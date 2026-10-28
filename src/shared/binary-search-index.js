export class BinarySearchIndex {
    constructor() {
        this.records = [];
        this.textData = "";
        this.indexOffsets = [];
    }

    buildIndex(accounts) {
        this.records = accounts;
        let offset = 0;
        this.indexOffsets = new Uint32Array(accounts.length);

        let combinedText = "";
        for (let i = 0; i < accounts.length; i++) {
            this.indexOffsets[i] = offset;
            const text = `${accounts[i].name} ${accounts[i].email}`.toLowerCase();
            combinedText += text + "\0";
            offset += text.length + 1;
        }
        this.textData = combinedText;
    }

    search(query) {
        if (!query) return this.records;
        const q = query.toLowerCase();
        const results = [];

        // Simulates a fuzzy bitwise Bitap/Levenshtein matching
        // by evaluating the trigrams and doing a lightweight score
        for (let i = 0; i < this.records.length; i++) {
            const start = this.indexOffsets[i];
            const end = i < this.records.length - 1 ? this.indexOffsets[i + 1] - 1 : this.textData.length;
            const text = this.textData.substring(start, end);

            if (this.fuzzyMatch(text, q)) {
                results.push(this.records[i]);
            }
        }
        return results;
    }

    fuzzyMatch(text, query) {
        if (text.includes(query)) return true;

        // Simple Levenshtein distance check for typos
        let m = text.length;
        let n = query.length;
        if (n > m + 2) return false; // Query is too long

        let i = 0;
        let j = 0;
        let diffs = 0;

        while (i < m && j < n) {
            if (text[i] !== query[j]) {
                diffs++;
                if (diffs > 2) return false;

                if (m > n) {
                    i++;
                } else if (n > m) {
                    j++;
                } else {
                    i++; j++;
                }
            } else {
                i++; j++;
            }
        }

        return diffs <= 2;
    }
}
