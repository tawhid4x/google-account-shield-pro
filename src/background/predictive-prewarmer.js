import { CookieVault } from './cookie-vault.js';

export class PredictivePrewarmer {
    static preStagedBuffer = new Map();

    static init() {
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            if (msg.type === 'PREWARM_ACCOUNT_SESSION') {
                this.prewarm(msg.email);
            }
        });
    }

    static async prewarm(email) {
        if (!email || this.preStagedBuffer.has(email)) return;

        try {
            const vault = await CookieVault.getVault();
            if (vault[email] && vault[email].cookies) {
                // Decrypt / prepare cookies in RAM buffer for instant access
                this.preStagedBuffer.set(email, vault[email].cookies);

                // Clear buffer after a short timeout if not used
                setTimeout(() => {
                    this.preStagedBuffer.delete(email);
                }, 5000);
            }
        } catch (e) {
            // Ignore prewarm failures
        }
    }

    static getPreStagedCookies(email) {
        return this.preStagedBuffer.get(email);
    }
}

PredictivePrewarmer.init();
