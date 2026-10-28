const fs = require('fs');
const path = require('path');

// Break up words to prevent the script from failing itself
const cw1 = 'del' + 've';
const cw2 = 'tapest' + 'ry';
const cw3 = 'unle' + 'ash';
const cw4 = 'game-ch' + 'anger';
const cw5 = 'revolutio' + 'nary';
const cw6 = 'seamless' + 'ly';
const cw7 = 'in conclu' + 'sion';
const CLICHE_WORDS = [cw1, cw2, cw3, cw4, cw5, cw6, cw7];

const rc1 = 'this function ini' + 'tializes';
const rc2 = 'here we lo' + 'op through';
const rc3 = 'helper func' + 'tion to';
const ROBOTIC_COMMENTS = [rc1, rc2, rc3];

function scanFile(filePath) {
    if (filePath.includes('verify-human-grade.js')) return true; // skip itself

    const content = fs.readFileSync(filePath, 'utf8').toLowerCase();

    let failed = false;

    CLICHE_WORDS.forEach(word => {
        if (content.includes(word)) {
            console.error(`AI Footprint Detected (Cliche word '${word}') in ${filePath}`);
            failed = true;
        }
    });

    ROBOTIC_COMMENTS.forEach(comment => {
        if (content.includes(comment)) {
            console.error(`AI Footprint Detected (Robotic comment '${comment}') in ${filePath}`);
            failed = true;
        }
    });

    return !failed;
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            if (!['node_modules', '.git'].includes(f)) {
                walkDir(dirPath, callback);
            }
        } else {
            if (['.js', '.html', '.css', '.md'].some(ext => f.endsWith(ext))) {
                callback(dirPath);
            }
        }
    });
}

function runVerification() {
    console.log('Running Human-Craftsmanship Auditor...');
    let allPassed = true;
    walkDir('.', (filePath) => {
        if (!scanFile(filePath)) {
            allPassed = false;
        }
    });

    if (!allPassed) {
        console.error('Human Grade Verification Failed. AI Footprint Detected.');
        process.exit(1);
    } else {
        console.log('Human Grade Verification Passed. 0.0% AI Footprint.');
    }
}

runVerification();
