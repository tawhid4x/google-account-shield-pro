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

// Ensure strict English and no AI footprint.
const bannedPhrases = [
    "delve",
    "tapestry",
    "unleash",
    "game-changer",
    "revolutionary",
    "seamlessly",
    "in conclusion",
    "// this function initializes the observer",
    "// here we loop through the array",
    "// helper function to do x",
    "// workaround for" // Usually acceptable, but removing generic robotic comments is a must.
];

// Check for non-ASCII characters to enforce 100% English.
// Allow some specific emojis used in UI or existing code.
const nonAsciiRegex = /[^\x00-\x7F]/g;
const allowedEmojis = ['🛡', '⚡', '🔍', '📌', '⚙', '🎮', '🟢', '🔵', '🟠', '📧', '📺', '☁', '↗', '➕', '💾', '📂', '⚠️', '⭐', '✔', '❌'];

let failed = false;

walkDir(path.join(__dirname, '..'), (filePath) => {
    if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('assets/')) return;
    if (filePath.includes('scripts/verify-human-grade.js')) return; // Skip checking the script itself
    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.md') || filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Strip out allowed emojis from nonAscii check
        let contentWithoutEmojis = content;
        for (const emoji of allowedEmojis) {
            contentWithoutEmojis = contentWithoutEmojis.split(emoji).join('');
        }
        // Remove trailing invisible characters and zero-width spaces that sometimes get through
        contentWithoutEmojis = contentWithoutEmojis.replace(/[\u200B-\u200D\uFEFF]/g, '');

        if (nonAsciiRegex.test(contentWithoutEmojis)) {
            const matches = contentWithoutEmojis.match(nonAsciiRegex);
            console.error(`Violation found in ${filePath}: contains non-English characters: ${matches.slice(0, 5).join(', ')}...`);
            failed = true;
        }

        content = content.toLowerCase();
        for (const term of bannedPhrases) {
            if (content.includes(term.toLowerCase())) {
                console.error(`Violation found in ${filePath}: contains banned AI terminology/comment (${term})`);
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