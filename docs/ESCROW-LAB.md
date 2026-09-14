# Trustless Work Escrow Lab — Application Flow (Protocol V2)

> **Protocol: V2 (BETA), testnet only.** V2 is not deployed on mainnet and is not a production path. This document describes the **application flow** of Escrow Lab against V2 semantics only. Do not mix V1 roles, flags, or lifecycle rules into this model.

Escrow Lab is a **hands-on testnet laboratory**: a demo dApp where builders can walk the full escrow lifecycle, connect a Stellar wallet, and see how a React/Next.js app integrates Trustless Work — without treating it as a finished business product.

---

## What the lab is for

Trustless Work V2 is programmable escrow infrastructure on Stellar/Soroban: funds stay in a smart contract until agreed conditions are met (milestones, threshold approvals, release, or dispute resolution).

This lab exists to:

- Walk the **full V2 lifecycle** in a live UI (deploy → fund → work → approve → release / dispute).
- Make **roles and authority** visible: who can do what, and when.
- Contrast **Single Release** vs **Multi Release** as two product shapes of the same protocol.
- Give builders a **runnable reference** for wallet connection, signing, and reading escrow state on testnet.

It is **not** a production backoffice, marketplace, or end-user payments app.

---

## Protocol context (V2 only)

| Aspect | V2 behavior |
| --- | --- |
| Network | Testnet only (beta) |
| Custody | Non-custodial — funds live in the escrow contract |
| Writes | Always **build → sign → submit**; nothing hits the chain until the authorized wallet signs |
| Roles | Most roles are **address lists** (up to 5); `admin`, `platform`, and `receiver` (single-release) are single addresses |
| Approval | **Threshold** per milestone (`approvalsTarget`), not a boolean flag |
| State | No V1 `flags` object — release/dispute live as direct fields; disputes carry a **reason** |
| Escrow types | **Single Release** and **Multi Release** (independent of protocol version) |

---

## Roles in the application

Every escrow is configured with a `roles` set at deploy. Authority is role-gated: the connected wallet must hold the required role for the action.

| Role | Cardinality | What they do in the flow |
| --- | --- | --- |
| **Admin** | 1 address | Initialize-time authority after deploy: update escrow properties, manage milestones, extend contract TTL. Immutable after init. Not a payee. |
| **Approvers** | 1–5 | Cast approval votes on milestones; may raise a dispute |
| **Service providers** | 1–5 | Report milestone progress/status and evidence; may raise a dispute |
| **Release signers** | 1–5 | Authorize fund release; may raise a dispute |
| **Dispute resolvers** | 1–5 | Resolve disputes and withdraw remaining funds when the escrow is terminal. **Cannot** open a dispute |
| **Platform** | 1 address | Receives the platform fee at release; may raise a dispute. Fee-only capability (not the updater — that is `admin`) |
| **Receiver** | 1 address | **Single Release only** — receives the net payout on release; may raise a dispute |
| **Observers** | 0–5 | Read-only; no on-chain authority |

**Composition rules that shape the UI / product design:**

- Dispute resolvers cannot overlap other active roles (including platform and any receiver).
- Admin cannot be a payee or overlap approvers / service providers / release signers / dispute resolvers.
- Admin and platform **may** be the same address (capability distinction, not forced address separation).
- Funding does **not** grant a role — any depositor with the asset can fund.

In **Multi Release**, there is no escrow-level receiver: each milestone has its own `receiver`.

---

## Escrow types in the lab

The lab lets you pick a type before operating:

### Single Release

- One escrow, **one settlement**.
- Total `amount` and a single `roles.receiver` live on the escrow.
- Milestones are **progress/approval units** — they do not each hold funds.
- Release pays the **whole escrow once**, only when **all** milestones have met their approval threshold and there is no active dispute.
- An escrow with **zero milestones cannot release** until milestones are added.

### Multi Release

- One escrow, **many payouts**.
- No top-level amount/receiver; each milestone has its own `amount` and `receiver`.
- Approve, dispute, resolve, and release are scoped to **named milestones**.
- Remaining milestones stay operative while one is disputed or still in progress.

---

## Universal write loop (every mutating step)

Regardless of which stage you are in, every write in the lab follows the same mental model:

1. **Build** — the app asks Trustless Work to prepare an unsigned transaction.
2. **Sign** — the connected wallet that holds the required authority signs it.
3. **Submit** — the signed transaction is broadcast to Stellar testnet.
4. **Observe** — the lab refreshes / shows state (escrow snapshot, balances, events) so you can see what changed.

