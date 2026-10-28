export class Interactive3DCore {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.nodes = [];
        this.rotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0, down: false };
        this.initNodes();
        this.bindEvents();
        this.animate();
    }

    initNodes() {
        for (let i = 0; i < 200; i++) {
            const phi = Math.acos(-1 + (2 * i) / 200);
            const theta = Math.sqrt(200 * Math.PI) * phi;
            this.nodes.push({
                x: Math.cos(theta) * Math.sin(phi),
                y: Math.sin(theta) * Math.sin(phi),
                z: Math.cos(phi),
                active: i < 5
            });
        }
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) / this.width - 0.5;
            this.mouse.y = (e.clientY - rect.top) / this.height - 0.5;

            if (this.mouse.down) {
                this.targetRotation.y += e.movementX * 0.01;
                this.targetRotation.x += e.movementY * 0.01;
            } else {
                this.targetRotation.y = this.mouse.x * Math.PI * 0.5;
                this.targetRotation.x = this.mouse.y * Math.PI * 0.5;
            }
        });

        this.canvas.addEventListener('mousedown', () => this.mouse.down = true);
        window.addEventListener('mouseup', () => this.mouse.down = false);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Lerp rotation
        this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.1;
        this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.1;

        this.ctx.clearRect(0, 0, this.width, this.height);

        const cx = this.width / 2;
        const cy = this.height / 2;
        const radius = Math.min(cx, cy) * 0.6;

        // Draw core
        const coreGradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.5);
        coreGradient.addColorStop(0, 'rgba(0, 255, 128, 0.8)');
        coreGradient.addColorStop(1, 'rgba(0, 255, 128, 0)');
        this.ctx.fillStyle = coreGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Sort nodes by Z for proper rendering
        const projectedNodes = this.nodes.map(node => {
            // Apply Y rotation
            const x1 = node.x * Math.cos(this.rotation.y) - node.z * Math.sin(this.rotation.y);
            const z1 = node.z * Math.cos(this.rotation.y) + node.x * Math.sin(this.rotation.y);

            // Apply X rotation
            const y2 = node.y * Math.cos(this.rotation.x) - z1 * Math.sin(this.rotation.x);
            const z2 = z1 * Math.cos(this.rotation.x) + node.y * Math.sin(this.rotation.x);

            const scale = 1000 / (1000 - z2 * radius);
            return {
                x: cx + x1 * radius * scale,
                y: cy + y2 * radius * scale,
                z: z2,
                scale: scale,
                active: node.active
            };
        }).sort((a, b) => a.z - b.z);

        projectedNodes.forEach(pNode => {
            this.ctx.beginPath();
            this.ctx.arc(pNode.x, pNode.y, Math.max(0.5, 3 * pNode.scale), 0, Math.PI * 2);
            this.ctx.fillStyle = pNode.active ? '#00ff80' : `rgba(255, 255, 255, ${0.1 + (pNode.z + 1) * 0.2})`;
            this.ctx.fill();
        });
    }
}
