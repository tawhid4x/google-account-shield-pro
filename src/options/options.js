import { Interactive3DCore } from '../shared/interactive-3d-core.js';
import { VaultCloner } from '../shared/vault-cloner.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        Interactive3DCore.init('canvas-container', { scrollDolly: true });
    } catch (e) {}

    const { gmas_account_vault = {} } = await chrome.storage.local.get('gmas_account_vault');
    const accounts = Object.values(gmas_account_vault);

    document.getElementById('account-count').textContent = accounts.length;

    const grid = document.getElementById('account-grid');
    accounts.forEach(acc => {
        const card = document.createElement('div');
        Object.assign(card.style, {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'transform 0.2s',
            cursor: 'pointer'
        });

        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-5px)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');

        const img = document.createElement('img');
        img.src = acc.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTEiLz48L3N2Zz4=';
        Object.assign(img.style, { width: '48px', height: '48px', borderRadius: '50%' });

        const info = document.createElement('div');
        const name = document.createElement('div');
        name.textContent = acc.name || 'Unknown User';
        Object.assign(name.style, { fontWeight: '600', marginBottom: '4px' });

        const email = document.createElement('div');
        email.textContent = acc.email;
        Object.assign(email.style, { fontSize: '12px', color: '#94a3b8' });

        info.appendChild(name);
        info.appendChild(email);

        card.appendChild(img);
        card.appendChild(info);
        grid.appendChild(card);
    });

    const btnExport = document.getElementById('btn-export');
    btnExport.addEventListener('click', async () => {
        // Example export logic
        const capsule = await VaultCloner.exportToCapsule(gmas_account_vault, "default_password_if_unspecified");
        const blob = new Blob([capsule], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vault_${Date.now()}.gmas`;
        a.click();
    });
});
