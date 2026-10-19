# ZOMBIENEXUS — Project Guide

Whole project in one file: bullets, tables, diagrams, numbered flows.
Source of truth: `docs/SPEC.md` (interfaces), `docs/PLAN.md` (rules), `contracts/` (code).
Team details are placeholders: `[TEAM_MEMBER_1_NAME]`, `[TEAM_MEMBER_2_NAME]`, `[TEAM_MEMBER_3_NAME]`.

Contents: 1 Overview · 2 Architecture · 3 Repo map · 4 Contracts · 5 Flows · 6 Tx lifecycle · 7 Scripts · 8 Time model · 9 Bugs and limits · 10 Tests · 11 Demo · 12 Troubleshooting · 13 File glossary

---

## 1. Overview and glossary

### One screen
- ZOMBIENEXUS = CryptoZombies (course starter) rebuilt as a polished dApp.
- Runs 100% local: Ganache chain, Truffle contracts, React app, MetaMask wallet.
- Starter contracts were buggy. They are fixed and tested (30 Truffle tests, plus 47 Vitest tests for the front end).
- New local contract `AvengerContract` replaces the CryptoKitties contract.
- Feed a zombie on an Avenger -> a **hero zombie** (DNA ends in `99`).
- Battle an Avenger (odds depend on level and power) or another zombie (PvP).
- Original trio page (create, list, level up) still works at `/legacy/`.
- One command starts everything: `npm run demo`.

### Glossary
| Term | Meaning |
|---|---|
| Zombie | On-chain struct: `name, dna, level, readyTime, winCount, lossCount`. Also an ERC-721-style token (id = array index). |
| DNA | 16-digit number. `keccak256(name) % 10^16`, last two digits forced to `00`. Decides all art. |
| Pair | Two DNA digits. 8 pairs per DNA, counted from the right (pair 0 = last two digits). |
| Cooldown | 1 day (`cooldownTime`). Zombie cannot feed or battle until `readyTime <= now`. |
| Ready | `readyTime <= block time`. New zombies start with a 24 h cooldown. |
| Avenger | Row in `AvengerContract`: `genes` + `birthTime`. Anyone can summon one. |
| Genes | Avenger's 16-digit number. `genes % 6` = hero, `genes % 10 + 1` = power (1..10). |
| Power | Avenger strength 1..10. Lowers your win chance. |
| Hero zombie | Zombie made by `feedOnAvenger`. DNA ends `99`. Gold/purple mask + armor art. |
| Rarity | `common`, `rare` (pair 7 >= 90, gold frame), `hero` (DNA ends `99`). |
| Feed / Infect | Same action. UI says "Infect". Contract name: `feedOnAvenger`. |
| Head | Latest block `{blockNumber, timestamp}`. UI time is always head time. |
| Warden | Seeded opponent zombie (id 4) owned by deployer. PvP target. |

---

## 2. Architecture

```
 Browser (Chrome)                                         Your machine (127.0.0.1)
┌──────────────────────────────┐
│  MetaMask (EIP-1193 wallet)  │──── signs + sends tx ──────────────┐
│  account + chain 1337        │                                    │
└──────────────▲───────────────┘                                    ▼
               │ eth_requestAccounts,                     ┌────────────────────┐
               │ wallet_switchEthereumChain,              │  Ganache 7.9.2     │
               │ chainChanged / accountsChanged           │  :7545             │
┌──────────────┴───────────────┐                          │  chainId=netId=1337│
│  React app (Vite build)      │                          │  db: .ganache/db   │
│  ethers v6                   │── read RPC (JsonRpc) ───►│                    │
│  /  /create  /zombie/:id     │   eth_call, getLogs,     │  ┌──────────────┐  │
│  /avengers /battle /activity │   blockNumber every 4 s  │  │ZombieOwnership│ │
│  /settings /gallery          │                          │  └──────┬───────┘  │
└──────────────▲───────────────┘                          │         │ calls    │
               │ static files + /deployment.json          │  ┌──────▼───────┐  │
┌──────────────┴───────────────┐                          │  │AvengerContract│ │
│  scripts/serve.js  :8080     │                          │  └──────────────┘  │
│  /        -> frontend/dist   │                          └─────────▲──────────┘
│  /legacy/ -> index.html trio │── web3 1.2.7-rc.0 (CDN) ───────────┘
└──────────────────────────────┘

 Scripts (node)                     Files
 chain.js   start Ganache           build/contracts/*.json  (Truffle artifacts)
 truffle migrate  deploy 2 + 3  ->  frontend/public/deployment.json  (export.js)
 seed.js    6 zombies, 6 Avengers   .ganache/db, keys.json, snapshots/golden.tar
 check.js   PASS/FAIL health
 test.js    throwaway Ganache :8545 + truffle test
```

Key rules:
- **Reads** never need MetaMask. App reads through its own JSON-RPC provider (`rpcUrl` from `deployment.json`).
- **Writes** go through MetaMask only (`BrowserProvider` signer).
- **Receipts** are awaited on the read provider, not on MetaMask. Success = `receipt.status === 1`.
- **No hard-coded addresses** in `frontend/src`. Addresses + ABIs come from `/deployment.json`.
- Ports: 7545 chain, 8080 app + legacy, 5173 Vite dev, 8545 test chain. All on 127.0.0.1.
- Legacy page is the only place with a hard-coded address: `index.html` line 34.
- Legacy page signs through MetaMask too. It loads jQuery and web3 1.2.7-rc.0 from a CDN (internet needed). The local `web3.min.js` is not used and not served.

---

## 3. Repository map

### Root
| Path | What it does |
|---|---|
| `contracts/` | Solidity 0.4.25 sources (section 4). |
| `migrations/` | `1_initial_migration.js` (Migrations), `2_deploy_contracts.js` (ZombieOwnership), `3_deploy_avengers.js` (AvengerContract + wiring). |
| `test/` | Truffle tests: `CryptoZombies.js` (6 starter), `master.js` (20), `avengers.js` (4), `helpers/time.js`, `helpers/utils.js`. |
| `scripts/` | Plain Node CLIs (section 7). |
| `frontend/` | React + TypeScript + Vite + Tailwind app. |
| `docs/` | `PLAN.md`, `SPEC.md`, `PROJECT.md` (this), `PROGRESS.md`, `PPTX_PROMPT.md`, `MASTER_PROMPT.md`, `MASTER_INDEX.md`, `agent-notes/`. Screenshots go in `docs/screens/` (made by the team). |
| `index.html` | Legacy starter page (3 buttons: Show Zombies, Create Zombie, Level Up). Only line 34 edited (contract address). |
| `cryptozombies_abi.js`, `favicon.ico` | Legacy page assets, served at `/legacy/`. Untouched. |
| `web3.min.js` | Starter file. Untouched, unused (the page loads web3 from a CDN). |
| `truffle-config.js` | Networks `development` (7545, id 1337), `test` (8545); local solc; mocha timeout. |
| `package.json`, `package-lock.json`, `.npmrc` | Frozen deps; `ignore-scripts=true`, cache in `.npm-cache`. |
| `README.md`, `CHANGES.md` | Setup + submission text; bug fixes + improvements list. |
| `CryptoZombieCard.jpeg` | Reference for the zombie card layout. |
| `Midterm project-Guidelines.pdf`, `project-guideline.mp4` | Course material. |

