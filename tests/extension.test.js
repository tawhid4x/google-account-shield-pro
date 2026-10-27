test('Manifest JSON is valid', () => {
    const fs = require('fs');
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    expect(manifest.manifest_version).toBe(3);
});
