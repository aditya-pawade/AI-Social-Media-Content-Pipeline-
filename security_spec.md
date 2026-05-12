# Security Specification: AI Social Media Content Pipeline

## 1. Data Invariants
- A Workspace cannot exist without a valid `ownerId` that matches the authenticated user.
- A SocialContent document cannot exist without a valid `workspaceId`.
- Access to SocialContent is strictly derived from the parent Workspace's `ownerId`.
- `createdAt` is immutable and must equal the server timestamp at creation.
- `updatedAt` must equal the server timestamp at every modification.
- `ownerId` and `workspaceId` are strictly immutable; documents cannot be reassigned to other users or workspaces.
- Array fields (if any) are bounded. (Currently strings only, but if arrays are added, they will be strictly bounded.)

## 2. The "Dirty Dozen" Payloads

These 12 scenarios are designed to break the laws of Identity, Integrity, and State. All must receive `PERMISSION_DENIED`.

1. **Identity Spoofing**: User A creates a Workspace assigning `ownerId` to User B's UID.
2. **Unauthenticated Write**: An unauthenticated user attempts to create a Workspace.
3. **Shadow Field Injection**: Creating a Workspace with a Ghost Field (e.g., `isAdmin: true` or `billingPlan: "enterprise"`).
4. **Relational Orphan**: Creating SocialContent referring to a non-existent `workspaceId`.
5. **Lateral Privilege Escalation**: User A attempts to edit User B's Workspace.
6. **Value Poisoning (Data Type)**: Updating a Workspace `name` with an integer `123` instead of a string.
7. **Denial of Wallet (Huge Payload)**: Updating `name` to a 50,000-character string.
8. **Temporal Forgery**: Updating `updatedAt` to a past or future client-generated timestamp instead of `request.time`.
9. **Immutability Breach**: Updating an existing Workspace to change its `createdAt` or `ownerId`.
10. **State Shortcutting (Terminal State)**: If Content is "Published", editing its text when terminal state locking is enforced.
11. **ID Poisoning**: Requesting a document using a 50KB string as the `workspaceId`.
12. **The PII Blanket Test**: Executing a blanket `list` operation over `/workspaces` without an `ownerId == auth.uid` constraint.

## 3. The Test Runner
A `firestore.rules.test.ts` file will be generated to assert these 12 cases.
