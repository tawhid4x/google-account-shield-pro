import { BinarySearchIndex } from '../src/shared/binary-search-index.js';
import { SelfDoctor } from '../src/background/self-doctor.js';
import { SeamlessStatePreserver } from '../src/content/seamless-state-preserver.js';

test('Omniverse 100k Benchmark: BinarySearchIndex', () => {
    const index = new BinarySearchIndex();
    const accounts = Array.from({ length: 500 }).map((_, i) => ({
        email: `test${i}@gmail.com`,
        name: `User ${i}`
    }));
    index.buildIndex(accounts);

    let matchCount = 0;
    const ITERATIONS = 25000;
    for (let i = 0; i < ITERATIONS; i++) {
        const results = index.search('test25');
        matchCount += results.length;
    }

    expect(matchCount).toBeGreaterThan(0);
});

test('Omniverse 100k Benchmark: Vault Schema check', async () => {
    // Mock chrome.storage.local for tests
    global.chrome = {
        storage: {
            local: {
                data: {
                    gmas_account_vault: {
                        "test@GMAIL.COM": {
                            email: "test@GMAIL.COM",
                            cookies: [
                                { name: "__Host-token", domain: ".google.com", path: "/" }
                            ]
                        }
                    }
                },
                get: async function(key) {
                    return { [key]: this.data[key] };
                },
                set: async function(obj) {
                    Object.assign(this.data, obj);
                }
            }
        }
    };

    let iterations = 25000;
    let before = Date.now();
    for (let i = 0; i < iterations; i++) {
        await SelfDoctor.diagnoseAndRepair();
    }
    let after = Date.now();

    const vault = global.chrome.storage.local.data.gmas_account_vault;
    expect(vault['test@gmail.com']).toBeDefined(); // Case normalized
    expect(vault['test@GMAIL.COM']).toBeUndefined(); // Original removed
    expect(vault['test@gmail.com'].cookies[0].domain).toBe('google.com'); // Prefix normalized
    expect(after - before).toBeLessThan(5000); // Ensures it's fast
});

test('Omniverse 100k Benchmark: State Preserver', () => {
    // Mock required DOM globals
    global.window = {
        scrollX: 100,
        scrollY: 200,
        location: { hostname: 'youtube.com' },
        scrollTo: jest.fn()
    };
    global.document = {
        activeElement: { tagName: 'INPUT', value: 'search query', id: 'searchBox' },
        querySelector: jest.fn(() => ({ currentTime: 15, paused: false, focus: jest.fn(), play: jest.fn(() => Promise.resolve()) })),
        createElement: jest.fn(() => ({ style: {}, offsetHeight: 10, remove: jest.fn() })),
        body: { appendChild: jest.fn() }
    };
    const mockStorage = {};
    global.sessionStorage = {
        setItem: (k, v) => mockStorage[k] = v,
        getItem: (k) => mockStorage[k],
        removeItem: (k) => delete mockStorage[k]
    };

    let iterations = 25000;
    for(let i=0; i<iterations; i++) {
        SeamlessStatePreserver.captureState();
        expect(mockStorage['__gmas_transient_state']).toBeDefined();
        SeamlessStatePreserver.restoreState();
        expect(mockStorage['__gmas_transient_state']).toBeUndefined();
    }
});