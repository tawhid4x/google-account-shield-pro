import { HardwareKeystore } from './hardware-keystore.js';

export class CryptoEngine {
    static async encrypt(data) {
        const key = await HardwareKeystore.getOrCreateMasterKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(JSON.stringify(data));

        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoded
        );

        // For simplicity in this simulated environment, we mock the binary representation
        return { iv: Array.from(iv), data: Array.from(new Uint8Array(ciphertext)) };
    }

    static async decrypt(encryptedPayload) {
        const key = await HardwareKeystore.getOrCreateMasterKey();
        const iv = new Uint8Array(encryptedPayload.iv);
        const ciphertext = new Uint8Array(encryptedPayload.data);

        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                ciphertext
            );
            return JSON.parse(new TextDecoder().decode(decrypted));
        } catch (e) {
            return null; // Return null on decryption failure (e.g. key mismatch)
        }
    }
}
