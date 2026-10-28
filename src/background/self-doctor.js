export class SelfDoctor {
    static async validateAndRepairVault() {
        return new Promise((resolve) => {
            chrome.storage.local.get('gmas_account_vault', (res) => {
                let vault = res.gmas_account_vault || {};
                let repaired = false;

                const repairedVault = {};
                const seenEmails = new Set();

                for (const [key, account] of Object.entries(vault)) {
                    if (!account || typeof account !== 'object') {
                        repaired = true;
                        continue;
                    }

                    const email = account.email ? account.email.trim().toLowerCase() : null;
                    if (!email) {
                        repaired = true;
                        continue; // Skip invalid entries
                    }

                    if (seenEmails.has(email)) {
                        repaired = true;
                        continue; // Deduplicate
                    }
                    seenEmails.add(email);

                    // Ensure required fields
                    repairedVault[email] = {
                        email: email,
                        name: account.name || 'Unknown User',
                        avatarUrl: account.avatarUrl || '',
                        status: account.status || 'needs_reauth',
                        lastActive: account.lastActive || Date.now(),
                        tags: Array.isArray(account.tags) ? account.tags : [],
                        cookies: Array.isArray(account.cookies) ? this.sanitizeCookies(account.cookies) : [],
                        metadata: account.metadata || {}
                    };

                    // Check if repair happened due to normalization
                    if (JSON.stringify(account) !== JSON.stringify(repairedVault[email])) {
                        repaired = true;
                    }
                }

                if (repaired) {
                    chrome.storage.local.set({ gmas_account_vault: repairedVault }, () => {
                        console.log('SelfDoctor: Vault repaired successfully.');
                        resolve(repairedVault);
                    });
                } else {
                    resolve(vault);
                }
            });
        });
    }

    static sanitizeCookies(cookies) {
        const now = Date.now() / 1000;
        return cookies.map(c => {
            // Strip expired
            if (c.expirationDate && c.expirationDate < now) {
                return null;
            }
            // Normalize domain prefix
            if (c.name.startsWith('__Host-')) {
                c.domain = c.domain.replace(/^\./, '');
                c.path = '/';
                c.secure = true;
            }
            if (c.name.startsWith('__Secure-')) {
                c.secure = true;
            }
            return c;
        }).filter(Boolean);
    }
}

chrome.runtime.onStartup.addListener(() => {
    SelfDoctor.validateAndRepairVault();
});

chrome.runtime.onInstalled.addListener(() => {
    SelfDoctor.validateAndRepairVault();
});
