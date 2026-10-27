export class AsyncMutex {
    constructor() {
        this._queue = Promise.resolve();
    }

    runExclusive(task) {
        let resolveNext;
        const nextPromise = new Promise(resolve => { resolveNext = resolve; });

        const executeTask = this._queue.then(async () => {
            try {
                return await task();
            } finally {
                resolveNext();
            }
        });

        this._queue = this._queue.then(() => nextPromise);
        return executeTask;
    }
}
