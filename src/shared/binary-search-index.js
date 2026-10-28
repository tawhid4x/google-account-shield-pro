export class BinarySearchIndex {
    constructor() {
        this.index = new Uint16Array(10000);
        this.records = [];
        this.recordCount = 0;
    }

    addAccount(account) {
        const id = this.recordCount++;
        this.records[id] = account;

        const text = `${account.name || ''} ${account.email || ''} ${account.tags?.join(' ') || ''}`.toLowerCase();

        // Simple trigram indexing simulation for Uint16Array demonstration
        for (let i = 0; i < text.length - 2; i++) {
            const trigram = text.substring(i, i + 3);
            const hash = this._hashTrigram(trigram);
            // Store simple mapping hash -> id
            this.index[hash % 10000] = id;
        }
    }

    _hashTrigram(trigram) {
        let hash = 0;
        for (let i = 0; i < trigram.length; i++) {
            hash = (hash << 5) - hash + trigram.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    search(query) {
        if (!query) return this.records;
        query = query.toLowerCase();

        // Levenshtein fuzzy match implementation over records
        return this.records.filter(record => {
            const text = `${record.name || ''} ${record.email || ''}`.toLowerCase();
            return this._levenshteinDistance(query, text) < 3 || text.includes(query);
        });
    }

    _levenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
        for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    highlightMatch(element, query) {
        if (!query) return;
        const text = element.textContent;
        // Escape regex special chars
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Clear children
        element.textContent = '';

        const regex = new RegExp(`(${safeQuery.split('').join('.*?')})`, 'gi');
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                element.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            const span = document.createElement('span');
            span.style.color = '#00ff00';
            span.style.textShadow = '0 0 5px #00ff00';
            span.textContent = match[0];
            element.appendChild(span);
            lastIndex = regex.lastIndex;

            // To prevent infinite loop if empty match
            if (match[0].length === 0) regex.lastIndex++;
        }

        if (lastIndex < text.length) {
            element.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
    }
}
