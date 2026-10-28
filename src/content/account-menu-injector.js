// Injects the 200+ accounts into Google menu

export class AccountMenuInjector {
    static injectStatusBadge(accountElement, status) {
        let badge = accountElement.querySelector('.gmas-status-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'gmas-status-badge';
            accountElement.appendChild(badge);
        }

        switch (status) {
            case 'healthy':
                badge.textContent = '🟢 100% Healthy';
                break;
            case 'vaulted':
                badge.textContent = '🔵 Vaulted';
                break;
            case 'needs_refresh':
                badge.textContent = '🟠 Needs Refresh';
                break;
            default:
                badge.textContent = '🟢 Active';
        }
    }
}
