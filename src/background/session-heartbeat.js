export class SessionHeartbeat {
    static start() {
        chrome.alarms.create('heartbeat', { periodInMinutes: 360 });
    }
}
