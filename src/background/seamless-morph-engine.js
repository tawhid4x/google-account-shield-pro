class SeamlessMorphEngine {
    constructor() {
        this.listenForSwitchRequests();
    }

    listenForSwitchRequests() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'REQUEST_SEAMLESS_SWITCH') {
                this.performSeamlessSwitch(message.email, sender.tab?.id)
                    .then(() => sendResponse({ success: true }))
                    .catch(err => {
                        console.error('Seamless switch failed:', err);
                        sendResponse({ success: false, error: err.message });
                    });
                return true; // Keep message channel open for async response
            }
        });
    }

    async performSeamlessSwitch(targetEmail, tabId) {
        if (!tabId) {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0) tabId = tabs[0].id;
        }

        if (tabId) {
            try {
                // Signal content script to capture transient state
                await chrome.tabs.sendMessage(tabId, { type: 'BEFORE_ACCOUNT_SWITCH' });
            } catch (e) {
                console.warn('Could not contact content script for state preservation', e);
            }
        }

        // Perform atomic cookie swap (Module 23 logic usually handles the actual purging/setting,
        // but we trigger the hot-swap process here)
        await this.hotSwapCookies(targetEmail);

        if (tabId) {
            // Optional: Module 1 logic to sanitize URL before reload can go here
            await chrome.tabs.reload(tabId);
        }
    }

    async hotSwapCookies(targetEmail) {
        // Retrieve target account cookies from vault
        const result = await chrome.storage.local.get('gmas_account_vault');
        const vault = result.gmas_account_vault || {};
        const targetAccount = vault[targetEmail];

        if (!targetAccount || !targetAccount.cookies) {
            throw new Error('Target account cookies not found in vault');
        }

        // We depend on AntiThrottleShield/SessionRotator to cleanly purge current cookies,
        // but for safety in this module, we ensure the new ones are set.
        // A complete implementation would integrate with AntiThrottleShield.

        for (const cookie of targetAccount.cookies) {
            let url = (cookie.secure ? "https://" : "http://") + cookie.domain.replace(/^\./, "") + cookie.path;
            let cookieToSet = {
                url: url,
                name: cookie.name,
                value: cookie.value,
                path: cookie.path,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                sameSite: cookie.sameSite,
                storeId: cookie.storeId
            };
            if (!cookie.hostOnly) cookieToSet.domain = cookie.domain;
            if (!cookie.session && cookie.expirationDate) cookieToSet.expirationDate = cookie.expirationDate;

            try {
                await chrome.cookies.set(cookieToSet);
            } catch (e) {
                console.warn('Failed to set cookie', cookie.name, e);
            }
        }

        console.log(`Morph Engine: Orchestrated hot-swap for ${targetEmail}`);

        return true;
    }
}

// Instantiate the engine
const morphEngine = new SeamlessMorphEngine();
