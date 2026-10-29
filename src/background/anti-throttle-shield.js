export class AntiThrottleShield {
    static async scrubStaleCookies(domains) {
        const authCookies = ['SID', 'HSID', 'SSID', 'APISID', 'SAPISID', 'LSID', '__Secure-1PSID', '__Secure-3PSID', '__Secure-1PSIDTS', '__Secure-3PSIDTS', '__Secure-1PSIDCC', '__Secure-3PSIDCC', 'SIDCC', 'ACCOUNT_CHOOSER'];

        for (const domain of domains) {
            const allCookies = await chrome.cookies.getAll({ domain });
            for (const cookie of allCookies) {
                if (authCookies.includes(cookie.name)) {
                    let url = (cookie.secure ? 'https://' : 'http://') + cookie.domain.replace(/^\./, '') + cookie.path;
                    await chrome.cookies.remove({ url, name: cookie.name });
                }
            }
        }
    }

    static async applyJitter(minMs = 50, maxMs = 150) {
        const jitter = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        return new Promise(resolve => setTimeout(resolve, jitter));
    }
}