### Generated or local-only (gitignored)
| Path | What |
|---|---|
| `build/` | Truffle artifacts (ABI, bytecode, networks). |
| `.ganache/` | `db/` chain state, `keys.json` (never served), `snapshots/golden.tar`. |
| `frontend/dist/` | Production bundle (`npm run build`). |
| `frontend/public/deployment.json` | Addresses + ABIs for the app (`npm run export`). |
| `node_modules/`, `.npm-cache/`, `.home/`, `.tmp/` | Deps and sandboxed HOME/TMP used by `scripts/run.js`. |
| `.baseline/` | Pristine starter copy + SHA-256 manifest (for `npm run changes`). |
| `.checkpoints/` | Per-wave tarballs (build tooling only). |

### contracts/
| File | Role |
|---|---|
| `ownable.sol` | `owner()`, `onlyOwner`. Untouched. |
| `safemath.sol` | `SafeMath` (uint256), `SafeMath32`, `SafeMath16`. Untouched. |
| `erc721.sol` | Interface + `Transfer`, `Approval` events. Untouched. |
| `Migrations.sol` | Truffle bookkeeping. Untouched. |
| `2_crypto_zombies.js` | Odd starter file. Left alone. |
| `zombiefactory.sol` | Struct, storage, `createRandomZombie`. |
| `zombiefeeding.sol` | `AvengerInterface`, cooldown helpers, `feedOnAvenger`. |
| `zombiehelper.sol` | `levelUp`, `changeName`, `changeDna`, getters, owner admin. |
| `zombieattack.sol` | `attack` (PvP), `attackAvenger`, `randMod`. |
| `zombieownership.sol` | Deployed contract: `transferFrom`, `approve`, `balanceOf`, `ownerOf`. |
| `avengercontract.sol` | Local Avenger registry. Separate deploy. |

### frontend/
| Path | What |
|---|---|
| `index.html`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json` | Tooling. Alias `@` = `frontend/src`. |
| `public/` | `favicon.svg`, generated `deployment.json`. |
| `src/main.tsx`, `App.tsx`, `index.css` | Providers, routes, design tokens (Tailwind v4 `@theme`). |
| `src/lib/` | `types, deployment, chain, contracts, wallet, tx, errors, hooks, format, dna, roster`. |
| `src/components/ui/` | Button, Card, Badge, Stat, Modal, Toast, Skeleton, EmptyState, TxStepper, Tabs, Input, Select, ProgressBar, Address. |
| `src/components/layout/` | AppShell, Sidebar, BottomNav, Header, WalletPill, NetworkBadge, WalletModal, StatusBanner. |
| `src/components/art/` | ZombieArt, AvengerArt (SVG from DNA/genes), ZombieCard, AvengerCard. |
| `src/pages/` | Home, ZombieDetail, Create, Avengers, Battle, Activity, Settings, Gallery, NotFound (+ private subfolders per page). |
| `src/test/` | Vitest files. |

---

## 4. Contract guide

### Inheritance chain
```
Ownable ─► ZombieFactory ─► ZombieFeeding ─► ZombieHelper ─► ZombieAttack ─► ZombieOwnership ◄─ ERC721
 owner      create, state    feed, cooldown   level, name     battles          transfer, approve
                                  │
                                  └── talks to ──► AvengerContract (separate deploy, set by owner)
