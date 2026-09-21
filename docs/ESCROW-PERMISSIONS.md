# Escrow V2 — permissions, editable fields, and constraints for agents

Sources: [`ESCROW-VALIDATIONS.md`](./ESCROW-VALIDATIONS.md), [`CONTRACT_UPDATE_FUNCTIONS.md`](./CONTRACT_UPDATE_FUNCTIONS.md), [`CONTRACT_ROLES_REFERENCE.md`](./CONTRACT_ROLES_REFERENCE.md).  
Complements: [`ESCROW-VALIDATIONS.md`](./ESCROW-VALIDATIONS.md) (business rules per action and when they apply).

This file answers: **who** can touch what, **which fields** are editable, and **what an agent / UI must not promise or send**.

---

## 0. Principles

1. **Admin ≠ operations.** Only `roles.admin` may call `update_escrow` and `manage_milestones`. Admin does **not** approve, release, dispute, or resolve.
2. **Two edit paths — never mix them:**
   - General escrow properties → `update_escrow`
   - The `milestones` array → **only** `manage_milestones`
3. **`update_escrow` is not a partial patch:** the client sends a full `Escrow`, but the contract **ignores / preserves** `milestones` (and on single-release also `dispute` / `released`).
4. **Once funds exist (`FundedAmount > 0` / `balance > 0`):** almost everything is frozen on `update_escrow`, and **editing** existing milestones is blocked. **Adding** new milestones remains allowed.
5. The same wallet may hold several operational roles (approver + SP + release_signer + receiver), **except** the `admin` and `dispute_resolver` exclusions.

---

## 1. Permission matrix by role

| Action | admin | approvers | service_providers | release_signers | dispute_resolvers | platform | receiver | observers | anyone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `initialize_escrow` | ✅ (constructor address) | — | — | — | — | — | — | — | — |
| `update_escrow` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `manage_milestones` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `extend_contract_ttl` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `fund_escrow` | — | — | — | — | — | — | — | — | ✅ |
| `change_milestone_status` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `approve_milestones` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `release_funds` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `approve_and_release_milestones` | ❌ | ✅ only if also release_signer | ❌ | ✅ only if also approver | ❌ | ❌ | ❌ | ❌ | ❌ |
| Open dispute | ❌ | ✅ | ✅ | ✅ | ❌ **excluded** | ✅ | ✅ | ❌ | ❌ |
| `resolve_dispute` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `withdraw_remaining_funds` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| CCTP set/clear destination | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (their scope) | ❌ | ❌ |

**Forbidden overlaps (initialize / update roles):**

- `admin` cannot appear in approvers / SP / release_signers / dispute_resolvers; on single-release it also cannot be `receiver`.
- `dispute_resolvers` cannot overlap with approvers / SP / release_signers (and on single-release also not with `receiver`).
- Lists: 1–5 (observers 0–5), no duplicates within the same list.
- `approvers`, `service_providers`, `release_signers`, `dispute_resolvers` are **never empty**.
- `observers`: no on-chain authority.

---

## 2. `update_escrow` — property detail

**Who:** only `roles.admin`.  
**When (contract):** escrow exists; **no** open dispute (single: escrow flag; multi: **no** milestone disputed).  
**dApp UI:** also only shows update when `balance <= 0` (unfunded), because with funds almost everything must be identical or the tx fails.

### 2.1 Always-on guards

- Do not change `roles.admin` or `roles.platform` (immutable since initialize).
- String limits: `engagement_id` / `title` ≤ 100; `description` ≤ 500.
- `platform_fee ≤ 9900` and `platform_fee + 30 ≤ 10000`.
- Roles: caps, non-empty, admin/DR overlaps.
- Single: payload must send `released` / `dispute.is_disputed` / `dispute.resolved` as `false` (`FlagsMustBeFalse`) — the contract **preserves** the real values; they cannot be set through this path.
- Single: `amount > 0` when the payload is validated.

### 2.2 What the contract touches / does not touch

