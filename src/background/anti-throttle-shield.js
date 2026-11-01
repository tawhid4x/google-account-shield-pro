class AntiThrottleShield {
    constructor() {
        this.domains = ['.google.com', 'accounts.google.com', 'mail.google.com', '.youtube.com'];
        this.authCookies = ['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', '__Secure-1PSID', '__Secure-3PSID', '__Secure-1PSIDTS', '__Secure-3PSIDTS', 'SIDCC'];
    }

    async delay(minMs = 50, maxMs = 150) {
        const ms = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async atomicScrubCookies() {
        console.log("Anti-Throttle Shield: Scrubbing residual auth cookies to prevent Gaia anomaly detection");

        for (const domain of this.domains) {
            const urlDomain = domain.startsWith('.') ? domain.substring(1) : domain;
            const url = `https://${urlDomain}/`;

            try {
                const cookies = await chrome.cookies.getAll({ domain: domain });
                for (const cookie of cookies) {
                    // Only scrub auth-related cookies, preserve preferences like PREF
                    if (this.authCookies.includes(cookie.name)) {
                        const cookieUrl = (cookie.secure ? "https://" : "http://") + cookie.domain.replace(/^\./, "") + cookie.path;
                        await chrome.cookies.remove({ url: cookieUrl, name: cookie.name });
                    }
                }
            } catch (e) {
                console.error(`Failed to scrub cookies for domain ${domain}:`, e);
            }
        }

        // Jitter pacing to avoid triggering bot detection
        await this.delay(100, 250);
    }

    async protectOperation(operation) {
        // Pre-operation delay jitter
        await this.delay(50, 150);
        try {
            return await operation();
        } finally {
            // Post-operation delay jitter
            await this.delay(50, 150);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AntiThrottleShield;
}
