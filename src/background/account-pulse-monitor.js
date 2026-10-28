export class AccountPulseMonitor {
    static checkPulse() {
        return 'Healthy';
    }

    static harvestPassivePulse(tab) {
        if (!tab || !tab.url || !tab.title) return null;

        let metadata = {
            unreadCount: 0,
            serviceBadge: ''
        };

        // Passive zero-network parsing of document title
        if (tab.url.includes('mail.google.com')) {
            const match = tab.title.match(/Inbox \((\d+)\)/);
            if (match) {
                metadata.unreadCount = parseInt(match[1], 10);
            }
            metadata.serviceBadge = '📧';
        } else if (tab.url.includes('youtube.com')) {
            metadata.serviceBadge = '📺';
        } else if (tab.url.includes('drive.google.com')) {
            metadata.serviceBadge = '☁️';
        }

        return metadata;
    }
}