```
- Only `ZombieOwnership` and `AvengerContract` are deployed.
- All files: `pragma solidity ^0.4.25;`.

### State
| Variable | Where | Meaning |
|---|---|---|
| `zombies[]` | Factory | All zombies. Index = id. Public getter returns 6 fields. |
| `zombieToOwner[id]` | Factory | Owner address (public). 0x0 = unknown id. |
| `ownerZombieCount[addr]` | Factory | Owned count (internal; read via `balanceOf`). |
| `dnaModulus` | Factory | `10^16`. |
| `cooldownTime` | Factory | `1 days`. |
| `avengerContract` | Feeding | Public. Set once after deploy. |
| `levelUpFee` | Helper | Public, `0.001 ether`. |
| `randNonce` | Attack | Internal counter, shared by both battle types. Starts at 0. |
| `attackVictoryProbability` | Attack | `70` (see PvP odds). |
| `zombieApprovals[id]` | Ownership | Approved transferer (internal). Cleared on transfer. |

Zombie struct order (this is the ABI): `string name · uint dna · uint32 level · uint32 readyTime · uint16 winCount · uint16 lossCount`.

### Functions (ZombieOwnership ABI, plain words)
| Function | Who | What it does | Reverts with |
|---|---|---|---|
| `createRandomZombie(name)` | anyone | Makes your free zombie. DNA from name hash, ends `00`, level 1, cooldown 1 day. Emits `NewZombie`. | `only one free zombie per address` |
| `feedOnAvenger(zombieId, avengerId)` | zombie owner | Mixes zombie DNA with Avenger genes. New zombie `"NoName"` with hero DNA. Parent gets cooldown. Emits `NewZombie` then `AvengerFed`. | `avenger contract not set`, `no such avenger`, `not the zombie owner`, `zombie is not ready` |
| `setAvengerContractAddress(addr)` | contract owner | Wires `AvengerContract`. | (plain `onlyOwner` revert) |
| `avengerContract()` | view | Address of the wired Avenger contract. | |
| `levelUp(zombieId)` payable | **anyone** | +1 level for exactly `levelUpFee`. Emits `LevelUp`. | `no such zombie`, `wrong level up fee` |
| `changeName(zombieId, name)` | zombie owner | Rename. Needs level >= 2. No event. | `no such zombie`, `level too low`, `not the zombie owner` |
| `changeDna(zombieId, dna)` | zombie owner | Needs level >= 20. Not used by the UI. | same as above |
| `getZombiesByOwner(addr)` view | anyone | Array of ids owned. | |
| `getZombieCount()` view | anyone | `zombies.length`. | |
| `zombies(id)` view | anyone | `(name, dna, level, readyTime, winCount, lossCount)`. | invalid opcode on bad id |
| `zombieToOwner(id)` view | anyone | Owner or 0x0. | |
| `levelUpFee()` view | anyone | 0.001 ETH in wei. | |
| `setLevelUpFee(fee)`, `withdraw()` | contract owner | Admin. `withdraw` sends the whole balance to owner with `transfer`. | |
| `attack(zombieId, targetId)` | zombie owner | PvP. See below. Emits `Battle`. | `not the zombie owner`, `no such target`, `zombie is not ready` |
| `attackAvenger(zombieId, avengerId)` | zombie owner | Avenger battle. Emits `AvengerBattle`. | `not the zombie owner`, `avenger contract not set`, `no such avenger`, `zombie is not ready` |
| `balanceOf(addr)` view | anyone | Count owned. | |
| `ownerOf(id)` view | anyone | Owner; 0x0 for unknown id (no revert). | |
| `approve(addr, id)` payable | zombie owner | Lets `addr` move that zombie. Emits `Approval`. ETH sent with it stays in the contract. | `not the zombie owner` |
| `transferFrom(from, to, id)` payable | owner or approved | Moves zombie, fixes both counts, clears approval. Emits `Transfer`. ETH sent with it stays in the contract. | `from is not the owner`, `not owner or approved`, `zero address` |
| `owner()`, `isOwner()`, `transferOwnership`, `renounceOwnership` | Ownable | Standard. | |

`AvengerContract`:
| Function | What |
|---|---|
| `createAvenger(genes)` | Open to anyone, any genes. Stores `(genes, now)`. Emits `Birth`. Returns id. |
| `totalAvengers()` | Count. |
| `getAvenger(id)` | Kitty-shaped 10-tuple, `genes` is the last value. Reverts `no such avenger`. |

### Events
| Event | Contract | Fields |
|---|---|---|
| `NewZombie` | ZombieFactory | `zombieId, name, dna` |
| `AvengerFed` | ZombieFeeding | `zombieId*, avengerId*` |
| `LevelUp` | ZombieHelper | `zombieId*, newLevel` |
| `Battle` | ZombieAttack | `zombieId*, targetId*, won` |
| `AvengerBattle` | ZombieAttack | `zombieId*, avengerId*, won` |
| `Transfer` | ERC721 | `_from*, _to*, _tokenId*` |
| `Approval` | ERC721 | `_owner*, _approved*, _tokenId*` |
| `OwnershipTransferred` | Ownable | `previousOwner*, newOwner*` |
| `Birth` | AvengerContract | `owner*, avengerId*, genes` |

`*` = indexed. There is no rename event: renames do not appear in the activity feed.

### Rules in one place
- One free zombie per address (checked on `createRandomZombie`).
- Feed and battle need `readyTime <= now`. Both then reset cooldown to `now + 1 day`.
- Only the zombie owner may feed, battle, rename, approve.
- Anyone may level up any zombie (original rule, kept and documented).
- `transferFrom`: `from` must own it; caller must be `from` or approved; `to` not zero.
- Avenger id is checked locally (`< totalAvengers()`) so the revert reason is reliable on 0.4.25.
- `avengerContract` is set by the contract owner and trusted. On 0.4.25 the external call is a `CALL`, not a `STATICCALL`.

### Avenger odds formula
```
power  = genes % 10 + 1                       (1..10)
chance = clamp( 50 + 5*level - 5*power , 10 , 90 )     percent, signed math
roll   = randMod(100)                         (0..99)
win    = roll < chance                        -> exactly `chance` % of rolls win
```
Win: `winCount+1`, `level+1`. Loss: `lossCount+1`. Both: cooldown 1 day, `AvengerBattle` event. No new zombie.

| Zombie level | Avenger (power) | Math | Chance |
|---|---|---|---|
| 8 (Duskwalker) | Hawkeye (4) | 50 + 40 - 20 | **70 %** |
| 8 (Duskwalker) | Thor (9) | 50 + 40 - 45 | **45 %** |
| 2 (Rotfang) | Iron Man (7) | 50 + 10 - 35 | **25 %** |
| 5 (Mossbelly) | Captain America (6) | 50 + 25 - 30 | **45 %** |
| 1 | power 10 | 50 + 5 - 50 = 5 -> floor | **10 %** |
| 20 | power 1 | 50 + 100 - 5 = 145 -> cap | **90 %** |

PvP (`attack`): `win = roll <= 70` -> 71 of 100 rolls -> **71 %**. Win: level+1, target loses, **spawns a "NoName" child** (DNA mixed, not hero). Loss: own loss+1, target win+1. Both: cooldown.

Randomness: `keccak256(now, msg.sender, randNonce) % 100`. Predictable by design of the starter. Not secure. Documented.

### Roster (Avenger -> hero by `genes % 6`)
| idx | Hero (text only) | Seed genes | Power |
|---|---|---|---|
| 0 | Iron Man | 7319028465120486 | 7 |
| 1 | Captain America | 1846203957461125 | 6 |
| 2 | Thor | 9902671358840708 | 9 |
| 3 | Hulk | 4471935026689137 | 8 |
| 4 | Black Widow | 2638470915573364 | 5 |
| 5 | Hawkeye | 5560218743309963 | 4 |

All art is original SVG. No official logos or artwork.

### Hero DNA example (feed Rotfang on Thor)
```
zombie DNA   2521625881949400
Thor genes   9902671358840708
sum          12424297240790108
sum / 2      6212148620395054
- (x % 100)  6212148620395000      (strip last two digits)
+ 99         6212148620395099      <- hero zombie "Thunderrot"
```
Frontend `heroDna()` computes the same before you sign (before/after preview).

### DNA decoding table
`pair i` = digits counted from the right (`dnaPair(dna, i)`). Variant = pair % count.

| Pair | Digits | Trait | Variants |
|---|---|---|---|
| 0 | 15-16 | species | `99` = hero overlay, else normal |
| 1 | 13-14 | accessory (%6) | none, helmet+goggles, pirate hat, flat cap, bandana, headphones |
| 2 | 11-12 | clothes (%6) | torn tank top, striped shirt, lab coat, leather jacket, hoodie, suit+tie |
| 3 | 9-10 | mouth (%5) | stitched, jagged teeth, drool, gap grin, frown |
| 4 | 7-8 | eyes (%6) | hollow, mismatched, glowing slits, stitched X, droopy, three-eyed |
| 5 | 5-6 | skin (%8) | 8 greens/grays from a fixed palette |
| 6 | 3-4 | head (%4) | round, square jaw, tall skull, lumpy stitched |
| 7 | 1-2 | aura (%5) + rarity roll | toxic green, purple mist, teal ring, ember, swirl; pair >= 90 = rare |

Worked example, Rotfang `2521625881949400` -> pairs from right `00 94 94 81 58 62 21 25`:
- species normal · accessory 94%6=4 bandana · clothes 94%6=4 hoodie · mouth 81%5=1 jagged teeth
- eyes 58%6=4 droopy · skin 62%8=6 · head 21%4=1 square jaw · aura 25%5=0 toxic green, 25 < 90 = common

Level tier (glow on the art): L1 -> 0, L2-4 -> 1, L5-9 -> 2, L10+ -> 3.

---

## 5. End-to-end flows

Notation: UI action -> function/event. "Head" = latest block.

### 5.1 Wallet connect and network states
```
                      ┌────────────────────────────────────────────┐
 app loads ──────────►│ read provider eth_chainId fails            │──► rpc-down
                      │ or deployment.json missing                 │
                      └──────────────┬─────────────────────────────┘
                                     ▼ ok
                      getCode(ZombieOwnership) == 0x ? ───────────────► no-contract
                                     ▼ code present
                      no wallet provider after 500 ms ? ──────────────► no-metamask
                                     ▼ provider found
                      eth_requestAccounts pending ? ──────────────────► connecting
                                     ▼
                      no account / app disconnected ? ────────────────► disconnected
                                     ▼ account
                      wallet chain != 0x539 (reason: chain) ?
                      or wallet's own getCode == 0x (reason: rpc) ? ──► wrong-network
                                     ▼ no
                                   ready
