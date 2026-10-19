# ZOMBIENEXUS — Implementation Plan (v5, approved 2026-10-16)

Approved by the user: "Execute the plan, approve A B C, start." Single-day build, 4-hour target. This file is the source of truth for resume.
Resume phrase in a new Claude session: `resume zombienexus` -> read `docs/PROGRESS.md` first.

## 0. Binding user constraints
1. No files outside this project directory. No local resources outside it (Chrome profile "Zombie_Project" and `~/.claude` memory are the only exceptions).
2. No global installs. Everything installs into `node_modules` of this project (`npm ci` / `npm install`, `ignore-scripts=true`). No Homebrew, no sudo.
3. **NO GIT by Claude or any agent, ever — not even read-only (`status`, `diff`, `log`, `ls-files`).** The user runs all git. Use `.baseline/` + `scripts/changes.js` instead. After any `npm install`, grep `package-lock.json` for `git+` / `github:` (must print nothing).
4. Placeholders stay placeholders. Never write real names, CWIDs, emails, passwords. Placeholder tokens:
   `[TEAM_MEMBER_1_NAME]`, `[TEAM_MEMBER_2_NAME]`, `[TEAM_MEMBER_3_NAME]`, `[CWID_1]`, `[CWID_2]`, `[CWID_3]`, `[EMAIL_1]`, `[EMAIL_2]`, `[EMAIL_3]`, `[GITHUB_REPO_URL]`, `[CANVAS_SUBMISSION_LINK]`, `[METAMASK_PASSWORD]` (never in any file), `[DEMO_SLOT_TIME]`.
5. Project must run on **another macOS arm64 Mac** (Node 20+, internet once for `npm ci`). Ship source only. No absolute paths. All scripts are plain Node (cross-platform).
6. Quality bar: frontend and all visuals top-notch. No scope cuts without asking the user.
7. No Render/testnet/marketplace/`.rar`.
8. Model policy: **Opus makes decisions** (spec freeze, gate verdicts, QA triage, ambiguity). Sonnet implements. Haiku does mechanical work. Lead runs commands and gates and applies Opus rulings.

## 1. Course context
CSUF Advanced Blockchain midterm. Submission window 2026-10-12..10-20, deliverables 10/18. Demo <= 10 min. Grading: 24 pts = starter (index.html legacy trio) running on Ganache; +1 pt per demonstrated improvement (up to 6). Master prompt asked: >=6 improvements, 20 Truffle scenarios, wallet/network handling, local NPC contract, transfer/feed/battle, README with team placeholders, 10-min demo readiness.

## 2. What ships
- **Contracts** (Solidity ^0.4.25, solc 0.4.25 local `soljson.js`): bug-fixed starter + `AvengerContract` + `feedOnAvenger` + `attackAvenger`.
- **Chain**: Ganache 7.9.2 on 127.0.0.1:7545, chainId = networkId = 1337, deterministic wallet (10 x 1000 ETH), persistent DB `.ganache/db`, deterministic seed, golden snapshot, `npm run reset`.
- **App** (React + TS + Vite + Tailwind + ethers v6): `/` army, `/create` factory (live DNA preview), `/zombie/:id` details (+rename, +approve), `/avengers`, `/battle` (vs Avengers arena + PvP vs zombies), `/activity`, `/settings`, `/gallery` (wallet-free art page). Served with `/legacy/` (original trio) from `scripts/serve.js` on 8080.
- **Tests**: Truffle = 6 starter + 20 master scenarios + 4 Avenger; Vitest unit tests (DNA/art, tx state machine, error mapping).
- **Docs**: `README.md`, `CHANGES.md`, `docs/PROJECT.md` (whole project explained: bullets, ASCII diagrams, per-flow steps, no long paragraphs), `docs/PPTX_PROMPT.md` (detailed Codex prompt to make `ZOMBIENEXUS.pptx`), `docs/SPEC.md` (frozen interfaces), `docs/PLAN.md`, `docs/PROGRESS.md`, `docs/agent-notes/*`.

