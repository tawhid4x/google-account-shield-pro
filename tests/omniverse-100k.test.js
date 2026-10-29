const fs = require('fs');
const path = require('path');
const vm = require('vm');
const url = require('url');

describe('Agentic Mission Real Validations', () => {
    test('Mission 1: Multi-Script Global Scope Collision Test', () => {
        const contentDir = path.join(__dirname, '../src/content');
        const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.js'));
        let combinedCode = '';
        files.forEach(f => {
            combinedCode += fs.readFileSync(path.join(contentDir, f), 'utf8') + '\n';
        });

        // Use a mocked window context
        const context = vm.createContext({
            window: { __GMAS_SHARED__: {}, addEventListener: () => {} },
            document: {
                documentElement: {
                    setAttribute: () => {}, getAttribute: () => {}, appendChild: () => {}
                },
                body: { appendChild: () => {} },
                createElement: () => ({
                    id: '',
                    className: '',
                    attachShadow: () => ({
                        appendChild: () => {},
                        getElementById: () => ({ addEventListener: () => {}, focus: () => {}, value: '', classList: { add: () => {}, remove: () => {} } })
                    }),
                    addEventListener: () => {},
                    appendChild: () => {},
                    style: {}
                }),
                querySelectorAll: () => [],
                readyState: 'complete',
                addEventListener: () => {}
            },
            MutationObserver: class { observe() {} },
            Node: { ELEMENT_NODE: 1 },
            console: console,
            chrome: { runtime: { sendMessage: () => Promise.resolve(), onMessage: { addListener: () => {} } } },
            sessionStorage: { setItem: () => {}, getItem: () => {}, removeItem: () => {} },
            requestAnimationFrame: (cb) => cb()
        });

        expect(() => {
            vm.runInContext(combinedCode, context);
        }).not.toThrow();
    });

    test('Mission 2: Exact Google Account Menu DOM Shield Test', () => {
        const scriptCode = fs.readFileSync(path.join(__dirname, '../src/content/signout-shield.js'), 'utf8');

        let observerCb = null;
        let elementsHidden = [];
        let documentHtml = {
            'data-gmas-hide-signout': 'true'
        };

        const mockEls = [
            { textContent: 'Manage your Google Account', getAttribute: () => null, parentElement: null, querySelectorAll: () => [], getBoundingClientRect: () => ({ height: 20 }), style: { setProperty: (k, v) => elementsHidden.push('manage') }, hasAttribute: () => false, setAttribute: () => {} },
            { textContent: 'MD. TAWHID HOSSAIN official.mdtawhidhossain@gmail.com', getAttribute: () => null, parentElement: null, querySelectorAll: () => [], getBoundingClientRect: () => ({ height: 40 }), style: { setProperty: (k, v) => elementsHidden.push('account1') }, hasAttribute: () => false, setAttribute: () => {} },
            { textContent: '+ Add another account', getAttribute: () => null, parentElement: null, querySelectorAll: () => [], getBoundingClientRect: () => ({ height: 30 }), style: { setProperty: (k, v) => elementsHidden.push('addaccount') }, hasAttribute: () => false, setAttribute: () => {}, querySelector: () => null },
            { textContent: 'Sign out of all accounts', getAttribute: () => null, parentElement: null, querySelectorAll: () => [], getBoundingClientRect: () => ({ height: 30 }), style: { setProperty: (k, v) => elementsHidden.push('signout') }, hasAttribute: () => false, setAttribute: () => {}, querySelector: () => null }
        ];

        const context = vm.createContext({
            window: { __GMAS_SHARED__: {}, addEventListener: () => {} },
            document: {
                documentElement: {
                    setAttribute: (k, v) => documentHtml[k] = v,
                    getAttribute: (k) => documentHtml[k]
                },
                body: { appendChild: () => {} },
                querySelectorAll: (q) => mockEls,
                readyState: 'complete',
                addEventListener: () => {}
            },
            MutationObserver: class {
                constructor(cb) { observerCb = cb; }
                observe() {}
            },
            Node: { ELEMENT_NODE: 1 },
            console: console,
            chrome: { runtime: { sendMessage: () => Promise.resolve() } },
            requestAnimationFrame: (cb) => cb()
        });

        vm.runInContext(scriptCode, context);
        if (observerCb) observerCb();

        expect(elementsHidden).toContain('signout');
        expect(elementsHidden).not.toContain('manage');
        expect(elementsHidden).not.toContain('account1');
        expect(elementsHidden).not.toContain('addaccount');
    });

    test('Mission 3: myaccount.google.com Redirect Bouncer Test', () => {
        const swCode = fs.readFileSync(path.join(__dirname, '../src/background/service-worker.js'), 'utf8');
        const cleanCode = swCode.replace(/import .*/g, '');

        let redirectedUrl = null;
        let listeners = {};

        const context = vm.createContext({
            URL: url.URL,
            chrome: {
                runtime: {
                    onInstalled: { addListener: () => {} },
                    onMessage: { addListener: () => {} }
                },
                tabs: {
                    onUpdated: { addListener: (cb) => listeners.onUpdated = cb },
                    update: (tabId, opts) => redirectedUrl = opts.url
                },
                storage: {
                    local: {
                        get: (keys, cb) => cb({ lastReturnUrl: 'https://www.google.com/' })
                    }
                }
            }
        });

        vm.runInContext(cleanCode, context);

        // Trigger the bounce
        listeners.onUpdated(1, {}, { url: 'https://myaccount.google.com/u/1/?utm_source=sign_in_no_continue&pli=1' });

        expect(redirectedUrl).toBe('https://www.google.com/?authuser=1');
    });

    test('Mission 4: Default Toggles & Auto-Harvest Test', () => {
        const swCode = fs.readFileSync(path.join(__dirname, '../src/background/service-worker.js'), 'utf8');
        const cleanCode = swCode.replace(/import .*/g, '');
        let installedCb = null;
        let setValues = null;
        const context = vm.createContext({
            chrome: {
                runtime: {
                    onInstalled: { addListener: (cb) => installedCb = cb },
                    onMessage: { addListener: () => {} }
                },
                tabs: { onUpdated: { addListener: () => {} } },
                storage: {
                    local: {
                        get: (keys, cb) => cb({}),
                        set: (vals) => setValues = vals
                    }
                }
            }
        });
        vm.runInContext(cleanCode, context);
        if (installedCb) installedCb();

        expect(setValues.hideSignout).toBe(true);
        expect(setValues.unlimitedVault).toBe(true);
        expect(setValues.autoEvict).toBe(true);
    });
});