```
Precedence (top wins): `rpc-down > no-contract > no-metamask > connecting > disconnected > wrong-network > ready`.

Steps:
1. Page mounts. App fetches `/deployment.json` (`cache: no-store`).
2. Wallet discovery: listen `eip6963:announceProvider`, dispatch `eip6963:requestProvider`.
3. After 500 ms pick `io.metamask`, else first announced, else `window.ethereum`, else `no-metamask`.
4. Silent `eth_accounts` on load (skipped if localStorage `zn.disconnected === '1'`).
5. Click Connect -> `eth_requestAccounts`. Clears the disconnected flag.
6. Compare `eth_chainId` with `0x539` (1337).
7. Wrong chain -> Switch network -> `wallet_switchEthereumChain {0x539}`. Error 4902 -> `wallet_addEthereumChain` (name `Ganache 1337 (ZOMBIENEXUS)`, RPC `http://127.0.0.1:7545`).
8. Wrong RPC behind chain 1337 (e.g. Localhost 8545): wallet's `eth_getCode` is `0x` -> `wrong-network` reason `rpc`. Fix: edit that network's RPC URL in MetaMask.
9. Listeners `accountsChanged`, `chainChanged`, `disconnect`: registered once per provider, removed on cleanup. Each calls `refresh()`; stale results dropped by a request counter. **No page reload.**
10. Balance re-read on every head change.
11. "Disconnect app session" only sets the flag. MetaMask permission stays granted.

### 5.2 Create zombie (preview == on-chain DNA)
1. Open `/create`, tab Create. Type a name (1-32 chars, trimmed).
2. Every keystroke: `previewDna(name)` = `BigInt(keccak256(utf8(name))) % 10^16`, minus `% 100`.
3. Art, DNA digits (pair colours), rarity badge update live.
4. Gate: `balanceOf(me) > 0` -> button disabled, "One free zombie per address".
5. Click Create -> `createRandomZombie(name)`. Tx lifecycle (section 6).
6. On `confirmed`: `parseReceipt` reads `NewZombie(zombieId, name, dna)`.
7. UI compares event `dna` with the preview -> "Preview matched on-chain DNA".
8. Reveal animation + link to `/zombie/:id`.
9. New zombie has a 24 h cooldown (cannot feed/battle yet).

### 5.3 Level up
1. `/zombie/:id` -> Level Up (any address may level any zombie; fee 0.001 ETH).
2. `levelUp(id)` with `value = levelUpFee`. Wrong fee -> `wrong level up fee`.
3. Event `LevelUp(zombieId, newLevel)`.
4. Head changes -> hooks refetch -> new level, glow tier, odds update.

### 5.4 Rename
1. Enabled when level >= 2 (else hint). Owner only.
2. `changeName(id, newName)` (modifiers `aboveLevel(2)`, `onlyOwnerOf`).
3. No event. Name appears after refetch. Not in activity feed.

### 5.5 Approve + transfer
1. Owner opens `/zombie/:id`.
2. Optional: Approve -> `approve(addr, id)` -> event `Approval`. Address checked with `isAddress`.
3. Transfer: Input address (not self, not zero) -> confirm modal "cannot be undone".
4. `transferFrom(me, to, id)` -> event `Transfer(from, to, id)`.
5. Contract: `from` owns it, caller is `from` or approved, `to != 0`; `_to` count +1, `_from` count -1; `delete zombieApprovals[id]`.
6. Toast with tx hash. Detail page shows new owner after refetch.
7. Switch MetaMask to receiver -> Army shows the zombie. Sender's list no longer has it.
8. Approved-spender path: approved address calls `transferFrom(owner, to, id)` (covered by Truffle tests).

### 5.6 Infect (feed on Avenger) -> hero zombie
1. `/create?tab=infect` (or Avengers page -> Infect).
2. Pick one of your **ready** zombies and an Avenger. Not-ready ones are disabled with a countdown.
3. UI shows before -> after DNA with both arts (`heroDna(myDna, genes)`).
4. Click Infect -> `feedOnAvenger(zombieId, avengerId)`.
5. Contract: avenger contract set? id `< totalAvengers()`? owner? ready?
6. `getAvenger(id)` -> genes. `feedAndMultiply`: `(dna + genes)/2`, strip last two digits, add `99`.
7. `_createZombie("NoName", newDna)` -> event `NewZombie`. Parent `readyTime = now + 1 day`. Event `AvengerFed`.
8. UI reads the new zombie id from `NewZombie` in the receipt; hero reveal (gold flash, mask drops in); link to the new zombie.
9. Demo note: the seed already fed Rotfang on Thor once (that made Thunderrot, id 5). Feeding Rotfang on Thor again makes a new "NoName" with the same hero DNA `6212148620395099`.

