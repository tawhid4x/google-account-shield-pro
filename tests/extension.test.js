const fs = require('fs');
const path = require('path');
const vm = require('vm');

test('Manifest JSON is valid', () => {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    expect(manifest.manifest_version).toBe(3);
});

test('Multi-Script Global Scope Collision Test', () => {
    // Read all content scripts
    const contentDir = path.join(__dirname, '../src/content');
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.js'));

    let combinedCode = '';
    files.forEach(f => {
        combinedCode += fs.readFileSync(path.join(contentDir, f), 'utf8') + '\n';
    });

    // Create a sandbox to run the combined scripts
    const sandbox = {
        window: { location: { href: 'https://ogs.google.com/u/0/widget/account', hostname: 'ogs.google.com' }, addEventListener: jest.fn() },
        document: {
            documentElement: { setAttribute: jest.fn(), getAttribute: jest.fn(() => 'true') },
            body: { appendChild: jest.fn() },
            querySelectorAll: jest.fn(() => []),
            addEventListener: jest.fn()
        },
        MutationObserver: class {
            observe() {}
        },
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        console: console,
        chrome: {
            runtime: { sendMessage: jest.fn(() => Promise.resolve()) },
            storage: { local: { set: jest.fn() } }
        }
    };

    // This will throw if there's a SyntaxError like 'Identifier has already been declared'
    expect(() => {
        vm.runInNewContext(combinedCode, sandbox);
    }).not.toThrow();
});
