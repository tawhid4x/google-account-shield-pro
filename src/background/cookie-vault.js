import { StorageManager } from '../shared/storage-manager.js';
import { STORAGE_KEYS, GOOGLE_DOMAINS } from '../shared/constants.js';

export class CookieVault {
    static async getVault() {
        return (await StorageManager.get(STORAGE_KEYS.VAULT)) || {};
    }

    static async snapshotCurrentSession(email, metadata = {}) {
        const cookies = [];
        for (const domain of GOOGLE_DOMAINS) {
            const domainCookies = await new Promise(resolve => {
                chrome.cookies.getAll({ domain }, (results) => resolve(results || []));
            });
            cookies.push(...domainCookies);
        }

        const vault = await this.getVault();
        vault[email] = {
            email,
            ...metadata,
            cookies,
            lastActive: Date.now(),
            status: "vaulted_ready"
        };

        await StorageManager.set(STORAGE_KEYS.VAULT, vault);
    }
}
