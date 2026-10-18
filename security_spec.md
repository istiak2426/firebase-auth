# Security Specification & Test Payloads

## 1. Data Invariants
1. **Identity Isolation**: All documents in `/notes/{noteId}`, `/tasks/{taskId}`, and `/users/{userId}` must strictly belong to the authenticated user (`request.auth.uid == resource.data.userId` or `request.auth.uid == userId`).
2. **Path Hardening**: Every document ID must satisfy `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
3. **No Unauthenticated or Cross-User Access**: Unauthenticated users cannot read, list, create, update, or delete any user document.
4. **List Query Boundary**: `allow list` must verify that `resource.data.userId == request.auth.uid`, strictly preventing query leakage or scraping.
5. **Strict Field Whitelisting**: On write, `incoming()` must only contain recognized schema fields with strictly bounded strings, verified arrays, and safe types.
6. **Immutability of Ownership & Creation Timestamps**: On update, `incoming().userId == existing().userId` and `incoming().createdAt == existing().createdAt`.
7. **PII Isolation**: User profiles are stored at `/users/{userId}` where only the matching user `request.auth.uid == userId` can read or write.

## 2. The "Dirty Dozen" Malicious Payloads (All MUST be Rejected)
1. **Payload 1 (Identity Spoofing - Note Create)**: User `userA` attempts to create a note with `userId: "userB"`. *Rejected: incoming().userId != request.auth.uid*.
2. **Payload 2 (Unauthenticated Write - Task Create)**: Unauthenticated request (`request.auth == null`) attempts to create a task. *Rejected: isSignedIn() fails*.
3. **Payload 3 (Cross-User Read - Note Get)**: User `userA` attempts to read `/notes/{noteId}` belonging to `userB`. *Rejected: resource.data.userId != request.auth.uid*.
4. **Payload 4 (Cross-User List Scraping)**: User `userA` runs a collection query for all notes without filtering by their own `userId`. *Rejected: allow list requires resource.data.userId == request.auth.uid*.
5. **Payload 5 (Shadow Field Injection - Note Update)**: User injects `{ isAdmin: true, role: "superadmin" }` into a note document. *Rejected: schema validation rejects unrecognized keys*.
6. **Payload 6 (Oversized Payload - Denial of Wallet)**: User sends a note title longer than 200 characters or content larger than 50,000 characters. *Rejected: size() <= max constraints*.
7. **Payload 7 (Ownership Tampering - Task Update)**: User updates their task and attempts to reassign `userId: "userC"`. *Rejected: incoming().userId == existing().userId fails*.
8. **Payload 8 (Creation Date Forgery - Note Update)**: User alters `createdAt` to falsify creation chronology. *Rejected: incoming().createdAt == existing().createdAt fails*.
9. **Payload 9 (ID Poisoning - Invalid Document Path)**: Attacker attempts to target `/notes/..%2F..%2Fadmin` or non-alphanumeric oversized ID. *Rejected: isValidId() fails*.
10. **Payload 10 (Cross-User Profile Hijack)**: User `userA` attempts to read or overwrite `/users/userB`. *Rejected: request.auth.uid != userId*.
11. **Payload 11 (Invalid Status Enum - Task Update)**: User writes `{ status: "deleted_forever_backdoor" }`. *Rejected: status in ['todo', 'in_progress', 'completed'] fails*.
12. **Payload 12 (Array Flooding - Tags Array Denial)**: User supplies a `tags` array exceeding max item count (e.g. 500 items). *Rejected: tags size check fails*.
