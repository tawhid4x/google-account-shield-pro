export class AntiThrottleShield {
    static async scrubCookieJar(domain) {
        return new Promise(resolve => {
            chrome.cookies.getAll({ domain }, (cookies) => {
                const gaiaCookies = ['SID', 'HSID', 'SSID', '__Secure-1PSID', '__Secure-1PSIDTS', '__Secure-1PSIDCC', 'NID', 'AEC'];
                let count = 0;

                const toRemove = cookies.filter(c => gaiaCookies.includes(c.name));
                if (toRemove.length === 0) return resolve();

                toRemove.forEach(cookie => {
                    let url = `http${cookie.secure ? 's' : ''}://${cookie.domain.replace(/^\./, '')}${cookie.path}`;
                    chrome.cookies.remove({ url, name: cookie.name }, () => {
                        count++;
                        if (count === toRemove.length) resolve();
                    });
                });
            });
        });
    }

    static async applyJitter(minMs = 50, maxMs = 150) {
        const jitter = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        return new Promise(resolve => setTimeout(resolve, jitter));
    }
}