### 5.7 Battle vs Avenger
1. `/battle`, tab "vs Avengers" (or Avengers page -> Battle).
2. Pick a ready zombie (left) and an Avenger (right).
3. Centre shows `winChance(level, power)` % (same formula as the contract).
4. Click Battle -> `attackAvenger(zombieId, avengerId)` with `gasLimit: 300000`.
5. Arena: awaiting-signature (fighters lean in) -> pending (auras pulse, VS spins) -> confirmed (clash).
6. Result comes from receipt event `AvengerBattle(zombieId, avengerId, won)`, never from the animation.
7. Result panel: VICTORY / DEFEAT, level and win/loss deltas, new `readyTime`.
8. Reverted / rejected / failed: no clash, error banner.

### 5.8 PvP battle (vs zombies)
1. `/battle`, tab "vs Zombies". Targets = other owners' zombies (Warden listed first).
2. Odds shown as 71 %.
3. `attack(zombieId, targetId)`, `gasLimit: 300000`.
4. Event `Battle(zombieId, targetId, won)`.
5. Win: level+1, win+1, target loss+1, `feedAndMultiply` spawns "NoName" child (`NewZombie` log) -> result shows "Spawned zombie #id".
6. Loss: own loss+1, target win+1. Both: cooldown.
7. Self-attack is possible on-chain; the UI never offers it.

### 5.9 Summon Avenger
1. `/avengers` -> Summon panel.
2. Genes = `randomGenes()` (crypto random, `% 10^16`) with Reroll, or type digits manually.
3. Preview `AvengerArt` + hero name (`genes % 6`) + power (`genes % 10 + 1`).
4. Click Summon -> `AvengerContract.createAvenger(genes)` (any account).
5. Event `Birth(owner, avengerId, genes)`.
6. New card appears after refetch. Avenger is now usable for Infect and Battle.

### 5.10 Activity feed
1. `/activity` -> `useActivity()`.
2. `queryFilter('*', deployedAtBlock, 'latest')` on both contracts, newest first, cap 300.
3. Block timestamps cached by block; receipts cached by hash (for `from`, `gasUsed`).
4. Filters: All, Zombies (NewZombie, LevelUp), Transfers (Transfer, Approval), Battles (Battle, AvengerBattle), Avengers (Birth, AvengerFed), Mine.
5. Row: event icon + label, linked ids, from, block, `timeAgo` (chain time), gas, copyable hash.
6. Refetch on every head change (poll `eth_blockNumber` every 4 s while the tab is visible).

### 5.11 Legacy trio (`/legacy/`)
- Original `index.html` + `cryptozombies_abi.js`. jQuery and web3 1.2.7-rc.0 load from a CDN (internet needed).
- Buttons: Show Zombies, Create Zombie, Level Up.
- Calls: `createRandomZombie` (name = the account address), `getZombiesByOwner`, `zombies`, `levelUp`.
- Only change: line 34 contract address = ZombieOwnership address from `deployment.json`.
- Use account C (index 3), which must own exactly one zombie (Level Up passes the id array; web3 coerces a one-element array).
- Feed on Kitty no longer works (renamed to `feedOnAvenger`). The page has the `feedOnKitty` function but no button calls it. Not part of the graded trio.

---

## 6. Transaction lifecycle

```
            run()                send(signer)             hash returned
  idle ───────────► awaiting-signature ───────────► pending ───────────► confirmed   (receipt.status 1)
                          │                           │  \
                          │ user rejects              │   └─────────────► reverted    (status 0 or null)
                          ▼                           ▼
                       rejected                    failed  (RPC/network/unknown error)
```
- Reducer actions: `start`, `sent`, `mined`, `error`, `reset`. Pure function `txReducer`.
- `run()` returns `null` right away while busy (no double submit).
- After `sent`: info toast with hash. Then `waitForTransaction(hash, 1, 120000)` on the read provider.
- `confirmed` only when `receipt.status === 1`. Then `refreshHead()` + success toast.
- Gas: ethers estimates (estimate surfaces revert reasons before signing). Exception: `attack` and `attackAvenger` use `gasLimit: 300000`, because the win path costs more than an estimate taken on the loss path.
- `TxStepper`: Sign in wallet -> Pending -> Confirmed (short hash + copy, block number). Terminal errors red/amber with the message.

### Error mapping (`mapError`)
| Kind | Detected by | User sees |
|---|---|---|
| rejected | `ACTION_REJECTED` or code 4001 | You rejected the request in MetaMask. Nothing was sent. |
| funds | `INSUFFICIENT_FUNDS` or /insufficient funds/ | This account does not have enough test ETH for gas and fees. |
| network | 4902, `NETWORK_ERROR`, wallet not ready, or /nonce/ | Wrong network: switch to Ganache (1337, `http://127.0.0.1:7545`). Nonce case: Settings > Advanced > Clear activity tab data in MetaMask. |
| reverted | `CALL_EXCEPTION`, status 0, or a revert reason found | The contract rejected this action: friendly reason. |
| unknown | anything else, RPC fetch failures | Something went wrong talking to the local chain. Is `npm run demo` running? |

Reason extraction order: `err.reason`, `err.revert.args[0]`, then a regex on `info.error.message`, `error.message`, `shortMessage`, `message` (hits starting with "data" are skipped; this overrides SPEC 4.3).

Friendly reasons: `not the zombie owner` -> "You do not own this zombie." · `only one free zombie per address` -> "This address already owns a zombie." · `zombie is not ready` -> "still cooling down" · `level too low` · `no such zombie` / `no such target` -> "does not exist" · `no such avenger` · `wrong level up fee` -> "exactly 0.001 ETH" · `not owner or approved` · `from is not the owner` · `zero address` · `avenger contract not set`. Unknown reasons are shown verbatim.

---

## 7. Scripts guide

All commands run through `node scripts/run.js` where needed (HOME/TMPDIR pinned inside the project). Output lines: `PASS`, `FAIL`, `SKIP`, `WARN`. Exit 0 ok, 1 failure, 2 usage.

