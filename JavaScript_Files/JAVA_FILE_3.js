"use strict";
var GlobalUtils = (function () {
    function GlobalUtils() {
        Object.defineProperty(this, "blackListedErrorLimit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        Object.defineProperty(this, "logLimit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        Object.defineProperty(this, "sentErrorMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    Object.defineProperty(GlobalUtils.prototype, "getRequestGuid", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var requestGuidElement = document.querySelector("meta[name=requestGuid]");
            var requestGuid;
            if (typeof requestGuidElement === 'undefined' || !requestGuidElement) {
                requestGuidElement = document.getElementById("requestGuid");
                requestGuid = requestGuidElement ? requestGuidElement.value : "";
            }
            else {
                requestGuid = requestGuidElement.getAttribute("content");
            }
            return requestGuid;
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "getPageImpressionGuid", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _impressionElement = document.querySelector("meta[name=impressionGuid]");
            if (typeof _impressionElement !== 'undefined' && _impressionElement) {
                var value = _impressionElement.getAttribute("content");
                if (!value) {
                    value = this.generateUUID();
                    _impressionElement.setAttribute("content", value);
                }
                return value;
            }
            return "";
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "getTabGuid", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var isSessionStorageSupported = typeof window.sessionStorage !== "undefined";
            if (!isSessionStorageSupported) {
                return null;
            }
            var SESSION_KEY = "StudyTabGuid";
            var tabGuid = null;
            try {
                tabGuid = window.sessionStorage.getItem(SESSION_KEY);
            }
            catch (e) {
                console.log(e);
            }
            if (tabGuid == null) {
                var newTabGuid = this.generateGuid();
                try {
                    window.sessionStorage.setItem(SESSION_KEY, newTabGuid);
                    tabGuid = newTabGuid;
                }
                catch (e) {
                    console.log(e);
                }
            }
            return tabGuid;
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "generateUUID", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var res = [];
            var hv;
            var rgx = new RegExp("[2345]");
            for (var i = 0; i < 8; i++) {
                hv = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                if (rgx.exec(i.toString()) !== null) {
                    if (i === 3) {
                        hv = "6" + hv.substr(1, 3);
                    }
                    res.push("-");
                }
                res.push(hv.toUpperCase());
            }
            return res.join('');
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "generateGuid", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            Date.now = Date.now || function () {
                return +new Date();
            };
            var d = Date.now();
            return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "requireConfigError", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (event) {
            var exception = {};
            exception.message = "error loading require config file";
            exception.sourceJavascript = '<remilon:versionify resourceLocation="${jsHost}" path="/js/requireConfig.js" />';
            exception.lineNumber = 0 + ':' + 0;
            this.logError(exception, "fileload");
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "requireError", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (event) {
            var exception = {};
            exception.message = "require.js failed to load";
            exception.sourceJavascript = "//cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js";
            exception.lineNumber = 0 + ':' + 0;
            this.logError(exception, "require");
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "onError", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (message, url, lineNumber, colNumber, error) {
            var exception = (error != null) ? error : {};
            exception.message = message;
            exception.sourceJavascript = url;
            exception.lineNumber = lineNumber;
            this.logError(exception, "windowOnError");
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "logError", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (exception, type, mutator) {
            if (typeof exception === 'string') {
                var message = exception;
                exception = { message: message };
            }
            var loggableEvent = this.createLoggableEventForError();
            try {
                var urlCapture = /\((.+?):(\d+):(\d+)/g;
                var matchUrl = urlCapture.exec(exception.stack);
                if (matchUrl && matchUrl.length == 4) {
                    var url = matchUrl[1];
                    var line = matchUrl[2];
                    var col = matchUrl[3];
                    loggableEvent.sourceJavascript = url;
                    loggableEvent.lineNumber = line + ':' + col;
                }
                else {
                    loggableEvent.sourceJavascript = exception.sourceJavascript;
                    loggableEvent.lineNumber = exception.lineNumber;
                }
            }
            catch (e) {
                loggableEvent.sourceJavascript = exception.sourceJavascript;
                loggableEvent.lineNumber = exception.lineNumber;
            }
            loggableEvent.message = this.truncateText(exception.message);
            loggableEvent.url = window.location.href;
            loggableEvent.name = exception.name;
            loggableEvent.stacktrace = this.truncateText(exception.stack);
            loggableEvent.type = type;
            if (mutator != null) {
                mutator(loggableEvent);
            }
            var hashCode = this.computeErrorHashCode(loggableEvent);
            if (this.shouldLogError(loggableEvent, hashCode)) {
                this.markErrorAsSent(loggableEvent, hashCode);
                this.handleErrorEvent(loggableEvent);
            }
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "handleErrorEvent", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (loggableEvent) {
            loggableEvent.loggerType = "javascriptError-preEventTracking";
            this.logLimit--;
            var request = new XMLHttpRequest();
            request.open("POST", "/eventLogger/eventLog.ajax");
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify([loggableEvent]));
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "markErrorAsSent", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (loggableEvent, errorHashCode) {
            if (this.isBlackListedError(loggableEvent) && this.blackListedErrorLimit > 0) {
                this.blackListedErrorLimit--;
            }
            this.sentErrorMap[errorHashCode] = true;
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "shouldLogError", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (loggableEvent, errorHashCode) {
            if (this.logLimit <= 0) {
                return false;
            }
            if (this.isBlackListedError(loggableEvent) && this.blackListedErrorLimit <= 0) {
                return false;
            }
            if (this.sentErrorMap[errorHashCode]) {
                return false;
            }
            return true;
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "isBlackListedError", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (loggableEvent) {
            return loggableEvent.message.match(/(script error|mismatched anonymous define)/i);
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "truncateText", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (text, maxLength) {
            if (maxLength === void 0) { maxLength = 4000; }
            return (text && text.length > maxLength) ? text.substring(0, maxLength) + "....[truncated]" : text;
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "computeErrorHashCode", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (loggableEvent) {
            var hashString = loggableEvent.message + " | " + loggableEvent.sourceJavascript + " | " + loggableEvent.lineNumber;
            return this.simpleHashCode(hashString);
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "simpleHashCode", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (text) {
            var h = 0;
            for (var i = 0; i < text.length; i++) {
                h = (h << 5) - h + text.charCodeAt(i) | 0;
            }
            return h;
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "createLoggableEventForError", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            return this.createLoggableEvent("javascriptError");
        }
    });
    Object.defineProperty(GlobalUtils.prototype, "createLoggableEvent", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (eventType) {
            var loggableEvent = {};
            loggableEvent.eventType = eventType;
            loggableEvent.javascriptUUID = this.generateGuid();
            loggableEvent.pageImpressionGuid = this.getPageImpressionGuid();
            loggableEvent.pageRequestGuid = this.getRequestGuid();
            loggableEvent.javascriptTimestamp = new Date().getTime();
            return loggableEvent;
        }
    });
    return GlobalUtils;
}());
var globalUtils = new GlobalUtils();
window.globalUtils = globalUtils;
window.onerror = function (message, url, lineNumber, colNumber, error) {
    globalUtils.onError(message, url, lineNumber, colNumber, error);
    return false;
};

//# sourceMappingURL=error.js.map