document.documentElement.setAttribute('data-gmas-hide-signout', 'true');

const signoutStrings = [
    "sign out of all accounts", "sign out", "log out", "sign out of all",
    "সব অ্যাকাউন্ট থেকে সাইন-আউট করুন", "সাইন-আউট করুন", "সাইন আউট"
];

const observer = new MutationObserver((mutations) => {
    const isHidden = document.documentElement.getAttribute('data-gmas-hide-signout') === 'true';
    if (!isHidden) return;

    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        const text = el.textContent?.trim().toLowerCase() || "";
        const aria = el.getAttribute('aria-label')?.trim().toLowerCase() || "";
        const html = el.innerHTML || "";
        const href = (el.href || "").toLowerCase();

        // Never hide the trigger button
        if (aria.includes("google account:")) return;

        // Never hide an element containing an email address or "Add another account"
        if (text.includes("@") || text.includes("add another account") || html.includes("<img")) return;

        let match = false;
        if (signoutStrings.includes(text)) match = true;
        if (signoutStrings.includes(aria)) match = true;
        if (href.includes("/logout") || href.includes("accounts.google.com/logout")) match = true;

        if (match) {
            let target = el;
            // Go up one level to hide the container if it's small and safe
            if (el.parentElement && (el.parentElement.tagName === 'LI' || el.parentElement.tagName === 'DIV')) {
                const parentHtml = el.parentElement.innerHTML;
                const parentText = el.parentElement.textContent.trim().toLowerCase();

                // Ensure parent doesn't contain multiple buttons, emails, or avatars
                if (!parentText.includes("@") && !parentText.includes("add another account") && !parentHtml.includes("<img") && el.parentElement.offsetHeight < 75) {
                    const linksAndButtons = el.parentElement.querySelectorAll('a, button, [role="button"]');
                    if (linksAndButtons.length <= 1 || Array.from(linksAndButtons).every(b => signoutStrings.includes(b.textContent?.trim().toLowerCase()))) {
                        target = el.parentElement;
                    }
                }
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

        // Fix Bug 2: Prevent bare AddSession links from redirecting to myaccount
        if (el.tagName === 'A' && el.href && (el.href.includes('AddSession') || el.href.includes('AccountChooser'))) {
            if (!el.href.includes('continue=')) {
                event.preventDefault();
                event.stopImmediatePropagation();

                let currentUrl = window.location.href;
                if (currentUrl.includes('myaccount.google.com') || currentUrl.includes('SignOutOptions')) {
                    currentUrl = 'https://www.google.com/';
                }

                const separator = el.href.includes('?') ? '&' : '?';
                window.location.href = el.href + separator + 'continue=' + encodeURIComponent(currentUrl);
                return;
            }
        }
    }
}, true);
