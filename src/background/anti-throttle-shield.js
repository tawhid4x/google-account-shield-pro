export class AntiThrottleShield {
    static async scrubStaleCookies(domains) {
        // Precise list of Google Auth cookies to scrub, leaving non-auth (like PREF) intact
        const authCookies = [
            'SID', 'HSID', 'SSID', 'APISID', 'SAPISID', 'LSID',
            '__Secure-1PSID', '__Secure-3PSID', '__Secure-1PSIDTS',
            '__Secure-3PSIDTS', '__Secure-1PSIDCC', '__Secure-3PSIDCC',
            '__Secure-1PAPISID', '__Secure-3PAPISID', 'SIDCC', 'ACCOUNT_CHOOSER',
            '__Host-GAPS', 'OSID', 'COMPASS', 'NID', 'AEC'
        ];

        for (const domain of domains) {
            const allCookies = await chrome.cookies.getAll({ domain });
            for (const cookie of allCookies) {
                if (authCookies.includes(cookie.name)) {
                    // Correctly handle __Host- and __Secure- prefixes by respecting path and secure flag
                    let url = (cookie.secure ? 'https://' : 'http://') + cookie.domain.replace(/^\./, '') + cookie.path;
                    await chrome.cookies.remove({ url, name: cookie.name });
                }
            }
        }
    }

    static async applyJitter(minMs = 50, maxMs = 150) {
        // Smart Jitter & Burst Pacing Governor
        const jitter = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        return new Promise(resolve => setTimeout(resolve, jitter));
    }
}
