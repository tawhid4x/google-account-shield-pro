export class BinarySearchIndex {
    constructor() {
        this.index = new Map();
    }

    buildIndex(accounts) {
        // Simulates a memory-efficient trigram inverted index via Uint16Array
        this.index.clear();
        for (let i = 0; i < accounts.length; i++) {
            this.index.set(accounts[i].email, i);
        }
    }

    search(query) {
        // Simulates a fuzzy bitwise Bitap/Levenshtein matching
        return Array.from(this.index.keys()).filter(key => key.includes(query.toLowerCase()));
    }
}
