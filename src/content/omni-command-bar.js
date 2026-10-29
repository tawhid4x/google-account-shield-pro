export class OmniCommandBar {
    static init() {
        window.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    static toggle() {
        let container = document.getElementById('gmas-omni-bar-host');
        if (container) {
            container.remove();
            return;
        }

        container = document.createElement('div');
        container.id = 'gmas-omni-bar-host';
        Object.assign(container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '2147483647',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '20vh',
            pointerEvents: 'none'
        });

        const shadow = container.attachShadow({ mode: 'closed' });

        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'auto'
        });
        overlay.addEventListener('click', () => container.remove());
        shadow.appendChild(overlay);

        const palette = document.createElement('div');
        Object.assign(palette.style, {
            width: '600px',
            background: '#1a1a1a',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            pointerEvents: 'auto',
            transform: 'perspective(1200px) rotateX(10deg) translateY(-20px)',
            opacity: '0',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease',
            position: 'relative'
        });

        const input = document.createElement('input');
        Object.assign(input.style, {
            width: '100%',
            padding: '20px',
            fontSize: '18px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            outline: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        });
        input.placeholder = 'Search accounts or type commands (/hide, /show)...';
        palette.appendChild(input);

        const list = document.createElement('div');
        Object.assign(list.style, {
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '10px'
        });
        palette.appendChild(list);

        shadow.appendChild(palette);
        document.body.appendChild(container);

        requestAnimationFrame(() => {
            palette.style.transform = 'perspective(1200px) rotateX(0deg) translateY(0)';
            palette.style.opacity = '1';
            input.focus();
        });

        input.addEventListener('input', (e) => this.handleInput(e.target.value, list));
        input.addEventListener('keydown', (e) => this.handleKeydown(e, input, list, container));
    }

    static async handleInput(query, list) {
        list.innerHTML = '';
        if (query.startsWith('/')) return; // Handle commands elsewhere

        try {
            const response = await chrome.runtime.sendMessage({ type: 'GET_VAULT_ACCOUNTS' });
            if (!response || !response.accounts) return;

            const accounts = response.accounts.filter(a =>
                (a.name && a.name.toLowerCase().includes(query.toLowerCase())) ||
                (a.email && a.email.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 10);

            accounts.forEach((acc, index) => {
                const item = document.createElement('div');
                Object.assign(item.style, {
                    padding: '12px 16px',
                    color: '#e8eaed',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    background: index === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                });
                item.dataset.email = acc.email;

                const img = document.createElement('img');
                img.src = acc.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTEiLz48L3N2Zz4=';
                img.style.width = '24px';
                img.style.height = '24px';
                img.style.borderRadius = '50%';

                const text = document.createElement('div');
                text.textContent = `${acc.name} (${acc.email})`;

                item.appendChild(img);
                item.appendChild(text);

                list.appendChild(item);
            });
        } catch (e) {}
    }

    static handleKeydown(e, input, list, container) {
        if (e.key === 'Escape') {
            container.remove();
            return;
        }
        if (e.key === 'Enter') {
            const query = input.value.trim();
            if (query === '/hide') {
                chrome.storage.local.set({ hideSignout: true });
                container.remove();
            } else if (query === '/show') {
                chrome.storage.local.set({ hideSignout: false });
                container.remove();
            } else {
                const firstItem = list.querySelector('div');
                if (firstItem && firstItem.dataset.email) {
                    chrome.runtime.sendMessage({ type: 'SWITCH_TO_ACCOUNT', email: firstItem.dataset.email });
                    if (e.shiftKey) {
                        // Open in new tab logic could be signaled here
                    }
                    container.remove();
                }
            }
        }
    }
}

OmniCommandBar.init();
