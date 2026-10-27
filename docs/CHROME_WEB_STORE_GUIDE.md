# Chrome Web Store Enterprise Guide

## Description
This extension virtualizes multiple Google accounts into a single browser environment, completely suppressing limit ceilings.

## Permission Justifications
- `cookies`: Required to isolate, snapshot, and restore authuser tokens deterministically.
- `storage` / `unlimitedStorage`: Required to securely store 200+ serialized cookie payloads.
- `scripting`: Required to inject zero-flash CSS shields at document_start.
- `alarms`: Required for background token refresh logic to maintain session vitality.