| npm script | What it does |
|---|---|
| `setup` | `npm ci` then `compile`. First-time install. |
| `compile` | `truffle compile` with local solc 0.4.25 (no download). |
| `chain` | Start Ganache on 7545 (chain 1337, deterministic, DB in `.ganache/db`). Prints accounts. Ctrl-C stops. Says "already running" if up. |
| `migrate` | `truffle migrate --reset --network development` (deploy ZombieOwnership + AvengerContract + wiring). Use on an empty chain: on a deployed chain it creates new addresses. |
| `seed` | 6 Avengers, 6 zombies, levels, one hero. Refuses if already seeded (exit 1). |
| `export` | Write `frontend/public/deployment.json` (chainId, addresses, ABIs, deploy block). |
| `check` | Health checks: net_version 1337, chainId 0x539, code at both addresses, wiring, `index.html` line 34, deployment.json vs artifacts, zombie count >= 6. |
| `serve` | Static server 127.0.0.1:8080 (app at `/`, legacy at `/legacy/`). GET/HEAD only; whitelist; `keys.json` and `web3.min.js` are never served. 503 if `dist` is missing. |
| `demo` | One command: start/reuse chain -> migrate+seed if block 0 -> build if `dist` missing -> export -> check -> serve. Check FAIL stops it (exit 1). Ctrl-C stops the server, and the chain only if `demo` started it. |
| `reset` | Delete `.ganache/db` and `keys.json`. Refuses if chain is running. |
| `snapshot` | Save `.ganache/snapshots/golden.tar`. Refuses if chain is running. |
| `restore` | Replace db with the golden snapshot. Refuses if running or no snapshot. |
| `doctor` | Env check: Node >= 20.19, node_modules, solc, ports 7545/8080 free, registry reachable. |
| `test` | Throwaway Ganache on 8545 + `truffle test --network test`. 30 tests. Exits 1 if 8545 is busy. |
| `test:ui` | Vitest, 47 tests in 6 files. Needs Node 22.22+ (`doctor` WARNs below that). |
| `build` | `tsc --noEmit` then `vite build` -> `frontend/dist`. |
| `dev` | Vite dev server on 5173 (hot reload). |
| `changes` | Compare project to `.baseline` manifest; fails if a no-touch starter file changed. |

### First run (new Mac)
1. Install Node 20.19+ (22.22+ recommended). Needs internet once.
2. `npm ci` (or `npm run setup`).
3. `npm run doctor` (fix any FAIL).
4. `npm test` and `npm run test:ui` (optional sanity).
5. `npm run demo` -> open `http://127.0.0.1:8080/`.
6. MetaMask: add/import network (section 12), import accounts [1], [2], [3] by private key from `.ganache/keys.json`. Never import [0].

### Reset, snapshot, restore
```
 Ctrl-C the demo ─► npm run reset ─► npm run demo      fresh chain, new deploy, new seed
 Ctrl-C the demo ─► npm run snapshot                   save good state (golden.tar)
 Ctrl-C the demo ─► npm run restore ─► npm run demo    back to the saved state
```
- After reset or restore, MetaMask nonces are stale: Settings > Advanced > Clear activity tab data.
- Contract addresses are deterministic (same deployer, same migration order), so `index.html` line 34 stays valid.
- `check` fails if line 34 and deployment disagree.

### Accounts
| Role | Index | Use |
|---|---|---|
| D deployer | 0 | Deploys, seeds, owns the Warden. Never import to MetaMask. |
| A army | 1 | Main demo wallet (5 zombies). |
| B fresh | 2 | Live Create; receives a transfer. |
| C legacy | 3 | Runs the legacy trio. |

---

## 8. Data and time model

### Where data lives
```
 chain (Ganache)  ──►  contracts: zombies[], owners, avengers[], events   (truth)
 deployment.json  ──►  addresses + ABIs + RPC URL                        (config)
 React state      ──►  copies, refetched when the head block changes       (cache)
 localStorage     ──►  only `zn.disconnected` flag
```
- DNA and genes are `BigInt` in the UI (16 digits exceed safe JS numbers).
- Cards show only on-chain fields. No invented stats.

### Time
- Contract `now` = timestamp of the block that includes the tx.
- `readyTime = now + 1 day`. Zombie is ready when `readyTime <= block time`.
- Ganache mines only when a tx arrives. No tx = head does not move.
- The seed runs `evm_increaseTime(90000)` twice (50 h) so every zombie is ready at demo start.
- Result: **chain time runs ~50 h ahead of the wall clock.**
- `chain.js` restart (chain past block 0): `evm_setTime(max(now, lastBlockTime + 1 s))` in ms + `evm_mine`. Time offset is memory-only, so this keeps time monotonic. Skipped on an empty chain, so `demo` can still see block 0.
- `eth_call` runs against the parent block timestamp.

### Why readiness uses block time
- Wall clock (`Date.now()`) is ~50 h behind chain time. It would show everything as cooling.
- UI uses `isReady(z, headTs)` and `timeAgo(ts, headTs)`: always head time.
- Next block time is >= head time, so "ready" in the UI is ready on-chain.
- Accepted edge: a cooldown that just expired may look "cooling" until any tx mines a new block (conservative).

---

## 9. Starter bugs fixed and known limitations

### Fixed (before -> after)
| # | Starter (before) | Now (after) |
|---|---|---|
| 1 | `_transfer` decremented `ownerZombieCount[msg.sender]` (not `_from`): phantom id 0, sender's count stuck, approved-caller path wrong | Decrements `_from`. Counts correct for owner and approved flows. |
| 2 | Approvals never cleared on transfer | `delete zombieApprovals[id]` in `_transfer`. |
| 3 | `transferFrom` never checked `_from` | `require(zombieToOwner[id] == _from, "from is not the owner")`, plus owner/approved and zero-address checks. |
| 4 | `attack` had no readiness check (wins reverted on cooldown, losses succeeded) | `require(_isReady(...), "zombie is not ready")` first for all outcomes. |
| 5 | `attack` with a bad target id: invalid opcode | `require(_targetId < zombies.length, "no such target")`. |
| 6 | No battle event | `Battle(zombieId, targetId, won)`. |
| 7 | `feedOnKitty` reverted while the kitty address was unset (no reason) | `feedOnAvenger` with `avenger contract not set`, `no such avenger`; local `AvengerContract`. |
| 8 | `levelUp`: no id check, fee private, no event | `no such zombie`, public `levelUpFee`, `LevelUp` event. |
| 9 | No count getter, no revert messages anywhere | `getZombieCount()`, readable messages everywhere. |
| 10 | Legacy page hard-coded a contract address (line 34) | Line 34 points at the deployed ZombieOwnership (checked by `npm run check`). |
| 11 | Legacy page: deprecated `ethereum.enable()`, unguarded `ethereum.on` | New React app: EIP-6963 discovery, `eth_requestAccounts`, guarded listeners, no reload. Legacy page kept as is (documented). |

