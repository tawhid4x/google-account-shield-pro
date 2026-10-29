(() => {
"use strict";
const GUARD_KEY = "__gmas_content_loaded_account_menu_injector";
if (window[GUARD_KEY]) return;
window[GUARD_KEY] = true;
window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

// Injects the 200+ accounts into Google menu

window.__GMAS_SHARED__.AccountMenuInjector = class AccountMenuInjector {
    static harvestAccounts() {
        // Runs on ogs.google.com widget or SignOutOptions iframe
        if (!window.location.hostname.includes('google.com')) return;

        const accounts = [];

        // Very basic heuristic scan for accounts in the native menu
        document.querySelectorAll('a, div').forEach(el => {
            if (!el.textContent) return;
            const text = el.textContent.toLowerCase();

            // Check if it looks like an account card
            if (text.includes('@gmail.com') || text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)) {
                // Find nearest img for avatar
                const img = el.querySelector('img');
                const emailMatch = el.textContent.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                if (emailMatch) {
                    const email = emailMatch[1].toLowerCase();
                    // Basic deduplication
                    if (!accounts.find(a => a.email === email)) {
                        accounts.push({
                            email: email,
                            name: el.textContent.replace(emailMatch[1], '').replace(/signed out/i, '').replace(/sign in/i, '').replace(/remove/i, '').replace(/\n/g, ' ').trim(),
                            avatarUrl: img ? img.src : null,
                            status: text.includes('signed out') ? 'signed_out' : 'active'
                        });
                    }
                }
            }
        });

        if (accounts.length > 0) {
            chrome.runtime.sendMessage({
                type: 'SYNC_DISCOVERED_ACCOUNTS',
                payload: accounts
            }).catch(e => {
                // Ignore disconnect errors if background worker is asleep
            });
        }
    }

    static injectStatusBadge(accountElement, status) {
        let badge = accountElement.querySelector('.gmas-status-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'gmas-status-badge';
            accountElement.appendChild(badge);
        }

        switch (status) {
            case 'healthy':
                badge.textContent = '🟢 100% Healthy';
                break;
            case 'vaulted':
                badge.textContent = '🔵 Vaulted';
                break;
            case 'needs_refresh':
                badge.textContent = '🟠 Needs Refresh';
                break;
            default:
                badge.textContent = '🟢 Active';
        }
    }
}

// Auto-run harvesting if we are inside the Google account menu
if (window.location.href.includes('ogs.google.com/u/') || window.location.href.includes('accounts.google.com/SignOutOptions') || window.location.href.includes('accounts.google.com/v3/signin/accountchooser')) {
    // Run immediately and also observe for dynamic loading
    window.__GMAS_SHARED__.AccountMenuInjector.harvestAccounts();

    // Set up a debounced observer to re-harvest when the menu changes
    let timeout;
    const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            window.__GMAS_SHARED__.AccountMenuInjector.harvestAccounts();
        }, 1000);
    });

    const rootNode = document.documentElement || document.body;
    if (rootNode) {
        observer.observe(rootNode, { childList: true, subtree: true });
    }
}

})();
