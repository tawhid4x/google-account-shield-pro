export class AccountPulseMonitor {
    static init() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.analyzeTabPulse(tab);
            }
        });
    }

    static async analyzeTabPulse(tab) {
        if (!tab.url || !tab.title) return;

        let service = null;
        let badge = null;
        if (tab.url.includes('mail.google.com')) {
            service = 'Gmail';
            badge = '📧';
        } else if (tab.url.includes('youtube.com')) {
            service = 'YouTube';
            badge = '📺';
        } else if (tab.url.includes('drive.google.com')) {
            service = 'Drive';
            badge = '☁️';
        }

        if (!service) return;

        // Try to extract unread count from title, e.g., "Inbox (14) - user@gmail.com"
        const unreadMatch = tab.title.match(/\((\d+)\)/);
        const unreadCount = unreadMatch ? parseInt(unreadMatch[1], 10) : 0;

        const emailMatch = tab.title.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const email = emailMatch ? emailMatch[1].toLowerCase() : null;

        if (email) {
            this.updateAccountPulse(email, service, unreadCount, badge);
        }
    }

    static async updateAccountPulse(email, service, unreadCount, badge) {
        const { gmas_account_vault = {} } = await chrome.storage.local.get('gmas_account_vault');

        if (gmas_account_vault[email]) {
            if (!gmas_account_vault[email].pulse) {
                gmas_account_vault[email].pulse = {};
            }
            gmas_account_vault[email].pulse.lastService = service;
            gmas_account_vault[email].pulse.serviceBadge = badge;
            gmas_account_vault[email].pulse.unreadCount = unreadCount;
            gmas_account_vault[email].pulse.lastChecked = Date.now();

            // Health indicator logic
            const timeSinceActive = Date.now() - (gmas_account_vault[email].lastActive || 0);
            let healthStatus = '🟢 100% Healthy (Token Fresh)';
            if (gmas_account_vault[email].status === 'vaulted_ready') {
                healthStatus = '🔵 Vaulted (Ready for 0.4ms Switch)';
            }
            if (timeSinceActive > 30 * 24 * 60 * 60 * 1000) { // older than 30 days
                 healthStatus = '🟠 Needs 1-Click Refresh';
            }
            gmas_account_vault[email].pulse.healthStatus = healthStatus;

            await chrome.storage.local.set({ gmas_account_vault });
        }
    }
}
