import { SeamlessMorphEngine } from './seamless-morph-engine.js';
import { AntiThrottleShield } from './anti-throttle-shield.js';
import { SelfDoctor } from './self-doctor.js';
import { AccountPulseMonitor } from './account-pulse-monitor.js';

// Mission 4 defaults check at startup
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['hideSignout', 'unlimitedVault', 'autoEvict'], (res) => {
        let updates = {};
        if (res.hideSignout === undefined) updates.hideSignout = true;
        if (res.unlimitedVault === undefined) updates.unlimitedVault = true;
        if (res.autoEvict === undefined) updates.autoEvict = true;
        if (Object.keys(updates).length > 0) {
            chrome.storage.local.set(updates);
        }
    });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'SYNC_DISCOVERED_ACCOUNTS') {
        chrome.storage.local.get('gmas_account_vault', (res) => {
            const vault = res.gmas_account_vault || {};
            msg.payload.forEach(acc => {
                if (!vault[acc.email]) {
                    vault[acc.email] = {
                        email: acc.email,
                        name: acc.name,
                        avatarUrl: acc.avatarUrl,
                        status: acc.status,
                        lastActive: Date.now(),
                        cookies: [],
                        tags: []
                    };
                } else {
                    vault[acc.email].status = acc.status;
                    vault[acc.email].name = acc.name || vault[acc.email].name;
                }
            });
            chrome.storage.local.set({ gmas_account_vault: vault }, () => sendResponse({ success: true }));
        });
        return true;
    }

    if (msg.type === 'SWITCH_ACCOUNT' || msg.type === 'SWITCH_TO_ACCOUNT') {
        (async () => {
            const tabId = sender.tab ? sender.tab.id : null;
            if (tabId) {
                await SeamlessMorphEngine.morphSession(tabId, msg.email);
            }
            await AntiThrottleShield.applyJitter();
            await AntiThrottleShield.scrubCookieJar('google.com');

            // Restore target account cookies (mocked core behavior based on vault)
            chrome.storage.local.get('gmas_account_vault', (res) => {
                const vault = res.gmas_account_vault || {};
                const acc = vault[msg.email];
                if (acc && acc.cookies) {
                    acc.cookies.forEach(c => {
                        let url = `http${c.secure ? 's' : ''}://${c.domain.replace(/^\./, '')}${c.path}`;
                        chrome.cookies.set({
                            url, name: c.name, value: c.value, domain: c.domain, path: c.path,
                            secure: c.secure, httpOnly: c.httpOnly, expirationDate: c.expirationDate
                        });
                    });
                }
                sendResponse({ success: true });
                if (tabId) chrome.tabs.reload(tabId);
            });
        })();
        return true;
    }
});

// Mission 3: myaccount.google.com Redirect Bouncer
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const currentUrl = changeInfo.url || tab.url;
    if (!currentUrl) return;

    if (currentUrl.includes('myaccount.google.com') &&
       (currentUrl.includes('utm_source=sign_in_no_continue') || currentUrl.includes('utm_source=accountchooser'))) {

        let authIndex = '0';
        const uMatch = currentUrl.match(/\/u\/(\d+)/);
        if (uMatch) {
            authIndex = uMatch[1];
        } else {
            const authuserMatch = currentUrl.match(/authuser=(\d+)/);
            if (authuserMatch) authIndex = authuserMatch[1];
        }

        chrome.storage.local.get('lastReturnUrl', (res) => {
            const returnUrl = res.lastReturnUrl || 'https://www.google.com/';
            const targetUrl = new URL(returnUrl);
            targetUrl.searchParams.set('authuser', authIndex);
            chrome.tabs.update(tabId, { url: targetUrl.toString() });
        });
    }
});
