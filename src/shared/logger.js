export class Logger {
    static info(msg, data = {}) {
        // Logging is minimal to maintain performance and avoid memory leaks.
    }
    static error(msg, err) {
        console.error(`[GMAS Error] ${msg}`, err);
    }
}
