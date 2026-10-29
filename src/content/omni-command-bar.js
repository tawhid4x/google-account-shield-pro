(() => {
  'use strict';
  const GUARD_KEY = '__gmas_content_loaded_omni_command_bar_js';
  if (window[GUARD_KEY]) return;
  window[GUARD_KEY] = true;

  window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

  class OmniCommandBar {
    constructor() {
        this.container = document.createElement('div');
        this.shadow = this.container.attachShadow({ mode: 'closed' });
        this.visible = false;

        // Hide from host page layout entirely when inactive
        this.container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647; pointer-events: none; display: none;';
        document.documentElement.appendChild(this.container);

        this.render();
        this.bindEvents();
    }

    render() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                --bg: rgba(20, 20, 25, 0.85);
                --accent: #00ff80;
            }
            .overlay {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 15vh;
                pointer-events: auto;
                opacity: 0;
                transition: opacity 0.2s;
            }
            .bar {
                width: 600px;
                max-width: 90vw;
                background: var(--bg);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                transform: translateY(-20px) rotateX(10deg);
                transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                font-family: system-ui, sans-serif;
            }
            .overlay.active {
                opacity: 1;
            }
            .overlay.active .bar {
                transform: translateY(0) rotateX(0);
            }
            input {
                background: transparent;
                border: none;
                color: #fff;
                font-size: 24px;
                padding: 20px;
                outline: none;
            }
            .results {
                max-height: 400px;
                overflow-y: auto;
            }
            .result-item {
                padding: 15px 20px;
                color: rgba(255,255,255,0.7);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .result-item.selected, .result-item:hover {
                background: rgba(255,255,255,0.05);
                color: #fff;
            }
        `;
        this.shadow.appendChild(style);

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.id = 'overlay';

        const bar = document.createElement('div');
        bar.className = 'bar';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'omni-input';
        input.placeholder = 'Type to switch account or /command...';
        input.autocomplete = 'off';
        input.spellcheck = false;

        const results = document.createElement('div');
        results.className = 'results';
        results.id = 'results';

        bar.appendChild(input);
        bar.appendChild(results);
        overlay.appendChild(bar);
        this.shadow.appendChild(overlay);
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape' && this.visible) {
                this.hide();
            }
        }, true);

        const input = this.shadow.getElementById('omni-input');
        input.addEventListener('input', () => this.handleInput(input.value));
        input.addEventListener('keydown', (e) => this.handleKey(e));

        this.shadow.getElementById('overlay').addEventListener('click', (e) => {
            if (e.target.className === 'overlay active') this.hide();
        });
    }

    toggle() {
        this.visible ? this.hide() : this.show();
    }

    show() {
        this.visible = true;
        this.container.style.display = 'block';
        const overlay = this.shadow.getElementById('overlay');
        const input = this.shadow.getElementById('omni-input');

        requestAnimationFrame(() => {
            overlay.classList.add('active');
            input.focus();
        });
    }

    hide() {
        this.visible = false;
        const overlay = this.shadow.getElementById('overlay');
        overlay.classList.remove('active');
        setTimeout(() => {
            if (!this.visible) this.container.style.display = 'none';
        }, 200);
    }

    handleInput(query) {
        // Implement fast search via background or local index
        // For demonstration, handling commands
        const resultsEl = this.shadow.getElementById('results');
        resultsEl.textContent = ''; // clear

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        if (query === '/hide') {
            resultItem.classList.add('selected');
            resultItem.textContent = '🛡️ Hide "Sign out of all accounts" button';
        } else if (query === '/show') {
            resultItem.classList.add('selected');
            resultItem.textContent = '⚠️ Show "Sign out of all accounts" button';
        } else {
            resultItem.textContent = 'Search accounts...';
        }

        resultsEl.appendChild(resultItem);
    }

    handleKey(e) {
        if (e.key === 'Enter') {
            const val = this.shadow.getElementById('omni-input').value;
            if (val === '/hide') {
                chrome.storage.local.set({ hideSignout: true });
                this.hide();
            } else if (val === '/show') {
                chrome.storage.local.set({ hideSignout: false });
                this.hide();
            }
        }
    }
}

// Initialize on supported domains (or everywhere depending on manifest)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new OmniCommandBar());
} else {
    new OmniCommandBar();
}

  // Assign classes to shared if needed
  if (typeof SeamlessStatePreserver !== 'undefined') window.__GMAS_SHARED__.SeamlessStatePreserver = SeamlessStatePreserver;
  if (typeof OmniCommandBar !== 'undefined') window.__GMAS_SHARED__.OmniCommandBar = OmniCommandBar;

})();
