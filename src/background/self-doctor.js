export class SelfDoctor {
    static async checkAndRepairVault() {
        try {
            const { gmas_account_vault = {} } = await chrome.storage.local.get('gmas_account_vault');
            let repaired = false;
            const healthyVault = {};

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
                    addedAt: accountData.addedAt || Date.now(),
                    lastActive: accountData.lastActive || Date.now(),
                    tags: accountData.tags || '',
                    pulse: accountData.pulse || null
                };

                // Filter out malformed cookies
                const validCookies = healthyAccount.cookies.filter(cookie => {
                    return cookie && typeof cookie.name === 'string' && typeof cookie.value === 'string' && typeof cookie.domain === 'string';
                });

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
