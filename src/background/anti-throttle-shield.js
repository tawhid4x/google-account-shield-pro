export class AtomicCookieScrubber {
    static async scrubResiduals() {
        const domains = ['.google.com', 'accounts.google.com', 'mail.google.com', '.youtube.com'];
        for (const domain of domains) {
            try {
                const cookies = await chrome.cookies.getAll({ domain });
                for (const cookie of cookies) {
                    if (cookie.name === 'PREF') continue; // Keep non-auth site preferences

                    const url = (cookie.secure ? "https://" : "http://") + cookie.domain + cookie.path;
                    await chrome.cookies.remove({ url: url, name: cookie.name });
                }
            } catch (e) {
                console.error('Failed to scrub domain', domain, e);
            }
        }
    }
}

export class BurstPacingGovernor {
    static lastRequestTime = 0;
    static minInterval = 100; // ms jitter base

    static async pace() {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        const jitter = Math.floor(Math.random() * 100) + 50; // 50-150ms jitter

        if (elapsed < (this.minInterval + jitter)) {
            const delay = (this.minInterval + jitter) - elapsed;
            await new Promise(r => setTimeout(r, delay));
        }

        this.lastRequestTime = Date.now();
    }
}

export class AntiThrottleShield {
    static async scrub() {
        await AtomicCookieScrubber.scrubResiduals();
    }

    static async throttle() {
        await BurstPacingGovernor.pace();
    }
}
