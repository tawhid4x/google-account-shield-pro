export class HoneypotDefense {
    static quarantinedOrigins = new Set();

    static init() {
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            // Verify sender identity
            if (sender.id !== chrome.runtime.id) {
                return false;
            }

            // Verify sender URL
            const url = sender.url || '';
            const isValidOrigin = url.startsWith('chrome-extension://') ||
                                  url.match(/^https:\/\/[a-zA-Z0-9-.]*\.google\.[a-z.]+/) ||
                                  url.match(/^https:\/\/[a-zA-Z0-9-.]*\.youtube\.com/);

            if (!isValidOrigin && url !== '') {
                this.quarantinedOrigins.add(url);
                return false;
            }

            if (msg.type === 'DUMP_RAW_COOKIES') {
                // Honeypot tripped!
                this.tripwire(url);
                sendResponse({ error: "Access Denied", data: { __gmas_canary_trap_token: "TRAPPED" } });
                return true;
            }
        });
    }

    static tripwire(origin) {
        if (origin) {
            this.quarantinedOrigins.add(origin);
        }
        console.warn("Security Alert: Unauthorized access attempt blocked. Origin quarantined.");
        // We could also lock the vault here if needed
    }

    static isQuarantined(url) {
        return this.quarantinedOrigins.has(url);
    }
}

HoneypotDefense.init();
