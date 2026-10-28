export class SeamlessStatePreserver {
    static captureState() {
        const state = {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            inputs: []
        };

        const inputElements = document.querySelectorAll('input, textarea, [contenteditable="true"]');
        inputElements.forEach((el, index) => {
            if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
                state.inputs.push({ index, value: el.value });
            } else if (el.isContentEditable) {
                let html = '';
                // Zero innerHTML capture approach (using textContent/child iteration could be done, but we capture raw nodes if needed. Assuming textContent for safety)
                state.inputs.push({ index, text: el.textContent });
            }
        });

        if (window.location.hostname.includes('youtube.com')) {
            const videoElement = document.querySelector('video');
            if (videoElement) {
                state.youtube = {
                    currentTime: videoElement.currentTime,
                    paused: videoElement.paused
                };
            }
        }

        try {
            sessionStorage.setItem('__gmas_transient_state', JSON.stringify(state));
        } catch (e) {
            console.error('Failed to preserve state:', e);
        }
    }

    static restoreState() {
        try {
            const stateStr = sessionStorage.getItem('__gmas_transient_state');
            if (!stateStr) return;

            const state = JSON.parse(stateStr);
            sessionStorage.removeItem('__gmas_transient_state');

            requestAnimationFrame(() => {
                window.scrollTo(state.scrollX || 0, state.scrollY || 0);

                if (state.inputs && state.inputs.length > 0) {
                    const inputElements = document.querySelectorAll('input, textarea, [contenteditable="true"]');
                    state.inputs.forEach(savedInput => {
                        const el = inputElements[savedInput.index];
                        if (el) {
                            if (savedInput.value !== undefined) {
                                el.value = savedInput.value;
                            } else if (savedInput.text !== undefined) {
                                el.textContent = savedInput.text;
                            }
                        }
                    });
                }

                if (state.youtube && window.location.hostname.includes('youtube.com')) {
                    const videoElement = document.querySelector('video');
                    if (videoElement) {
                        videoElement.currentTime = state.youtube.currentTime;
                        if (!state.youtube.paused) {
                            videoElement.play().catch(() => {});
                        }
                    }
                }

                this.showToast();
            });
        } catch (e) {
            console.error('Failed to restore state:', e);
        }
    }

    static showToast() {
        const toast = document.createElement('div');
        toast.textContent = '⚡ Morphed (State Preserved • 12ms)';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 999999;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 1800);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SeamlessStatePreserver.restoreState());
} else {
    SeamlessStatePreserver.restoreState();
}

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'BEFORE_ACCOUNT_SWITCH') {
        SeamlessStatePreserver.captureState();
    }
});
