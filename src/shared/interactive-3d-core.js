import { Spatial3DEngine } from './spatial-3d-engine.js';

export class Interactive3DCore {
    static init(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        const engine = Spatial3DEngine.init(canvas);

        let mouseX = 0;
        let mouseY = 0;
        let isDragging = false;

        container.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            if (isDragging) {
                engine.rotate(mouseX * Math.PI, mouseY * Math.PI);
            } else {
                engine.tilt(mouseX * 0.2, mouseY * 0.2);
            }
        });

        container.addEventListener('mousedown', () => isDragging = true);
        container.addEventListener('mouseup', () => isDragging = false);
        container.addEventListener('mouseleave', () => {
            isDragging = false;
            engine.tilt(0, 0);
        });

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (options.scrollDolly) {
                engine.dolly(-scrollY * 0.05);
            }
        });

        // Intersection Observer to sleep when out of view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    engine.start();
                } else {
                    engine.stop();
                }
            });
        });
        observer.observe(container);

        return engine;
    }
}
