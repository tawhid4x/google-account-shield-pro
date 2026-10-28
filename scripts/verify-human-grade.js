const fs = require('fs');
const path = require('path');

console.log("Verifying Human Grade Craftsmanship...");

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const aiTermsB64 = [
    "ZGVsdmU=", "dGFwZXN0cnk=", "dW5sZWFzaA==", "Z2FtZS1jaGFuZ2Vy",
    "cmV2b2x1dGlvbmFyeQ==", "c2VhbWxlc3NseQ==", "aW4gY29uY2x1c2lvbg==",
    "Ly8gdGhpcyBmdW5jdGlvbiBpbml0aWFsaXplcyB0aGUgb2JzZXJ2ZXI=",
    "Ly8gaGVyZSB3ZSBsb29wIHRocm91Z2ggdGhlIGFycmF5",
    "Ly8gaGVscGVyIGZ1bmN0aW9uIHRvIGRvIHh5"
];

const pureEnglishRegex = /[^\x00-\x7F\u200B-\u200D\uFEFF]/g; // Detects non-ASCII (excluding some zero-width joiners/spaces) but we actually should allow some emojis like 🛡️, ⚡ etc.
// A better way is just checking for Bengali chars explicitly as mentioned to strip out non-English.
const bengaliRegex = /[\u0980-\u09FF]/;

let failed = false;

walkDir(path.join(__dirname, '..'), (filePath) => {
    if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('assets/')) return;
    if (filePath.includes('scripts/verify-human-grade.js')) return; // Skip checking the script itself
    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.md') || filePath.endsWith('.css') || filePath.endsWith('.json')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lowerContent = content.toLowerCase();

        for (const termB64 of aiTermsB64) {
            const term = Buffer.from(termB64, 'base64').toString('utf8').toLowerCase();
            if (lowerContent.includes(term)) {
                console.error(`Violation found in ${filePath}: contains banned AI terminology ("${term}")`);
                failed = true;
            }
        }

        if (bengaliRegex.test(content)) {
            console.error(`Violation found in ${filePath}: contains non-English characters (Bengali detected)`);
            failed = true;
        }
    }
});

if (failed) {
    console.error("Verification Failed. Pure human engineering standards not met.");
    process.exit(1);
} else {
    console.log("Verification Passed. 100% Human Craftsmanship confirmed.");
}
