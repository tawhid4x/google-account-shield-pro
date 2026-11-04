import { Interactive3DCore } from '../shared/interactive-3d-core.js';
import { VaultCloner } from '../shared/vault-cloner.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        Interactive3DCore.init('hero-canvas-container', { scrollDolly: true });
    } catch(e) {}

    // Parallax logic
    const cards = document.querySelectorAll('[data-3d-card]');
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        cards.forEach(card => {
            card.style.transform = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
        });
    });

    // Telemetry Graph
    const tCanvas = document.getElementById('telemetry-canvas');
    const ctx = tCanvas.getContext('2d');
    let offset = 0;
    function renderTelemetry() {
        ctx.clearRect(0, 0, tCanvas.width, tCanvas.height);
        ctx.beginPath();
        ctx.moveTo(0, tCanvas.height / 2);
        for(let x=0; x<tCanvas.width; x+=5) {
            let y = (tCanvas.height / 2) + Math.sin(x/30 + offset) * 20;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.stroke();
        offset += 0.05;
        requestAnimationFrame(renderTelemetry);
    }
    renderTelemetry();

    // Render Accounts
    const { gmas_account_vault = {} } = await chrome.storage.local.get('gmas_account_vault');
    const grid = document.getElementById('accounts-grid');

    function renderGrid(filter = '') {
        grid.innerHTML = '';
        Object.values(gmas_account_vault).forEach(acc => {
            if (filter && !acc.name.toLowerCase().includes(filter) && !acc.email.toLowerCase().includes(filter)) return;

            const div = document.createElement('div');
            div.className = 'account-card';
            div.dataset.email = acc.email;
            div.innerHTML = `
                <img src="${acc.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTEiLz48L3N2Zz4='}">
                <div class="info">
                    <strong>${acc.name}</strong>
                    <span>${acc.email}</span>
                </div>
            `;
            grid.appendChild(div);
        });
    }
    renderGrid();

    document.getElementById('search-input').addEventListener('input', (e) => {
        renderGrid(e.target.value.toLowerCase());
    });

    // Modals & Cloner
    document.getElementById('btn-export').addEventListener('click', () => {
        document.getElementById('export-modal').style.display = 'flex';
    });

    document.getElementById('btn-cancel-export').addEventListener('click', () => {
        document.getElementById('export-modal').style.display = 'none';
    });

    document.getElementById('btn-confirm-export').addEventListener('click', async () => {
        const pass = document.getElementById('export-password').value;
        const capsule = await VaultCloner.exportToCapsule(gmas_account_vault, pass);
        navigator.clipboard.writeText(capsule);
        alert('Vault capsule copied to clipboard!');
        document.getElementById('export-modal').style.display = 'none';
    });

    document.getElementById('btn-import').addEventListener('click', () => {
        document.getElementById('import-modal').style.display = 'flex';
    });

    document.getElementById('btn-cancel-import').addEventListener('click', () => {
        document.getElementById('import-modal').style.display = 'none';
    });

    document.getElementById('btn-confirm-import').addEventListener('click', async () => {
        const data = document.getElementById('import-data').value;
        const pass = document.getElementById('import-password').value;
        const importedVault = await VaultCloner.importFromCapsule(data, pass);
        if (importedVault) {
            await chrome.storage.local.set({ gmas_account_vault: importedVault });
            alert('Vault imported successfully!');
            location.reload();
        } else {
            alert('Failed to decrypt vault capsule.');
        }
    });
});