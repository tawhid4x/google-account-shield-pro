import { Interactive3DCore } from '../shared/interactive-3d-core.js';

console.log("Options Init");

document.addEventListener('DOMContentLoaded', () => {
    Interactive3DCore.init('dashboard', { scrollDolly: true });
});
