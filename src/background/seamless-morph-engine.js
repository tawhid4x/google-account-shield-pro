export class SeamlessMorphEngine {
    static async morphSession(tabId, newAccountEmail, backgroundWorker) {
        // Send a message to content script to capture transient state
        try {
            await chrome.tabs.sendMessage(tabId, { type: 'BEFORE_ACCOUNT_SWITCH', email: newAccountEmail });
        } catch (e) {
            // Ignore error if content script not loaded
        }

        // Let the worker swap cookies
        await backgroundWorker.executeAccountSwap(newAccountEmail);

        // Ensure we reload the current tab cleanly
        const tab = await chrome.tabs.get(tabId);

        if (tab && tab.url) {
            let sanitizedUrl = tab.url;
            try {
                // If it's a google URL, sanitize the authuser parameter
                sanitizedUrl = await backgroundWorker.sanitizeUrl(tab.url, newAccountEmail);
            } catch(e) {}

            await chrome.tabs.update(tabId, { url: sanitizedUrl });
        } else {
            await chrome.tabs.reload(tabId);
        }
    }
}
