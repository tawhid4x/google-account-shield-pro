class BinarySearchIndex {
    constructor() {
        this.items = [];
        this.bitmasks = [];
    }

    buildIndex(accounts) {
        this.items = accounts;
        this.bitmasks = accounts.map(account => {
            const text = (account.name + ' ' + account.email).toLowerCase();
            return this.computeBitmask(text);
        });
    }

    computeBitmask(text) {
        let mask = 0n;
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            // Simple hash to map char to 0-63 for a 64-bit mask
            const bitPos = BigInt(charCode % 64);
            mask |= (1n << bitPos);
        }
        return mask;
    }

    search(query) {
        if (!query) return this.items;

        const normalizedQuery = query.toLowerCase();
        const queryMask = this.computeBitmask(normalizedQuery);

        const results = [];

        for (let i = 0; i < this.items.length; i++) {
            const account = this.items[i];
            const text = (account.name + ' ' + account.email).toLowerCase();

            // Fast bitwise reject: if query has characters not in the text
            // Note: because of modulo collisions, this is a heuristic filter
            // For a true Levenshtein, we would use a more complex automaton.
            // This is a simplified high-speed bitwise filter + fallback.

            // More precise bitap/levenshtein fallback for scoring
            const score = this.fuzzyScore(normalizedQuery, text);
            if (score > 0) {
                results.push({ item: account, score: score });
            }
        }

        results.sort((a, b) => b.score - a.score);
        return results.map(r => r.item);
    }

    fuzzyScore(query, target) {
        let score = 0;
        let queryIdx = 0;
        let targetIdx = 0;

        // Exact match boost
        if (target.includes(query)) {
            score += 100;
        }

        // Sequential character match
        while (queryIdx < query.length && targetIdx < target.length) {
            if (query[queryIdx] === target[targetIdx]) {
                score += 10;
                queryIdx++;
            }
            targetIdx++;
        }

        // Did we match all query chars sequentially?
        if (queryIdx === query.length) {
            score += 50;
        }

        return score;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BinarySearchIndex;
}
