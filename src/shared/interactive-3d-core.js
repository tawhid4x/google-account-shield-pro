import { Spatial3DEngine } from './spatial-3d-engine.js';

export class Interactive3DCore {
    static attach(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        container.appendChild(canvas);

        return Spatial3DEngine.init(canvas);
    }
}
