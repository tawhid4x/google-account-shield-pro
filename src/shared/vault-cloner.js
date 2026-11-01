class VaultCloner {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    async generateKey(password) {
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            this.encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveBits", "deriveKey"]
        );
        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: this.encoder.encode("GMAS_SALT_100K"), // Use a fixed salt for simplicity in demo
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    async compressAndEncrypt(vaultData, password) {
        const jsonStr = JSON.stringify(vaultData);

        // Compress using CompressionStream
        const stream = new Blob([jsonStr]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
        const compressedBlob = await new Response(compressedStream).blob();
        const compressedBuffer = await compressedBlob.arrayBuffer();

        // Encrypt using AES-256-GCM
        const key = await this.generateKey(password);
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            compressedBuffer
        );

        // Combine IV and Ciphertext
        const finalBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        finalBuffer.set(iv, 0);
        finalBuffer.set(new Uint8Array(encryptedBuffer), iv.length);

        // Return Base64 encoded string
        return btoa(String.fromCharCode.apply(null, finalBuffer));
    }

    async decryptAndDecompress(gmasBase64, password) {
        const binaryStr = atob(gmasBase64);
        const finalBuffer = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            finalBuffer[i] = binaryStr.charCodeAt(i);
        }

        const iv = finalBuffer.slice(0, 12);
        const encryptedBuffer = finalBuffer.slice(12);

        const key = await this.generateKey(password);

        const compressedBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encryptedBuffer
        );

        // Decompress using DecompressionStream
        const stream = new Blob([compressedBuffer]).stream();
        const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
        const decompressedBlob = await new Response(decompressedStream).blob();

        const jsonStr = await decompressedBlob.text();
        return JSON.parse(jsonStr);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VaultCloner;
}