If step 3 is skipped, nothing happened on-chain. That is the core integration lesson the lab demonstrates.

---

## Application flow — happy path

```text
Connect wallet
    → Choose escrow type (Single | Multi)
    → Deploy (configure roles, terms, milestones)
    → [Optional] Update properties / manage milestones  (admin, before first fund)
    → Fund
    → Work loop: status updates ↔ approvals
    → Release (whole escrow | selected milestones)
    → [Optional] Withdraw remaining funds (terminal only)
```

### 1. Connect wallet

- The lab requires a Stellar wallet on **testnet** (e.g. Freighter via Stellar Wallets Kit).
- Without a connected address, mutating flows stay locked.
- The connected address is the candidate signer for each action; whether it succeeds depends on whether it holds the required role (or is a valid funder).

### 2. Choose escrow type

- **Single Release** for one final payout after all milestones are approved.
- **Multi Release** for tranche-style payouts per milestone.

This choice changes forms, who receives funds, and whether release/dispute is escrow-wide or per milestone.

### 3. Deploy (create the escrow)

The deployer configures:

- Identity fields (title, description, engagement reference).
- **Roles** under V2 composition rules.
- **Trustline** for the asset (token the escrow will hold).
- **Platform fee** (percent).
- **Milestones** (optional in V2 — you may deploy empty and add later).
  - Single: descriptions + approval thresholds.
  - Multi: description + amount + receiver + approval threshold per milestone.

After a successful deploy + sign + submit, the lab has a **contract id** to load and operate against.

### 4. Pre-funding configuration (admin)

Before the **first successful fund**:

- **Admin** may update escrow properties and roles (within V2 rules).
- **Admin** may manage milestones: append new ones or edit existing ones.
  - Single: edit descriptions.
  - Multi: edit descriptions **and** amounts.
- Milestones are never deleted — only appended or edited.

**Funding lock (V2):** the first successful `fund` freezes properties, roles, and edits to existing milestones permanently. The lock is the **cumulative funded amount** (it never decreases), not the live token balance. Releasing funds does **not** unlock the escrow.

**After funding:** appending **new** milestones can still be allowed until the escrow reaches a blocking terminal/dispute state; editing existing milestones and property updates are blocked.

### 5. Fund

- Any address holding the asset can deposit.
- Funding grants **no role**.
- Canonical funding target:
  - Single: the escrow `amount`.
  - Multi: the sum of milestone amounts.
- Once funded, the escrow is live: work and approvals can proceed; structural reconfiguration is largely frozen.

### 6. Work loop — progress and approvals

This is the collaborative middle of the product:

| Step | Who | What happens |
| --- | --- | --- |
| Report progress | Service provider(s) | Change milestone status (conventionally pending → in progress → completed) and optionally attach evidence |
| Approve | Approver(s) | Each approver casts **one vote** per milestone; when unique votes reach `approvalsTarget`, the milestone is approved |
| Batch / shortcut | Same roles | V2 allows approving several milestones at once; wallets that are both approver and release signer can **approve-and-release** in one transaction |

Approvals are **irreversible**. There is no unapprove.

### 7. Release

**Single Release**

- Preconditions: all milestones approved, no active dispute, at least one milestone defined, balance covers the payout.
- One release signer pays the configured amount (minus platform + protocol fees) to `roles.receiver`.
- Escrow becomes **released** (terminal for the happy path).

**Multi Release**

- Preconditions per selected milestone: approved, not already released, not disputed.
- Release signer releases **only the named milestones**.
- Each pays its own amount (minus fees) to its own receiver.
- Other milestones continue independently.

### 8. Withdraw remaining funds (optional cleanup)

After the escrow is **genuinely terminal**:

- Single: released **or** dispute resolved.
- Multi: **every** milestone is released **or** its dispute resolved.

A dispute resolver may sweep leftover balance (overfunding, dust, stray transfers). In V2 this is a **full sweep** of the remaining balance — not a partial withdrawal — and an **open** unresolved dispute does **not** qualify.

---

## Application flow — dispute path

Disputes interrupt the happy path. In V2 every dispute carries a required **reason**.

### Who can open a dispute

Approvers, service providers, release signers, platform, and the relevant receiver(s) may open one.  
**Dispute resolvers cannot open disputes** — they only resolve them.

### Single Release dispute

