(() => {
  'use strict';
  const GUARD_KEY = '__gmas_content_loaded_auto_healer_js';
  if (window[GUARD_KEY]) return;
  window[GUARD_KEY] = true;

  window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

  // Auto-heals signed out badges

  // Assign classes to shared if needed
  if (typeof SeamlessStatePreserver !== 'undefined') window.__GMAS_SHARED__.SeamlessStatePreserver = SeamlessStatePreserver;
  if (typeof OmniCommandBar !== 'undefined') window.__GMAS_SHARED__.OmniCommandBar = OmniCommandBar;

})();