| Field | Unfunded | Funded | Notes |
| --- | --- | --- | --- |
| `engagement_id` | ✅ editable | ❌ must be identical | |
| `title` | ✅ | ❌ identical | |
| `description` | ✅ | ❌ identical | |
| `roles.admin` | ❌ never | ❌ | |
| `roles.platform` | ❌ never | ❌ | |
| `roles.approvers` / SP / release_signers / DR / observers | ✅ | ❌ identical (entire roles object) | |
| `roles.receiver` (single only) | ✅ | ❌ identical | |
| `amount` (single only) | ✅ | ❌ identical | Multi has no escrow-level amount |
| `platform_fee` | ✅ | ❌ identical | |
| `trustline` | ✅ | ❌ identical | |
| `receiver_memo` | ✅ | ❌ identical | |
| `milestones` | ❌ **never** via update | ❌ | Always overwritten with the existing array |
| `dispute` / `released` (single only) | ❌ never via update | ❌ | Preserved from current state |

With funds: any difference in the “frozen” fields → `EscrowPropertiesMismatch` and **nothing** is applied (not a partial merge).

### 2.3 Agent constraints — `update_escrow`

```
DO NOT
- Call update_escrow if the caller is not admin.
- Promise milestone editing via update_escrow.
- Allow changing admin or platform in the form.
- Show title/description/roles/fee/trustline/memo/amount as editable when balance > 0.
- Send a payload with released/dispute flags set to true “to force state”.
- Assume a partial patch: either the submitted state matches what is allowed, or the whole call fails.
- On multi, call update if any milestone is in dispute.
```

---

## 3. `manage_milestones` — detail

**Who:** only `roles.admin`.  
**Only** function that mutates the `milestones` array.

Conceptual signature:

```
manage_milestones(admin, new_milestones[], milestone_updates[])
```

At least one of the two lists must be non-empty.

### 3.1 State blocks

| Condition | Single-release | Multi-release |
| --- | --- | --- |
| Open dispute | Blocks if `dispute.is_disputed` | Blocks if **any** milestone is disputed |
| Dispute already resolved | Blocks if `dispute.resolved` | Blocks if **any** milestone has `dispute.resolved` |
| Already released | Blocks if escrow `released` | Blocks **only if all** milestones are released (if ≥1 remains unreleased → manage can continue) |

### 3.2 Adding milestones (`new_milestones`)

**Allowed even with funds** (both contracts).

For each new milestone:

| Rule | Single | Multi |
| --- | --- | --- |
| Existing + new total ≤ 50 | ✅ | ✅ |
| `approvals.target > 0` | ✅ | ✅ |
| `target ≤ #approvers` | ✅ | ✅ |
| No prior approvals (`count == 0`, empty `approved_by`) | ✅ | ✅ |
| `amount > 0` | N/A (amount on escrow) | ✅ required |
| `released` / dispute flags false at birth | N/A at milestone level | ✅ |
| Own `receiver` | N/A (`roles.receiver`) | ✅ fixed at creation |
| Brings description / status / evidence / approvals | ✅ | ✅ |

Text limits (same as initialize): milestone description/status/evidence ≤ 500 / 50 / 500.

### 3.3 Editing existing milestones (`milestone_updates`)

**Critical rule:** only when `FundedAmount == 0` (no deposits).  
With funds → `MilestoneUpdateNotAllowedWithFunds`. No exceptions.

What `MilestoneUpdate` carries:

| Update field | Single | Multi |
| --- | --- | --- |
| `index` | ✅ | ✅ |
| `new_description` | ✅ optional | ✅ optional |
| `new_amount` | ❌ does not exist | ✅ optional |

What **cannot** be edited via `manage_milestones` (even when unfunded):

| Milestone property | Editable? | How it changes (if at all) |
| --- | --- | --- |
| `description` | Only when unfunded | `milestone_updates` |
| `amount` (multi) | Only when unfunded | `milestone_updates` |
| `approvals.target` | ❌ **never** | Only at creation (init or `new_milestones`) |
| `status` / `evidence` | ❌ | `change_milestone_status` (service_provider) |
| `approval_count` / `approved_by` | ❌ | `approve_milestones` |
| `receiver` (multi) | ❌ **never** | Fixed at creation |
| `dispute` / `released` (multi) | ❌ | dispute / resolve / release |

**Direct answer:** there is no contract path to change the required approval count (`target`) of an already-created milestone. If a different `target` is needed, **add** a new milestone with the correct target.

### 3.4 Agent constraints — `manage_milestones`

