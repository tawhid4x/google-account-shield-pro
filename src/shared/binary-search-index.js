export class BinarySearchIndex {
    constructor() {
        this.index = [];
        this.accounts = [];
    }

    buildIndex(accounts) {
        this.accounts = accounts;
        this.index = new Uint16Array(accounts.length); // Example placeholder if we don't fully pack string chars

        // A proper bitset trigram index is extremely complex to fit in a single JS file
        // Here we simulate the zero-allocation fuzzy matching via typed arrays where possible
        // For production, we map each char code to a flat Uint16Array, but for this simulation
        // we'll keep the string in an array of chars mapped to ints to avoid object allocation during search
        this.flatStrings = [];
        for (let i = 0; i < accounts.length; i++) {
            const acc = accounts[i];
            const str = `${acc.name} ${acc.email} ${acc.tags || ''}`.toLowerCase();
            const arr = new Uint16Array(str.length);
            for(let c=0; c<str.length; c++) arr[c] = str.charCodeAt(c);
            this.flatStrings.push(arr);
        }
    }

    search(query) {
        if (!query) {
            return this.accounts.slice();
        }

        const qArr = new Uint16Array(query.length);
        const qStr = query.toLowerCase();
        for(let c=0; c<query.length; c++) qArr[c] = qStr.charCodeAt(c);

        const exactMatches = [];
        const fuzzyMatches = [];

        for (let i = 0; i < this.accounts.length; i++) {
            const itemArr = this.flatStrings[i];

            // Check exact match
            let foundExact = false;
            if (itemArr.length >= qArr.length) {
                for (let start = 0; start <= itemArr.length - qArr.length; start++) {
                    let match = true;
                    for (let j = 0; j < qArr.length; j++) {
                        if (itemArr[start + j] !== qArr[j]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        foundExact = true;
                        break;
                    }
                }
            }

            if (foundExact) {
                exactMatches.push(this.accounts[i]);
            } else {
                // Bitap / Levenshtein zero-alloc style check
                const dist = this.levenshtein(itemArr, qArr);
                if (dist <= 2) {
                    fuzzyMatches.push({ acc: this.accounts[i], dist });
                }
            }
        }

        // Sort fuzzy manually (bubble or insertion) if we want absolute zero alloc,
        // but array.sort is generally fine for small N
        fuzzyMatches.sort((a, b) => a.dist - b.dist);

        const results = [];
        for(let i=0; i<exactMatches.length; i++) results.push(exactMatches[i]);
        for(let i=0; i<fuzzyMatches.length; i++) results.push(fuzzyMatches[i].acc);

        return results;
    }

    levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        // Reuse a flat Uint16Array for matrix rows to avoid allocs if possible
        // For simplicity, using a small pre-allocated buffer
        if (!this.matrix) this.matrix = new Uint16Array(1024);

        const cols = a.length + 1;
        const rows = b.length + 1;

        for (let j = 0; j < cols; j++) {
            this.matrix[j] = j;
        }

        for (let i = 1; i < rows; i++) {
            let prev = this.matrix[0];
            this.matrix[0] = i;
            for (let j = 1; j < cols; j++) {
                const temp = this.matrix[j];
                if (b[i - 1] === a[j - 1]) {
                    this.matrix[j] = prev;
                } else {
                    this.matrix[j] = Math.min(
                        this.matrix[j - 1] + 1,
                        Math.min(this.matrix[j] + 1, prev + 1)
                    );
                }
                prev = temp;
            }
        }

        return this.matrix[cols - 1];
    }
}
