(() => {
"use strict";
const GUARD_KEY = "__gmas_content_loaded_signout_shield";
if (window[GUARD_KEY]) return;
window[GUARD_KEY] = true;
window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

document.documentElement.setAttribute('data-gmas-hide-signout', 'true');

const signoutStrings = [
    "sign out of all accounts", "sign out", "log out", "sign out of all",
    "সব অ্যাকাউন্ট থেকে সাইন-আউট করুন", "সাইন-আউট করুন", "সাইন আউট"
];

function isProtectedElement(el) {
    const text = (el.textContent || "").toLowerCase();
    const html = (el.innerHTML || "").toLowerCase();
    const href = (el.href || "").toLowerCase();
    const aria = (el.getAttribute('aria-label') || "").toLowerCase();

    // Guard 1: Email protection
    if (text.includes("@")) return true;

    // Guard 2: Add account protection
    if (text.includes("add another account") || text.includes("add account") || text.includes("use another account") || html.includes("addsession")) return true;

    // Guard 3: Manage account protection
    if (text.includes("manage your google account") || href.includes("myaccount.google.com")) return true;

    // Guard 4: "Signed out" / "Sign in" / "Remove" badge protection
    if (text.includes("signed out") || text.includes("sign in") || text.includes("remove")) return true;

    // Guard 5: Multi-button & container protection
    const linksAndButtons = el.querySelectorAll('a, button, [role="button"]');
    const images = el.querySelectorAll('img');
    if (linksAndButtons.length > 1 || images.length > 0) return true;

    // Guard 6: Height and trigger protection
    const rect = el.getBoundingClientRect();
    if (rect.height > 68) return true;
    if (aria.includes("google account:") || href.includes("signoutoptions")) return true;

    return false;
}

const observer = new MutationObserver((mutations) => {
    const isHidden = document.documentElement.getAttribute('data-gmas-hide-signout') === 'true';
    if (!isHidden) {
        document.querySelectorAll('[data-gmas-signout-hidden="true"]').forEach(el => {
            el.removeAttribute('data-gmas-signout-hidden');
            el.style.cssText = '';
        });
        return;
    }

    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        if (isProtectedElement(el)) return;

        const text = el.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
        const href = (el.href || "").toLowerCase();

        let match = false;
        if (href.includes("/logout") || href.includes("accounts.google.com/logout")) match = true;
        if (signoutStrings.includes(text)) match = true;

        if (match) {
            let target = el;
            if (el.parentElement && (el.parentElement.tagName === 'LI' || el.parentElement.tagName === 'DIV')) {
                if (!isProtectedElement(el.parentElement)) {
                    target = el.parentElement;
                }
            }
            target.setAttribute('data-gmas-signout-hidden', 'true');
            target.style.setProperty('display', 'none', 'important');
            target.style.setProperty('visibility', 'hidden', 'important');
            target.style.setProperty('pointer-events', 'none', 'important');
            target.style.setProperty('height', '0', 'important');
            target.style.setProperty('margin', '0', 'important');
            target.style.setProperty('padding', '0', 'important');
            target.style.setProperty('overflow', 'hidden', 'important');
        }
    });
});

const rootNode = document.documentElement || document.body;
if (rootNode) {
    observer.observe(rootNode, { childList: true, subtree: true });
}

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
        if (el.tagName === 'A' && el.href && (el.href.includes('/Logout') || el.href.includes('accounts.google.com/SignOutOptions'))) {
            // Check if it's the top right avatar, don't block
            if (!(el.getAttribute('aria-label') && el.getAttribute('aria-label').includes("Google Account:"))) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
        }

        // Fix Bug 2: Prevent bare AddSession links from redirecting to myaccount
        if (el.tagName === 'A' && el.href && (el.href.includes('AddSession') || el.href.includes('AccountChooser'))) {
            let currentUrl = window.location.href;
            if (currentUrl.includes('myaccount.google.com') || currentUrl.includes('SignOutOptions')) {
                currentUrl = 'https://www.google.com/';
            }
            // Save the return URL to local storage for the background worker to use
            chrome.storage.local.set({ lastReturnUrl: currentUrl });

            if (!el.href.includes('continue=')) {
                event.preventDefault();
                event.stopImmediatePropagation();
                const separator = el.href.includes('?') ? '&' : '?';
                window.location.href = el.href + separator + 'continue=' + encodeURIComponent(currentUrl);
                return;
            }
        }
    }
}, true);
})();