### Known limitations (documented, not changed)
- `levelUp` is ownerless: anyone can level any zombie (pays the 0.001 ETH fee).
- PvP win rate is 71 % (`<= 70`), a starter off-by-one kept on purpose.
- Self-attack is possible on-chain. UI hides it.
- Randomness is predictable (`now`, sender, nonce). Fine for a demo, not for value.
- `createAvenger` is open to anyone with any genes: players can mint power-1 Avengers to farm levels, and pick the DNA a feed produces.
- An address can transfer its zombie away, then create another free one.
- `transferFrom` and `approve` are `payable`: ETH sent with them stays in the contract until the owner calls `withdraw`.
- The owner-set `avengerContract` is trusted (0.4.25 external call uses `CALL`, not `STATICCALL`).
- `ownerOf` returns 0x0 for unknown ids instead of reverting.
- `withdraw` uses `transfer` (2300 gas limit).
- New zombies start with a 24 h cooldown (starter rule). The seed fast-forwards time.
- uint16 win/loss counters revert after 65 535 (SafeMath16).
- Legacy page: raw-HTML names (XSS), jQuery/web3 from CDN (internet needed), stale ABI file, `Transfer` subscription error on HTTP, Create Zombie uses the account address as the name, Level Up sends the whole id array. Only line 34 was edited.
- Legacy Feed on Kitty no longer works (function renamed to `feedOnAvenger`). The page has no button for it. Not part of the 24-point trio.
- Contract addresses are stable only for the same migration sequence.
- Local chain only: no testnet, no marketplace, not on Etherscan.

---

## 10. Test map

### Truffle (30 tests, real local chain on 8545)
| Group | Count | File | Covers |
|---|---|---|---|
| Starter | 6 | `test/CryptoZombies.js` | create, no second zombie, transfer, approve+transfer by approved, approve+transfer by owner, attack |
| Master | 20 | `test/master.js` | S01-S20 below |
| Avenger | 4 | `test/avengers.js` | A1-A4 below |

| ID | Scenario |
|---|---|
| S01 | Contracts compile (artifacts have bytecode) |
| S02 | Contracts deploy, Avenger contract wired |
| S03 | Creation works, `NewZombie` emitted |
| S04 | Data correct (name, DNA ends `00` = keccak preview, level 1, counters 0) |
| S05 | Ownership assigned (`ownerOf`, `balanceOf`) |
| S06 | Retrieval (`getZombiesByOwner`, `getZombieCount`, `zombies`) |
| S07 | Second free zombie reverts |
| S08 | Owner and approved transfers succeed |
| S09 | Stranger, wrong `from`, zero address revert |
| S10 | Balances change, approval cleared, sender can create again |
| S11 | Level-up rules (wrong fee, unknown id, rename below level 2) |
| S12 | Level persists, `LevelUp` emitted |
| S13 | Feed on Avenger -> hero DNA `...99`, `AvengerFed` |
| S14 | Invalid Avenger use reverts (unknown id, not set, not ready) |
| S15 | Non-owner cannot `attack` / `attackAvenger` |
| S16 | Cooldowns: not-ready reverts, `readyTime` = block time + 1 day |
| S17 | Event values (`NewZombie`, `Transfer`, `Approval`, `LevelUp`, `Battle`) |
| S18 | Wrong-account txs rejected (`changeName`, `approve`, `setAvengerContractAddress`) |
| S19 | Invalid ids fail safely with reasons; `ownerOf` -> 0x0 |
| S20 | Fresh `ZombieOwnership.at(address)` reads the same state |
| A1 | `createAvenger` stores genes, emits `Birth`, count +1 |
| A2 | `getAvenger` 10-tuple, genes last, unknown id reverts |
| A3 | `attackAvenger` outcome matches the odds formula (>= 6 battles, clamp checked) |
| A4 | Wins, losses, level, cooldown, `AvengerBattle` updated |

No test depends on luck: each Avenger battle test deploys a fresh contract, counts `randMod` calls (nonce n), recomputes the roll with `soliditySha3(blockTimestamp, sender, n) % 100`, then asserts the matching branch. (The starter attack test only checks that the call succeeds.)

### Vitest (`npm run test:ui`): 47 tests in 6 files
| File | Tests | Covers |
|---|---|---|
| `dna.test.ts` | 8 | `previewDna("Rotfang")` = `2521625881949400n`; `heroDna` = `6212148620395099n`; `decodeDna`; `rarityOf`; `levelTier` |
| `roster.test.ts` | 5 | 6 genes -> 6 heroes; powers 7,6,9,8,5,4; `winChance` (1,10)=10, (20,1)=90, (8,9)=45, (8,4)=70; PvP chance 71 |
| `tx.test.ts` | 8 | Every `txReducer` transition; status 0 -> reverted; rejected vs failed |
| `errors.test.ts` | 12 | 4001, `ACTION_REJECTED`, `INSUFFICIENT_FUNDS`, revert reasons, Ganache "VM Exception", nonce, unknown, `friendlyReason` |
| `format.test.ts` | 6 | `shortAddress`, `formatEth`, `formatDna`, `formatDuration`, `timeAgo` with chain time, `isReady` |
| `ZombieArt.test.tsx` | 7 | `role="img"`, data attributes match `decodeDna` (4 DNAs), hero overlay only for `...99`, deterministic output |

---

## 11. Demo script (about 9:30)

Setup before the slot `[DEMO_SLOT_TIME]`: `npm run demo` running, Chrome profile with MetaMask, accounts A, B, C imported, MetaMask on Ganache 1337, all tabs open. No chain reset during the demo. No live network switch.

| Time | Step | Talking points |
|---|---|---|
| 0:00 | Intro slide / title | Starter = 3 buttons. We kept it working and rebuilt the rest. 6 improvements. |
| 0:30 | `/legacy/` as account C: Create, list, Level Up | Original trio on Ganache = baseline (24 pts). Only line 34 changed. |
| 1:45 | New app as account B: tour sidebar, Settings | Wallet pill, Ganache 1337 badge, diagnostics all PASS, no hard-coded addresses. |
| 2:30 | B: `/create`, type a name | Live DNA preview = on-chain DNA (keccak). Rarity badge. Create -> stepper -> reveal. |
| 3:30 | Switch to A: Army grid | 5 zombies, DNA-driven art, sort/filter, ready/cooling from chain time. |
| 4:15 | Open a zombie, Level Up | Fee 0.001 ETH, `LevelUp` event, glow tier changes. Note: ownerless rule, documented. |
| 5:00 | Avengers: summon one, then Infect Rotfang on Thor | Local `AvengerContract` replaces CryptoKitties. Before/after DNA, hero ends `99`, `AvengerFed`. The new "NoName" has the same DNA as the seeded Thunderrot. |
| 6:15 | Battle: Duskwalker vs Hawkeye (70 %) or Thor (45 %) | Odds formula `clamp(50+5L-5P,10,90)`. Result from the event, not the animation. Cooldown starts. |
| 7:15 | PvP: Mossbelly vs Warden | 71 % kept and documented. Win spawns a child zombie. |
| 8:00 | Transfer Grimjaw to B, switch to B | Fixed `_transfer`, approval cleared, both lists update, `Transfer` in Activity. |
| 8:45 | Activity page + `npm test` result slide | 30 Truffle tests, 47 Vitest tests, bug-fix table. |
| 9:15 | Wrap-up | Limitations: ownerless level up, predictable randomness, local only. One-command demo/reset/snapshot. |

