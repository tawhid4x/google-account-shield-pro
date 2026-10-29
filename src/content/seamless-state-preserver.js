export class SeamlessStatePreserver {
    static init() {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === 'BEFORE_ACCOUNT_SWITCH') {
                this.captureState();
            }
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.hydrateState());
        } else {
            this.hydrateState();
        }
    }

    static captureState() {
        const state = {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            activeElementValue: null,
            activeElementSelector: null,
            youtubeVideo: null
        };

        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
            state.activeElementValue = activeElement.value || activeElement.innerText;
            state.activeElementSelector = this.getSelector(activeElement);
        }

        if (window.location.hostname.includes('youtube.com') && window.location.pathname === '/watch') {
            const video = document.querySelector('video');
            if (video) {
                state.youtubeVideo = {
                    currentTime: video.currentTime,
                    paused: video.paused
                };
            }
        }

        try {
            sessionStorage.setItem('__gmas_transient_state', JSON.stringify(state));
        } catch (e) {
            // Ignore quota errors
        }
    }

    static hydrateState() {
        const startTimestamp = performance.now();
        let rawState = null;
        try {
            rawState = sessionStorage.getItem('__gmas_transient_state');
            sessionStorage.removeItem('__gmas_transient_state');
        } catch (e) {}

        if (!rawState) return;

        let state = null;
        try {
            state = JSON.parse(rawState);
        } catch (e) {
            return;
        }

        requestAnimationFrame(() => {
            window.scrollTo(state.scrollX || 0, state.scrollY || 0);

            if (state.activeElementSelector && state.activeElementValue) {
                const el = document.querySelector(state.activeElementSelector);
                if (el) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.value = state.activeElementValue;
                    } else if (el.isContentEditable) {
                        el.innerText = state.activeElementValue;
                    }
                }
            }

            if (state.youtubeVideo && window.location.hostname.includes('youtube.com') && window.location.pathname === '/watch') {
                const checkVideo = setInterval(() => {
                    const video = document.querySelector('video');
                    if (video && video.readyState >= 1) {
                        video.currentTime = state.youtubeVideo.currentTime;
                        if (!state.youtubeVideo.paused) {
                            video.play().catch(() => {});
                        }
                        clearInterval(checkVideo);
                    }
                }, 100);
                setTimeout(() => clearInterval(checkVideo), 5000);
            }

            const elapsed = performance.now() - startTimestamp;
            this.showToast(`⚡ Morphed Account (State Preserved • ${Math.round(elapsed)}ms)`);
        });
    }

    static getSelector(el) {
        if (el.id) return `#${el.id}`;
        if (el.className) return `.${el.className.split(' ').join('.')}`;
        return el.tagName.toLowerCase();
    }

    static showToast(text) {
        const toast = document.createElement('div');
        toast.textContent = text;
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(20, 20, 20, 0.8)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: '2147483647',
            transform: 'translateY(100px) rotateX(15deg)',
            opacity: '0',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
        });
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0) rotateX(0deg)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.transform = 'translateY(100px) rotateX(-15deg)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 1800);
    }
}

SeamlessStatePreserver.init();
