class QuantumShield3D {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d'); // Using 2D projection for simplicity and compatibility

        this.nodes = [];
        this.rotation = { x: 0, y: 0, z: 0 };
        this.mouse = { x: 0, y: 0, isDragging: false };
        this.cameraZ = -400; // Base Z depth

        this.initSphere();
        this.bindEvents();
        this.animate();
    }

    initSphere() {
        const numNodes = 200; // Representing 200 accounts
        for (let i = 0; i < numNodes; i++) {
            const phi = Math.acos(-1 + (2 * i) / numNodes);
            const theta = Math.sqrt(numNodes * Math.PI) * phi;

            this.nodes.push({
                x: 150 * Math.cos(theta) * Math.sin(phi),
                y: 150 * Math.sin(theta) * Math.sin(phi),
                z: 150 * Math.cos(phi)
            });
        }
    }

    bindEvents() {
        this.canvas.addEventListener('mousedown', () => this.mouse.isDragging = true);
        this.canvas.addEventListener('mouseup', () => this.mouse.isDragging = false);
        this.canvas.addEventListener('mouseleave', () => this.mouse.isDragging = false);

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.mouse.isDragging) {
                const deltaX = e.movementX * 0.01;
                const deltaY = e.movementY * 0.01;
                this.rotation.y += deltaX;
                this.rotation.x += deltaY;
            }
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left - this.canvas.width / 2;
            this.mouse.y = e.clientY - rect.top - this.canvas.height / 2;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraZ += e.deltaY * 0.5;
            // Clamp camera depth
            this.cameraZ = Math.max(-800, Math.min(-100, this.cameraZ));
        });
    }

    project3D(node) {
        // Rotation
        const cosX = Math.cos(this.rotation.x), sinX = Math.sin(this.rotation.x);
        const cosY = Math.cos(this.rotation.y), sinY = Math.sin(this.rotation.y);

        let y1 = node.y * cosX - node.z * sinX;
        let z1 = node.y * sinX + node.z * cosX;

        let x2 = node.x * cosY + z1 * sinY;
        let z2 = -node.x * sinY + z1 * cosY;

        // Perspective Projection
        const fov = 400;
        const scale = fov / (fov - z2 - this.cameraZ);

        return {
            x: x2 * scale + this.canvas.width / 2,
            y: y1 * scale + this.canvas.height / 2,
            scale: scale,
            z: z2 // Keep for z-sorting
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Auto-rotation if not dragging
        if (!this.mouse.isDragging) {
            this.rotation.y += 0.005;
        }

        const projectedNodes = this.nodes.map(n => this.project3D(n));

        // Z-sort
        projectedNodes.sort((a, b) => b.z - a.z);

        for (const pNode of projectedNodes) {
            this.ctx.beginPath();
            const radius = Math.max(1, 3 * pNode.scale);
            this.ctx.arc(pNode.x, pNode.y, radius, 0, Math.PI * 2);

            // Depth fading
            const alpha = Math.max(0.1, Math.min(1, 1 - (pNode.z / 300)));
            this.ctx.fillStyle = `rgba(0, 255, 128, ${alpha})`;
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.animate());
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuantumShield3D;
}
