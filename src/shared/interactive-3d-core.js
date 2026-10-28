export class Interactive3DCore {
    static attach(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth || 800;
        canvas.height = container.clientHeight || 400;
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Basic 3D setup variables
        let width = canvas.width;
        let height = canvas.height;
        let rotationX = 0;
        let rotationY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;
        let zoom = 1;
        let targetZoom = 1;

        let mouseX = 0;
        let mouseY = 0;

        const nodes = Array.from({ length: 50 }).map(() => {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 150 + Math.random() * 50;
            return {
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi),
                r: Math.random() * 3 + 2,
                color: Math.random() > 0.5 ? '#00ff88' : '#00aaff'
            };
        });

        const lerp = (start, end, factor) => start + (end - start) * factor;

        container.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left - width / 2;
            mouseY = e.clientY - rect.top - height / 2;

            targetRotationY = mouseX * 0.005;
            targetRotationX = mouseY * 0.005;
        });

        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            targetZoom += e.deltaY * -0.001;
            targetZoom = Math.min(Math.max(0.5, targetZoom), 3);
        });

        const render = () => {
            rotationX = lerp(rotationX, targetRotationX, 0.1);
            rotationY = lerp(rotationY, targetRotationY, 0.1);
            zoom = lerp(zoom, targetZoom, 0.1);

            ctx.clearRect(0, 0, width, height);

            // Draw central Quantum Shield Core
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.scale(zoom, zoom);

            ctx.beginPath();
            ctx.arc(0, 0, 40, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 150, 255, 0.2)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Render orbiting nodes
            const cosX = Math.cos(rotationX);
            const sinX = Math.sin(rotationX);
            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);

            const projectedNodes = nodes.map(node => {
                // Rotate Y
                let x1 = node.x * cosY - node.z * sinY;
                let z1 = node.z * cosY + node.x * sinY;

                // Rotate X
                let y2 = node.y * cosX - z1 * sinX;
                let z2 = z1 * cosX + node.y * sinX;

                const perspective = 400 / (400 + z2);

                return {
                    x: x1 * perspective,
                    y: y2 * perspective,
                    scale: perspective,
                    color: node.color,
                    r: node.r
                };
            });

            // Sort by depth
            projectedNodes.sort((a, b) => a.scale - b.scale);

            projectedNodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.r * node.scale, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.globalAlpha = node.scale * 0.8;
                ctx.fill();
            });

            ctx.restore();

            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
    }
}