```text
… funded / in progress …
    → Someone authorized opens a dispute (whole escrow) + reason
    → Escrow frozen (no normal release)
    → Dispute resolver distributes the full current balance
    → Dispute marked resolved (terminal) → optional withdraw of leftovers if any
```

- Dispute scope: the **entire escrow**.
- Resolution: distributions must cover the **entire current contract balance**.
- Resolution is terminal; the dispute cannot be reopened.

### Multi Release dispute

```text
… funded / in progress …
    → Dispute specific milestone(s) + reason
    → Those milestones freeze; others may continue
    → Dispute resolver settles only the disputed milestones
    → Those milestones become resolved → continue / release others → withdraw when all terminal
```

- Dispute scope: **named milestones** only.
- Resolution: distributions must match the **combined amounts of those milestones**.
- Unaffected milestones can still progress, approve, or release.

---

## How the lab UI maps to this flow

The Escrow Lab UI is organized by **capability modules** that mirror the lifecycle, not by a single forced wizard:

| Lab area | Flow stage it supports |
| --- | --- |
| Wallet connect / theme | Entry — identity of the signer |
| Escrow type tabs (Single / Multi) | Chooses which lifecycle rules apply |
| Deploy | Create escrow + roles + milestones |
| Escrows / management | Operate on a loaded contract: fund, status, approve, release, dispute, resolve, withdraw, manage milestones |
| Load escrow | Resume an existing contract by id |
| Helpers | Auxiliary checks (e.g. balances across contracts) |
| Indexer / reads | Discover and inspect escrows (by participant, role, ids) and observe state after writes |
| Response display | See build/sign/submit outcomes for learning and debugging |

Typical lab session:

1. Connect wallet on testnet.  
2. Pick Single or Multi.  
3. Deploy with a valid V2 role set.  
4. Optionally tweak as admin before funding.  
5. Fund.  
6. Switch wallets (or use multiple accounts) to act as service provider → approver → release signer.  
7. Either release on the happy path, or open a dispute and resolve as dispute resolver.  
8. Use reads/indexer to confirm the escrow state.

---

## State model (what “done” looks like)

### Single Release

- Progress tracked on milestones (status, evidence, approval counts vs target).
- Escrow-level `released` and escrow-level `dispute` (`isDisputed`, `reason`, `resolved`).
- Happy-path terminal: `released`.
- Dispute-path terminal: dispute `resolved` (via distributions).

### Multi Release

- Each milestone carries its own amount, receiver, approvals, `released`, and `dispute`.
- The escrow is fully terminal only when every milestone is released or dispute-resolved.
- Partial completion is normal: some milestones paid, others still open.

---

## Design constraints builders should internalize

These are the V2 rules that most often reshape product UX (and that the lab makes easy to hit):

1. **Role separation is enforced** — you cannot casually reuse one address across conflicting roles like V1 often allowed.
2. **Threshold approvals** — plan for 1..N approvers and show approval progress, not a single checkbox.
3. **First fund freezes structure** — treat pre-fund as the editable window; post-fund as operational.
4. **Milestones optional at deploy** — but single-release still needs milestones before release.
5. **Approve-and-release** is a shortcut only when one wallet legitimately holds both roles.
6. **Disputes need a reason** and freeze the disputed scope until a resolver acts.
7. **Withdraw is terminal-only and full-sweep** in V2.
8. **Admin ≠ platform** as capabilities: admin configures; platform earns the fee (addresses may coincide).

---

## What this lab is not

- Not an end-user payments product.
- Not official API documentation (see [docs.trustlesswork.com](https://docs.trustlesswork.com/trustless-work) / V2 section).
- Not a V1 guide — singular roles, `flags`, and V1 dispute/withdraw rules do not apply here.
- Not mainnet-ready while V2 remains beta.

---

## In one sentence

> Escrow Lab on V2 is a testnet sandbox where builders connect a wallet, choose Single or Multi Release, and walk the full role-gated lifecycle — deploy, fund, approve by threshold, release or dispute — using build → sign → submit on Stellar.

---

## Useful links

- [Trustless Work documentation](https://docs.trustlesswork.com/trustless-work)
- [V2 Single Release (docs)](https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/deploy)
- [V2 Multi Release (docs)](https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/deploy-1)
- [Escrow Lab (OSS)](https://docs.trustlesswork.com/trustless-work/oss-dapps/escrow-lab)
- [Project README](../README.md) — setup, environment variables, and wallets