## 3. Verified facts (do not re-derive)
- Starter inheritance: Ownable -> ZombieFactory -> ZombieFeeding -> ZombieHelper -> ZombieAttack -> ZombieOwnership (+ERC721). Compiles only as 0.4.x. Odd file `contracts/2_crypto_zombies.js` exists in the starter (leave it).
- **Starter bugs**: `_transfer` decrements `ownerZombieCount[msg.sender]` not `_from` (zombieownership.sol:23) -> phantom id 0, sender stuck; approvals never cleared; `transferFrom` never checks `_from`; `attack` has no readiness check (wins revert on cooldown, losses succeed); `rand <= 70` = 71% win; predictable randomness; self-attack allowed; `levelUp` ownerless + exact fee; `feedOnKitty` reverts while kitty unset; new zombie has 24h cooldown; one free zombie per address.
- **Legacy `index.html` defects**: hard-coded address at line 34 (`0xC08d276D3022F1E9E1e99eBAa6410fE4FcbEcB8f`); Level Up passes whole id array; raw-HTML names (XSS, documented not fixed); deprecated `ethereum.enable()`; `ethereum.on` unguarded. Edit **line 34 only**.
- Env: macOS arm64, no Rosetta (Ganache GUI cannot run). System Node v26.8.2, npm 11.19.1. Ports 7545/8080/5173/8545 free. Truffle 5.4.25 solc hosts dead + `compile` exits 1 on Node>=20 -> use **Truffle 5.11.5**. ganache 7.9.2 runs on Node 26 with JS fallbacks (uWS/bigint warnings expected). `evm_setTime` = ms; `evm_increaseTime` = seconds; time offset is memory-only. Ganache `dbPath`/`accountKeysPath` do NOT auto-create parent dirs. `eth_call` uses parent block timestamp.
- MetaMask: `ethereum.request({method:'eth_requestAccounts'})`; reset = Settings > Advanced > Clear activity tab data (nonce); per network. `chainChanged` can fire mid-connect: guard handlers, no page reload.
- Pins (audit-verified; Haiku re-checks in W0): node 22.23.3 (fallback only), truffle 5.11.5, ganache 7.9.2, solc 0.4.25, react/react-dom 19.3.1, react-router 7.18.4, ethers 6.17.0, lucide-react 1.57.0, vite 8.3.4, @vitejs/plugin-react 6.1.2, tailwindcss + @tailwindcss/vite 4.3.3, typescript 6.0.3 (needs `"types":["vite/client"]`), @types/react 19.3.0, @types/react-dom 19.3.0, vitest 5.0.4. New (verify with `npm view`): `motion`, `@fontsource/space-grotesk`, `@fontsource/inter`, `@testing-library/react`+`jsdom` if needed.
- Starter deps removed from package.json: browser-sync, openzeppelin-solidity, truffle-hdwallet-provider, web3.

