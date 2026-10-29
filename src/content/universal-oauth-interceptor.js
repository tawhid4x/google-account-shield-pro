(() => {
  'use strict';
  const GUARD_KEY = '__gmas_content_loaded_universal_oauth_interceptor_js';
  if (window[GUARD_KEY]) return;
  window[GUARD_KEY] = true;

  window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

  // Intercepts OAuth choosers

  // Assign classes to shared if needed
  if (typeof SeamlessStatePreserver !== 'undefined') window.__GMAS_SHARED__.SeamlessStatePreserver = SeamlessStatePreserver;
  if (typeof OmniCommandBar !== 'undefined') window.__GMAS_SHARED__.OmniCommandBar = OmniCommandBar;

})();
