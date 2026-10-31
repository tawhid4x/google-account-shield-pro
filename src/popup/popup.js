import { Interactive3DCore } from '../shared/interactive-3d-core.js';

console.log("Popup UI Init");

document.addEventListener('DOMContentLoaded', () => {
    Interactive3DCore.init('app', { scrollDolly: false });
});
