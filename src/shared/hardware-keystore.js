export class HardwareKeystore {
    static async getOrCreateMasterKey() {
        // Generates an AES-256-GCM non-extractable master key tied to the browser session.
        return await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }
}
