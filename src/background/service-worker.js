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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const currentUrl = changeInfo.url || tab.url;
    if (currentUrl) {
        if (currentUrl.includes('myaccount.google.com') && (currentUrl.includes('utm_source=sign_in_no_continue') || currentUrl.includes('utm_source=accountchooser'))) {
            let authIndex = 0;
            const matchU = currentUrl.match(/\/u\/(\d+)\//);
            if (matchU) authIndex = matchU[1];
            else {
                const matchAuthuser = currentUrl.match(/authuser=(\d+)/);
                if (matchAuthuser) authIndex = matchAuthuser[1];
            }

            const data = await chrome.storage.local.get('lastReturnUrl');
            let returnUrl = data.lastReturnUrl || 'https://www.google.com/';

            try {
                let urlObj = new URL(returnUrl);
                urlObj.searchParams.set('authuser', authIndex);
                returnUrl = urlObj.href;
            } catch(e) {
                returnUrl = `https://www.google.com/?authuser=${authIndex}`;
            }

            chrome.tabs.update(tabId, { url: returnUrl });
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
