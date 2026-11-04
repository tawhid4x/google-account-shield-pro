import { Interactive3DCore } from '../shared/interactive-3d-core.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize 3D Engine for popup background
    try {
        Interactive3DCore.init('hero-canvas-container');
    } catch(e) {}

    // 3D Parallax Tilt for Cards
    const cards = document.querySelectorAll('[data-3d-card]');
    document.body.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        cards.forEach(card => {
            card.style.transform = `perspective(1000px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) translateZ(10px)`;
        });
    });

    document.body.addEventListener('mouseleave', () => {
        cards.forEach(card => {
            card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)`;
        });
    });

    // Populate data
    try {
        const { gmas_account_vault = {} } = await chrome.storage.local.get('gmas_account_vault');
        document.getElementById('vault-count').textContent = Object.keys(gmas_account_vault).length;
    } catch(e) {}

    // Toggles
    const toggleHideSignout = document.getElementById('toggle-hide-signout');
    chrome.storage.local.get(['hideSignout'], (res) => {
        if (res.hideSignout !== undefined) toggleHideSignout.checked = res.hideSignout;
    });

    toggleHideSignout.addEventListener('change', (e) => {
        chrome.storage.local.set({ hideSignout: e.target.checked });
    });

    document.getElementById('btn-options').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Mini telemetry
    const canvas = document.getElementById('mini-telemetry');
    const ctx = canvas.getContext('2d');
    let offset = 0;

    function drawTelemetry() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        for(let x=0; x<canvas.width; x+=5) {
            let y = (canvas.height / 2) + Math.sin(x/15 + offset) * 10;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
        offset += 0.1;
        requestAnimationFrame(drawTelemetry);
    }
    drawTelemetry();
});