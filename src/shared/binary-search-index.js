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
            const searchableStr = `${acc.name} ${acc.email} ${acc.tags || ''}`.toLowerCase();
            this.index.set(acc.email, {
                str: searchableStr,
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

        // Fast exact substring match
        const exactMatches = [];
        const fuzzyMatches = [];

        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            const item = this.index.get(key);

            if (item.str.includes(q)) {
                exactMatches.push(item.original);
            } else {
                // Basic Levenshtein / fuzzy logic
                const dist = this.levenshtein(item.str, q);
                if (dist <= 2) {
                    fuzzyMatches.push({ acc: item.original, dist });
                }
            }
        }

        fuzzyMatches.sort((a, b) => a.dist - b.dist);
        return [...exactMatches, ...fuzzyMatches.map(f => f.acc)];
    }

    levenshtein(a, b) {
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
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
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
}