Seeded roles: feed = Rotfang (id 0), Avenger battle = Duskwalker (id 3), PvP = Mossbelly (id 2) vs Warden (id 4), transfer = Grimjaw (id 1) to account B, spare = Thunderrot (id 5, hero).
Each feed or battle starts a one-day cooldown and the demo does not move chain time: use each zombie once.

Fallback if something breaks: show `/gallery` (needs no chain or wallet) and the Settings diagnostics.

---

## 12. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| MetaMask error mentions nonce, tx stuck, "nonce too high" | Chain was reset/restored; MetaMask remembers old nonces | MetaMask > Settings > Advanced > Clear activity tab data (per network), retry |
| Banner "MetaMask is on chain X" (wrong-network, reason chain) | Wallet on another network | Click Switch network, or pick Ganache 1337 manually |
| Banner "chain 1337 entry does not point at 127.0.0.1:7545" (reason rpc) | MetaMask already has chain 1337 with another RPC (e.g. Localhost 8545) | Edit that network's RPC URL to `http://127.0.0.1:7545` (chain id 1337, symbol ETH) |
| `EADDRINUSE` / "port busy" on 7545, 8080, 5173, 8545 | Old process or another app | `lsof -nP -iTCP:<port> -sTCP:LISTEN`, stop that process, rerun. `npm run doctor` shows busy ports |
| Banner "Local chain offline" (rpc-down) | Ganache not running or `deployment.json` missing | `npm run demo` (or `npm run chain`); then `npm run export` |
| Banner "Contracts not found on this chain" (no-contract) | Chain was wiped or never migrated | `npm run demo` (migrates + seeds when block is 0), or `npm run migrate && npm run seed && npm run export` |
| "MetaMask not detected" | No wallet extension in this browser profile | Use the profile with MetaMask. Gallery, Activity, Avengers still read-only |
| Zombie shows cooling after restart | Cooldown not yet passed at head time | Any mined tx advances the head; seeded zombies are ready at start |
| `npm run seed` -> "already seeded" | Zombies already exist | Expected. `npm run reset` first for a clean start |
| `reset`/`snapshot`/`restore` refuses | Chain is running | Stop `npm run demo` / `npm run chain` first |
| `restore` exits 1 | No `golden.tar` | Run `npm run snapshot` once on a good state |
| `npm run check` FAIL on `index.html` line 34 | Addresses changed (different deploy order) | Put the ZombieOwnership address from `deployment.json` on line 34 |
| Blank app / 503 "Run npm run build" | `frontend/dist` missing | `npm run build` (demo does it automatically) |
| `npm run test:ui` fails to start | Node older than 22.22 | Upgrade Node (app and Truffle still work on 20.19+) |
| Legacy page buttons dead | `ethereum.enable()` removed in newer MetaMask, or CDN offline | Check internet for jQuery/web3 CDN; ask before editing other legacy lines |
| Truffle `compile` tries to download | Wrong solc config | Use `npm run compile` (local `node_modules/solc/soljson.js`) |

MetaMask network values: name `Ganache 1337`, RPC `http://127.0.0.1:7545`, chain id `1337`, symbol `ETH`.

---

## 13. File glossary for the presenter

| File | One-line explanation |
|---|---|
| `zombiefactory.sol` | Where a zombie is born: name -> hash -> DNA. |
| `zombiefeeding.sol` | Feeding and cooldown; talks to the Avenger contract. |
| `zombiehelper.sol` | Level up, rename, lists, owner admin. |
| `zombieattack.sol` | Both battle types and the odds formula. |
| `zombieownership.sol` | The deployed token: transfer and approve (bug fixes live here). |
| `avengercontract.sol` | Our local replacement for the CryptoKitties contract. |
| `migrations/3_deploy_avengers.js` | Deploys Avengers and wires it into ZombieOwnership. |
| `scripts/chain.js` | Starts the local blockchain. |
| `scripts/seed.js` | Fills the chain with demo zombies and Avengers. |
| `scripts/demo.js` | Does everything for the demo in one command. |
| `scripts/export.js` | Writes `deployment.json` for the app. |
| `scripts/check.js` | Proves chain, contracts and legacy page agree. |
| `scripts/serve.js` | Serves the app and the legacy page. |
| `scripts/state.js` | Reset, snapshot, restore of the chain. |
| `scripts/test.js` | Runs Truffle against a throwaway chain. |
| `scripts/run.js` | Keeps tool caches inside the project. |
| `frontend/src/lib/wallet.tsx` | Wallet states, network switching, listeners. |
| `frontend/src/lib/tx.ts` | Transaction state machine. |
| `frontend/src/lib/errors.ts` | Turns raw errors into readable messages. |
| `frontend/src/lib/chain.ts` | Read provider and block-head polling. |
| `frontend/src/lib/contracts.ts` | Contract handles, fetch helpers, receipt decoding. |
| `frontend/src/lib/hooks.ts` | Data hooks (zombies, avengers, activity). |
| `frontend/src/lib/dna.ts` | DNA preview, hero DNA, trait decoding, rarity. |
| `frontend/src/lib/roster.ts` | Hero roster and win-chance formula. |
| `frontend/src/components/art/ZombieArt.tsx` | Draws a zombie from its DNA. |
| `frontend/src/pages/BattlePage.tsx` | Arena for both battle modes. |
| `frontend/src/pages/CreatePage.tsx` | Create (live preview) and Infect. |
| `frontend/src/pages/ActivityPage.tsx` | Event explorer. |
| `frontend/src/pages/SettingsPage.tsx` | Network, contracts, diagnostics. |
| `frontend/public/deployment.json` | Generated config: addresses and ABIs. |
| `index.html` (root) | Legacy page. Line 34 = contract address. |
| `docs/SPEC.md` / `docs/PLAN.md` | Frozen interfaces / rules and decisions. |
| `CHANGES.md` | Bug fixes and improvements list for grading. |
