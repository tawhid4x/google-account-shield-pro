export class PerformanceEngine {
    static queueMicrotaskBatch(tasks) {
        tasks.forEach(task => queueMicrotask(task));
    }

    static measureLatency(startMark) {
        return performance.now() - startMark;
    }
}
