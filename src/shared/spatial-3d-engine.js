export class Spatial3DEngine {
    static init(canvas) {
        const engine = new Spatial3DEngine(canvas);
        return engine;
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
        this.running = false;
        this.rotationX = 0;
        this.rotationY = 0;
        this.dollyZ = 0;

        // Initialize some dummy nodes for the Quantum Shield
        for (let i = 0; i < 50; i++) {
            this.nodes.push({
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100,
                z: Math.random() * 200 - 100,
            });
        }
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.loop();
    }

    stop() {
        this.running = false;
    }

    rotate(rx, ry) {
        this.rotationX = rx;
        this.rotationY = ry;
    }

    tilt(tx, ty) {
        this.rotationX = tx;
        this.rotationY = ty;
    }

    dolly(z) {
        this.dollyZ = z;
    }

    loop() {
        if (!this.running) return;

        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        const cosX = Math.cos(this.rotationX);
        const sinX = Math.sin(this.rotationX);
        const cosY = Math.cos(this.rotationY);
        const sinY = Math.sin(this.rotationY);

        this.ctx.fillStyle = '#00ffcc';

        for (const node of this.nodes) {
            // Apply rotation Y
            let x = node.x * cosY - node.z * sinY;
            let z = node.z * cosY + node.x * sinY;

            // Apply rotation X
            let y = node.y * cosX - z * sinX;
            z = z * cosX + node.y * sinX;

            z += this.dollyZ;

            const scale = 200 / (200 + z);
            if (scale > 0) {
                const px = cx + x * scale;
                const py = cy + y * scale;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 2 * scale, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        requestAnimationFrame(() => this.loop());
    }
}
