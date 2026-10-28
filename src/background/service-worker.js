import { SeamlessMorphEngine } from './seamless-morph-engine.js';
import { AntiThrottleShield } from './anti-throttle-shield.js';
import { SelfDoctor } from './self-doctor.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'SWITCH_ACCOUNT') {
        (async () => {
            const tabId = sender.tab ? sender.tab.id : null;
            if (tabId) {
                await SeamlessMorphEngine.morphSession(tabId, msg.email);
            }
            await AntiThrottleShield.applyJitter();
            await AntiThrottleShield.scrubCookieJar('google.com');
            sendResponse({ success: true });
        })();
        return true;
    }
});