## 4. Contract spec (0.4.25; UNVERIFIED until compiled — Opus O1 reviews)
```solidity
// zombieownership.sol
function _transfer(address _from, address _to, uint256 _tokenId) private {
  ownerZombieCount[_to] = ownerZombieCount[_to].add(1);
  ownerZombieCount[_from] = ownerZombieCount[_from].sub(1);   // was msg.sender
  zombieToOwner[_tokenId] = _to;
  delete zombieApprovals[_tokenId];
  emit Transfer(_from, _to, _tokenId);
}
function transferFrom(address _from, address _to, uint256 _tokenId) external payable {
  require(zombieToOwner[_tokenId] == _from, "from is not the owner");
  require(_from == msg.sender || zombieApprovals[_tokenId] == msg.sender, "not owner or approved");
  require(_to != address(0), "zero address");
  _transfer(_from, _to, _tokenId);
}
```
- `zombieattack.sol attack()`: FIRST statement `require(_targetId < zombies.length, "no such target")`; then `require(_isReady(myZombie), "zombie is not ready")`; `bool won = rand <= attackVictoryProbability;` (71% kept); `emit Battle(_zombieId, _targetId, won)`.
- **`attackAvenger(uint _zombieId, uint _avengerId)`**: `onlyOwnerOf(_zombieId)`, `_isReady`, avenger must exist (`_avengerId < avengerContract.totalAvengers()`); `power = (genes % 10) + 1`; `chance = clamp(50 + 5*level - 5*power, 10, 90)` computed in int256 (no uint underflow); win if `randMod(100) < chance`; win: winCount++, level++; loss: lossCount++; both `_triggerCooldown`; `emit AvengerBattle(_zombieId, _avengerId, won)`. No `feedAndMultiply` on win.
- `zombiehelper.sol`: `uint public levelUpFee = 0.001 ether;` `event LevelUp(uint indexed zombieId, uint newLevel);` `levelUp()` requires `_zombieId < zombies.length` and emits; `function getZombieCount() external view returns (uint)`.
- `zombiefeeding.sol`: `AvengerInterface` (replaces `KittyInterface`; `getAvenger(uint) -> same 10-tuple as getKitty`), `AvengerInterface public avengerContract;`, `setAvengerContractAddress(address)` (onlyOwner), `feedOnAvenger(uint _zombieId, uint _avengerId)`, `event AvengerFed(uint indexed zombieId, uint indexed avengerId)`. Species string `"avenger"` -> DNA ends in `99` (hero zombie).
- `contracts/avengercontract.sol`: `AvengerContract` — `createAvenger(uint256 genes)` open to anyone, emits `Birth`; `totalAvengers()`; `getAvenger(uint256)` with `require(_id < avengers.length, "no such avenger")`.
- Migration 2 deploys `ZombieOwnership` by contract name; migration 3 deploys `AvengerContract` and calls `setAvengerContractAddress`.
- Unchanged + documented: ownerless `levelUp`, 71% PvP win rate, self-attack possible (UI lists only others' zombies), predictable randomness, `withdraw` via `transfer`.
- The legacy page's "Feed on Kitty" button stops working (renamed); not part of the 24-pt trio.

## 5. Chain, accounts, seed
- Deterministic deployer -> contract addresses stable after any wipe -> `index.html:34` set once to the ZombieOwnership address.
- Accounts: [0] deployer/seeder/opponent (never imported to MetaMask); A=[1] army; B=[2] fresh, does a live Create and receives a transfer; C=[3] runs legacy trio.
- Seed ([0] acts): create+transfer zombies to A (5 total, varied DNA/levels); keep Warden as opponent; mint 6 Avengers; end with `evm_increaseTime(90000)` + `evm_mine` (removes 24h wait). `chain.js` on start: `evm_setTime(max(now,lastBlock+1s ms))` then `evm_mine`.
- `scripts/export.js` -> `frontend/public/deployment.json` (gitignored): chainId, addresses, ABIs. `scripts/check.js`: net_version 1337 & eth_chainId 0x539; code at both addresses; `avengerContract()` equals avenger address; `index.html:34` equals ZombieOwnership address. PASS/FAIL/SKIP; exit 1 on FAIL.
- `scripts/serve.js`: whitelist static server 127.0.0.1:8080, app at `/`, legacy at `/legacy/` (`index.html`, `cryptozombies_abi.js`, `favicon.ico`); never serves `.ganache/keys.json`.
- `scripts/test.js`: Ganache on 8545 + async `spawn` of `truffle test --network test`.
- npm scripts: `setup`, `compile`, `chain`, `migrate`, `seed`, `export`, `check`, `serve`, `demo` (start chain -> migrate+seed if DB empty -> export -> check -> serve), `reset`, `snapshot`, `restore`, `doctor`, `test`, `test:ui`, `build`, `dev`, `changes`.
- `solc` via absolute `path.join(__dirname,'node_modules','solc','soljson.js')`.
- `scripts/doctor.js`: Node >= 20, ports 7545/8080 free, registry reachable.
- `.npmrc`: `ignore-scripts=true`, `save-exact=true`, `update-notifier=false`, `audit=false`, `fund=false`, `cache=.npm-cache`.

## 6. Frontend spec (details frozen in docs/SPEC.md by Opus D0)
- Palette: charcoal `#0B0D10`, electric green `#39FF88`, muted purple, gold for rare/hero. System + @fontsource Space Grotesk/Inter (self-hosted). All art original SVG (no Marvel logos/official art; hero names are text only: Iron Man, Captain America, Thor, Hulk, Black Widow, Hawkeye = `roster[genes % 6]`).
- Look: glass cards + faint grain, glow hover, rarity frames, sidebar (desktop) / bottom nav (mobile), sticky wallet pill with network status, toasts, skeleton loaders, designed empty states, responsive.
- Motion: `motion` + CSS keyframes; floating cards, shimmer rarity, tx stepper, hero-zombie reveal, clash animation in arena. Fallback to CSS only if `motion` pin fails.
- Zombie art: layered SVG (aura, skin, eyes, mouth, clothes, accessory) from DNA digits; level adds glow; rarity frame common/rare(gold)/hero(DNA ends 99 -> mask+armor). Card layout mirrors `CryptoZombieCard.jpeg`. Cards show only on-chain fields.
- Wallet states: `no-metamask | disconnected | connecting | wrong-network | no-contract | rpc-down | ready`. EIP-6963 discovery with `window.ethereum` fallback. Switch via `wallet_switchEthereumChain`, then `wallet_addEthereumChain` on 4902. Listeners registered once, removed on unmount, no reload on `chainChanged`.
- Tx states: idle, awaiting-signature, pending, confirmed, reverted, rejected, failed. Success only when `receipt.status === 1`. `attack`/`attackAvenger` use `gasLimit: 300000`. Five readable error messages. DNA is `BigInt`. Readiness judged against latest block time.
- Battle arena: zombie left, Avenger right, clash animation; result comes from the on-chain event; health bars decorative only (no fake stats). Two modes: vs Avengers (main), vs Zombies (PvP vs Warden).
- Factory: live DNA preview `keccak256(utf8(name)) % 10^16` matching the contract; create (one free per address) + Infect (feed on Avenger). Army grid sort/filter (rarity, level, ready/cooling).
- Zombie detail: rename (level >= 2), approve, transfer, level up (fee 0.001 ETH).
- `/gallery`: 12 zombies + 6 Avengers, wallet-free.
- No hard-coded addresses in `frontend/src` (read `deployment.json`).

## 7. Agents, waves, gates
Rules for EVERY agent: no git (not even read-only), no browser/MCP tools, no writes outside the project, no global installs, no real personal data, disjoint file ownership, write `docs/agent-notes/<agent>.md` (<=150 words: files written, checks run, open items) then a `.done` marker file `docs/agent-notes/<agent>.done`, final report <=150 words.

- **W0 (parallel)**: Env (Sonnet): `.npmrc`, `.gitignore` extension, `package.json`, `truffle-config.js`, `scripts/changes.js`, install, compile starter, baseline check. Pin audit (Haiku): `npm view` for all pins. **Opus D0**: write `docs/SPEC.md`. -> **G0 (Opus verdict)**.
- **W1 (~14 agents)**: contracts+migrations (Sonnet) -> then Truffle tests (Sonnet), chain/seed/snapshot (Sonnet), Opus O1 contract review; parallel from start: scripts export/check/serve/doctor (Haiku), art + gallery (Sonnet), design system + UI kit + shell + motion (Sonnet), wallet/tx/contract layer (Sonnet), pages: Home+Detail, Create/Factory, Avengers, Battle, Activity+Settings (Sonnet each), Vitest (Sonnet), docs PROJECT/README/CHANGES (Haiku), PPTX_PROMPT (Sonnet).
- **Integration**: migrate, export, seed, check, `npm run build`, smoke test; 2 Sonnet fixers. -> **G1 (Opus verdict)**.
- **QA**: 5 reviewers (contracts security; frontend correctness/a11y/perf; visual from screenshots; TS/React; constraints+placeholder scan [Haiku]) -> Opus triage -> parallel fix agents -> round-2 re-verify -> **G2 (Opus verdict)**.
- **Finish**: screenshots of `/gallery` (browser, lead), golden snapshot, final docs, deliverable scan. Checkpoints: `.checkpoints/after-W0.tgz`, `after-W1.tgz`, ... + `shasum` manifests.
- **G4 (user)**: MetaMask E2E, rehearsal, screenshots, git, submit.

## 8. Progress-protection protocol
- `docs/PROGRESS.md` updated before each wave launches and right after each gate.
- Agents write `docs/agent-notes/*.md` + `.done` markers. On resume, re-run only agents without `.done`.
- Record Workflow `runId` + `scriptPath` in PROGRESS.md; resume with `resumeFromRunId`.
- `.checkpoints/` tarballs (no node_modules) + manifests per wave; gitignored.
- Memory pointer file in `~/.claude/projects/-Users-harshsiddhapura-Downloads-ZOMBIENEXUS/memory/` -> `docs/PROGRESS.md`.

## 9. Risks
- Truffle 5.11.5 on Node 26 untested (fallback: project-local Node 22 in `.tools/`, **ask user first**).
- Workflow concurrency cap unknown.
- Avenger odds unverified until tests run.
- MetaMask over Ganache HTTP; nonce mismatch after chain wipe -> reset activity data.
- If clock hits 3:30 with a red gate: ask the user before dropping anything.

## 10. Demo runbook (9:30)
Legacy trio as C (24 pts) -> B app tour + live Create -> A army + DNA art -> level up -> mint Avenger, feed, hero zombie -> battle Thor/Avengers -> PvP vs Warden -> transfer to B, switch to B -> tests + security wrap-up. No live network switch.
