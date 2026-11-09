const fs = require('fs');
const path = require('path');

console.log("Validating Extension...");

const manifestPath = path.join(__dirname, '..', 'manifest.json');
if (!fs.existsSync(manifestPath)) {
    console.error("Error: manifest.json is missing.");
    process.exit(1);
}

try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    JSON.parse(manifestContent);
    console.log("manifest.json is valid JSON.");
} catch (e) {
    console.error("Error parsing manifest.json: ", e.message);
    process.exit(1);
}

// Simple heuristic check for PNG valid header
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
    const pngPath = path.join(__dirname, '..', 'assets', 'icons', `icon${size}.png`);
    if (!fs.existsSync(pngPath)) {
        console.error(`Error: Missing icon${size}.png`);
        process.exit(1);
    }
    const buffer = fs.readFileSync(pngPath);
    // \x89PNG\r\n\x1a\n
    if (buffer.length < 8 || buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47 || buffer[4] !== 0x0D || buffer[5] !== 0x0A || buffer[6] !== 0x1A || buffer[7] !== 0x0A) {
        console.error(`Error: icon${size}.png is not a valid PNG.`);
        process.exit(1);
    }
});

console.log("Validation Successful.");
process.exit(0);
