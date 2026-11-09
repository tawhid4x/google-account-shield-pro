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
                // Implement layer transitions based on depth
                engine.dolly(-scrollY * 0.05);

                if (scrollY > 400 && scrollY <= 800) {
                    engine.setLayerDepth(-400); // Layer 2
                } else if (scrollY > 800) {
                    engine.setLayerDepth(-800); // Layer 3
                } else {
                    engine.setLayerDepth(0); // Layer 1
                }
            }
        });

        // Interactive Telemetry Oscilloscope
        if (options.telemetry) {
            this.renderTelemetryOscilloscope(engine, canvas);
        }

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

    static renderTelemetryOscilloscope(engine, canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let time = 0;
        const drawOscilloscope = () => {
            if (!engine.isRunning()) return requestAnimationFrame(drawOscilloscope);

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Plotting dummy bullet-velocity graph
            ctx.beginPath();
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 10;

            for (let x = 0; x < canvas.width; x += 5) {
                const y = canvas.height - (Math.exp(x / canvas.width * 5) * 5 + Math.sin(time + x * 0.05) * 10);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();

            time += 0.1;
            requestAnimationFrame(drawOscilloscope);
        };
        requestAnimationFrame(drawOscilloscope);
    }
}
