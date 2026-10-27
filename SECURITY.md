# Security Architecture

The Google Multi-Account Shield utilizes advanced browser-level security constructs to ensure absolute safety for user session data.

- **Non-Extractable Hardware Keystore:** Utilizes `crypto.subtle.generateKey` with `extractable: false` for the AES-256-GCM master key.
- **Zero-Trust Message Firewall:** Strict runtime validation on all IPC communications.
- **Closed Shadow DOM:** Menu injection isolates elements using `attachShadow({ mode: 'closed' })` to prevent XSS attacks.
