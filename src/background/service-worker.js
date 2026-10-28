import { CookieVault } from './cookie-vault.js';
import { SessionRotator } from './session-rotator.js';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['gmas_settings'], (result) => {
        const settings = result.gmas_settings || {};
        const newSettings = {
            hideSignout: settings.hideSignout !== undefined ? settings.hideSignout : true,
            vaultActive: settings.vaultActive !== undefined ? settings.vaultActive : true,
            autoEvict: settings.autoEvict !== undefined ? settings.autoEvict : true
        };
        chrome.storage.local.set({ gmas_settings: newSettings });
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        if (changeInfo.url.includes('myaccount.google.com') && changeInfo.url.includes('utm_source=sign_in_no_continue')) {
            // Redirect back to google.com to prevent being stuck in account manager
            chrome.tabs.update(tabId, { url: 'https://www.google.com/' });
        }
    }
});

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
