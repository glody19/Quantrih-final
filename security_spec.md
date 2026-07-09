# Security Specification - Quantrih Terminal

## 1. Data Invariants
- **Identity Integrity**: A user can only create or modify their own profile.
- **Path Hardening**: Document IDs must be alphanumeric and length-restricted to prevent resource exhaustion.
- **Relational Integrity**: Backtests must belong to a valid user account.
- **Role Isolation**: The `role` field is strictly system-managed; no client-side write is permitted.
- **Temporal Trust**: `updatedAt` and `createdAt` must match `request.time`.

## 2. The "Dirty Dozen" Payloads (Attack Vectors)

| ID | Attack Name | Target | Malicious Payload | Expected Result |
|----|-------------|--------|-------------------|-----------------|
| 1 | Identity Spoofing | `/users/victim_uid` | `{ "displayName": "Attacker", "userId": "attacker_uid" }` | PERMISSION_DENIED |
| 2 | Privilege Escalation | `/users/me` | `{ "role": "admin" }` | PERMISSION_DENIED |
| 3 | Resource Poisoning | `/users/me` | `{ "displayName": "A" * 10000 }` (Huge String) | PERMISSION_DENIED |
| 4 | Shadow Update | `/users/me` | `{ "displayName": "Valid", "ghost_field": true }` | PERMISSION_DENIED |
| 5 | ID Injection | `/users/me/backtests/junk_id` | Document ID with 1MB of characters | PERMISSION_DENIED |
| 6 | Orphaned Write | `/users/non_existent/backtests/1` | Write to a path with no parent user | PERMISSION_DENIED |
| 7 | Time Spoofing | `/users/me` | `{ "updatedAt": "2020-01-01" }` (Old timestamp) | PERMISSION_DENIED |
| 8 | Array Overload | `/users/me/backtests/1` | `{ "allocRows": [1, 2, ... 10000] }` | PERMISSION_DENIED |
| 9 | Type Confusion | `/users/me` | `{ "displayName": 12345 }` (Number instead of String) | PERMISSION_DENIED |
| 10 | Cross-User Theft | `/users/victim/backtests` | `list` query without ownership filter | PERMISSION_DENIED |
| 11 | Unverified Access | `/users/me` | Email Verified = false (if required) | PERMISSION_DENIED |
| 12 | State Shortcutting | `/users/me/backtests/1` | Changing immutable `userId` | PERMISSION_DENIED |
