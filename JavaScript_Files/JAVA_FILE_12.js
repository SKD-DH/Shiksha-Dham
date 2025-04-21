"use strict";
require(["jquery", "homepage/JumpLinks", "redesign/globalModules"], function ($, JumpLinks) {
    var isMobileMediaQuery = window.matchMedia("(max-width: 767.9px)");
    var mobileAppBannerElement = document.querySelector("app-download-banner");
    if (mobileAppBannerElement) {
        require(["mobile-promotion/AppDownloadBannerViews"], function (AppDownloadBannerViews) {
            AppDownloadBannerViews.loadAndInitializeView(mobileAppBannerElement);
        });
    }
    var animateProductDemoId = null;
    var topNavMobileHeight = 66;
    var productDemoTitleHeight = 50;
    var productDemosNavMargin = 32;
    var productDemosNavElements = {
        "simplified-learning": false,
        "personalized-experience": false,
        "confidence-building-resources": false,
    };
    var getActiveProductDemoNavLink = function (activeId) {
        return document.querySelector(".product-demos-nav__link[href=\"".concat(activeId, "\"]"));
    };
    var getActiveProductDemoNavLinkPosition = function (activeId) {
        var navListPadding = 16;
        var activeLink = getActiveProductDemoNavLink(activeId);
        var navListItemPosition = activeLink.parentElement.offsetLeft - navListPadding;
        return navListItemPosition;
    };
    $(".product-demos-nav__link").on("click", function (e) {
        if (isMobileMediaQuery.matches) {
            e.preventDefault();
            animateProductDemoId = e.target.hash;
            var targetScrollTop = document.querySelector(e.target.hash).getBoundingClientRect().top - document.body.getBoundingClientRect().top
                - topNavMobileHeight - productDemosNavMargin;
            document.querySelectorAll(".product-demos-nav__link.active").forEach(function (links) {
                links.parentElement.classList.remove("active");
            });
            JumpLinks.doScrollAnimations({
                id: "productDemoVerticalScrollForUserClick",
                element: document.querySelector("html"),
                isVertical: true,
                targetPosition: targetScrollTop,
                onAnimationComplete: function () {
                    animateProductDemoId = null;
                    getActiveProductDemoNavLink(e.target.hash).parentElement.classList.add("active");
                },
            }, {
                id: "productDemoHorizontalScrollForUserClick",
                element: document.querySelector(".product-demos-nav"),
                isVertical: false,
                targetPosition: getActiveProductDemoNavLinkPosition(e.target.hash),
            });
        }
    });
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            var id = entry.target.getAttribute("id");
            if (isMobileMediaQuery.matches) {
                if (entry.isIntersecting) {
                    productDemosNavElements[id] = true;
                }
                else {
                    productDemosNavElements[id] = false;
                }
                var activeId = "";
                if (productDemosNavElements["simplified-learning"]) {
                    activeId = "simplified-learning";
                }
                else if (productDemosNavElements["personalized-experience"]) {
                    activeId = "personalized-experience";
                }
                else if (productDemosNavElements["confidence-building-resources"]) {
                    activeId = "confidence-building-resources";
                }
                if (activeId) {
                    if (!animateProductDemoId) {
                        document.querySelectorAll(".product-demos-nav__link").forEach(function (links) {
                            links.parentElement.classList.remove("active");
                        });
                        JumpLinks.doScrollAnimation({
                            id: "productDemoExternalHorizontalScrollForUserClick",
                            element: document.querySelector(".product-demos-nav"),
                            isVertical: false,
                            targetPosition: getActiveProductDemoNavLinkPosition("#" + activeId),
                        });
                        getActiveProductDemoNavLink("#" + activeId).parentElement.classList.add("active");
                    }
                }
            }
        });
    }, { root: null, rootMargin: "0px", threshold: 1 });
    document.querySelectorAll(".product-demo").forEach(function (section) {
        observer.observe(section);
    });
    initializeAIVideoObserver();
});
function initializeAIVideoObserver() {
    (new IntersectionObserver(function (entries, observer) {
        var entry = entries[0];
        if (entry.isIntersecting) {
            var videoElement = entry.target;
            if (videoElement.paused) {
                videoElement.play();
                observer.disconnect();
            }
        }
    })).observe(document.querySelector(".homepage-ai__video"));
}

//# sourceMappingURL=homepage2024.js.map