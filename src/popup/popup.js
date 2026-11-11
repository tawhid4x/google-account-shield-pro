import { Interactive3DCore } from '../shared/interactive-3d-core.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize 3D Engine for background
    try {
        Interactive3DCore.init('canvas-container', { scrollDolly: false });
    } catch (e) {
        // Fallback if canvas fails
    }

    const toggleHide = document.getElementById('toggle-hide');
    const accountCount = document.getElementById('account-count');
    const btnOptions = document.getElementById('btn-options');

    // Load initial state
    const { hideSignout = true, gmas_account_vault = {} } = await chrome.storage.local.get(['hideSignout', 'gmas_account_vault']);

    toggleHide.checked = hideSignout;
    accountCount.textContent = Object.keys(gmas_account_vault).length;

    toggleHide.addEventListener('change', (e) => {
        chrome.storage.local.set({ hideSignout: e.target.checked });
    });

    btnOptions.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
