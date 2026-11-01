class AccountPulseMonitor {
    constructor() {
        this.startListening();
    }

    startListening() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'SYNC_ACCOUNT_PULSE') {
                this.updateAccountPulse(message.email, message.pulseData)
                    .then(() => sendResponse({ success: true }))
                    .catch(e => {
                        console.error('Failed to update account pulse', e);
                        sendResponse({ success: false, error: e.message });
                    });
                return true;
            }
        });
    }

    async updateAccountPulse(email, pulseData) {
        if (!email || !pulseData) return;

        const result = await chrome.storage.local.get('gmas_account_vault');
        const vault = result.gmas_account_vault || {};

        if (vault[email]) {
            vault[email].pulse = {
                ...vault[email].pulse,
                ...pulseData,
                lastUpdated: Date.now()
            };

            await chrome.storage.local.set({ gmas_account_vault: vault });
            console.log(`Account Pulse Monitor: Updated pulse for ${email}`, pulseData);
        }
    }

    // Helper to be injected into content scripts or run via scripting API
    static contentScriptScraper() {
        const pulseData = {};

        // Check for unread count in title (e.g. "Inbox (14) - user@gmail.com")
        const match = document.title.match(/\((\d+)\)/);
        if (match) {
            pulseData.unreadCount = parseInt(match[1], 10);
        }

        // Determine service badge based on hostname
        const host = window.location.hostname;
        if (host.includes('mail.google.com')) pulseData.serviceBadge = '📧';
        else if (host.includes('youtube.com')) pulseData.serviceBadge = '📺';
        else if (host.includes('drive.google.com')) pulseData.serviceBadge = '☁️';
        else pulseData.serviceBadge = '🛡️';

        // Send the message using the currently active email in DOM
        const emailElement = document.querySelector('div.gb_xb.gb_yb, .y7OZL');
        if (emailElement) {
            const email = emailElement.textContent.trim();
            chrome.runtime.sendMessage({
                type: 'SYNC_ACCOUNT_PULSE',
                email: email,
                pulseData: pulseData
            }).catch(e => console.error("Error sending pulse:", e));
        }

        return pulseData;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccountPulseMonitor;
}

// Instantiate the monitor
const pulseMonitor = new AccountPulseMonitor();
