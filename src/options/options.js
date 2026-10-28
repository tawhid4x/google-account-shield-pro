import { VaultCloner } from '../shared/vault-cloner.js';

document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            let vaultData = {};
            if (chrome && chrome.storage && chrome.storage.local) {
                const data = await chrome.storage.local.get('gmas_account_vault');
                vaultData = data.gmas_account_vault || {};
            }
            const capsule = await VaultCloner.exportToCapsule(vaultData);

            const blob = new Blob([capsule], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'vault.gmas';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });

        importFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                const capsule = event.target.result;
                const vaultData = await VaultCloner.importFromCapsule(capsule);
                if (vaultData) {
                    if (chrome && chrome.storage && chrome.storage.local) {
                        await chrome.storage.local.set({ gmas_account_vault: vaultData });
                    }
                    console.log('Successfully imported vault', vaultData);
                    alert('Vault imported successfully!');
                } else {
                    alert('Failed to import vault (bad password or corrupted data)');
                }
            };
            reader.readAsText(file);
        });
    }
});
