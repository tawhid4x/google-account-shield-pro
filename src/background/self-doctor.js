export class SelfDoctor {
    static init() {
        chrome.runtime.onStartup.addListener(() => this.checkAndRepairVault());
        chrome.runtime.onInstalled.addListener(() => this.checkAndRepairVault());
    }

    static async checkAndRepairVault() {
        try {
            const { gmas_account_vault = {} } = await chrome.storage.local.get('gmas_account_vault');
            let repaired = false;
            const healthyVault = {};

            const now = Date.now();

            for (const [email, accountData] of Object.entries(gmas_account_vault)) {
                if (!email || !accountData) {
                    repaired = true;
                    continue;
                }

                // Deduplicate logic or format normalization
                const normalizedEmail = email.toLowerCase().trim();

                // Construct a healthy schema
                const healthyAccount = {
                    email: normalizedEmail,
                    name: accountData.name || normalizedEmail.split('@')[0],
                    avatarUrl: accountData.avatarUrl || '',
                    status: accountData.status || 'vaulted',
                    cookies: Array.isArray(accountData.cookies) ? accountData.cookies : [],
                    addedAt: accountData.addedAt || now,
                    lastActive: accountData.lastActive || now,
                    tags: accountData.tags || '',
                    pulse: accountData.pulse || null,
                    workspace: accountData.workspace || 'Personal'
                };

                // Filter out malformed cookies & fix __Host domain prefixes
                const validCookies = healthyAccount.cookies.map(cookie => {
                    if (!cookie || typeof cookie.name !== 'string' || typeof cookie.value !== 'string' || typeof cookie.domain !== 'string') {
                        return null;
                    }
                    if (cookie.expirationDate && cookie.expirationDate * 1000 < now) {
                        return null; // Expired
                    }
                    if (cookie.name.startsWith('__Host-') && cookie.domain.startsWith('.')) {
                        cookie.domain = cookie.domain.substring(1); // Strip leading dot for __Host cookies
                        repaired = true;
                    }
                    return cookie;
                }).filter(Boolean);

                if (validCookies.length !== healthyAccount.cookies.length) {
                    healthyAccount.cookies = validCookies;
                    repaired = true;
                }

                healthyVault[normalizedEmail] = healthyAccount;

                if (normalizedEmail !== email) {
                    repaired = true;
                }
            }

            if (repaired) {
                await chrome.storage.local.set({ gmas_account_vault: healthyVault });
            }
        } catch (e) {
            // Failsafe
        }
    }
}

SelfDoctor.init();
