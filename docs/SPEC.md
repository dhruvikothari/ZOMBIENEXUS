# ZOMBIENEXUS — SPEC (frozen contract for W1)

Owner: opus-d0-spec. Status: FROZEN at G0. Later agents treat this file as law. Changes only by an Opus ruling recorded in `docs/PROGRESS.md`.
Precedence: user request > `docs/PLAN.md` binding rules (§0) > this SPEC > MASTER_PROMPT. Where PLAN §4 said "unverified", the ruling here is marked **DECIDED**.
Verified while writing (2026-10-16): odds formula + 10-tuple getter compile on solc 0.4.25; Ganache 7.9.2 sends CORS headers (browser reads from :5173/:8080 to :7545 work); deterministic accounts/addresses below derived with ethers from the Ganache mnemonic; all lucide icon names in §5 exist in lucide-react 1.57.0; `motion/react` export exists.

---

## 1. CONTRACTS

### 1.1 Files and owner
| File | Agent | Change |
|---|---|---|
| `contracts/zombiefactory.sol` | w1-contracts | require message only |
| `contracts/zombiefeeding.sol` | w1-contracts | Kitty -> Avenger, messages |
| `contracts/zombiehelper.sol` | w1-contracts | public fee, LevelUp event, id checks, getZombieCount |
| `contracts/zombieattack.sol` | w1-contracts | ready check, Battle event, attackAvenger |
| `contracts/zombieownership.sol` | w1-contracts | transfer fixes |
| `contracts/avengercontract.sol` (new) | w1-contracts | AvengerContract |
| `migrations/2_deploy_contracts.js`, `migrations/3_deploy_avengers.js` (new) | w1-contracts | deploy |
| `ownable.sol`, `safemath.sol`, `erc721.sol`, `Migrations.sol`, `2_crypto_zombies.js`, `migrations/1_initial_migration.js` | nobody | untouched |

All files keep `pragma solidity ^0.4.25;`. Inheritance unchanged: Ownable -> ZombieFactory -> ZombieFeeding -> ZombieHelper -> ZombieAttack -> ZombieOwnership(+ERC721).

### 1.2 Zombie struct (unchanged, order is ABI)
`struct Zombie { string name; uint dna; uint32 level; uint32 readyTime; uint16 winCount; uint16 lossCount; }`
**DECIDED:** no per-field getters. Read via the public getter `zombies(uint) -> (name, dna, level, readyTime, winCount, lossCount)` (index 0..5). New zombie: level 1, readyTime = now + 1 day, counters 0. `cooldownTime = 1 days`, `dnaModulus = 10**16`.

### 1.3 Final public ABI of ZombieOwnership (deployed contract)
| Function | Mutability | Rule / require messages (exact strings) |
|---|---|---|
| `owner() view returns (address)` | view | Ownable |
| `isOwner() view returns (bool)` | view | Ownable |
| `renounceOwnership()` / `transferOwnership(address)` | onlyOwner | Ownable, unchanged (no message) |
| `zombies(uint256) view returns (string,uint256,uint32,uint32,uint16,uint16)` | view | out-of-range id reverts (invalid opcode, starter behaviour) |
| `zombieToOwner(uint256) view returns (address)` | view | 0x0 for unknown id |
| `createRandomZombie(string _name)` | nonpayable | `"only one free zombie per address"` when `ownerZombieCount[msg.sender] != 0`. DNA = `keccak256(abi.encodePacked(_name)) % 10**16`, then `- dna % 100` (ends `00`). Emits NewZombie |
| `avengerContract() view returns (address)` | view | public state var (type AvengerInterface) |
| `setAvengerContractAddress(address _address)` | onlyOwner | replaces setKittyContractAddress |
| `feedOnAvenger(uint _zombieId, uint _avengerId)` | nonpayable | order: `require(address(avengerContract) != address(0), "avenger contract not set")`; `require(_avengerId < avengerContract.totalAvengers(), "no such avenger")`; read genes (10th tuple value); `feedAndMultiply(_zombieId, genes, "avenger")`; `emit AvengerFed(_zombieId, _avengerId)` |
| `levelUpFee() view returns (uint256)` | view | `uint public levelUpFee = 0.001 ether;` |
| `levelUp(uint _zombieId)` payable | payable | `require(_zombieId < zombies.length, "no such zombie")`; `require(msg.value == levelUpFee, "wrong level up fee")`; level += 1 (SafeMath32); `emit LevelUp(_zombieId, newLevel)`. Ownerless (starter rule, documented) |
| `changeName(uint _zombieId, string _newName)` | nonpayable | modifiers `aboveLevel(2, id) onlyOwnerOf(id)` |
| `changeDna(uint _zombieId, uint _newDna)` | nonpayable | `aboveLevel(20, id) onlyOwnerOf(id)` |
| `getZombiesByOwner(address) view returns (uint256[])` | view | unchanged loop |
| `getZombieCount() view returns (uint256)` | view | `zombies.length` (new, external) |
| `setLevelUpFee(uint)` / `withdraw()` | onlyOwner | unchanged (`withdraw` uses `transfer`, documented) |
| `attack(uint _zombieId, uint _targetId)` | nonpayable | see 1.5 |
| `attackAvenger(uint _zombieId, uint _avengerId)` | nonpayable | see 1.5 |
| `balanceOf(address) view returns (uint256)` | view | `ownerZombieCount[_owner]` |
| `ownerOf(uint256) view returns (address)` | view | returns 0x0 for unknown id (no revert; documented) |
| `transferFrom(address _from, address _to, uint256 _tokenId)` payable | payable | `require(zombieToOwner[_tokenId] == _from, "from is not the owner")`; `require(_from == msg.sender \|\| zombieApprovals[_tokenId] == msg.sender, "not owner or approved")`; `require(_to != address(0), "zero address")`; `_transfer` |
| `approve(address _approved, uint256 _tokenId)` payable | payable | `onlyOwnerOf(_tokenId)`; emits Approval |

No `takeOwnership` (not in starter, not added). `feedOnKitty`, `setKittyContractAddress`, `KittyInterface`, `kittyContract` are removed.

Modifiers (exact):
```solidity
modifier onlyOwnerOf(uint _zombieId) { require(msg.sender == zombieToOwner[_zombieId], "not the zombie owner"); _; }
modifier aboveLevel(uint _level, uint _zombieId) {
  require(_zombieId < zombies.length, "no such zombie");
  require(zombies[_zombieId].level >= _level, "level too low"); _; }
```
`feedAndMultiply` keeps `internal onlyOwnerOf(_zombieId)` and becomes `require(_isReady(myZombie), "zombie is not ready");`; species check string `"avenger"` -> `newDna = newDna - newDna % 100 + 99`. New child is named `"NoName"`, owned by msg.sender; fed zombie gets cooldown.

`_transfer` (private): `_to` count +1, `_from` count -1 (was msg.sender), `zombieToOwner = _to`, `delete zombieApprovals[_tokenId]`, `emit Transfer(_from, _to, _tokenId)`.

### 1.4 Events (exact signatures)
| Contract | Event |
|---|---|
| ZombieFactory | `NewZombie(uint zombieId, string name, uint dna)` (unchanged; starter test reads `args.zombieId`, `args.name`) |
| ERC721 | `Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)`, `Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId)` |
| Ownable | `OwnershipTransferred(address indexed previousOwner, address indexed newOwner)` |
| ZombieFeeding | `AvengerFed(uint indexed zombieId, uint indexed avengerId)` |
| ZombieHelper | `LevelUp(uint indexed zombieId, uint newLevel)` |
| ZombieAttack | `Battle(uint indexed zombieId, uint indexed targetId, bool won)`, `AvengerBattle(uint indexed zombieId, uint indexed avengerId, bool won)` |
| AvengerContract | `Birth(address indexed owner, uint256 indexed avengerId, uint256 genes)` |
No rename event (changeName stays event-less; activity feed does not show renames).

