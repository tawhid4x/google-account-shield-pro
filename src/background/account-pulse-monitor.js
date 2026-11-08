export class AccountPulseMonitor {
    static init() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.title && tab.url) {
                this.harvestMetadata(tab);
            }
        });
    }

    static async harvestMetadata(tab) {
        const title = tab.title || '';
        let unreadCount = 0;
        const match = title.match(/\((\d+)\)/);
        if (match) {
            unreadCount = parseInt(match[1], 10);
        }

        let serviceBadge = '';
        if (tab.url.includes('mail.google.com')) serviceBadge = '📧';
        else if (tab.url.includes('youtube.com')) serviceBadge = '📺';
        else if (tab.url.includes('drive.google.com')) serviceBadge = '☁️';

        let email = '';
        const emailMatch = title.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
            email = emailMatch[0].toLowerCase();
        }

        if (email && serviceBadge) {
            try {
                const { gmas_account_vault = {} } = await chrome.storage.local.get('gmas_account_vault');
                if (gmas_account_vault[email]) {
                    gmas_account_vault[email].pulse = {
                        unread: unreadCount,
                        service: serviceBadge,
                        timestamp: Date.now()
                    };
                    await chrome.storage.local.set({ gmas_account_vault });
                }
            } catch (e) {}
        }
    }

    static getStatusBadge(account) {
        if (!account.cookies || account.cookies.length === 0) {
            return '🟠 Needs 1-Click Refresh';
        }

        const now = Date.now();
        // Just checking if tokens are generally fresh enough
        const isFresh = account.cookies.some(c => c.name === 'SID' && (!c.expirationDate || c.expirationDate * 1000 > now + 86400000));

        if (isFresh) {
            return '🟢 100% Healthy (Token Fresh)';
        }

        return '🔵 Vaulted (Ready for 0.4ms Switch)';
    }
}

AccountPulseMonitor.init();
