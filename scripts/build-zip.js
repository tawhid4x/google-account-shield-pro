const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

// Simple native zip builder using child_process and zip command
const outputZip = path.join(__dirname, '..', 'google-multi-account-shield-extension.zip');
console.log(`Building release ZIP to: ${outputZip}`);

try {
    if (fs.existsSync(outputZip)) {
        fs.unlinkSync(outputZip);
    }

    // We only zip specific directories and files that should be distributed
    const filesToInclude = [
        'manifest.json',
        'src/',
        'assets/',
        'README.md',
        'LICENSE',
        'PRIVACY.md'
    ];

    // Create zip
    const cmd = `zip -r ${outputZip} ${filesToInclude.join(' ')}`;
    execSync(cmd, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

    console.log("ZIP built successfully.");
} catch (e) {
    console.error("Error building ZIP:", e.message);
    process.exit(1);
}
