export class TabIsolationEngine {
    static init() {
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            if (msg.type === 'NOTIFY_BACKGROUND_TABS' && sender.tab) {
                this.notifyBackgroundTabs(sender.tab.id, msg.email);
            }
        });
    }

    static async notifyBackgroundTabs(activeTabId, newEmail) {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (tab.id !== activeTabId && tab.url && tab.url.includes('.google.')) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        type: 'SHOW_BACKGROUND_SYNC_TOAST',
                        email: newEmail
                    });
                } catch (e) {
                    // Ignore if content script is not loaded
                }
            }
        }
    }

    static async multiplexNewTab(targetEmail) {
        // Implement multiplex logic here
        // Opens targetEmail in a new tab without signing out the current one
        // (Simplified placeholder as per spec)
    }
}
TabIsolationEngine.init();
