export class VaultCloner {
    static async exportToCapsule(vaultData, password) {
        const jsonStr = JSON.stringify(vaultData);
        const encoder = new TextEncoder();
        const data = encoder.encode(jsonStr);

        // Compress using CompressionStream if available, otherwise just use raw data
        let compressedData = data;
        if (typeof CompressionStream !== 'undefined') {
            const cs = new CompressionStream('gzip');
            const writer = cs.writable.getWriter();
            writer.write(data);
            writer.close();
            const response = new Response(cs.readable);
            const arrayBuffer = await response.arrayBuffer();
            compressedData = new Uint8Array(arrayBuffer);
        }

        // Encrypt
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );

        const ciphertext = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            compressedData
        );

        const bundle = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
        bundle.set(salt, 0);
        bundle.set(iv, salt.length);
        bundle.set(new Uint8Array(ciphertext), salt.length + iv.length);

        let binaryString = "";
        for (let i = 0; i < bundle.byteLength; i++) {
            binaryString += String.fromCharCode(bundle[i]);
        }
        return btoa(binaryString);
    }

    static async importFromCapsule(capsuleBase64, password) {
        try {
            const binaryString = atob(capsuleBase64);
            const bundle = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bundle[i] = binaryString.charCodeAt(i);
            }

            const salt = bundle.slice(0, 16);
            const iv = bundle.slice(16, 28);
            const ciphertext = bundle.slice(28);

            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                "raw",
                encoder.encode(password),
                { name: "PBKDF2" },
                false,
                ["deriveBits", "deriveKey"]
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: salt,
                    iterations: 100000,
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                false,
                ["encrypt", "decrypt"]
            );

            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                ciphertext
            );

            let decompressedData = new Uint8Array(decryptedBuffer);
            if (typeof DecompressionStream !== 'undefined') {
                const ds = new DecompressionStream('gzip');
                const writer = ds.writable.getWriter();
                writer.write(decompressedData);
                writer.close();
                const response = new Response(ds.readable);
                const arrayBuffer = await response.arrayBuffer();
                decompressedData = new Uint8Array(arrayBuffer);
            }

            const decoder = new TextDecoder();
            const jsonStr = decoder.decode(decompressedData);
            return JSON.parse(jsonStr);
        } catch (e) {
            return null;
        }
    }
}
