(() => {
    // __GMAS_SHARED__ guard
    window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};
    if (window.__GMAS_SHARED__.omniCommandBarLoaded) return;
    window.__GMAS_SHARED__.omniCommandBarLoaded = true;

    class OmniCommandBar {
        constructor() {
            this.isOpen = false;
            this.container = null;
            this.shadow = null;

            this.bindHotkeys();
        }

        bindHotkeys() {
            document.addEventListener('keydown', (e) => {
                // Alt + G triggers the command bar
                if (e.altKey && e.key.toLowerCase() === 'g') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }

        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        open() {
            if (this.container) return;

            this.container = document.createElement('div');
            // Isolate styles and content
            this.shadow = this.container.attachShadow({ mode: 'closed' });

            // Basic UI Setup
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translate(-50%, 0);
                width: 600px;
                background: #1e1e1e;
                border: 1px solid #333;
                border-radius: 12px;
                box-shadow: 0 16px 32px rgba(0,0,0,0.5);
                z-index: 2147483647;
                font-family: system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                color: #fff;
            `;

            const input = document.createElement('input');
            input.placeholder = 'Search 200+ accounts or type /hide ...';
            input.style.cssText = `
                width: 100%;
                padding: 16px;
                background: transparent;
                border: none;
                border-bottom: 1px solid #333;
                color: #fff;
                font-size: 18px;
                outline: none;
                box-sizing: border-box;
            `;

            const list = document.createElement('div');
            list.style.cssText = `
                max-height: 300px;
                overflow-y: auto;
                padding: 8px;
            `;

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = input.value.trim();
                    if (query === '/hide') {
                        chrome.storage.local.set({ hideSignout: true });
                        this.close();
                    } else if (query === '/show') {
                        chrome.storage.local.set({ hideSignout: false });
                        this.close();
                    } else {
                        const emailMatch = query.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                        const selectedEmail = emailMatch ? emailMatch[0] : query;
                        console.log(`Command Bar: Request switch to match for "${query}"`);

                        chrome.runtime.sendMessage({
                            type: 'REQUEST_SEAMLESS_SWITCH',
                            email: selectedEmail,
                            newTab: e.shiftKey
                        }).catch(e => console.error("Error switching:", e));

                        this.close();
                    }
                }
            });

            wrapper.appendChild(input);
            wrapper.appendChild(list);
            this.shadow.appendChild(wrapper);

            document.documentElement.appendChild(this.container);
            this.isOpen = true;

            // Focus input slightly after render
            setTimeout(() => input.focus(), 10);
        }

        close() {
            if (this.container) {
                this.container.remove();
                this.container = null;
                this.shadow = null;
                this.isOpen = false;
            }
        }
    }

    new OmniCommandBar();
})();
