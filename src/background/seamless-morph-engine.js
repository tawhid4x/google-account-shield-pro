export class SeamlessMorphEngine {
    static async morphSession(tabId, email) {
        try {
            await chrome.tabs.sendMessage(tabId, { type: 'BEFORE_ACCOUNT_SWITCH' });
        } catch (e) {
            // Ignore if content script is not active
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}
