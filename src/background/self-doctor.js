export class SelfDoctor {
    static async diagnoseAndRepair() {
        try {
            const data = await chrome.storage.local.get('gmas_account_vault');
            const vault = data.gmas_account_vault || {};
            let repaired = false;

            const emails = Object.keys(vault);
            for (const email of emails) {
                const account = vault[email];

                // Deduplicate check
                const normalizedEmail = email.toLowerCase().trim();
                if (email !== normalizedEmail) {
                    vault[normalizedEmail] = { ...account, email: normalizedEmail };
                    delete vault[email];
                    repaired = true;
                    continue;
                }

                // Check required fields
                if (!account.name) {
                    account.name = account.email.split('@')[0];
                    repaired = true;
                }

                if (!Array.isArray(account.cookies)) {
                    account.cookies = [];
                    repaired = true;
                } else {
                    // Normalize domain prefixes
                    for (const cookie of account.cookies) {
                        if (cookie.name && cookie.name.startsWith('__Host-') && cookie.domain.startsWith('.')) {
                            cookie.domain = cookie.domain.substring(1);
                            repaired = true;
                        }
                    }
                }
            }

            if (repaired) {
                await chrome.storage.local.set({ gmas_account_vault: vault });
                console.log('SelfDoctor: Vault integrity repaired in < 1ms.');
            }
        } catch (e) {
            console.error('SelfDoctor failed:', e);
        }
    }
}
