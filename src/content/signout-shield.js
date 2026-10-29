(() => {
  'use strict';
  const GUARD_KEY = '__gmas_content_loaded_signout_shield_js';
  if (window[GUARD_KEY]) return;
  window[GUARD_KEY] = true;

  window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

  document.documentElement.setAttribute('data-gmas-hide-signout', 'true');

  const signoutStrings = [
      "sign out of all accounts", "sign out", "log out",
      "সব অ্যাকাউন্ট থেকে সাইন-আউট করুন", "সাইন-আউট করুন", "সাইন আউট"
  ];

  function isProtectedElement(el) {
      if (!el || !el.textContent) return false;
      const text = el.textContent.toLowerCase();

      // Guard 1: Email protection
      if (text.includes('@')) return true;

      // Guard 2: Add account protection
      if (text.includes("add another account") || text.includes("add account") || text.includes("use another account")) return true;
      if (el.querySelector('a[href*="AddSession"]')) return true;

      // Guard 3: Manage account protection
      if (text.includes("manage your google account") || text.includes("myaccount.google.com")) return true;

      // Guard 4: Signed out badge & Sign in button protection
      if (text.includes("signed out") || text.includes("sign in") || text.includes("remove")) return true;

      // Guard 5: Multi-button & container protection
      if (el.querySelectorAll('a, button, [role="button"]').length > 1) return true;
      if (el.querySelectorAll('img').length > 0) return true;

      // Guard 6: Height & top-right profile button protection
      const rect = el.getBoundingClientRect();
      if (rect.height > 68) return true;
      const aria = el.getAttribute('aria-label');
      const href = el.getAttribute('href');
      if (aria && aria.toLowerCase().includes('google account')) return true;
      if (href && href.includes('SignOutOptions')) return true;

      return false;
  }

  const observer = new MutationObserver((mutations) => {
      const isHidden = document.documentElement.getAttribute('data-gmas-hide-signout') === 'true';

      if (!isHidden) {
          document.querySelectorAll('[data-gmas-signout-hidden="true"]').forEach(el => {
              el.style.removeProperty('display');
              el.removeAttribute('data-gmas-signout-hidden');
          });
          return;
      }

      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
          if (el.hasAttribute('data-gmas-signout-hidden')) return;

          const text = el.textContent?.replace(/\s+/g, ' ').trim().toLowerCase();
          const href = el.getAttribute('href');

          let isSignOut = false;
          if (href && href.includes('/Logout')) isSignOut = true;
          if (text && signoutStrings.includes(text)) isSignOut = true;

          if (isSignOut) {
              let target = el;
              if (el.parentElement && (el.parentElement.tagName === 'LI' || el.parentElement.tagName === 'DIV')) {
                  if (!isProtectedElement(el.parentElement)) {
                      target = el.parentElement;
                  }
              }

              if (!isProtectedElement(target)) {
                  target.setAttribute('data-gmas-signout-hidden', 'true');
                  target.style.setProperty('display', 'none', 'important');
              }
          }
      });
  });

  const rootNode = document.documentElement || document.body;
  if (rootNode) observer.observe(rootNode, { childList: true, subtree: true });

  window.addEventListener('click', (event) => {
      const isHidden = document.documentElement.getAttribute('data-gmas-hide-signout') === 'true';
      if (!isHidden) return;

      let path = event.composedPath();
      for (let el of path) {
          if (el.nodeType !== Node.ELEMENT_NODE) continue;
          if (el.getAttribute('data-gmas-signout-hidden') === 'true') {
              event.preventDefault();
              event.stopImmediatePropagation();
              return;
          }
      }
  }, true);

})();
