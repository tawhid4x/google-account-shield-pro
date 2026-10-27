document.documentElement.setAttribute('data-gmas-hide-signout', 'true');

const signoutStrings = [
    "sign out of all accounts", "sign out", "log out", "sign out of all",
    "সব অ্যাকাউন্ট থেকে সাইন-আউট করুন", "সাইন-আউট করুন", "সাইন আউট"
];

const observer = new MutationObserver((mutations) => {
    const isHidden = document.documentElement.getAttribute('data-gmas-hide-signout') === 'true';
    if (!isHidden) return;

    document.querySelectorAll('a, button, [role="button"], [role="menuitem"], [role="listitem"]').forEach(el => {
        const text = el.textContent?.trim().toLowerCase();
        const aria = el.getAttribute('aria-label')?.trim().toLowerCase();

        // Never hide the trigger button
        if (aria && aria.includes("google account:")) return;

        let match = false;
        if (text && signoutStrings.includes(text)) match = true;
        if (aria && signoutStrings.includes(aria)) match = true;

        // Check for specific SVG path
        if (!match && el.querySelector('svg path[d*="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"]')) {
            match = true;
        }

        if (match) {
            let target = el;
            // Go up one or two levels to hide the container
            if (el.parentElement && (el.parentElement.tagName === 'LI' || el.parentElement.tagName === 'DIV')) {
                target = el.parentElement;
            }
            target.setAttribute('data-gmas-signout-hidden', 'true');
            target.style.cssText = "display: none !important; visibility: hidden !important; pointer-events: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important;";
        }
    });
});

observer.observe(document.documentElement, { childList: true, subtree: true });

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
    }
}, true);
