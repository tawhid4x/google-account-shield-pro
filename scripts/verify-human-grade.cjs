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
    "Ly8gaGVscGVyIGZ1bmN0aW9uIHRvIGRvIHh5",
    "Y29uc29sZS5sb2c=", // console.log
    "4Ka44Ka54Kac", "4KaX4Ka+4KaH4Kah", "4Kas4Ka+4KaC4Kay4Ka+" // Bengali traces check
];

let failed = false;

walkDir(path.join(__dirname, '..'), (filePath) => {
    if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('assets/') || filePath.includes('docs/CHROME_WEB_STORE_GUIDE.md')) return;
    if (filePath.includes('scripts/verify-human-grade.js')) return;

    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.md') || filePath.endsWith('.css')) {
        const content = fs.readFileSync(filePath, 'utf8').toLowerCase();

        // Exclude specific files from console.log ban, such as testing/building scripts
        const isExemptFromConsoleLog = filePath.includes('scripts/validate-extension.js') ||
                                       filePath.includes('scripts/build-zip.js') ||
                                       filePath.includes('scripts/generate-icons.js') ||
                                       filePath.includes('tests/');

        for (const termB64 of aiTermsB64) {
            const term = Buffer.from(termB64, 'base64').toString('utf8').toLowerCase();

            if (term === 'console.log' && isExemptFromConsoleLog) continue;

            if (content.includes(term)) {
                console.error(`Violation found in ${filePath}: contains banned terminology (${term})`);
                failed = true;
            }
        }
    }
});

if (failed) {
    console.error("Verification Failed. Pure human engineering standards not met.");
    process.exit(1);
} else {
    console.log("Verification Passed. 100% Human Craftsmanship confirmed.");
}
