import { CookieVault } from './cookie-vault.js';
import { SessionRotator } from './session-rotator.js';
import { SelfDoctor } from './self-doctor.js';
import { AccountPulseMonitor } from './account-pulse-monitor.js';

// Init Self-Doctor & Heartbeat on startup
chrome.runtime.onInstalled.addListener(() => {
    SelfDoctor.checkAndRepairVault();
});
chrome.runtime.onStartup.addListener(() => {
    SelfDoctor.checkAndRepairVault();
});

// Init Account Pulse Monitor
AccountPulseMonitor.init();

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