### 1.5 Battles (zombieattack.sol) — DECIDED
`randMod` unchanged: `randNonce = randNonce.add(1); return uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % _modulus;` Nonce = the private `randNonce` state var of ZombieAttack, shared by `attack` and `attackAvenger`, starts at 0, first call hashes nonce 1. Predictable; documented as not secure.
```solidity
function attack(uint _zombieId, uint _targetId) external onlyOwnerOf(_zombieId) {
  require(_targetId < zombies.length, "no such target");
  Zombie storage myZombie = zombies[_zombieId];
  require(_isReady(myZombie), "zombie is not ready");
  Zombie storage enemyZombie = zombies[_targetId];
  uint rand = randMod(100);
  bool won = rand <= attackVictoryProbability;          // 70 -> 71% (kept, documented)
  if (won) { win++, level++ (mine); enemy loss++; feedAndMultiply(_zombieId, enemyZombie.dna, "zombie"); } // spawns "NoName", triggers cooldown
  else     { loss++ (mine); enemy win++; _triggerCooldown(myZombie); }
  emit Battle(_zombieId, _targetId, won);
}
function attackAvenger(uint _zombieId, uint _avengerId) external onlyOwnerOf(_zombieId) {
  require(address(avengerContract) != address(0), "avenger contract not set");
  require(_avengerId < avengerContract.totalAvengers(), "no such avenger");
  Zombie storage myZombie = zombies[_zombieId];
  require(_isReady(myZombie), "zombie is not ready");
  uint genes;
  (,,,,,,,,,genes) = avengerContract.getAvenger(_avengerId);
  uint power = (genes % 10) + 1;                                        // 1..10
  int256 chance = 50 + 5 * int256(myZombie.level) - 5 * int256(power); // signed: no uint underflow
  if (chance < 10) chance = 10;
  if (chance > 90) chance = 90;
  bool won = randMod(100) < uint256(chance);                            // cast safe: 10..90
  if (won) { myZombie.winCount = myZombie.winCount.add(1); myZombie.level = myZombie.level.add(1); }
  else     { myZombie.lossCount = myZombie.lossCount.add(1); }
  _triggerCooldown(myZombie);
  emit AvengerBattle(_zombieId, _avengerId, won);
}
```
No `feedAndMultiply` on Avenger wins. Self-attack stays possible on-chain (UI lists only other owners' zombies). Avenger existence is pre-checked locally because 0.4.25 revert-reason bubbling from external calls is not relied on.
Frontend mirror (lib/roster.ts `winChance`): `clamp(50 + 5*level - 5*power, 10, 90)` percent. PvP shown as "71%".

### 1.6 AvengerContract (contracts/avengercontract.sol), standalone, no imports
```solidity
contract AvengerContract {
  struct Avenger { uint256 genes; uint256 birthTime; }
  Avenger[] avengers;
  event Birth(address indexed owner, uint256 indexed avengerId, uint256 genes);
  function createAvenger(uint256 _genes) external returns (uint256)  // open to anyone; push(genes, now); emit Birth(msg.sender, id, _genes)
  function totalAvengers() external view returns (uint256)            // avengers.length
  function getAvenger(uint256 _id) external view returns (bool isGestating, bool isReady, uint256 cooldownIndex,
    uint256 nextActionAt, uint256 siringWithId, uint256 birthTime, uint256 matronId, uint256 sireId,
    uint256 generation, uint256 genes)   // require(_id < avengers.length, "no such avenger"); returns (false,true,0,0,0,birthTime,0,0,0,genes)
}
```
`AvengerInterface` (declared in zombiefeeding.sol) = `getAvenger` (same 10-tuple) + `totalAvengers()`. `AvengerInterface public avengerContract;` lives in ZombieFeeding.

### 1.7 Revert message catalogue (used by lib/errors.ts and tests)
`not the zombie owner`, `only one free zombie per address`, `no such zombie`, `level too low`, `zombie is not ready`, `wrong level up fee`, `no such target`, `avenger contract not set`, `no such avenger`, `from is not the owner`, `not owner or approved`, `zero address`. Ownable `onlyOwner` reverts without a reason.

---

## 2. AVENGER ROSTER AND SEED

### 2.1 Roster (index = genes % 6, power = genes % 10 + 1). Avenger ids 0..5 are minted in this order, so id == index for seeded ones.
Parity note: genes%6 and genes%10 share parity, so even-index heroes get odd power. Values verified with BigInt.
| idx | Hero | genes (seed) | power | palette (original art, no logos) |
|---|---|---|---|---|
| 0 | Iron Man | 7319028465120486 | 7 | crimson #C8323C + gold #E3B341, faceplate with glowing slits, chest light |
| 1 | Captain America | 1846203957461125 | 6 | navy #2C4A8C + white + red #C23B3B, round ringed shield (no star) |
| 2 | Thor | 9902671358840708 | 9 | steel #8A96A8 + cape red #B0302A, hammer silhouette, storm aura |
| 3 | Hulk | 4471935026689137 | 8 | green #4E9A3A + purple #5B3A8C shorts, huge shoulders |
| 4 | Black Widow | 2638470915573364 | 5 | black #1B1D22 + red #D23B3B, red hair, hourglass belt |
| 5 | Hawkeye | 5560218743309963 | 4 | purple #6A3FA0 + black, bow + arrow, visor |
Hero names are plain text only.

### 2.2 Accounts (Ganache deterministic mnemonic; seed reads `eth_accounts`, never hard-codes)
| Role | Index | Expected address (verify vs `.ganache/keys.json`) | Use |
|---|---|---|---|
| D deployer/seeder/opponent | [0] | 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 | never imported to MetaMask |
| A army | [1] | 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0 | main demo wallet |
| B fresh | [2] | 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b | live Create, receives transfer |
| C legacy | [3] | 0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d | legacy trio; must own exactly one zombie |
Expected contract addresses with Migrations present (deployer nonces 2 and 4): ZombieOwnership `0xCfEB869F69431e42cdB54A4F4f105C19C080A601`, AvengerContract `0xC89Ce4735882C9F0f0FE26686c53074E09B0D550`. Informational only; the truth is `build/contracts` / `deployment.json`; `index.html:34` is set by the lead from `deployment.json` after the first migrate.

### 2.3 Seed script (`scripts/seed.js`, ethers v6 CJS, Ganache unlocked signers via `provider.getSigner(addr)`)
Preconditions: RPC 127.0.0.1:7545 up, artifacts deployed on 1337, `getZombieCount() == 0` else print `already seeded` and exit 1. Every tx awaited; any failure -> exit 1.
1. D: `createAvenger(genes)` for roster idx 0..5 -> avenger ids 0..5.
2. D: for name in `Rotfang, Grimjaw, Mossbelly, Duskwalker`: `createRandomZombie(name)` then `transferFrom(D, A, id)` -> ids 0..3 owned by A.
3. D: `createRandomZombie("The Warden")` -> id 4, kept by D.
4. D: `levelUp` (value `levelUpFee()`): id0 x1, id2 x4, id3 x7, id4 x2.
5. `evm_increaseTime(90000)` + `evm_mine`.
6. A: `feedOnAvenger(0, 2)` (Rotfang eats Thor) -> id 5 hero, DNA 6212148620395099.
7. D: `levelUp(5)` x1; A: `changeName(5, "Thunderrot")`.
8. `evm_increaseTime(90000)` + `evm_mine` (final; removes the 24h wait).
9. Assert and print table: `getZombieCount()==6`, `balanceOf(A)==5`, `balanceOf(D)==1`, `zombies(5).dna==6212148620395099`, `totalAvengers()==6`, every `readyTime <= latest block timestamp`.

Seeded state (expected; DNA = keccak preview, verified):
| id | name | owner | level | DNA | rarity |
|---|---|---|---|---|---|
| 0 | Rotfang | A | 2 | 2521625881949400 | common |
| 1 | Grimjaw | A | 1 | 2729772995698500 | common |
| 2 | Mossbelly | A | 5 | 9343918324261100 | rare (top pair 93) |
| 3 | Duskwalker | A | 8 | 8887902053609700 | common |
| 4 | The Warden | D | 3 | 5861794999842000 | common |
| 5 | Thunderrot | A | 2 | 6212148620395099 | hero |
**Ready at demo start: all six (ids 0-5).** B and C own nothing. Demo use: feed = Rotfang, Avenger battle = Duskwalker (L8 vs Hawkeye 70% / vs Thor 45%), PvP = Mossbelly vs Warden, transfer = Grimjaw -> B, spare = Thunderrot.

---

## 3. DEPLOYMENT AND SCRIPTS

### 3.1 Migrations
- `2_deploy_contracts.js`: `deployer.deploy(artifacts.require("ZombieOwnership"))` only (no library/base deploys; SafeMath is internal).
- `3_deploy_avengers.js`: `async (deployer) => { await deployer.deploy(AvengerContract); const zo = await ZombieOwnership.deployed(); await zo.setAvengerContractAddress(AvengerContract.address); }`.

### 3.2 truffle-config.js requirements (dev-env W0; lead patches at G0 if missing)
`development {host:"127.0.0.1", port:7545, network_id:"1337"}`, `test {host:"127.0.0.1", port:8545, network_id:"*"}`, `compilers.solc.version = path.join(__dirname,"node_modules","solc","soljson.js")`, `mocha.timeout = 100000`.

### 3.3 deployment.json (`frontend/public/deployment.json`, gitignored, written by export.js)
```json
{ "chainId": 1337, "networkName": "Ganache 1337", "rpcUrl": "http://127.0.0.1:7545",
  "deployedAtBlock": 0, "generatedAt": "<ISO-8601>",
  "contracts": { "ZombieOwnership": { "address": "0x<checksummed>", "abi": [] },
                 "AvengerContract": { "address": "0x<checksummed>", "abi": [] } } }
```
`deployedAtBlock` = block of ZombieOwnership's deploy tx (artifact `transactionHash` receipt). ABIs copied from `build/contracts/*.json`.

### 3.4 Ports and `.ganache/` layout
Ports: 7545 chain, 8080 app+legacy (serve.js), 5173 vite dev, 8545 test chain. All bound to 127.0.0.1.
`.ganache/db/` (Ganache dbPath), `.ganache/keys.json` (accountKeysPath, 10 accounts), `.ganache/snapshots/golden.tar`. Scripts `mkdirSync(recursive)` these first. **keys.json is never served** (serve.js whitelist) and never copied into docs.
Ganache options: `chain {chainId:1337, networkId:1337}`, `wallet {deterministic:true, totalAccounts:10, defaultBalance:1000, accountKeysPath}`, `database {dbPath}`, `logging {quiet:true}`; defaults otherwise.

### 3.5 Scripts (plain CommonJS Node; each runnable as CLI and `require`-able; `if (require.main === module)`)
Output lines are `PASS|FAIL|SKIP|WARN  <text>`. Exit 0 ok, 1 failure, 2 usage error.
| Script | Owner | Export | CLI behaviour |
|---|---|---|---|
| `chain.js` | w1-chain | `startChain() -> {server, url, close()}` | If :7545 answers `eth_chainId 0x539` print "already running", exit 0; port busy otherwise exit 1. Start Ganache, then `evm_setTime(max(Date.now(), lastBlockTs*1000+1000))` (ms) + `evm_mine`; print URL + role table; run until SIGINT, then `server.close()` |
| `seed.js` | w1-chain | `seed(rpcUrl)` | §2.3 |
| `state.js` | w1-chain | — | `reset`: refuse (exit 1) if :7545 in use; delete `.ganache/db` and `keys.json`. `snapshot`: refuse if running; `tar -cf .ganache/snapshots/golden.tar -C .ganache db`. `restore`: refuse if running; exit 1 if no golden.tar; delete db, `tar -xf golden.tar -C .ganache`. Unknown arg -> exit 2 |
| `demo.js` | w1-chain | — | 1 reuse or `startChain()`; 2 if `blockNumber == 0`: spawn `node scripts/run.js truffle migrate --reset --network development`, then `seed()`; 3 if `frontend/dist/index.html` missing run `npm run build` steps via run.js; 4 `exportDeployment()`; 5 `runChecks()` (false -> close, exit 1); 6 `startServer()`; print `App http://127.0.0.1:8080/  Legacy http://127.0.0.1:8080/legacy/`; SIGINT closes server and chain |
| `export.js` | w1-scripts | `exportDeployment()` | artifacts missing / not on network 1337 / RPC down -> exit 1 |
| `check.js` | w1-scripts | `runChecks() -> boolean` | items: net_version 1337; eth_chainId 0x539; code at ZombieOwnership; code at AvengerContract; `avengerContract()` == Avenger address; `index.html` line 34 contains the ZombieOwnership address (case-insensitive); deployment.json addresses == artifacts; `getZombieCount() >= 6` (SKIP, not FAIL, when lower). Exit 1 on any FAIL |
| `serve.js` | w1-scripts | `startServer({port=8080})` | GET/HEAD only (else 405). `/deployment.json` -> `frontend/public/deployment.json` with `Cache-Control: no-store`; `/legacy` -> 301 `/legacy/`; `/legacy/` -> ROOT `index.html`; `/legacy/cryptozombies_abi.js`, `/legacy/favicon.ico`; files under `frontend/dist` (resolved path must stay inside dist, `..` -> 404); extension-less path -> `frontend/dist/index.html` (SPA fallback); dist missing -> 503 "Run npm run build"; everything else 404 |
| `doctor.js` | w1-scripts | — | Node >= 20.19 (FAIL below); Node < 22.22 WARN "npm run test:ui needs Node 22.22+"; `node_modules` + `node_modules/solc/soljson.js` exist (FAIL); ports 7545/8080 free (WARN if busy); registry `https://registry.npmjs.org/` reachable in 3 s (WARN). Exit 1 on FAIL |
| `test.js` | w1-scripts | — | Port 8545 busy -> exit 1. In-process Ganache on 8545 (chainId 1337, deterministic, no db, quiet), `spawn` `node scripts/run.js truffle test --network test ...argv`, exit with its code, close server |
`changes.js`, `run.js`: dev-env (W0), unchanged.

---

## 4. FRONTEND ARCHITECTURE

### 4.1 Tree (`frontend/src`, alias `@` = `frontend/src`)
```
main.tsx  App.tsx  index.css  vite-env.d.ts
lib/        types.ts deployment.ts chain.ts contracts.ts wallet.tsx tx.ts errors.ts hooks.ts format.ts   (w1-data)
            dna.ts roster.ts                                                                          (w1-art)
components/ui/      Button Card Badge Stat Modal Toast Skeleton EmptyState TxStepper Tabs Input Select ProgressBar Address .tsx (w1-ui)
components/layout/  AppShell Sidebar BottomNav Header WalletPill NetworkBadge WalletModal StatusBanner .tsx            (w1-ui)
components/art/     ZombieArt AvengerArt ZombieCard AvengerCard .tsx                                                  (w1-art)
pages/      HomePage ZombieDetailPage CreatePage AvengersPage BattlePage ActivityPage SettingsPage GalleryPage NotFoundPage .tsx
pages/<slug>/*      private sub-components of a page (slug = home|detail|create|avengers|battle|activity|settings)
test/       *.test.ts(x)                                                                                              (w1-vitest)
```
Every component file has at least one **named export** equal to the file name (`export function Button`); `Toast.tsx` additionally exports `ToastProvider` and `useToast`. Pages use `export default function HomePage()`. No barrel files. No new dependencies; data fetching = plain hooks + one external store.

### 4.2 Types (`lib/types.ts`)
```ts
export type Zombie = { id: number; name: string; dna: bigint; level: number; readyTime: number; winCount: number; lossCount: number; owner: string };
export type Avenger = { id: number; genes: bigint; birthTime: number; heroIndex: number; heroName: string; power: number };
export type Rarity = 'common' | 'rare' | 'hero';
export type Head = { blockNumber: number; timestamp: number };
export type WalletStatus = 'no-metamask' | 'disconnected' | 'connecting' | 'wrong-network' | 'no-contract' | 'rpc-down' | 'ready';
export type WalletState = { status: WalletStatus; address: string | null; chainId: number | null; balance: bigint | null; reason: string | null; providerName: string | null };
export type ErrorKind = 'rejected' | 'funds' | 'network' | 'reverted' | 'unknown';
export type AppError = { kind: ErrorKind; message: string; detail?: string };
export type TxStatus = 'idle' | 'awaiting-signature' | 'pending' | 'confirmed' | 'reverted' | 'rejected' | 'failed';
export type TxState = { status: TxStatus; label: string; hash: string | null; receipt: import('ethers').TransactionReceipt | null; error: AppError | null };
export type ContractInfo = { address: string; abi: import('ethers').InterfaceAbi };
export type Deployment = { chainId: number; networkName: string; rpcUrl: string; deployedAtBlock: number; generatedAt: string; contracts: { ZombieOwnership: ContractInfo; AvengerContract: ContractInfo } };
export type ActivityItem = { key: string; event: string; contract: 'ZombieOwnership' | 'AvengerContract'; args: Record<string, string>; blockNumber: number; timestamp: number; txHash: string; from: string; gasUsed: bigint };
export type Loadable<T> = { data: T | null; loading: boolean; error: AppError | null; refetch: () => void };
```

### 4.3 Module APIs (exact names)
**lib/deployment.ts**: `EXPECTED_CHAIN_ID = 1337`; `loadDeployment(): Promise<Deployment>` (fetch `/deployment.json`, `cache:'no-store'`, shape-checked, promise cached; throws `Error('deployment.json missing')`).
**lib/chain.ts**: `getReadProvider(dep: Deployment): JsonRpcProvider` (singleton, `new JsonRpcProvider(dep.rpcUrl, dep.chainId, { staticNetwork: true })`); `useHead(): Head | null`; `useBlockTime(): number | null` (= head.timestamp); `refreshHead(): Promise<void>`. Head store: `useSyncExternalStore`; polls `eth_blockNumber` every **4000 ms** while any subscriber exists and `document.visibilityState === 'visible'`; on change fetches the block timestamp. Reads always go through this direct RPC provider (works without MetaMask).
**lib/contracts.ts**: `zombieRead(dep): Contract`; `avengerRead(dep): Contract`; `zombieWrite(dep, signer): Contract`; `avengerWrite(dep, signer): Contract`; `fetchZombie(dep, id: number): Promise<Zombie>`; `fetchAvenger(dep, id: number): Promise<Avenger>`; `parseReceipt(dep, receipt): { name: string; args: Record<string, string> }[]` (decodes logs of both contracts, unknown logs skipped); `BATTLE_GAS_LIMIT = 300000n`.
**lib/wallet.tsx**: `WalletProvider({ children })`; `useWallet(): WalletState & { deployment: Deployment | null; connect(): Promise<void>; disconnect(): void; switchNetwork(): Promise<void>; refresh(): Promise<void>; getSigner(): Promise<JsonRpcSigner> }`.
- Discovery: on mount listen `eip6963:announceProvider`, dispatch `eip6963:requestProvider`; after 500 ms pick `info.rdns === 'io.metamask'`, else first announced, else `window.ethereum`, else `no-metamask`.
- Status precedence: `rpc-down` (read provider `eth_chainId` fails or deployment missing) > `no-contract` (`getCode(ZombieOwnership) === '0x'`) > `no-metamask` > `connecting` > `disconnected` > `wrong-network` > `ready`.
- `wrong-network` when wallet `eth_chainId !== 0x539` (reason `chain`), or when the wallet's own `eth_getCode(ZombieOwnership)` is `0x` (reason `rpc`: MetaMask's chain-1337 entry points to another RPC such as Localhost 8545).
- `connect()` = `eth_requestAccounts`; on load use silent `eth_accounts` unless localStorage `zn.disconnected === '1'`. `disconnect()` sets that flag and clears the address (app session only; copy says it does not revoke MetaMask permission). `connect()` clears it.
- `switchNetwork()` = `wallet_switchEthereumChain {chainId:'0x539'}`; on error code 4902 -> `wallet_addEthereumChain {chainId:'0x539', chainName:'Ganache 1337 (ZOMBIENEXUS)', rpcUrls:['http://127.0.0.1:7545'], nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18}}`.
- Listeners `accountsChanged`, `chainChanged`, `disconnect` registered once per selected provider inside one `useEffect`, removed with `removeListener` in cleanup. Handlers ignore payloads and call `refresh()`, which re-reads `eth_accounts` + `eth_chainId`; a monotonically increasing request id drops stale results (chainChanged mid-connect). **No page reload anywhere.** Balance re-read on every head change.
- `getSigner()` = `new BrowserProvider(eip1193).getSigner(address)`; throws AppError kind `network` if status !== `ready`.
**lib/tx.ts**: `INITIAL_TX: TxState`; `type TxAction = {type:'start';label:string} | {type:'sent';hash:string} | {type:'mined';receipt:TransactionReceipt} | {type:'error';error:AppError} | {type:'reset'}`; `txReducer(s, a): TxState` (pure: start->awaiting-signature, sent->pending, mined status 1->confirmed else reverted, error kind rejected->rejected / reverted->reverted / other->failed, reset->INITIAL_TX); `useTx(): { state: TxState; busy: boolean; run(label: string, send: (signer: JsonRpcSigner) => Promise<{ hash: string }>): Promise<TransactionReceipt | null>; reset(): void }`.
`run`: returns null immediately while busy (no double submit) -> start -> `send(await getSigner())` -> sent + info toast -> `getReadProvider(dep).waitForTransaction(hash, 1, 120000)` -> **success only when `receipt.status === 1`** -> `refreshHead()` + success toast -> return receipt. Status 0 or null -> reverted, error toast, return null. Thrown errors -> `mapError`. Callers pass `{ gasLimit: BATTLE_GAS_LIMIT }` for `attack`/`attackAvenger` only (win path costs more than an estimate taken on the loss path); everything else lets ethers estimate (estimate surfaces revert reasons before signing).
**lib/errors.ts**: `mapError(err: unknown): AppError`; `friendlyReason(reason: string): string`. Reason extraction order: `err.reason`, `err.revert?.args?.[0]`, regex `/revert(?:ed)?(?: with reason string)?[: ]+'?([^'"\n]+)/` on `shortMessage`, `message`, `info.error.message`, `error.message`.
| kind | detection | message |
|---|---|---|
| rejected | code `ACTION_REJECTED` or 4001 | You rejected the request in MetaMask. Nothing was sent. |
| funds | code `INSUFFICIENT_FUNDS` or /insufficient funds/i | This account does not have enough test ETH for gas and fees. |
| network | code 4902, `NETWORK_ERROR`, status not ready, or /nonce/i | Wrong network: switch MetaMask to Ganache (chain 1337, RPC http://127.0.0.1:7545). For /nonce/: MetaMask is out of sync with the local chain. Settings > Advanced > Clear activity tab data, then retry. |
| reverted | `CALL_EXCEPTION`, receipt status 0, or a reason found | The contract rejected this action: `friendlyReason(reason)` (fallback: "it reverted without a reason.") |
| unknown | anything else, RPC fetch failures | Something went wrong talking to the local chain. Is `npm run demo` running? |
`friendlyReason` map: not the zombie owner -> You do not own this zombie. / only one free zombie per address -> This address already owns a zombie; one free zombie per address. / zombie is not ready -> This zombie is still cooling down. / level too low -> This zombie's level is too low for that. / no such zombie, no such target -> That zombie does not exist. / no such avenger -> That Avenger does not exist. / wrong level up fee -> Level up costs exactly 0.001 ETH. / not owner or approved -> Only the owner or the approved address can transfer this zombie. / from is not the owner -> The sender does not own this zombie. / zero address -> Cannot transfer to the zero address. / avenger contract not set -> The Avenger contract is not connected. Unknown reasons are shown verbatim.
**lib/dna.ts** (w1-art): `DNA_MOD = 10n ** 16n`; `normalizeDna(dna: bigint): bigint`; `dnaString(dna): string` (16 chars, zero-padded); `dnaPair(dna, i: number): number` = `Number((dna % DNA_MOD) / 10n ** BigInt(2*i) % 100n)` (i=0 is the last two digits); `previewDna(name: string): bigint` = `BigInt(keccak256(toUtf8Bytes(name))) % DNA_MOD` minus `% 100n` (matches `createRandomZombie`; Rotfang -> 2521625881949400n); `heroDna(myDna: bigint, genes: bigint): bigint` = `((myDna + genes % DNA_MOD) / 2n)` then `- x % 100n + 99n`; `isHero(dna)` = `dna % 100n === 99n`; `rarityOf(dna): Rarity` = hero if isHero, rare if `dnaPair(dna,7) >= 90`, else common; `decodeDna(dna): Traits` with `export type Traits = { species: 'zombie' | 'hero'; accessory: number; clothes: number; mouth: number; eyes: number; skin: number; head: number; aura: number }` (exported from `lib/dna.ts`; each numeric value = pair % variant count; `species` = 'hero' iff pair 0 is 99):
| pair i | digits | trait | variant |
|---|---|---|---|
| 0 | 15-16 | species | 99 = hero overlay, else normal |
| 1 | 13-14 | accessory | %6: none, helmet+goggles, pirate hat, flat cap, bandana, headphones |
| 2 | 11-12 | clothes | %6: torn tank top, striped shirt, lab coat, leather jacket, hoodie, suit+tie |
| 3 | 9-10 | mouth | %5: stitched, jagged teeth, drool, gap grin, frown |
| 4 | 7-8 | eyes | %6: hollow, mismatched, glowing slits, stitched X, droopy, three-eyed |
| 5 | 5-6 | skin | %8 -> `SKIN = ['#7FB069','#8DBF5A','#6FA37A','#9BBF7A','#7A9E8E','#A3B86C','#5E8C6A','#8FA89B']` |
| 6 | 3-4 | head | %4: round, square jaw, tall skull, lumpy stitched |
| 7 | 1-2 | aura + rarity roll | %5: toxic green, purple mist, teal ring, ember, swirl; `>= 90` rare |
Also `TRAIT_NAMES` (labels above) and `levelTier(level): 0|1|2|3` = L1:0, 2-4:1, 5-9:2, >=10:3.
**lib/roster.ts** (w1-art): `ROSTER: { index; name; genes: bigint; color; accent }[]` (table 2.1); `heroIndex(genes) = Number(genes % 6n)`; `heroName(genes)`; `powerOf(genes) = Number(genes % 10n) + 1`; `winChance(level, power) = Math.min(90, Math.max(10, 50 + 5*level - 5*power))`; `PVP_WIN_CHANCE = 71`; `randomGenes(): bigint` (crypto.getRandomValues -> BigInt % 10n**16n).
**lib/format.ts**: `shortAddress(a)` `0x1234…abcd`; `formatEth(wei: bigint, digits=4)`; `formatDna(dna)` groups of 4 with thin spaces; `formatDuration(sec)` `1d 2h` / `3h 12m` / `45s`; `timeAgo(ts, nowTs)` uses **chain time** (head timestamp), never `Date.now()` (chain runs ~50 h ahead); `isReady(z, headTs) = z.readyTime <= headTs`.
**lib/hooks.ts** (all return `Loadable<T>`): `useZombies(owner?: string): Loadable<Zombie[]>` (owner -> `getZombiesByOwner`; no owner -> ids `0..getZombieCount()-1` with `zombieToOwner`); `useZombie(id: number): Loadable<Zombie>` (id >= count -> error `no such zombie`); `useAvengers(): Loadable<Avenger[]>`; `useActivity(): Loadable<ActivityItem[]>`; `useBalance(address): Loadable<bigint>`. Refetch rule: each hook refetches when `useHead().blockNumber` changes or its args change; Ganache mines only on tx, so confirmed txs (and other wallets' txs) refresh everything within 4 s, immediately after own tx via `refreshHead()`. Keep previous data while refetching (no skeleton flash).
Activity: `contract.queryFilter('*', dep.deployedAtBlock, 'latest')` on both contracts, newest first, cap 300; block timestamps cached by block number; `getTransactionReceipt` for `from` + `gasUsed` cached by hash.

### 4.4 App wiring (w1-ui)
`main.tsx`: imports fonts (`@fontsource/space-grotesk/500.css`, `/700.css`, `@fontsource/inter/400.css`, `/500.css`, `/600.css`), `./index.css`; renders `<StrictMode><MotionConfig reducedMotion="user"><ToastProvider><WalletProvider><BrowserRouter><App/></BrowserRouter></WalletProvider></ToastProvider></MotionConfig></StrictMode>`. `App.tsx`: `<Routes>` inside `<AppShell>`: `/` HomePage, `/create`, `/zombie/:id`, `/avengers`, `/battle`, `/activity`, `/settings`, `/gallery`, `*` NotFoundPage. Imports from `react-router`.
No hard-coded addresses in `frontend/src` (tests excepted).

---

## 5. DESIGN SYSTEM (w1-ui, `index.css`)

### 5.1 Tokens (Tailwind v4: `@import "tailwindcss";` then `@theme`)
```css
@theme {
  --color-bg:#0B0D10; --color-panel:#12151A; --color-panel-2:#181C23; --color-raised:#1F242D;
  --color-line:#262C36; --color-line-strong:#353D4A;
  --color-fg:#E8ECF1; --color-fg-muted:#9AA4B2; --color-fg-faint:#6B7482; --color-on-accent:#0B0D10;
  --color-green:#39FF88; --color-green-dim:#1FA85A; --color-green-glow:rgb(57 255 136 / 0.35);
  --color-purple:#8E7CC3; --color-purple-dim:#4B3F78; --color-gold:#F2C14E; --color-gold-dim:#8A6A1F;
  --color-danger:#FF5C6C; --color-warning:#FFB547; --color-info:#5CC8FF; --color-success:#39FF88;
  --font-display:"Space Grotesk",ui-sans-serif,system-ui,sans-serif;
  --font-sans:"Inter",ui-sans-serif,system-ui,sans-serif;
  --font-mono:ui-monospace,"SF Mono",Menlo,monospace;
  --text-display:3rem; --text-display--line-height:1.08;
  --text-h1:2rem; --text-h1--line-height:1.2; --text-h2:1.5rem; --text-h2--line-height:1.25;
  --text-h3:1.125rem; --text-h3--line-height:1.35; --text-body:0.9375rem; --text-body--line-height:1.5;
  --text-label:0.75rem; --text-label--line-height:1.2;
  --radius-sm:6px; --radius-md:10px; --radius-lg:14px; --radius-xl:20px; --radius-2xl:28px;
  --shadow-card:0 1px 0 rgb(255 255 255 / 0.04) inset, 0 12px 32px rgb(0 0 0 / 0.45);
  --shadow-glow-green:0 0 0 1px rgb(57 255 136 / 0.5), 0 0 24px rgb(57 255 136 / 0.25);
  --shadow-glow-gold:0 0 0 1px rgb(242 193 78 / 0.6), 0 0 28px rgb(242 193 78 / 0.3);
  --shadow-glow-purple:0 0 0 1px rgb(142 124 195 / 0.6), 0 0 28px rgb(142 124 195 / 0.3);
  --ease-out-expo:cubic-bezier(0.16,1,0.3,1); --ease-in-out:cubic-bezier(0.65,0,0.35,1);
  --animate-float:float 6s var(--ease-in-out) infinite; --animate-shimmer:shimmer 2.4s linear infinite;
  --animate-pulse-glow:pulse-glow 2.8s ease-in-out infinite;
}
```
Spacing: Tailwind default (4 px unit); page padding 16 (mobile) / 32 (lg); grid gap 16/24. Breakpoints: Tailwind defaults (sm 640, md 768, lg 1024, xl 1280). Motion durations: fast 120 ms, base 200 ms, slow 360 ms, reveal 700 ms, clash 1400 ms. Z-index: header 30, sidebar/bottom nav 40, modal backdrop 50, modal 60, toasts 70. Labels: `text-label uppercase tracking-[0.08em] font-display`. DNA/addresses/hashes: `font-mono`.
Body: `bg-bg text-fg font-sans text-body`; `body::before` fixed grain (inline SVG feTurbulence data URI, opacity .04, pointer-events none). Glass card: `background: color-mix(in oklab, var(--color-panel) 78%, transparent); backdrop-filter: blur(12px); border:1px solid var(--color-line); border-radius: var(--radius-xl); box-shadow: var(--shadow-card)`. Interactive cards: hover `translateY(-2px)` + glow, 200 ms.
Keyframes in index.css: `float` (translateY 0/-6px), `shimmer` (background-position sweep for rare/hero frames and Skeleton), `pulse-glow`.

### 5.2 Accessibility baseline
Global `:focus-visible { outline: 2px solid var(--color-green); outline-offset: 2px; }`. Text contrast >= 4.5:1 (fg-faint only for >= 18 px or decorative). Primary button = green bg + `on-accent` text. Every icon-only button has `aria-label`. Toast region `aria-live="polite"`, error toasts `role="alert"`. Modal = native `<dialog>` + `showModal()` (focus trap, Esc). Tabs: `role=tablist/tab/tabpanel`, arrow keys. Art SVG `role="img"` + `aria-label` ("Rotfang, rare zombie, level 5"). Decorative health bars `aria-hidden`. `@media (prefers-reduced-motion: reduce)` disables keyframe animations; motion follows `MotionConfig reducedMotion="user"`. Touch targets >= 40 px.

### 5.3 UI kit (`components/ui`, named exports)
| Component | Props |
|---|---|
| Button | `variant?: 'primary'\|'secondary'\|'ghost'\|'danger'\|'gold'`; `size?: 'sm'\|'md'\|'lg'`; `loading?: boolean`; `icon?: ReactNode`; `fullWidth?: boolean`; + button attrs. `secondary` = outline (mirrors SELECT button) |
| Card | `glow?: 'none'\|'green'\|'gold'\|'purple'`; `interactive?: boolean`; `className?`; `children` |
| Badge | `tone?: 'neutral'\|'green'\|'purple'\|'gold'\|'danger'\|'warning'\|'info'`; `icon?`; `children` |
| Stat | `label: string`; `value: ReactNode`; `icon?: ReactNode`; `hint?: string` (tile mirrors card back: icon + big number + label) |
| Modal | `open: boolean`; `onClose(): void`; `title: string`; `children`; `footer?: ReactNode` |
| Toast | exports `Toast` (one toast view), `ToastProvider`; `useToast(): { toast(t: { kind: 'info'\|'success'\|'error'\|'warning'; title: string; description?: string; hash?: string }): void }`; auto-dismiss 5 s (error 8 s), max 4 stacked, bottom-right (above bottom nav on mobile) |
| Skeleton | `className?`; `rounded?: 'md'\|'xl'\|'full'` |
| EmptyState | `icon: ReactNode`; `title: string`; `description: string`; `action?: ReactNode` |
| TxStepper | `state: TxState`; `compact?: boolean`. Steps: Sign in wallet -> Pending -> Confirmed (hash short + copy, block number); terminal states red/amber with `state.error.message` |
| Tabs | `tabs: { id: string; label: string; icon?: ReactNode }[]`; `value: string`; `onChange(id): void` |
| Input | `label: string`; `hint?`; `error?`; `mono?: boolean`; + input attrs |
| Select | `label: string`; `options: { value: string; label: string }[]`; + select attrs (native) |
| ProgressBar | `value: number` (0-100); `tone?`; `label: string`; `decorative?: boolean` |
| Address | `address: string`; `short?: boolean` (default true); `copy?: boolean` |
Layout (`components/layout`): `AppShell({children})`; `Sidebar` (lg+, 240 px, logo wordmark "ZOMBIENEXUS" in display font with green "NEXUS"); `BottomNav` (< lg: Army, Factory, Avengers, Battle, Activity); `Header` (sticky; page title left; right: NetworkBadge + WalletPill; on < lg also Settings icon link); `NetworkBadge` (green dot "Ganache 1337" / amber "Wrong network" / red "Chain offline"); `WalletPill` (status-coloured; shows `shortAddress` + balance when ready, "Connect" otherwise; opens WalletModal); `WalletModal` (connect, address + copy, network name, chain id, balance, Refresh, "Disconnect app session" + note "MetaMask permission stays granted", wrong-network guidance + Switch button); `StatusBanner({ compact? })` (reads useWallet; renders nothing when ready).
Nav: Army `/` Skull, Factory `/create` FlaskConical, Avengers `/avengers` Shield, Battle `/battle` Swords, Activity `/activity` Activity, Gallery `/gallery` Images, Settings `/settings` Settings. Other icons: Trophy, Timer, ChevronsUp, Dna, Zap, Copy, RefreshCw, Sparkles, Crown, TriangleAlert, CircleCheck, CircleX, LoaderCircle, Menu, X, Biohazard, Flame, Pencil, Send, UserCheck, Server, Wallet.

### 5.4 Art (`components/art`, w1-art)
`ZombieArt({ dna: bigint; level?: number; size?: number; animated?: boolean; label?: string })` -> `<svg viewBox="0 0 200 240">` with `data-head data-skin data-eyes data-mouth data-clothes data-accessory data-aura data-species` attributes (test hooks). Layer order: aura -> body+clothes -> head (skin fill, darker shade stroke) -> eyes -> mouth -> accessory -> hero overlay -> level glow. Hero overlay (`species hero`): gold/purple metal half-mask over the eyes, shoulder armor plate, hexagon chest emblem, gold rim light. Level glow: `levelTier` 0 none, 1/2/3 aura opacity .35/.6/.85 (+ pulse at 3). `animated` = float + aura breathe. Original hand-built shapes only; no images, no external assets.
`AvengerArt({ genes: bigint; size?: number; animated?: boolean })`: one original silhouette per roster index (palette 2.1); power 1-10 drives aura intensity (opacity .3 + power*.06) and a 10-pip power bar.
`ZombieCard({ zombie: Zombie; headTs: number | null; variant?: 'grid' | 'detail'; actions?: ReactNode; to?: string })` mirrors `CryptoZombieCard.jpeg`:
- Front (art panel): rounded-2xl, 2 px rarity frame (common green-dim, rare gold + shimmer, hero purple->gold gradient + gold glow + Crown "HERO" badge), deep panel gradient with a faint oversized aura silhouette behind the character, art centred, bottom label `{RARITY} #{id}` in rarity colour (label style, like "UNCOMMON #340").
- Back/info: name (h3), `formatDna` mono line, then 2x2 Stat tiles in raised squares: LEVEL (ChevronsUp), WINS (Trophy), LOSSES (Skull), READY (Timer: "Ready" green or `formatDuration` amber). Then actions: primary (filled, like UPGRADE) + secondary outline (like SELECT).
- `grid`: front over info, vertical. `detail`: front and info side by side (>= md), the info panel slightly tilted/overlapping like the reference (2deg, desktop only, none for reduced motion).
`AvengerCard({ avenger: Avenger; actions?: ReactNode; selected?: boolean })`: same frame language in purple, shows hero name, `#id`, power pips, genes mono, birth time.
Only on-chain fields appear on cards (no invented attack/health/brain/speed numbers).

---

## 6. PAGES
Common: every page shows `StatusBanner` at top when wallet status != ready. Read-only data (army of others, avengers, activity, detail) loads through the read provider even when the wallet is disconnected or on the wrong network; write buttons are disabled with the reason as tooltip/hint text. Loading = Skeleton matching final layout; error = Card with mapped message + Retry (`refetch`). Readiness judged with `isReady(z, headTs)` (latest block time). Busy tx disables its button and shows `TxStepper`.
StatusBanner copy: rpc-down "Local chain offline at http://127.0.0.1:7545. Start it with `npm run demo`." / no-contract "Contracts not found on this chain. Run `npm run demo` (deploys and seeds automatically)." / no-metamask "MetaMask not detected in this browser. You can still browse the Gallery and Activity." / disconnected "Connect MetaMask to command your army." [Connect] / connecting "Waiting for MetaMask…" / wrong-network(chain) "MetaMask is on chain {id}. ZOMBIENEXUS runs on Ganache (chain 1337)." [Switch network] / wrong-network(rpc) "MetaMask's chain 1337 entry does not point at http://127.0.0.1:7545. Edit that network's RPC URL in MetaMask."

| Route | Owner / files | Content |
|---|---|---|
| `/` Army | w1-page-home: `pages/HomePage.tsx`, `pages/home/*` | Not connected: hero panel ("Raise your undead army on-chain.") + floating ZombieArt trio (Gallery DNAs) + Connect CTA. Ready: welcome line with `Address`; Stat row: Balance (ETH), Zombies owned, Total levels, Ready now; toolbar: sort Select (Level high-low, Level low-high, Newest, Name) + filter chips (All, Common, Rare, Hero, Ready, Cooling) + Refresh; grid of `ZombieCard` (grid; actions Details / Battle); "Recent activity" = 5 newest `useActivity` items involving the address + link. Empty: EmptyState Skull "No zombies yet" "Every address gets one free zombie." [Create zombie] |
| `/zombie/:id` | w1-page-home: `pages/ZombieDetailPage.tsx`, `pages/detail/*` | `ZombieCard variant=detail`; DNA breakdown table (pair digits, trait, variant name); owner Address; cooldown line. Actions (owner unless noted): Level Up (anyone; "Fee 0.001 ETH. The contract lets any address level any zombie (original rule)."), Rename (enabled at level >= 2, Input 1-32 chars), Approve (address Input, isAddress), Transfer (address Input, isAddress, != self, confirm Modal "Transfer #id to 0x…? This cannot be undone."), links Battle / Infect when ready. After transfer: toast with hash, card shows new owner (from refetch). Invalid id -> EmptyState "Zombie #id does not exist." Not owner -> read-only + "Owned by 0x…". |
| `/create` Factory | w1-page-create: `pages/CreatePage.tsx`, `pages/create/*` | Tabs Create / Infect (`?tab=`). Create: name Input (trim, 1-32 chars), live preview `ZombieArt dna=previewDna(name)` on every keystroke, DNA digits with pair colouring + trait legend, rarity Badge. Eligibility: `balanceOf(me) > 0` -> disabled + "One free zombie per address. This wallet already owns N." Create -> on confirm read NewZombie from `parseReceipt`, reveal animation (scale 0.8->1, glow burst 700 ms) + "Preview matched on-chain DNA" check + link `/zombie/:id`. Infect: Select my ready zombie (`?zombie=`) + Select avenger (`?avenger=`), before -> after DNA (`heroDna`) with both arts, `feedOnAvenger`; result = hero reveal (gold flash, mask drops in) + new zombie link. Not-ready zombies listed disabled with countdown. |
| `/avengers` | w1-page-avengers: `pages/AvengersPage.tsx`, `pages/avengers/*` | Grid of `AvengerCard` (actions: Battle -> `/battle?mode=avengers&avenger=id`, Infect -> `/create?tab=infect&avenger=id`). Summon panel: genes = `randomGenes()` with Reroll, or manual digits Input (BigInt >= 0); preview AvengerArt + hero name + power; `createAvenger` -> toast + new card. Empty: "No Avengers yet. Summon the first one." |
| `/battle` | w1-page-battle: `pages/BattlePage.tsx`, `pages/battle/*` | Tabs vs Avengers / vs Zombies (`?mode=avengers\|zombies`, `?zombie=`, `?avenger=`, `?target=`). Left: picker of my zombies (not-ready disabled + countdown). Right: avenger picker, or other owners' zombies (`owner !== me`; Warden first). Centre: odds (`winChance(level, power)` % or "71%"), Battle button. Arena sequence below. Result panel from the on-chain event in the receipt: VICTORY/DEFEAT, deltas (level, wins/losses), new readyTime, PvP win -> "Spawned zombie #id" (NewZombie log). |
| `/activity` | w1-page-activity: `pages/ActivityPage.tsx`, `pages/activity/*` | Filter chips: All, Zombies (NewZombie, LevelUp), Transfers (Transfer, Approval), Battles (Battle, AvengerBattle), Avengers (Birth, AvengerFed), Mine (args or from == me). Rows: event label + icon, ids linked, from Address, block, `timeAgo(ts, headTs)`, gas used, tx hash Address-style copy. Note: "Contract events indexed from this local chain since block N. Not a full transaction history; Ganache transactions are not on Etherscan." Empty: "No events yet." |
| `/settings` | w1-page-activity: `pages/SettingsPage.tsx`, `pages/settings/*` | Network (name, chainId, rpcUrl), contracts (addresses + copy, deployedAtBlock, generatedAt), wallet (status, address, balance, Connect / Disconnect app session / Switch network). Diagnostics list (live, PASS/FAIL badges): RPC reachable, chain id 1337, code at both addresses, `avengerContract()` wiring, wallet chain, wallet RPC sees contract, `levelUpFee()`, `getZombieCount()`, `totalAvengers()`, latest block + chain time. MetaMask help: add network values; nonce reset path (Settings > Advanced > Clear activity tab data); link to Gallery and `/legacy/`. |
| `/gallery` | w1-art: `pages/GalleryPage.tsx` | Wallet- and chain-free. 12 zombies: 2521625881949400, 2729772995698500, 9343918324261100, 8887902053609700, 5861794999842000, 6212148620395099, 5403569476888700, 6279290754456800, 0981397381800200, 8448425644938400, 6679918540149499, 9343918324261199 (names Rotfang, Grimjaw, Mossbelly, Duskwalker, The Warden, Thunderrot, Bonechill, Ashgrin, Hollowmaw, Vexbone, Duskhulk, Mossking; levels 2,1,5,8,3,2,1,4,6,10,7,12; covers common/rare/hero and all level tiers) + 6 roster Avengers. Caption: DNA, rarity, trait names. Used for screenshots. |
| `*` | w1-ui: `pages/NotFoundPage.tsx` | "This crypt is empty." + link home |

Battle arena sequence (motion/react; durations from 5.1):
1 idle: both fighters `float`; decorative ProgressBars full (`decorative`, aria-hidden); VS glyph centre.
2 awaiting-signature: button "Confirm in MetaMask…"; fighters lean in (scale 1.03, 200 ms).
3 pending: auras pulse, VS glyph rotates slowly, copy "Battle transaction pending…".
4 confirmed: clash 1400 ms: dash to centre (x ±35 %, 350 ms ease-in) -> impact flash (white -> green radial, 120 ms) + 6 px shake 250 ms -> recoil; loser opacity .45 + rotate 8deg, its bar drains to 0 (500 ms); winner bar glows; banner VICTORY (green) / DEFEAT (danger) springs in. Result text always comes from the receipt event, never from the animation.
5 reverted/failed/rejected: no clash; fighters return to idle; banner shows `error.message`.
Reduced motion: no dash/shake/rotation; opacity fades only.

---

## 7. AGENT OWNERSHIP MAP (wave W1, disjoint files)
Rules: edit only files you own; import other areas only through the APIs in §4/§5 by path (`@/lib/...`, `@/components/ui/Button`); **first action of every frontend owner = create each owned module with the exact exported names and types** (stub bodies returning placeholder values or throwing `Error('TODO')`) so everyone type-checks early. Never edit someone else's file to unblock yourself; record the gap in your agent notes. Vitest may use `vi.mock`. Every agent: notes + `.done` per PLAN §7.
| Agent | Files owned | Inputs | Definition of done |
|---|---|---|---|
| w1-contracts (Sonnet) | §1.1 list | §1 | `npm run compile` clean; ABI matches §1.3/1.4 exactly |
| w1-truffle-tests (Sonnet, after contracts) | `test/master.js`, `test/avengers.js`, `test/helpers/time.js`, `test/helpers/utils.js`, `test/CryptoZombies.js` (line 1 only -> `artifacts.require("ZombieOwnership")`) | §1, §8 | `npm test`: 30 passing, 0 failing |
| w1-chain (Sonnet) | `scripts/chain.js`, `seed.js`, `state.js`, `demo.js` | §2, §3 | reset -> demo -> seed table matches §2.3; restart keeps state |
| w1-scripts (Haiku) | `scripts/export.js`, `check.js`, `serve.js`, `doctor.js`, `test.js` | §3 | each CLI behaves per §3.5; serve 404s `/.ganache/keys.json` |
| w1-art (Sonnet) | `lib/dna.ts`, `lib/roster.ts`, `components/art/*`, `pages/GalleryPage.tsx` | §2.1, §5.4 | gallery renders 12+6 distinct, deterministic, no console errors |
| w1-ui (Sonnet) | `frontend/index.html`, `main.tsx`, `App.tsx`, `index.css`, `components/ui/*`, `components/layout/*`, `pages/NotFoundPage.tsx`, `frontend/public/favicon.svg` | §4.4, §5 | shell + kit build; responsive 375 px and 1440 px; a11y baseline |
| w1-data (Sonnet) | `lib/types.ts`, `deployment.ts`, `chain.ts`, `contracts.ts`, `wallet.tsx`, `tx.ts`, `errors.ts`, `hooks.ts`, `format.ts` | §4 | APIs exact; no reloads; no hard-coded addresses |
| w1-page-home (Sonnet) | `pages/HomePage.tsx`, `pages/ZombieDetailPage.tsx`, `pages/home/*`, `pages/detail/*` | §6 | all states; level up, rename, approve, transfer work |
| w1-page-create (Sonnet) | `pages/CreatePage.tsx`, `pages/create/*` | §6 | preview == on-chain DNA; infect makes a hero |
| w1-page-avengers (Sonnet) | `pages/AvengersPage.tsx`, `pages/avengers/*` | §6 | summon + list |
| w1-page-battle (Sonnet) | `pages/BattlePage.tsx`, `pages/battle/*` | §1.5, §6 | both modes, sequence, result from event |
| w1-page-activity (Sonnet) | `pages/ActivityPage.tsx`, `pages/SettingsPage.tsx`, `pages/activity/*`, `pages/settings/*` | §6 | filters, diagnostics |
| w1-vitest (Sonnet) | `frontend/src/test/*` | §4, §8 | `npm run test:ui` green |
| w1-docs (Haiku) | `README.md`, `CHANGES.md`, `docs/PROJECT.md` | PLAN, SPEC, MASTER_INDEX §B | README sections of MASTER_INDEX §B with bracket placeholders; CHANGES lists bug fixes + improvements below; PROJECT = bullets + ASCII diagrams + per-flow steps |
| w1-pptx (Sonnet) | `docs/PPTX_PROMPT.md` | PLAN, SPEC | self-contained Codex prompt for `ZOMBIENEXUS.pptx` |
| opus-o1 (Opus) | notes only | contracts | review verdict on §1 compliance + security |
Lead only: `index.html` line 34, `truffle-config.js` patches, `docs/PROGRESS.md`.
Improvements to claim (CHANGES/README/PPTX): 1 premium React frontend; 2 wallet + network integration; 3 Factory + Army (live DNA preview, sort/filter, details); 4 ownership transfer (fixed contract + UI + activity); 5 feeding/mutation with local AvengerContract (hero zombies, before/after DNA); 6 battle arena (vs Avengers + PvP). Backups: 7 activity explorer; 8 diagnostics in Settings; 9 starter bug fixes + 30 Truffle tests; 10 one-command demo/reset/snapshot.

---

## 8. TEST PLAN

### 8.1 Starter (test/CryptoZombies.js, 6 tests, unchanged except line 1)
1 should be able to create a new zombie; 2 should not allow two zombies; 3 should transfer a zombie; 4 approve then transfer when the approved address calls transferFrom; 5 approve then transfer when the owner calls transferFrom; 6 zombies should be able to attack another zombie (needs `time.increase` fixed).
`helpers/time.js`: keep exports `increase(duration)`, `duration`; implement with a promisified `web3.currentProvider.send` for `evm_increaseTime` then `evm_mine`, both awaited (starter uses `sendAsync` and does not await the mine). `helpers/utils.js`: keep `shouldThrow`; add `expectRevert(promise, reason)` asserting the error message contains `reason`.

### 8.2 Master scenarios (`test/master.js`, `contract("ZOMBIENEXUS master scenarios")`, exact titles)
S01 contracts compile: artifacts carry bytecode / S02 contracts deploy: deployed instances have code and avenger contract is wired / S03 zombie creation works and emits NewZombie / S04 zombie data is correct (name, DNA ends 00 and matches keccak preview, level 1, counters 0) / S05 ownership is assigned (ownerOf, balanceOf) / S06 zombie retrieval works (getZombiesByOwner, getZombieCount, zombies) / S07 creation restriction: second free zombie reverts / S08 authorized transfers succeed (owner and approved) / S09 unauthorized transfers revert (stranger, wrong from, zero address) / S10 ownership changes after transfer (both balances, approval cleared, sender can create again) / S11 level-up eligibility is enforced (wrong fee, unknown id, rename below level 2) / S12 level changes persist and LevelUp is emitted / S13 feeding on an Avenger creates a hero zombie (DNA ends 99, AvengerFed) / S14 invalid Avenger interactions revert (unknown avenger, contract not set, zombie not ready) / S15 battles enforce authorization (attack and attackAvenger by non-owner) / S16 battle cooldowns work (not-ready reverts, readyTime = block time + 1 day after battle) / S17 events contain correct values (NewZombie, Transfer, Approval, LevelUp, Battle) / S18 wrong-account transactions are rejected (changeName, approve, setAvengerContractAddress) / S19 invalid IDs fail safely (attack target, levelUp, changeName, getAvenger revert with reasons; ownerOf returns zero address) / S20 state persists across frontend reloads (a fresh `ZombieOwnership.at(address)` handle reads identical zombies, owners and counts).

### 8.3 Avenger tests (`test/avengers.js`, `contract("AvengerContract")`)
A1 createAvenger stores genes, emits Birth and increments totalAvengers / A2 getAvenger returns the 10-tuple with genes last and reverts for an unknown id / A3 attackAvenger outcome matches the on-chain odds formula / A4 attackAvenger updates wins, losses, level and cooldown and emits AvengerBattle.

### 8.4 Randomness handling (S16, S17, A3, A4, starter 6) — DECIDED
No test depends on luck. Each battle test uses a fresh `ZombieOwnership.new()` so `randNonce` starts at 0 and the test counts calls (nth `randMod` call hashes nonce n). Expected roll: `BigInt(web3.utils.soliditySha3({t:'uint256',v:blockTimestamp},{t:'address',v:sender},{t:'uint256',v:n})) % 100n`, where `blockTimestamp` is the timestamp of the receipt's block. Assert event `won` == (`roll <= 70n`) for PvP and (`roll < BigInt(chance)`) for Avengers, then assert the matching state branch. A3 runs >= 6 battles across powers/levels and also checks the clamp with level 1 vs power 10 (chance 10) by formula. Cooldown between battles via `time.increase(86401)`.

### 8.5 Vitest (`frontend/src/test`)
`dna.test.ts` (previewDna("Rotfang") = 2521625881949400n; heroDna(Rotfang, Thor genes) = 6212148620395099n; decodeDna deterministic + pair mapping; rarityOf for the 3 tiers; levelTier) / `roster.test.ts` (6 genes -> 6 distinct heroes; powers 7,6,9,8,5,4; winChance(1,10)=10, (20,1)=90, (8,9)=45, (8,4)=70) / `tx.test.ts` (txReducer: every transition, status 0 -> reverted, rejected vs failed) / `errors.test.ts` (4001, ACTION_REJECTED, INSUFFICIENT_FUNDS, CALL_EXCEPTION with reason -> friendly text, Ganache "VM Exception ... revert zombie is not ready", nonce, unknown) / `format.test.ts` (shortAddress, formatDuration, formatDna, timeAgo with chain time) / `ZombieArt.test.tsx` (role img, data attributes match decodeDna, hero overlay present only for ...99).

---

## 9. GATES
G1 (integration, lead runs; chain stopped first):
| Command | Expected |
|---|---|
| `npm run compile` | exit 0 |
| `npm test` | 30 passing, 0 failing |
| `npm run test:ui` | all pass |
| `npm run build` | exit 0 (tsc + vite) |
| `npm run reset` then `npm run demo` (background) | migrate + seed table == §2.3, all check lines PASS, server URLs printed |
| `npm run check` (2nd terminal) | exit 0 |
| `curl -s -o /dev/null -w '%{http_code}'` on `/`, `/zombie/3`, `/deployment.json`, `/legacy/`, `/legacy/cryptozombies_abi.js` | 200 each; `/.ganache/keys.json`, `/package.json`, `/legacy/../package.json` -> 404 |
| `npm run seed` | exit 1 "already seeded" |
| `grep -rnE '0x[0-9a-fA-F]{40}' frontend/src --exclude-dir=test` | no output |
| `grep -nE '"(git\+|github:)' package-lock.json` | no output |
| `grep -rn 'location.reload\|ethereum.enable' frontend/src` | no output |
| `sed -n 34p index.html` | contains deployment.json ZombieOwnership address |
G2 (QA): all G1 rows green again after fixes; reviewer findings triaged with no open HIGH; `npm run doctor` exit 0 (WARN allowed); placeholder scan `grep -rnE '\[(TEAM_MEMBER_[123]_NAME|CWID_[123]|EMAIL_[123]|GITHUB_REPO_URL|CANVAS_SUBMISSION_LINK|DEMO_SLOT_TIME)\]' README.md docs` shows the tokens and an email regex `grep -rnE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}' README.md CHANGES.md docs frontend/src scripts` finds no real address; `grep -rln METAMASK_PASSWORD --exclude-dir=node_modules --exclude-dir=.npm-cache --exclude-dir=.home --exclude-dir=.baseline .` lists only docs/PLAN.md and docs/SPEC.md (placeholder mention only, never a real value); `node scripts/changes.js` lists only in-project paths.
G3 (finish, before user G4): chain stopped -> `npm run snapshot` creates `.ganache/snapshots/golden.tar`; `npm run restore` then `npm run demo` -> check PASS and seed state intact, all 6 zombies ready; `/gallery` screenshots saved by lead; README/CHANGES/PROJECT/PPTX_PROMPT present; `.checkpoints/after-*.tgz` + manifests; `/legacy/` loads and line 34 matches.

---

## 10. OPEN RISKS AND RULINGS
1. MetaMask may already hold a chain-1337 network ("Localhost 8545"). **Ruling:** README tells the user to set its RPC to http://127.0.0.1:7545 (or add the network); app flags it as `wrong-network` reason `rpc`.
2. Legacy page: `ethereum.enable()` may be gone in current MetaMask; Level Up passes the whole id array (web3 1.2.7 coerces a one-element array, so C must own exactly one zombie, created live via the legacy Create button, never receive transfers); jQuery/web3 load from cdnjs (internet needed); `Transfer` subscription errors on HTTP (console only). **Ruling:** edit line 34 only; G4 rehearsal verifies the trio; if `enable()` fails, the lead asks the user before touching any other line.
3. `cryptozombies_abi.js` is stale (getAllZombies, AttackResult, non-indexed tokenId). **Ruling:** leave untouched; the trio's calls (`createRandomZombie`, `zombies`, `getZombiesByOwner`, `levelUp`) still match.
4. 0.4.25 external-call revert reasons: **ruling** pre-check `totalAvengers()` locally (done in §1).
5. Ganache CORS: verified working; no RPC proxy.
6. Readiness uses latest block time; with no new blocks a just-expired cooldown can look "cooling" until any tx is mined. **Accepted** (conservative; all seeded zombies ready).
7. Chain time runs ~50 h ahead of wall time after seed. **Ruling:** all UI times use chain time; chain.js `evm_setTime` keeps time monotonic across restarts.
8. Contract addresses: deterministic only for the same migration sequence. **Ruling:** `index.html:34` set once from deployment.json; `check.js` enforces; demo.js migrates only when blockNumber == 0.
9. Nonce mismatch after reset/restore. **Ruling:** mapError nonce message + Settings help + README.
10. Truffle 5.11.5 on Node 26 untested; `motion` pin fallback to CSS keyframes. Per PLAN §9 (ask user before Node 22 fallback).
11. `ownerOf` returns zero for unknown ids and `levelUp` stays ownerless, 71% PvP, self-attack possible, predictable randomness. **Ruling:** documented in CHANGES "known limitations", not changed.
12. uint16 win/loss overflow after 65535 battles: ignored (SafeMath16 reverts).
13. Pin audit: vite 8 needs Node 20.19+; vitest 5.0.4 + jsdom 30.1.3 need Node 22.22+. **Ruling:** keep pins (dev machine runs Node 26); README states Node 22.22+ recommended, 20.19+ minimum for app/chain/Truffle; doctor WARNs. `@testing-library/dom` is already pinned.
14. ganache leveldown native build skipped by `ignore-scripts`. **Ruling:** w1-chain must prove `.ganache/db` persists across a chain restart (G1 row "restart keeps state"); if it fails, report to the lead; do not switch to in-memory silently.
