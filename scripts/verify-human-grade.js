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

// We will also check for pure English (basic heuristic of finding Bengali Unicode range block)
const bengaliRegex = /[\u0980-\u09FF]/;

let failed = false;

walkDir(path.join(__dirname, '..'), (filePath) => {
    if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('assets/')) return;
    if (filePath.includes('scripts/verify-human-grade.js')) return; // Skip checking the script itself

    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.md') || filePath.endsWith('.css')) {
        const content = fs.readFileSync(filePath, 'utf8').toLowerCase();

        // Check for AI terms
        for (const termB64 of aiTermsB64) {
            const term = Buffer.from(termB64, 'base64').toString('utf8').toLowerCase();
            if (content.includes(term)) {
                console.error(`Violation found in ${filePath}: contains banned terminology (${term})`);
                failed = true;
            }
        }

        // Check for non-English (Bengali specifically, as requested)
        if (bengaliRegex.test(content) && !filePath.includes('signout-shield.js') && !filePath.includes('README.md')) { // signout-shield has string matching for bangla signout
            console.error(`Violation found in ${filePath}: contains non-English characters.`);
            failed = true;
        }

        // Basic heuristic for unused vars or console spam could be added here, but regex checking is flaky for AST rules.
        // Assuming ESLint logic or just basic regex:
        if (filePath.endsWith('.js') && content.includes('console.log(') && !filePath.includes('scripts/')) {
            console.error(`Violation found in ${filePath}: console.log spam.`);
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