```
DO NOT
- Expose “edit milestone” (description/amount) when balance > 0.
- Include a “required approvals” control on the edit form for an existing milestone (the contract has no field for it; the UI would lie).
- Try to change receiver / status / evidence / approvals via manage_milestones.
- Send both lists empty.
- On single, call manage if the escrow is already released or dispute resolved/open.
- On multi, call manage if any milestone is disputed/resolved, or if all are released.
- Confuse “add milestone” (OK with funds) with “edit existing” (unfunded only).
```

---

## 4. Other actions — payload / state validation (permissions + rules)

### 4.1 Fund
- Anyone. `amount > 0`, signer has balance, `expected_escrow` = **fresh** state (re-read before signing).
- No cap vs escrow `amount` / sum of milestones (over/under-fund OK).

### 4.2 Change milestone status (SP only)
- Batch ≤ 50; valid indexes; non-empty `new_status` ≤ 50 chars; optional evidence ≤ 500.
- **No** gate on approved/disputed/released — status is free text.

### 4.3 Approve (approvers only)
- Non-empty indexes, ≤ 50, no duplicates, must exist.
- Do not approve if already at `target`; do not approve twice by the same approver.
- The contract does **not** block when disputed/released; the **UI must**.

### 4.4 Release (release_signers only)
See [`ESCROW-VALIDATIONS.md`](./ESCROW-VALIDATIONS.md) §§1.6 / 2.6. Single: all-or-nothing + all approved. Multi: by index, each approved and clear of dispute/release.

### 4.5 Dispute / Resolve / Withdraw
See the actions doc. DR **cannot** open a dispute. Resolve does not set `released`. Withdraw is not a release.

### 4.6 CCTP
Only the receiver for that scope; domains `0,1,2,3,5,6,7` (never `27`). Does not apply to resolve/withdraw (always a Stellar transfer).

---

## 5. UI / agent checklist (permissions)

1. Resolve wallet roles vs `roles` (+ `milestones[i].receiver` on multi).
2. **Update:** admin + unfunded + no dispute → show form; fields per table §2.2.
3. **Manage:** admin + state gates §3.1 → allow **add** whenever the gate passes; allow **edit** only when `balance == 0`.
4. Do not mix forms: update never lists editable milestones; manage never edits title/fee/roles.
5. SP → status/evidence. Approver → approve. Release_signer → release. Both → approve+release. DR → resolve/withdraw. Receiver → CCTP (+ dispute).
6. Platform → dispute + passive fee. Observers → nothing.
7. If `balance > 0`, treat metadata/roles update as a visual no-op (hide it); do not “send anyway and let it fail”.

---

## 6. Global constraints for another agent

```
MUST
- Separate update_escrow vs manage_milestones vs change_milestone_status vs approve vs release.
- Treat approvals target as immutable after the milestone is created.
- Re-fetch the escrow before fund (expected_escrow).
- Respect admin / dispute_resolver exclusions in role forms.
- Distinguish single (escrow-level state) vs multi (per-milestone state).

MUST NOT
- Let a non-admin “edit the escrow” or “manage milestones”.
- Let admin approve/release/dispute/resolve from an admin UI.
- Offer editing existing milestones or frozen metadata after funding.
- Offer changing approvals.target / receiver / dispute / released via manage or update.
- Use update_escrow to mutate milestones.
- Use manage_milestones to mutate title/description/roles/fee/trustline/amount(single).
- Let dispute_resolver open disputes.
- Let release_signer / admin configure the receiver’s CCTP.
- Assume approve is blocked on-chain when disputed/released (it is not; block in the UI).
- Assume exact equality of distributions on multi resolve (it is a ≤ cap, not ==).
```

---

## 7. Single vs multi — edit summary

| Topic | Single | Multi |
| --- | --- | --- |
| Amount | On escrow; editable via update only when unfunded | Per milestone; editable via `milestone_updates` only when unfunded; on add via `new_milestones` |
| Receiver | `roles.receiver`; update only when unfunded | Per milestone; **immutable** after creation |
| Dispute / released | Escrow flags; block manage/update at escrow level | Per-milestone flags; one disputed/resolved blocks manage entirely; released only blocks manage when **all** are released |
| Release | All or nothing | Partial by index |
