export class VaultCloner {
    static async exportToCapsule(vaultData) {
        // Simulates CompressionStream and AES-GCM output
        return btoa(JSON.stringify(vaultData));
    }

    static async importFromCapsule(capsule) {
        try {
            return JSON.parse(atob(capsule));
        } catch(e) {
            return null;
        }
    }
}
