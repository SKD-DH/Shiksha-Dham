(function() {
	"use strict";
	
	//Copied this from remspect so we could make remspect decisions in here.
	var isInControlOfTest = function(factorName) {
		var variationForFactor = getVariationForFactor(factorName);
		return !variationForFactor || variationForFactor === 'control';
	};
	
	var getVariationForFactor = function(factorName) {
		var factorsToVariations = {};
		
		var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)ssoe_debug\s*=\s*([^;]*).*$)|^.*$/, "$1");
		var ssoeRegex = /([^-]+)-([^\.]+)\.?/g;
		var match = ssoeRegex.exec(cookieValue);
		while (match !== null) {
			
			var factor = match[1];
			var variation = match[2];
			
			factorsToVariations[factor] = variation;
			
			match = ssoeRegex.exec(cookieValue);
		}
		return factorsToVariations[factorName];
	};
	
	//'abc/def/ghi.controller': 'd646a69d4b' -> 'abc/def/ghi.controller': '/js/abc/def/ghi-d646a69d4b.controller'
	function convertAndAddPathEntries(encodedMap, destinationMap, hostPrefix) {
		if (hostPrefix.indexOf("/js/") > -1) {
			hostPrefix = hostPrefix.substring(0, hostPrefix.indexOf("/js/"));
		}
		
		var keys = Object.keys(encodedMap);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var hash = encodedMap[key];
			var mappedPath = null;
			var dotIndex = key.indexOf(".");
			if (dotIndex === -1) {
				//util/abc -> /js/util/abc-123123
				mappedPath = hostPrefix + "/js/" + key + "-" + hash;
			}
			else {
				//util/abc.directive -> /js/util/abc-123123.directive
				var firstPartOfLookupKey = key.substring(0, dotIndex);
				var lastPartOfLookupKey = key.substring(dotIndex);
				
				mappedPath = hostPrefix + "/js/" + firstPartOfLookupKey + "-" + hash + lastPartOfLookupKey;
			}
			destinationMap[key] = mappedPath;
		}
	}
	
	//files that do not return the access-control-allow-origin header will freak out if you add crossorigin=anonymous attr
	var libsWithoutAccessControlHeader = [
		"lib/braintree/apple-pay",
		"lib/braintree/client",
		"lib/braintree/google-pay",
		"lib/freshchat",
		"lib/listrak",
		"lib/google/api",
		"lib/google/pay",
		"lib/google/translate",
		"lib/grecaptcha",
		"lib/stripe", //probably not used now
		"stripe"
	];
	
	var element = document.querySelector("[data-remilon-env]");
	var env = element ? element.getAttribute("data-remilon-env") : "prod";
	var isProduction = env.indexOf('prod') > -1;
	
	var jsModeCookie = document.cookie.replace(/(?:(?:^|.*;\s*)js_debug\s*=\s*([^;]*).*$)|^.*$/, "$1");
	var jsDevMode = jsModeCookie.indexOf('true') > -1;
	
	var useJsDevMode = jsDevMode && !isProduction;

	define("MathJaxConfig", [], function() {
		window.MathJax = {
			asciimath: {
				delimiters: [["{am}", "{/am}"]]
			},
			tex: {
				displayMath: [["$$", "$$"]],
				inlineMath: [["{eq}", "{/eq}"]],
				processEnvironments: false,
				autoload: {
					color: [],
					colorv2: ['color']
				},
				packages: {'[+]': ['noerrors']}
			},
			options: {
				skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
				enableMenu: false,
				ignoreHtmlClass: 'tex2jax_ignore',
				processHtmlClass: 'tex2jax_process'
			},
			loader: {
				load: ['input/asciimath', '[tex]/noerrors']
			}
		};
	})
	
	requirejs.onError = function(err) {
		try {
			if (err.message) {
				err.message = "requireOnError: " + err.message;
			}
			else {
				err.message = "requireOnError";
			}
		}
		catch (e) {
			console.warn("error while trying to modify the next thrown exception", e);
		}
		throw err;
	};
	
	/* NOTE: Some libraries are served externally due to their large number of file dependencies. The preferred way to serve libraries is locally. */
	var paths = {
		"angularDependency": [
			useJsDevMode
			? "lib/angular/angular-1.7.8"
			: "lib/angular/angular-1.7.8.min"
		],
		"bootstrap": [
			"lib/bootstrap/bootstrap-3.3.7.min"
		],
		"jquery": [
			useJsDevMode
			? "lib/jquery/jquery-1.11.1"
			: "lib/jquery/jquery-1.11.1.min"
		],
		"react": [
			useJsDevMode
			 ? "lib/react/react.development-17.0.2"
			 : "lib/react/react.production-17.0.2.min"
		],
		"react-bootstrap-typeahead": [
			useJsDevMode
			 ? "lib/react/react-bootstrap-typeahead-5.2.0"
			 : "lib/react/react-bootstrap-typeahead-5.2.0.min"
		],
		"react-dom": [
			useJsDevMode
			 ? "lib/react/react-dom.development-17.0.2"
			 : "lib/react/react-dom.production-17.0.2.min"
		],
		"react-router-dom": [
			"lib/react/react-router-dom-5.3.0.min"
		],
		"mobx": [
			useJsDevMode
			 ? "lib/mobx/mobx.umd.development-6.0.5"
			 : "lib/mobx/mobx.umd.production-6.0.5.min"
		],
		"mobx-react": [
			useJsDevMode
			 ? "lib/mobx/mobxreact.umd.development-7.0.6"
			 : "lib/mobx/mobxreact.umd.production-7.0.6.min"
		],
		"@popperjs/core": [
			"lib/react/popper-2.11.2.min"
		],
		"@tippyjs/react": [
			"lib/react/tippy-react.umd-4.2.6.min"
		],
		//required dependency for mobx-react
		"mobx-react-lite": [
			useJsDevMode
			 ? "lib/mobx/mobxreactlite.umd.development-3.1.7"
			 : "lib/mobx/mobxreactlite.umd.production-3.1.7.min"
		],
		"core-js": [
			"lib/core-js/core-js-3.30.2.min"
		],
		"router5": [
		    "lib/router5/router5.min"
		],
		"router5-plugin-browser": [
			"lib/router5/router5-plugin-browser"
		],
		"lib/Q": [
			"lib/Q/q-2.0.2.min"
		],
		"lib/angular-sanitize": [
			useJsDevMode
			? "lib/angular/angular-sanitize-1.7.8"
			: "lib/angular/angular-sanitize-1.7.8.min"
		],
		"lib/angular-storage": [
			"lib/angular/angular-storage-0.0.13.min"
		],
		"lib/angular/animate": [
			useJsDevMode
			? "lib/angular/angular-animate-1.7.8"
			: "lib/angular/angular-animate-1.7.8.min"
		],
		"lib/angular/cookie": [
			useJsDevMode
			? "lib/angular/angular-cookies-1.7.8"
			: "lib/angular/angular-cookies-1.7.8.min"
		],
		"lib/angular/drag-and-drop-lists": [
			useJsDevMode
			? "lib/angular/angular-drag-and-drop-lists-2.1.0"
			: "lib/angular/angular-drag-and-drop-lists-2.1.0.min"
		],
		"lib/angular/draganddrop": [
			"lib/angular/draganddrop.min"
		],
		"lib/angular/loading-bar": [
			"lib/angular/angular-loading-bar-0.7.1.min"
		],
		"lib/angular/resource": [
			useJsDevMode
			? "lib/angular/angular-resource-1.2.21"
			: "lib/angular/angular-resource-1.2.21.min"
		],
		"lib/angular/rzslider": [
			"lib/angular/rzslider.min"
		],
		"lib/angular/touch": [
			useJsDevMode
			? "lib/angular/angular-touch-1.3.13"
			: "lib/angular/angular-touch-1.3.13.min"
		],
		"lib/angular/ui-bootstrap": [
			"lib/angular/ui-bootstrap-tpls-0.14.3"
		],
		"lib/angular/ui-router": [
			"lib/angular/angular-ui-router-1.0.22.min"
		],
		"lib/angular/ui-utils": [
			"lib/angular/angular-ui-utils-0.1.1.min"
		],
		"lib/axios": [
			"lib/react/axios-0.21.4.min"
		],
		"lib/bluebird": [
			"lib/bluebird/bluebird.core-3.5.0.min"
		],
		"lib/braintree/client": [
			"lib/braintree/client-3.76.4"
		],
		"lib/braintree/apple-pay": [
			"lib/braintree/apple-pay-3.76.4"
		],
		"lib/braintree/google-pay": [
			"lib/braintree/google-payment-3.76.4"
		],
		"lib/google/pay": [
			"//pay.google.com/gp/p/js/pay"
		],
		"lib/grecaptcha": [
			"//www.google.com/recaptcha/api.js?render=6Le2LJMUAAAAAB1i8hXn01bOkmc69XKMCiGnJEqY"
		],
		"lib/code-prettify": [
			"lib/code-prettify/run_prettify-4-Mar-2013"
		],
		"lib/code-prettify-r": [
			"lib/code-prettify/lang-r-4-Mar-2013"
		],
		"lib/freshchat": [
			"https://wchat.freshchat.com/js/widget",
			// fallback to find errors in the widget code, update this file from source whenever errors occur
			"lib/freshdesk/freshwidget--2022-04-08"
		],
		"lib/freshWidget": [
			"//s3.amazonaws.com/assets.freshdesk.com/widget/freshwidget"
		],
		"lib/google/api": [
			//NOTE: query param added to force requirejs NOT to add .js
			"https://accounts.google.com/gsi/client?a" // must be loaded from google over ssl.
		],
		"lib/google/translate": [
			"//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
		],
		"lib/humane": [
			"lib/humane/humane-3.2.0.min"
		],
		"lib/jquery/bootstrap": [
			 "lib/bootstrap/bootstrap-3.2.0.min"
		],
		"lib/jquery/bootstrap/datetimepicker": [
			"lib/jquery/bootstrap-datetimepicker.min"
		],
		"lib/jquery/bootstrap/jasny": [
			"lib/bootstrap/jasny-bootstrap-3.1.3.min"
		],
		"lib/jquery/cookie": [
			"lib/jquery/jquery.cookie-1.4.1.min"
		],
		"lib/jquery/jqplot": [
			"lib/jquery/graphing/jquery.jqplot.min"
		],
		"lib/jquery/jqplot/bars": [
			"lib/jquery/graphing/jqplot.barRenderer.min"
		],
		"lib/jquery/lazyload": [
			"lib/jquery/lazyload"
		],
		"lib/jquery/purl": [
			"lib/purl/purl-2.3.1.min"
		],
		"lib/jstz": [
			"lib/jstz/jstz.min"
		],
		"lib/listrak": [
			"//cdn.listrakbi.com/scripts/script.js?m=z6wSBMxAURie&v=1"
		],
		"lib/modernizr": [
			"lib/modernizr/modernizr-3.3.1-custom"
		],
		"lib/ngMask": [
			"lib/angular/ngMask.min"
		],
		"lib/raphael": [
			"lib/raphael/raphael"
		],
		"lib/react-bootstrap": [
			"lib/react/react-bootstrap-2.0.2.min"
		],
		"lib/react-spring": [
		 	"//unpkg.com/@react-spring/web@9.1.0/index.umd"
		],
		"lib/react-use-gesture": [
		 	"//cdn.jsdelivr.net/npm/react-use-gesture@9.1.2/dist/reactusegesture.umd.production.min"
		],
		"lib/prop-types": [
		 "//cdnjs.cloudflare.com/ajax/libs/prop-types/15.7.0/prop-types.min"
		],
		"lib/scrollama": [
		 	"lib/scrollama/scrollama-3.2.0.min"
		],
		"stripe": [
			"https://js.stripe.com/v2?noext" //stripe's url doesn't end in .js, so we stick a query param on the end.
		],
		"lib/tinymce": [
			"//cdnjs.cloudflare.com/ajax/libs/tinymce/4.4.3/tinymce.min"
		],
		"lib/tinymceui": [
			"lib/tinymce/tinymce-ui.min"
		],
		"lib/toastr": [
			"lib/toastr/toastr-2.1.1.min"
		],
		"lib/usmap": [
			"lib/usmap/jquery.usmap"
		],
		"lib/wistia": [
			"//fast.wistia.com/assets/external/E-v1"
		],
		"lscache": [
			"lib/lscache/lscache.min"
		],
		"mathjax": [
			"//cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.min"
		],
		"moment": [
			"lib/moment/moment.min"
		],
		"underscore": [
			"lib/underscore/underscore-1.8.3.min"
		],
		"lib/jquery/guid": [
			"lib/jquery/guid"
		],
		// legacy "jquery tools" used for the leadforms (almost all of this is bootstrap, and you shouldn't use these
		"lib/jquery/legacy/hint": [
			"lib/jquery/legacy/hint.jquery"
		],
		"lib/jquery/legacy/migrate": [
			"lib/jquery/jquery-migrate-1.2.1.min"
		],
		"lib/jquery/legacy/tools": [
			"lib/jquery/legacy/jquery.tools.min"
		],
		"lib/jquery/legacy/tools/tooltip": [
			"lib/jquery/legacy/jquery.tools.tooltip.1.2.3"
		],
		"lib/jquery/ui": [
			"lib/jquery/jquery-ui-1.12.1-custom.min"
		],
		"lib/jquery-mask": [
			"lib/jquery-mask/jquery.mask.min"
		],
		"topbar": [
		    "lib/topbar/topbar.min"
		]
	};
	
	if (window.studyJsMappings) {
		convertAndAddPathEntries(window.studyJsMappings, paths, "");
	}
	else if (window.studyJsMappings == null) {
		console.error("js mappings not available. versioned files will not be used");
		var error = new Error("js mappings not available. any files required via js will fail.");
		window.globalUtils.logError(error, "jsMappingsFailedToLoad");
		window.globalUtils.logLimit = 2; //Prevent ourselves from logging every single required js module
	}
	
	//react or mobx will use this, they will be on just about every page. See es6-global-polyfills
	var isMissingES6GlobalPolyfilledFeature = typeof Array.prototype["find"] === "undefined"
	 || typeof Array.prototype["findIndex"] === "undefined"
	 || typeof Array.prototype["includes"] === "undefined"
	 || typeof Array.prototype["flat"] === "undefined"
	 || typeof String.prototype["endsWith"] === "undefined";
	
	// attempt to see if their browser allows regex named capture groups and polyfill if not
	try {
		new RegExp("(?<test>.)");
	}
	catch (e) {
		isMissingES6GlobalPolyfilledFeature = true;
	}
	
	var mobCompatibility = ['mobx'];
	if (isMissingES6GlobalPolyfilledFeature || typeof Object["assign"] === "undefined" || typeof Object["entries"] === "undefined") {
		mobCompatibility.push('core-js');
	}
	define('mobx-compatibility', mobCompatibility, function(mobx) {
		if (typeof Proxy === 'undefined') {
			mobx.configure({useProxies: "never"});
		}
		return mobx;
	});
	
	var reactCompatibility = ['react'];
	if (isMissingES6GlobalPolyfilledFeature || typeof Map === "undefined" || typeof Set === "undefined" || typeof Object["assign"] === "undefined") {
		reactCompatibility.push('core-js');
	}
	define('react-compatibility', reactCompatibility, function(React) {
		return React;
	});
	
	var promisePolyfillDeps = [];
	if (typeof window["Promise"] === "undefined") {
		promisePolyfillDeps.push("lib/bluebird");
	}
	define("compatibility/promise-polyfill", promisePolyfillDeps, function(Bluebird) {
		if (Bluebird) {
			window["Promise"] = Bluebird;
		}
		else {
			Promise.prototype.finally = Promise.prototype.finally || {
				finally: function(callback) {
					var onFinally = function(value) { return Promise.resolve(callback()).then(function() { return value; }); };
					return this.then(function(result) { return onFinally(result); }, function(reason) { return onFinally(Promise.reject(reason)); });
				}
			}.finally;
		}
	});
	
	definePolyfillModule("compatibility/polyfill/url-search-params",
	 "core-js",
	 typeof window["URLSearchParams"] === "undefined");
	
	definePolyfillModule("compatibility/polyfill/element-get-attribute-names",
	 "compatibility/polyfill-impl/element-get-attribute-names",
	 typeof Element.prototype.getAttributeNames === "undefined");
	
	definePolyfillModule("compatibility/polyfill/es6-global-polyfills",
	 "core-js",
	 isMissingES6GlobalPolyfilledFeature);
	
	function definePolyfillModule(moduleName, polyFillImplModule, isMissingFeature) {
		var deps = [];
		if (isMissingFeature) {
			deps.push(polyFillImplModule);
		}
		define(moduleName, deps, function() { });
	}
	
	requirejs.config({
		onNodeCreated: function(node, config, module, path) {
			if ((node.src != null)
			 && !(node.src.indexOf(window.location.origin) === 0) //startsWith
			 && libsWithoutAccessControlHeader.indexOf(module) === -1) {
				node.setAttribute('crossorigin', 'anonymous');
			}
		},
		baseUrl: "/js",
		waitSeconds: 30,
		//BUNDLE_GO_HERE
		paths: paths,
		//Tippy for some dumb reason put "js" in their package name, which require.js hates
		packages: [{
			name: "tippy.js",
			location: "lib/tippy",
			main: useJsDevMode
			 ? "tippy.umd-6.3.7"
			 : "tippy.umd-6.3.7.min"
		}],
		map: {
			//These modules have common names used by other modules, so we need a mapping from the study.com "lib/" convention to the module's AMD name.
			'*': {
				'angularDependency': 'angular/util/angularExceptionLogger',
				"card-validator": "lib/braintree/braintree-card-validator",
				"eventLogging": "logging/eventLogging",
				"lib/axios": "wrappers/axios-and-config",
				'lib/lscache': 'lscache',
				'lib/moment': 'moment',
				'lib/stripe': 'wrappers/stripe-and-config',
				'lib/underscore': 'underscore',
				'util/value-proxy-promise': 'util/value-pro-promise',
				'util/value-proxy': 'util/value-pro',
				'mobx': 'mobx-compatibility',
				'react': 'react-compatibility'
			},
			'lib': {
				'angularDependency': 'angularDependency'
			},
			'angular/util/angularExceptionLogger': {
				'angularDependency': 'angularDependency'
			},
			'lib/angular/rzslider': {
				'angular': 'angularDependency'
			},
			'lib/angular/ui-router': {
				'angular': 'angularDependency'
			},
			"wrappers/axios-and-config": {
				"lib/axios": "lib/axios"
			},
			'wrappers/stripe-and-config': {
				'lib/stripe': 'stripe'
			},
			'mobx-compatibility': {
				'mobx': 'mobx'
			},
			'react-compatibility': {
				'react': 'react'
			}
		},
		shim: {
			//angular doesn't require jquery, as it has it's own jQLite when jquery is missing. Our code assumes it has access to full jquery, though .
			"angularDependency": {
				deps: ["jquery"],
				exports: "angular"
			},
			"bootstrap": ["jquery"],
			
			"lib/angular-sanitize": ["angularDependency"],
			"lib/angular-storage": ["angularDependency"],
			"lib/angular/animate": ["angularDependency"],
			"lib/angular/cookie": ["angularDependency"],
			"lib/angular/drag-and-drop-lists": ["angularDependency"],
			"lib/angular/draganddrop": ["angularDependency"],
			"lib/angular/loading-bar": ["angularDependency"],
			"lib/angular/resource": ["angularDependency"],
			"lib/angular/touch": ["angularDependency"],
			"lib/angular/ui-bootstrap": ["angularDependency", "lib/angular/animate", "lib/angular/touch", "lib/jquery/bootstrap"],
			"lib/angular/ui-router": ["angularDependency"],
			"lib/angular/ui-utils": ["angularDependency"],
			"lib/axios": {
				deps: ["compatibility/promise-polyfill"]
			},
			"lib/braintree/google-pay": ["lib/google/pay"],
			"lib/code-prettify": {
				exports: "PR"
			},
			"lib/code-prettify-r": {
				deps: ["lib/code-prettify"]
			},
			"lib/freshWidget": {
				exports: "FreshWidget"
			},
			"lib/freshchat": {
				exports: "fcWidget"
			},
			"lib/google/api": ["google/google-parse-tags-config"],
			"lib/jquery/bootstrap": ["jquery"],
			"lib/jquery/bootstrap/jasny": ["lib/jquery/bootstrap"],
			"lib/jquery/jqplot": ["jquery"],
			"lib/jquery/jqplot/bars": ["lib/jquery/jqplot"],
			"lib/jquery/lazyload": ["jquery"],
			"lib/jquery/mask/jquery.mask": ["jquery"],
			"lib/jquery/legacy/hint": ["jquery"],
			"lib/jquery/legacy/migrate": ["jquery"],
			"lib/jquery/legacy/tools": ["jquery", "lib/jquery/legacy/migrate"],
			"lib/jquery/legacy/tools/tooltip": ["lib/jquery/legacy/tools"],
			"lib/jquery/purl": ["jquery"],
			"lib/jquery/ui": ["jquery"],
			"lib/jquery-mask": ["jquery"],
			"lib/google/pay": {
				exports: "google"
			},
			"lib/google/translate": {
				exports: "google"
			},
			"lib/modernizr": {
				exports: "Modernizr"
			},
			"lib/ngMask": ["angularDependency"],
			"lib/Q": {
				exports: "Q"
			},
			"lib/tinymceui": ["angularDependency", "lib/tinymce"],
			"lib/toastr": ["jquery"],
			"lib/usmap": ["jquery", "lib/raphael"],
			"lib/white-web": {
				exports: "WhiteWebSdk"
			},
			"lib/agora-rtm-sdk": {
				exports: "AgoraRtmSdk"
			},
			"lib/wistia": {
				deps: ["jquery"],
				exports: "Wistia"
			},
			
			/*importantÃ©: inlineMath and displayMath are the delimiters. they have to match whats being used in the CMS. so if you change here, change in CMS as well*/
			"mathjax": {
				exports: "MathJax",
				deps: ["MathJaxConfig"]
			}
		}
	});
})();