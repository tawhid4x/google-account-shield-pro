export class VaultCloner {
    static async generateKey(password) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );
        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode("gmas_salt_123"),
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    static async exportToCapsule(vaultData, password = "default_secure_pwd") {
        const jsonStr = JSON.stringify(vaultData);

        // Simulating compression (since CompressionStream might not be in all test envs)
        // In a real environment, we'd pipe through a CompressionStream('gzip')
        const enc = new TextEncoder();
        const data = enc.encode(jsonStr);

        const key = await this.generateKey(password);
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            data
        );

        const payload = new Uint8Array(iv.length + encrypted.byteLength);
        payload.set(iv, 0);
        payload.set(new Uint8Array(encrypted), iv.length);

        // Base64 encode the payload
        let binary = '';
        for (let i = 0; i < payload.byteLength; i++) {
            binary += String.fromCharCode(payload[i]);
        }
        return btoa(binary);
    }

    static async importFromCapsule(capsule, password = "default_secure_pwd") {
        try {
            const binary = atob(capsule);
            const payload = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                payload[i] = binary.charCodeAt(i);
            }

            const iv = payload.slice(0, 12);
            const data = payload.slice(12);

            const key = await this.generateKey(password);
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv
                },
                key,
                data
            );

            const dec = new TextDecoder();
            const jsonStr = dec.decode(decrypted);

            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to decrypt capsule", e);
            return null;
        }
    }
}
