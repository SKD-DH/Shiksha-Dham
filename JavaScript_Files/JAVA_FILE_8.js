"use strict";
(function () {
    'use strict';
    require(['lib/underscore', 'eventLogging', 'logging/visible/visibility-tester', 'util/remspect'], init);
    function init(_, eventLogging, VisibilityTesterModule, remspect) {
        function handleClickEvent(event) {
            if (eventLogging.whichButton(event) !== 'RIGHT') {
                eventLogging.processDOMEvent(event);
            }
        }
        function onReady() {
            eventLogging.init();
            var uiEvents = {
                click: handleClickEvent,
                focus: eventLogging.processDOMEvent.bind(eventLogging),
                blur: eventLogging.processDOMEvent.bind(eventLogging),
                change: eventLogging.processDOMEvent.bind(eventLogging)
            };
            Object.keys(uiEvents).forEach(function (key) {
                document.body.addEventListener(key, uiEvents[key], true);
            });
            var customEvents = ['stripeError', 'regError', 'videoEvent', 'fullscreenEvent', 'barShown', 'videoToolbarEvent', 'videoLoad', 'qualarooShown', 'qualarooClosed', 'regFormModalError', 'videoPlayEvent', 'debugInfo', 'braintreeError'];
            function handleCustomEvent(event) {
                var eventDetail = new eventLogging.LoggableEvent(event.type);
                Object.keys(event.detail).forEach(function (key) { eventDetail[key] = event.detail[key]; });
                eventLogging.queueEvent(eventDetail);
            }
            customEvents.forEach(function (key) {
                document.addEventListener(key, handleCustomEvent.bind(this), true);
            });
            var visibilityTester = new VisibilityTesterModule.VisibilityTester();
            visibilityTester.addElementsToCheck(Array.prototype.slice.call(document.querySelectorAll("[data-track-visible]")));
            visibilityTester.start();
        }
        if (document.readyState !== 'loading') {
            onReady();
        }
        else {
            document.addEventListener('DOMContentLoaded', onReady, false);
        }
        window.globalUtils.handleErrorEvent = function (loggableEvent) {
            loggableEvent.loggerType = "javascriptError-postEventTracking";
            eventLogging.queueEvent(loggableEvent);
        };
        window.addEventListener("load", function () {
            if (!window.performance || !window.performance.timing || !window.performance.navigation) {
                return;
            }
            setTimeout(function () {
                var _a;
                var loggableEvent = new eventLogging.LoggableEvent("pageLoad");
                loggableEvent.timing = window.performance.timing;
                loggableEvent.redirectCount = window.performance.navigation.redirectCount;
                loggableEvent.navigationType = eventLogging.getNavigationType(window.performance.navigation.type);
                loggableEvent.initialScrollPixels = window.scrollY;
                try {
                    loggableEvent.urlWithAnchor = (_a = window.performance.getEntries().filter(function (_a) {
                        var entryType = _a.entryType;
                        return entryType === 'navigation';
                    })[0]) === null || _a === void 0 ? void 0 : _a.name;
                }
                catch (e) {
                    loggableEvent.urlWithAnchor = "ERROR_GETTING_URL_WITH_ANCHOR";
                }
                try {
                    var PaintPerformance = window.PaintPerformance;
                    if (PaintPerformance) {
                        loggableEvent.paintTiming = {};
                        PaintPerformance.queue.forEach(function (entry) {
                            loggableEvent.paintTiming[entry.name] = Math.round(entry.startTime + entry.duration);
                        });
                        PaintPerformance.observer.disconnect();
                    }
                }
                catch (e) {
                }
                eventLogging.queueEvent(loggableEvent);
                var loggableEventMetrics = new eventLogging.LoggableEvent("metrics");
                var wp = window.performance;
                loggableEventMetrics.metrics = {
                    eventUrl: window.location.href
                };
                var timing = wp.timing;
                var addPerformanceTimingDuration = function (metrics, metricsKey, timingKey) {
                    if (timing.navigationStart > 0 && timing[timingKey] > 0) {
                        var t = timing[timingKey] - timing.navigationStart;
                        if (t > 0 && t < 60000) {
                            metrics[metricsKey] = t;
                        }
                    }
                };
                try {
                    addPerformanceTimingDuration(loggableEventMetrics.metrics, "req_s", "requestStart");
                    addPerformanceTimingDuration(loggableEventMetrics.metrics, "res_s", "responseStart");
                    addPerformanceTimingDuration(loggableEventMetrics.metrics, "res_e", "responseEnd");
                    addPerformanceTimingDuration(loggableEventMetrics.metrics, "di", "domInteractive");
                    addPerformanceTimingDuration(loggableEventMetrics.metrics, "dcl_s", "domContentLoadedEventStart");
                    addPerformanceTimingDuration(loggableEventMetrics.metrics, "dcl_e", "domContentLoadedEventEnd");
                    addPerformanceTimingDuration(loggableEventMetrics.metrics, "dc", "domComplete");
                    addPerformanceTimingDuration(loggableEventMetrics.metrics, "le_e", "loadEventEnd");
                }
                catch (e) {
                }
                loggableEventMetrics.redirectCount = wp.redirectCount;
                eventLogging.queueEvent(loggableEventMetrics);
            }, 100);
            var secondsOnPageDelays = [10, 30, 60, 300, 600];
            secondsOnPageDelays.forEach(function (delay) {
                setTimeout(function () {
                    var e = new eventLogging.LoggableEvent("timeOnPage");
                    e.secondsSincePageLoad = delay;
                    eventLogging.queueEvent(e);
                }, delay * 1000);
            });
        }, true);
        var HeroTracking = window.HeroTracking;
        if (HeroTracking && window.performance && window.performance.timing && window.performance.timing.navigationStart) {
            var queue = HeroTracking.queue;
            var navigationStart = window.performance.timing.navigationStart;
            setInterval(function () {
                while (queue.length > 0) {
                    var heroEvent = queue.shift();
                    var loggableEvent = new eventLogging.LoggableEvent("heroEvent");
                    eventLogging.addElementInfoToEventDetail(loggableEvent, heroEvent.element);
                    loggableEvent.heroType = heroEvent.type;
                    loggableEvent.heroTimestamp = heroEvent.timestamp.getTime() - navigationStart;
                    loggableEvent.boundingClientRect = heroEvent.boundingClientRect;
                    var extraData = heroEvent.extraData;
                    for (var i in extraData) {
                        if (extraData.hasOwnProperty(i) && i !== "eventType") {
                            loggableEvent[i] = extraData[i];
                        }
                    }
                    eventLogging.queueEvent(loggableEvent);
                }
            }, 1000);
        }
        {
            var nextThrottledEventDate_1 = new Date(0);
            var logPrintPreview_1 = function (event) {
                var now = new Date();
                if (nextThrottledEventDate_1 <= now) {
                    var printEvent = new eventLogging.LoggableEvent("printPreview");
                    eventLogging.queueEvent(printEvent);
                    nextThrottledEventDate_1 = new Date(now.getTime() + 30 * 1000);
                }
            };
            var mql = window.matchMedia("print");
            var mqlHandler = function (event) {
                if (event.matches) {
                    logPrintPreview_1(event);
                }
            };
            if (mql.addEventListener) {
                mql.addEventListener("change", mqlHandler);
            }
            else if (mql.addListener) {
                mql.addListener(mqlHandler);
            }
            window.addEventListener("beforeprint", logPrintPreview_1);
        }
        if (typeof window.sessionStorage !== "undefined" && !window.sessionStorage.browserfp) {
            window.addEventListener("load", function () {
                var hash = function (input) {
                    var hash = 0;
                    for (var i = 0; i < input.length; i++) {
                        var char = input.charCodeAt(i);
                        hash = ((hash << 5) - hash) + char;
                        hash = hash & hash;
                    }
                    return hash;
                };
                require(['logging/fpjs/umd'], function (fpjs) {
                    var fpPromise = fpjs.load();
                    fpPromise
                        .then(function (fp) { return fp.get(); })
                        .then(function (result) {
                        result.components.canvas.value.geometry = hash(result.components.canvas.value.geometry);
                        result.components.canvas.value.text = hash(result.components.canvas.value.text);
                        var e = new eventLogging.LoggableEvent("browserfp");
                        e.data = result;
                        eventLogging.queueEvent(e);
                        window.sessionStorage.browserfp = 1;
                    });
                });
            });
        }
    }
})();

//# sourceMappingURL=eventLoggingInit.js.map