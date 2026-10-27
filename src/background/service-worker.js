import { CookieVault } from './cookie-vault.js';
import { SessionRotator } from './session-rotator.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'SYNC_DISCOVERED_ACCOUNTS') {
        // Update vault
    } else if (msg.type === 'SWITCH_TO_ACCOUNT') {
        SessionRotator.hotSwap(msg.email).then(() => {
            sendResponse({ success: true });
        });
        return true;
    }
});
