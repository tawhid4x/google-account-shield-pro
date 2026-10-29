(() => {
"use strict";
const GUARD_KEY = "__gmas_content_loaded_seamless_state_preserver";
if (window[GUARD_KEY]) return;
window[GUARD_KEY] = true;
window.__GMAS_SHARED__ = window.__GMAS_SHARED__ || {};

window.__GMAS_SHARED__.SeamlessStatePreserver = class SeamlessStatePreserver {
    static captureState() {
        const state = {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            focusedElementInput: null,
            focusedElementSelector: null,
            videoCurrentTime: null,
            videoPlaying: false
        };

        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
            state.focusedElementInput = activeElement.value || activeElement.textContent;
            // Generate a simple selector for restoration
            if (activeElement.id) {
                state.focusedElementSelector = `#${activeElement.id}`;
            } else if (activeElement.name) {
                state.focusedElementSelector = `${activeElement.tagName.toLowerCase()}[name="${activeElement.name}"]`;
            }
        }

        if (window.location.hostname.includes('youtube.com')) {
            const video = document.querySelector('video');
            if (video) {
                state.videoCurrentTime = video.currentTime;
                state.videoPlaying = !video.paused;
            }
        }

        sessionStorage.setItem('__gmas_transient_state', JSON.stringify(state));
        return state;
    }

    static restoreState() {
        const stored = sessionStorage.getItem('__gmas_transient_state');
        if (!stored) return;

        try {
            const state = JSON.parse(stored);

            if (state.scrollX !== undefined && state.scrollY !== undefined) {
                window.scrollTo(state.scrollX, state.scrollY);
            }

            if (state.focusedElementSelector && state.focusedElementInput) {
                const el = document.querySelector(state.focusedElementSelector);
                if (el) {
                    el.focus();
                    if (el.isContentEditable) {
                        el.textContent = state.focusedElementInput;
                    } else {
                        el.value = state.focusedElementInput;
                    }
                }
            }

            if (window.location.hostname.includes('youtube.com') && state.videoCurrentTime !== null) {
                const video = document.querySelector('video');
                if (video) {
                    video.currentTime = state.videoCurrentTime;
                    if (state.videoPlaying) {
                        video.play().catch(() => {});
                    }
                }
            }

            // Show micro toast
            const toast = document.createElement('div');
            toast.textContent = '⚡ Morphed to account (State Preserved)';
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                zIndex: '2147483647',
                pointerEvents: 'none',
                opacity: '0',
                transition: 'opacity 0.3s'
            });
            document.body.appendChild(toast);

            // Trigger reflow
            toast.offsetHeight;
            toast.style.opacity = '1';

            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 1800);

        } catch (e) {
            console.error('Failed to restore state', e);
        } finally {
            sessionStorage.removeItem('__gmas_transient_state');
        }
    }
}
})();
