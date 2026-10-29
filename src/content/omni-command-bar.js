(() => {
"use strict";
const GUARD_KEY = "__gmas_content_loaded_omni_command_bar";
if (window[GUARD_KEY]) return;
window[GUARD_KEY] = true;
window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

window.__GMAS_SHARED__.OmniCommandBar = class OmniCommandBar {
    constructor() {
        this.container = null;
        this.input = null;
        this.isOpen = false;
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        if (!this.container) {
            this.createDOM();
        }
        this.container.style.display = 'flex';
        // Force reflow
        this.container.offsetHeight;
        this.container.style.opacity = '1';
        this.container.style.transform = 'translate(-50%, -20vh) scale(1) perspective(1200px) rotateX(0deg)';
        this.input.focus();
        this.isOpen = true;
    }

    close() {
        if (!this.container) return;
        this.container.style.opacity = '0';
        this.container.style.transform = 'translate(-50%, -20vh) scale(0.95) perspective(1200px) rotateX(10deg)';
        setTimeout(() => {
            this.container.style.display = 'none';
            this.isOpen = false;
        }, 200);
    }

    createDOM() {
        const host = document.createElement('div');
        host.id = 'gmas-omni-host';
        Object.assign(host.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: '2147483647'
        });
        document.documentElement.appendChild(host);

        const shadow = host.attachShadow({ mode: 'closed' });

        this.container = document.createElement('div');
        Object.assign(this.container.style, {
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -20vh) scale(0.95) perspective(1200px) rotateX(10deg)',
            width: '600px',
            maxWidth: '90vw',
            background: 'rgba(15, 15, 20, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            display: 'none',
            flexDirection: 'column',
            opacity: '0',
            transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'auto',
            overflow: 'hidden'
        });

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Type to switch account, or /hide, /show...';
        Object.assign(this.input.style, {
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: '20px 24px',
            color: '#fff',
            fontSize: '20px',
            outline: 'none',
            fontFamily: 'system-ui, sans-serif'
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = this.input.value.trim();
                this.handleCommand(val);
            }
        });

        this.container.appendChild(this.input);
        shadow.appendChild(this.container);
    }

    handleCommand(cmd) {
        if (cmd === '/hide') {
            document.documentElement.setAttribute('data-gmas-hide-signout', 'true');
            this.close();
        } else if (cmd === '/show') {
            document.documentElement.setAttribute('data-gmas-hide-signout', 'false');
            this.close();
        } else {
            // Placeholder for search & switch logic
            console.log("GMAS Command Bar:", cmd);
            this.close();
        }
    }
}
})();
