export class VaultCloner {
    static async exportCapsule(accounts, password) {
        try {
            const dataStr = JSON.stringify(accounts);
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(dataStr);

            // Compress using GZIP
            let compressedData = dataBuffer;
            if (typeof CompressionStream !== 'undefined') {
                const cs = new CompressionStream('gzip');
                const writer = cs.writable.getWriter();
                writer.write(dataBuffer);
                writer.close();
                const response = new Response(cs.readable);
                const arrayBuffer = await response.arrayBuffer();
                compressedData = new Uint8Array(arrayBuffer);
            }

            // Derive key using PBKDF2
            const salt = crypto.getRandomValues(new Uint8Array(16));
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

            // Encrypt using AES-GCM
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                compressedData
            );

            // Bundle salt, iv, and ciphertext
            const encryptedArray = new Uint8Array(encryptedBuffer);
            const bundle = new Uint8Array(salt.length + iv.length + encryptedArray.length);
            bundle.set(salt, 0);
            bundle.set(iv, salt.length);
            bundle.set(encryptedArray, salt.length + iv.length);

            // Convert to Base64 (using a safe approach for large arrays)
            let binaryString = "";
            const chunkSize = 8192;
            for (let i = 0; i < bundle.length; i += chunkSize) {
                binaryString += String.fromCharCode.apply(null, bundle.subarray(i, i + chunkSize));
            }
            return btoa(binaryString);

        } catch (e) {
            return null;
        }
    }

    static async importCapsule(capsuleBase64, password) {
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
