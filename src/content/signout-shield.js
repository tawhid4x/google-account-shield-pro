export class SignoutShield {
    static init() {
        chrome.storage.local.get(['hideSignout'], (res) => {
            if (res.hideSignout !== false) {
                document.documentElement.setAttribute('data-gmas-hide-signout', 'true');
                this.observeMenu();
            }
        });

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.hideSignout) {
                if (changes.hideSignout.newValue !== false) {
                    document.documentElement.setAttribute('data-gmas-hide-signout', 'true');
                    this.observeMenu();
                } else {
                    document.documentElement.removeAttribute('data-gmas-hide-signout');
                    this.unhideElements();
                }
            }
        });

        window.addEventListener('click', this.captureClick.bind(this), true);
    }

    static observeMenu() {
        const root = document.documentElement || document.body;
        if (!root) return;

        if (this.observer) this.observer.disconnect();

        this.observer = new MutationObserver((mutations) => {
            let shouldScan = false;
            for (const mut of mutations) {
                if (mut.addedNodes.length > 0 || mut.type === 'attributes') {
                    shouldScan = true;
                    break;
                }
            }
            if (shouldScan) {
                requestAnimationFrame(() => this.scanAndHide());
            }
        });

        this.observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['role', 'class', 'href'] });
        this.scanAndHide();
    }

    static scanAndHide() {
        const interactables = document.querySelectorAll('a, button, [role="button"], [role="menuitem"], [role="listitem"]');
        const signoutStrings = [
            "sign out of all accounts",
            "sign out",
            "log out",
            "sign out of all",
            "salir", "deconnexion", "abmelden"
        ];
        // Removed Bengali to enforce 100% English requirement from Phase 4

        for (const el of interactables) {
            // Safety Whitelist
            const aria = (el.getAttribute('aria-label') || '').toLowerCase();
            const text = el.textContent.trim().toLowerCase();
            const href = (el.getAttribute('href') || '').toLowerCase();

            if (aria.includes('google account:') || text.includes('add another account') || text.includes('add account') || text.includes('manage your google account') || href.includes('addsession') || href.includes('myaccount.google.com')) {
                continue;
            }

            let isSignout = false;
            if (signoutStrings.some(s => text === s || aria === s)) {
                isSignout = true;
            } else if (href.includes('/logout') && !href.includes('signoutoptions')) {
                isSignout = true;
            } else if (el.innerHTML.includes('M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z')) {
                isSignout = true;
            }

            if (isSignout) {
                let target = el;
                // Try to hide the parent row if it's a list item container
                if (el.parentElement && (el.parentElement.tagName === 'LI' || el.parentElement.getAttribute('role') === 'presentation')) {
                    target = el.parentElement;
                }

                if (target.getAttribute('data-gmas-signout-hidden') !== 'true') {
                    target.setAttribute('data-gmas-signout-hidden', 'true');
                    Object.assign(target.style, {
                        display: 'none',
                        visibility: 'hidden',
                        pointerEvents: 'none',
                        height: '0',
                        margin: '0',
                        padding: '0',
                        overflow: 'hidden'
                    });
                }
            }
        }
    }

    static unhideElements() {
        const hidden = document.querySelectorAll('[data-gmas-signout-hidden="true"]');
        for (const el of hidden) {
            el.removeAttribute('data-gmas-signout-hidden');
            el.style.display = '';
            el.style.visibility = '';
            el.style.pointerEvents = '';
            el.style.height = '';
            el.style.margin = '';
            el.style.padding = '';
            el.style.overflow = '';
        }
    }

    static captureClick(e) {
        if (document.documentElement.getAttribute('data-gmas-hide-signout') === 'true') {
            let target = e.target;
            while (target && target !== document) {
                if (target.getAttribute('data-gmas-signout-hidden') === 'true' ||
                    (target.tagName === 'A' && target.href && target.href.includes('/Logout') && !target.href.includes('SignOutOptions'))) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                target = target.parentNode;
            }
        }
    }
}

if (window.location.hostname === 'accounts.google.com' || window.location.hostname.includes('google.com')) {
    SignoutShield.init();
}