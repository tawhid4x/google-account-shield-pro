import { BinarySearchIndex } from '../shared/binary-search-index.js';

const searchIndex = new BinarySearchIndex();
// Assuming vault accounts are passed here
function initSearch(accounts) {
    accounts.forEach(acc => searchIndex.addAccount(acc));

    const searchBox = document.createElement('input');
    searchBox.id = 'gmas-search';
    searchBox.addEventListener('input', (e) => {
        const results = searchIndex.search(e.target.value);
        console.log('Search Results:', results);
    });
    document.body.appendChild(searchBox);
}
