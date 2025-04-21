"use strict";
(function () {
    "use strict";
    var requireModules = [
        'jquery',
        'util/remspect',
        'lib/toastr',
        'logging/listrak',
        'lib/jquery/bootstrap',
        'lib/jquery/cookie',
        'bootstrapJs/bootstrap-tabcollapse',
        'lib/jquery-unveil/study.unveil',
        'components/survey/UserExperienceSurveyView',
    ];
    var shouldGoogleTranslate = document.querySelector("#shouldGoogleTranslate");
    if (shouldGoogleTranslate) {
        requireModules.push('lib/google/translate');
    }
    if (document.querySelector("#useGenericFreshchatWidget")) {
        requireModules.push('redesign/generic-advisor');
    }
    require(requireModules, init);
    window["googleTranslateElementInit"] = function () {
        new google.translate.TranslateElement({ pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false }, 'google_translate_element');
    };
    function init($, remspect) {
        "use strict";
        setUpCourseList();
        setUpResourceList();
        setUpStickyMenu();
        setUpCarouselSwiping();
        if (document.querySelector("#regModalGoHere")) {
            require(["registration/ReactRegModal.app"], function (ReactRegModalApp) {
                var isModalOpened = $("#partialRegFormModal.in").length > 0;
                if (isModalOpened) {
                    ReactRegModalApp.initReactRegModalApp(null);
                }
                else {
                    $("#partialRegFormModal").one("shown.bs.modal", function (e) {
                        ReactRegModalApp.initReactRegModalApp(e);
                    });
                }
            });
        }
        if (document.querySelector("react-init") !== null) {
            require(["react-utils/react-study-helpers"], function (reactHelperModule) {
                reactHelperModule.reactBootstrap(document);
            });
        }
        $(document).ready(function () {
            removeTestimonialFromNavIfWraps();
            showStudyBanner();
            navSearch();
            collapseMobileNav();
            googleTranslateListeners();
            if (remspect.isControl('requireResearch')) {
                submitMiniForms();
            }
            $('.ios-scrollable').on('touchstart', function (e) { });
            navOverride();
            triggerTooltips();
            initSeeMoreSeeLessToggle();
            $('[data-preventDefault="true"]').on('click', function (e) { e.preventDefault(); });
            $('.vertSubTabs').tabCollapse({
                tabsClass: 'visible',
                accordionClass: ''
            });
            dropdownAccordion();
            initPlaceholderSwap();
            hideStudyTrainerCtas();
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover();
            $("[study-nav-popout], .course-popout").each(function (index, dom) {
                var element = $(dom);
                var parent = element.closest(".popoutContainer");
                var popoutId = element.attr("study-nav-popout") || element.attr("id");
                element.on("mouseover", function () {
                    parent.addClass("show-" + popoutId);
                });
                element.on("mouseout", function () {
                    parent.removeClass("show-" + popoutId);
                });
            });
        });
        function googleTranslateListeners() {
            $("[data-language-list]").on("click", "a", function () {
                var lang = $(this).attr("data-googtrans-cookie");
                var domain = "study.com";
                var hostParts = window.location.host.split(".");
                var numHostParts = hostParts.length;
                if (numHostParts > 1) {
                    domain = hostParts[numHostParts - 2] + '.' + hostParts[numHostParts - 1];
                }
                $.cookie("googtrans", lang, { path: "/", domain: domain });
                $.cookie("googtrans", lang, { path: "/" });
                location.reload();
            });
        }
        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
        function showStudyBanner() {
            $.cookie('hasSeen', 'true');
        }
        function initSeeMoreSeeLessToggle() {
            $('.seeMore').click(function () {
                $(this).parent().children('.displayNone').toggle();
                if ($(window).width() < 481) {
                    $(this).parent().children('.displayDesktop').toggle();
                }
                else {
                    $(this).parent().children('.displayDesktop').show();
                }
                var showMoreToggleText = $(this).html();
                if (showMoreToggleText.match(/more/i) !== null) {
                    $(this).html($(this).html().replace('more', 'less'));
                }
                else {
                    $(this).html($(this).html().replace('less', 'more'));
                }
            });
        }
        function submitMiniForms() {
            $('body').on('change', '.miniformSelect', function () {
                $(this).closest('.miniform').submit();
            });
        }
        function triggerTooltips() {
            $('#fullSchoolDisclaimer, #sidebarDisclaimer').tooltip();
            $("[data-tooltip]").each(function () {
                var elem = $(this);
                var triggers = elem.data('tooltip').split(' ');
                var showTooltip = function () {
                    elem.tooltip('show');
                };
                for (var i = 0; i < triggers.length; i++) {
                    elem.on(triggers[i], showTooltip);
                }
            });
            $('body').on('click', function (e) {
                $('[data-toggle="tooltip"]').each(function () {
                    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.tooltip').has(e.target).length === 0) {
                        $(this).tooltip('hide');
                    }
                });
            });
        }
        function navOverride() {
            $('.newNavContainer .collapseHeader').on('click touch', function () { });
            $('.mNav').on('click', function () {
                $(this).parent().toggleClass('open');
            });
            $(window).on('resize', function () {
                if ($(window).width() > 768) {
                    $('.newNavContainer .dropdown').removeClass('open');
                }
            });
        }
        function dropdownAccordion() {
            $('.dropdown-accordion').on('click', 'a[data-toggle="collapse"]', function (event) {
                event.preventDefault();
                event.stopPropagation();
                $($(this).data('parent')).find('.panel-collapse.in').collapse('hide');
                $($(this).attr('href')).collapse('show');
            });
        }
        function initPlaceholderSwap() {
            var placeholders = $('[placeholder]');
            placeholders.each(function () {
                var $elem = $(this);
                $elem.attr('data-placeholder', $elem.attr('placeholder'));
            });
            placeholders.on('focusin', function () {
                $(this).attr('placeholder', '');
            });
            placeholders.on('focusout', function () {
                $(this).attr('placeholder', $(this).attr('data-placeholder'));
            });
        }
        function isLocalStorageEnabled() {
            var testString = 'testString';
            try {
                window.localStorage.setItem(testString, testString);
                window.localStorage.removeItem(testString);
                return true;
            }
            catch (e) {
                return false;
            }
        }
        function hideStudyTrainerCtas() {
            if (isLocalStorageEnabled() && window.localStorage.getItem('hasStudyTrainer') === 'false') {
                $('[data-study-trainer-cta]').each(function () {
                    $(this).removeClass('hidden');
                    var replacementSelector = $(this).data('study-trainer-cta');
                    if (replacementSelector) {
                        $(replacementSelector).addClass('hidden');
                    }
                });
            }
        }
        function collapseMobileNav() {
            var navBar = $('.study-nav');
            navBar.on('click', '.collapse .study-nav__member-nav a', function () {
                $('#navsContainer').collapse('hide');
            });
        }
        function navSearch() {
            $(document).ready(function () {
                $(".searchTrigger").click(function () {
                    var mobileSearchBar = $(".xs-search");
                    if (mobileSearchBar.hasClass("open")) {
                        mobileSearchBar.removeClass("open");
                    }
                    else {
                        mobileSearchBar.addClass("open");
                    }
                });
            });
        }
        function removeTestimonialFromNavIfWraps() {
            var singleLineHeight = 61;
            var nav = document.querySelector("[data-subdomain-main-top-nav]");
            var testimonial = document.querySelector("[data-top-nav-testimonials]");
            if (window.matchMedia('(min-width: 992px)').matches) {
                if (nav != null && nav.getBoundingClientRect().height > 61) {
                    testimonial.classList.add("hidden");
                }
            }
        }
        function setUpCourseList() {
            $(".study-nav__courses-submenu__course-plan-template-item").on("mouseenter onmouseover", function (event) {
                var link = event.delegateTarget;
                var templateId = link.getAttribute("data-course-plan-template-id");
                $("#nav-submenu-resource").removeClass("selected");
                $(".study-nav__courses-submenu .selected").removeClass("selected");
                if (templateId) {
                    $("#nav-submenu-courses-" + templateId).addClass("selected");
                }
            });
        }
        function setUpResourceList() {
            $(".study-nav__resources-submenu__resource-template-item").on("mouseenter onmouseover", function (event) {
                $(".study-nav__resources-submenu .selected").removeClass("selected");
                $("#nav-submenu-resource").addClass("selected");
            });
        }
        function setUpStickyMenu() {
            var $stickyMenu = $("#sticky-menu");
            if ($stickyMenu.length <= 0) {
                return;
            }
            var $menuAnchors = $stickyMenu.find("a.nav-link");
            var idToOffset = {};
            var idList = [];
            for (var _i = 0, $menuAnchors_1 = $menuAnchors; _i < $menuAnchors_1.length; _i++) {
                var menuAnchor = $menuAnchors_1[_i];
                var href = $(menuAnchor).attr("href");
                var id = href.substring(1);
                var offsetTop = $(href).offset().top;
                if (offsetTop > 0) {
                    idToOffset[id] = offsetTop;
                    idList.push(id);
                }
            }
            window.onscroll = function () {
                var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
                var lastIdBeforeScroll = null;
                for (var _i = 0, idList_1 = idList; _i < idList_1.length; _i++) {
                    var id = idList_1[_i];
                    var offset = idToOffset[id];
                    if (offset <= (scrollPosition + 60)) {
                        lastIdBeforeScroll = id;
                    }
                }
                if (lastIdBeforeScroll) {
                    $stickyMenu.find("a.nav-link").removeClass("active");
                    $stickyMenu.find('[href="#' + lastIdBeforeScroll + '"]').addClass("active");
                }
            };
        }
        function setUpCarouselSwiping() {
            $(".carousel").on('slide.bs.carousel', function (event) {
                var items = $(event.currentTarget).find(".item");
                $(items).removeClass("next");
                $(items).removeClass("prev");
            });
            $(".carousel").on('slid.bs.carousel', function (event) {
                var items = $(event.currentTarget).find(".item");
                var activeSlideIndex;
                $.each(items, function (index, item) {
                    if ($(item).hasClass("active")) {
                        activeSlideIndex = index;
                    }
                });
                if (activeSlideIndex >= 0) {
                    $(items[activeSlideIndex - 1]).addClass("prev");
                }
                if ((activeSlideIndex + 1) < items.length) {
                    $(items[activeSlideIndex + 1]).addClass("next");
                }
            });
            $(".carousel").on("touchstart", function (event) {
                var touchStartEvent = event.originalEvent;
                var toucheStartX = touchStartEvent.touches[0].pageX;
                $(this).one("touchmove", function (event) {
                    var touchMoveEvent = event.originalEvent;
                    var touchMoveX = touchMoveEvent.touches[0].pageX;
                    if (Math.floor(toucheStartX - touchMoveX) < -5) {
                        $(this).carousel('prev');
                    }
                    else if (Math.floor(toucheStartX - touchMoveX) > 5) {
                        $(this).carousel('next');
                    }
                });
                $(this).on("touchend", function () {
                    $(this).off("touchmove");
                });
            });
        }
        function studyNavSearch() {
            var navBar = $('.study-nav');
            var navSearchForm = navBar.find('form');
            var navSearchFormInput = navSearchForm.find('input');
            var expandedClass = 'search-expanded';
            $(document).ready(function () {
                if (navSearchFormInput.val()) {
                    navBar.addClass(expandedClass);
                }
            });
            navSearchForm.on('submit', function (event) {
                var searchQuery = navSearchFormInput.val();
                if (!searchQuery || (window.matchMedia("max-width: 768px").matches && !navBar.hasClass(expandedClass))) {
                    event.preventDefault();
                }
                else {
                    navBar.addClass(expandedClass);
                }
            });
            navSearchForm.on('click touch', 'button', function () {
                var buttonType = $(this).data('nav-search-toggle');
                if (buttonType === 'close') {
                    navBar.removeClass(expandedClass);
                    navSearchFormInput.val('');
                }
                else if (buttonType === 'expand') {
                    navBar.addClass(expandedClass);
                }
                else {
                    navSearchForm.submit();
                }
            });
            navSearchFormInput.on('focus', function () {
                if (!navBar.hasClass(expandedClass)) {
                    navBar.addClass(expandedClass);
                }
            });
            navSearchFormInput.on('blur', function () {
                if (!navSearchFormInput.val()) {
                    navBar.removeClass(expandedClass);
                }
            });
            navSearchForm.on('touchstart', 'button', function () {
                if ($(this).data('nav-search-toggle') === 'expand') {
                    navBar.addClass(expandedClass);
                }
            });
        }
        if (remspect.isVariation("ppcSimpleTopNav", "v1") && document.querySelector("body.simpleTopNav")) {
            var navLinks = document.querySelectorAll(".study-nav__site-nav > li");
            navLinks.forEach(function (navLink) {
                var dropDownDesktop1 = navLink.querySelector(".study-nav__courses-submenu .study-nav__extra-navs-container");
                var dropDownMobile1 = navLink.querySelector(".study-nav__sub-nav");
                if (dropDownDesktop1 || dropDownMobile1) {
                    navLink.remove();
                }
            });
        }
    }
})();

//# sourceMappingURL=global.js.map