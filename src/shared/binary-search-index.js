export class BinarySearchIndex {
    constructor() {
        this.index = new Map();
        this.keys = [];
    }

    buildIndex(accounts) {
        this.index.clear();
        this.keys = [];

        for (let i = 0; i < accounts.length; i++) {
            const acc = accounts[i];
            const searchableStr = `${acc.name} ${acc.email} ${acc.tags || ''} ${acc.workspace || ''}`.toLowerCase();

            // Generate simple Uint16 representation for fast matching
            const bitset = new Uint16Array(searchableStr.length);
            for (let j = 0; j < searchableStr.length; j++) {
                bitset[j] = searchableStr.charCodeAt(j);
            }

            this.index.set(acc.email, {
                str: searchableStr,
                bitset: bitset,
                original: acc
            });
            this.keys.push(acc.email);
        }
    }

    search(query) {
        if (!query) {
            return this.keys.map(k => this.index.get(k).original);
        }

        const q = query.toLowerCase();
        const qBitset = new Uint16Array(q.length);
        for(let i=0; i<q.length; i++) qBitset[i] = q.charCodeAt(i);

        const exactMatches = [];
        const fuzzyMatches = [];

        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            const item = this.index.get(key);

            // Binary match
            if (this._binaryIncludes(item.bitset, qBitset)) {
                exactMatches.push({ acc: item.original, matchType: 'exact' });
            } else {
                const dist = this._binaryLevenshtein(item.bitset, qBitset);
                if (dist <= 2) {
                    fuzzyMatches.push({ acc: item.original, dist, matchType: 'fuzzy' });
                }
            }
        }

        fuzzyMatches.sort((a, b) => a.dist - b.dist);
        return [...exactMatches.map(m => m.acc), ...fuzzyMatches.map(f => f.acc)];
    }

    _binaryIncludes(target, query) {
        if (query.length > target.length) return false;
        for (let i = 0; i <= target.length - query.length; i++) {
            let match = true;
            for (let j = 0; j < query.length; j++) {
                if (target[i + j] !== query[j]) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
        return false;
    }

    _binaryLevenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b[i - 1] === a[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    static highlightMatch(text, query) {
        if (!query) return text;
        const qLower = query.toLowerCase();
        const tLower = text.toLowerCase();

        const idx = tLower.indexOf(qLower);
        if (idx === -1) return text;

        const before = text.substring(0, idx);
        const match = text.substring(idx, idx + query.length);
        const after = text.substring(idx + query.length);

        return `${before}<span style="color: #00ffcc; text-shadow: 0 0 4px rgba(0, 255, 204, 0.5);">${match}</span>${after}`;
    }
}
module.exports = { BinarySearchIndex }; // For jest
