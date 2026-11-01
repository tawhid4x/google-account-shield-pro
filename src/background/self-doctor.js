class SelfDoctor {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        chrome.runtime.onStartup.addListener(() => this.runDiagnostics());
        chrome.runtime.onInstalled.addListener(() => this.runDiagnostics());
    }

    async runDiagnostics() {
        console.log("Self-Doctor: Running vault diagnostics and auto-repair...");

        try {
            const result = await chrome.storage.local.get('gmas_account_vault');
            const vault = result.gmas_account_vault;

            if (!vault) {
                console.log("Self-Doctor: Vault is empty, skipping.");
                return;
            }

            let modified = false;
            const healthyVault = {};
            const dedupeSet = new Set();

            for (const [key, account] of Object.entries(vault)) {
                // Check essential fields
                if (!account || typeof account !== 'object') continue;
                if (!account.email || typeof account.email !== 'string') continue;
                if (!account.name || typeof account.name !== 'string') account.name = "Unknown Account";

                // Deduplicate logic
                const normalizedEmail = account.email.trim().toLowerCase();
                if (dedupeSet.has(normalizedEmail)) {
                    modified = true;
                    continue; // Skip duplicates
                }
                dedupeSet.add(normalizedEmail);

                // Check and normalize cookies
                if (!Array.isArray(account.cookies)) {
                    account.cookies = [];
                    modified = true;
                } else {
                    const validCookies = account.cookies.filter(c => {
                        return c && typeof c.name === 'string' && typeof c.value === 'string' && typeof c.domain === 'string';
                    });
                    if (validCookies.length !== account.cookies.length) {
                        account.cookies = validCookies;
                        modified = true;
                    }
                }

                healthyVault[normalizedEmail] = account;
            }

            if (modified || Object.keys(vault).length !== Object.keys(healthyVault).length) {
                await chrome.storage.local.set({ gmas_account_vault: healthyVault });
                console.log(`Self-Doctor: Repaired vault schema. Remaining valid accounts: ${Object.keys(healthyVault).length}`);
            } else {
                console.log("Self-Doctor: Vault schema is 100% healthy.");
            }
        } catch (e) {
            console.error("Self-Doctor: Failed to run diagnostics", e);
        }
    }
}

// Instantiate the doctor
const doctor = new SelfDoctor();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelfDoctor;
}
