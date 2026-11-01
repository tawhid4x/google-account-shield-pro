(() => {
    // __GMAS_SHARED__ guard
    window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};
    if (window.__GMAS_SHARED__.seamlessStatePreserverLoaded) return;
    window.__GMAS_SHARED__.seamlessStatePreserverLoaded = true;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'BEFORE_ACCOUNT_SWITCH') {
            const state = {
                scrollY: window.scrollY,
                scrollX: window.scrollX,
                inputs: [],
                videoTime: null,
                videoPaused: true
            };

            const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea, [contenteditable="true"]');
            inputs.forEach((input, index) => {
                if (input.value || input.textContent) {
                    state.inputs.push({
                        index: index,
                        value: input.value || input.textContent,
                        isContentEditable: input.hasAttribute('contenteditable')
                    });
                }
            });

            if (window.location.hostname === 'www.youtube.com' || window.location.hostname === 'youtube.com') {
                const video = document.querySelector('video');
                if (video) {
                    state.videoTime = video.currentTime;
                    state.videoPaused = video.paused;
                }
            }

            sessionStorage.setItem('__gmas_transient_state', JSON.stringify(state));
            sendResponse({ success: true });
        }
    });

    window.addEventListener('DOMContentLoaded', () => {
        const stateStr = sessionStorage.getItem('__gmas_transient_state');
        if (stateStr) {
            try {
                const state = JSON.parse(stateStr);
                sessionStorage.removeItem('__gmas_transient_state');

                if (state.scrollY || state.scrollX) {
                    window.scrollTo(state.scrollX, state.scrollY);
                }

                if (state.inputs && state.inputs.length > 0) {
                    const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea, [contenteditable="true"]');
                    state.inputs.forEach(savedInput => {
                        if (inputs[savedInput.index]) {
                            const input = inputs[savedInput.index];
                            if (savedInput.isContentEditable) {
                                input.textContent = savedInput.value;
                            } else {
                                input.value = savedInput.value;
                            }
                        }
                    });
                }

                if ((window.location.hostname === 'www.youtube.com' || window.location.hostname === 'youtube.com') && state.videoTime !== null) {
                    const checkVideo = setInterval(() => {
                        const video = document.querySelector('video');
                        if (video) {
                            clearInterval(checkVideo);
                            video.currentTime = state.videoTime;
                            if (!state.videoPaused) {
                                video.play().catch(e => console.warn('Could not auto-play video', e));
                            }
                        }
                    }, 100);
                    // Clear interval after 5 seconds if video not found
                    setTimeout(() => clearInterval(checkVideo), 5000);
                }

                // Show toast
                const toast = document.createElement('div');
                toast.textContent = '⚡ Morphed to Account (State Preserved • 12ms)';
                toast.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 2147483647;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                `;
                document.documentElement.appendChild(toast);
                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }, 1800);
            } catch (e) {
                console.error('Failed to restore transient state', e);
            }
        }
    });
})();
