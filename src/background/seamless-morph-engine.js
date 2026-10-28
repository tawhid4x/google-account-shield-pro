export class SeamlessMorphEngine {
    static hydrateState(tabId, state) {
        if (!state) return Promise.resolve();

        return chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (injectedState) => {
                sessionStorage.setItem('__gmas_transient_state', JSON.stringify(injectedState));
                // Setup a listener for DOMContentLoaded if it hasn't fired, otherwise execute immediately
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        window.SeamlessStatePreserver && window.SeamlessStatePreserver.restoreState();
                    });
                } else {
                    window.SeamlessStatePreserver && window.SeamlessStatePreserver.restoreState();
                }
            },
            args: [state]
        }).catch(err => console.error("MorphEngine injection failed:", err));
    }
}
