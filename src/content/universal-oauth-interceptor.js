(() => {
"use strict";
const GUARD_KEY = "__gmas_content_loaded_universal_oauth_interceptor";
if (window[GUARD_KEY]) return;
window[GUARD_KEY] = true;
window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

// Intercepts OAuth choosers
})();
