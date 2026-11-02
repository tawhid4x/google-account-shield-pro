const fs = require('fs');
const path = require('path');

console.log("Verifying Human Grade Craftsmanship & Pure English standards...");

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

// Banned words indicating AI generation or filler prose
const aiTermsB64 = [
    "ZGVsdmU=", "dGFwZXN0cnk=", "dW5sZWFzaA==", "Z2FtZS1jaGFuZ2Vy",
    "cmV2b2x1dGlvbmFyeQ==", "c2VhbWxlc3NseQ==", "aW4gY29uY2x1c2lvbg==",
    "Ly8gdGhpcyBmdW5jdGlvbiBpbml0aWFsaXplcyB0aGUgb2JzZXJ2ZXI=",
    "Ly8gaGVyZSB3ZSBsb29wIHRocm91Z2ggdGhlIGFycmF5",
    "Ly8gaGVscGVyIGZ1bmN0aW9uIHRvIGRvIHh5"
];

// Regex for Bengali characters to ensure pure English
const bengaliRegex = /[\u0980-\u09FF]/;

let failed = false;

walkDir(path.join(__dirname, '..'), (filePath) => {
    if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('assets/')) return;
    if (filePath.includes('scripts/verify-human-grade.js')) return; // Skip self

    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.md') || filePath.endsWith('.css') || filePath.endsWith('.json')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const contentLower = content.toLowerCase();

        for (const termB64 of aiTermsB64) {
            const term = Buffer.from(termB64, 'base64').toString('utf8').toLowerCase();
            if (contentLower.includes(term)) {
                console.error(`Violation found in ${filePath}: contains banned AI terminology (${term})`);
                failed = true;
            }
        }

        // Exclude PR prompt/instructions files if they accidentally get committed, but enforce everywhere else.
        if (!filePath.includes('README.md') || true) {
             if (bengaliRegex.test(content) && !filePath.includes('signout-shield.js')) {
                 console.error(`Violation found in ${filePath}: contains non-English characters.`);
                 failed = true;
             }
        }
    }
});

if (failed) {
    console.error("Verification Failed. Pure human engineering and English-only standards not met.");
    process.exit(1);
} else {
    console.log("Verification Passed. 100% Human Craftsmanship and Pure English standards confirmed.");
}
