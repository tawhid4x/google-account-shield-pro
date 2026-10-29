(() => {
  'use strict';
  const GUARD_KEY = '__gmas_content_loaded_account_menu_injector_js';
  if (window[GUARD_KEY]) return;
  window[GUARD_KEY] = true;

  window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

  // Auto-harvest accounts from the native menu
  function harvestAccounts() {
      const accounts = [];
      // Look for standard account cards
      document.querySelectorAll('a[href*="AccountChooser"], div[data-email], li[data-email]').forEach(el => {
          const text = el.textContent || '';
          const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
          if (emailMatch) {
              const email = emailMatch[1].toLowerCase();
              let name = '';
              const img = el.querySelector('img');
              const avatarUrl = img ? img.src : '';

              const isSignedOut = text.toLowerCase().includes('signed out');

              // Simplistic name extraction (heuristic)
              const parts = text.split(emailMatch[1]);
              if (parts[0]) name = parts[0].trim();

              accounts.push({
                  email, name, avatarUrl, status: isSignedOut ? 'signed_out' : 'active'
              });
          }
      });

      if (accounts.length > 0) {
          chrome.runtime.sendMessage({ type: 'SYNC_DISCOVERED_ACCOUNTS', payload: accounts }).catch(() => {});
      }
  }

  // Observe menu opening or run immediately if already open
  harvestAccounts();
  const observer = new MutationObserver(() => harvestAccounts());
  const rootNode = document.documentElement || document.body;
  if (rootNode) observer.observe(rootNode, { childList: true, subtree: true });

  // Expose for command bar
  window.__GMAS_SHARED__.harvestAccounts = harvestAccounts;

})();
