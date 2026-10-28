export class AccountPulseMonitor {
    static async updatePassiveMetadata(tabId, url, title) {
        if (!url || !title) return;

        // Passive extraction without network requests
        let badge = null;
        let count = 0;

        if (url.includes('mail.google.com')) {
            const match = title.match(/Inbox \((\d+)\)/);
            if (match) {
                count = parseInt(match[1]);
                badge = `📧 ${count}`;
            }
        } else if (url.includes('youtube.com')) {
            badge = '📺 YT';
        } else if (url.includes('drive.google.com')) {
            badge = '☁️ Drive';
        }

        if (badge) {
            // Assume we can get active email from another service
            const activeEmail = await this.getActiveEmail();
            if (activeEmail) {
                this.saveMetadata(activeEmail, { badge, count, lastSeen: Date.now() });
            }
        }
    }

    static async getActiveEmail() {
        return new Promise(resolve => {
            chrome.storage.local.get('gmas_active_email', (res) => {
                resolve(res.gmas_active_email);
            });
        });
    }

    static saveMetadata(email, data) {
        chrome.storage.local.get('gmas_account_vault', (res) => {
            const vault = res.gmas_account_vault || {};
            if (vault[email]) {
                vault[email].metadata = { ...(vault[email].metadata || {}), ...data };
                chrome.storage.local.set({ gmas_account_vault: vault });
            }
        });
    }

    static getStatusBadge(account) {
        if (account.status === 'active_in_browser') return '🟢 100% Healthy (Token Fresh)';
        if (account.status === 'vaulted_ready') return '🔵 Vaulted (Ready for 0.4ms Switch)';
        return '🟠 Needs 1-Click Refresh';
    }
}
