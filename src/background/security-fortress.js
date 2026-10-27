export class SecurityFortress {
    static validateIPC(sender) {
        if (!sender.url.includes('.google.com') && !sender.url.startsWith('chrome-extension://')) {
            throw new Error('IPC Validation Failed');
        }
    }
}
