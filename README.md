# ZOMBIENEXUS

ZOMBIENEXUS: THE ULTIMATE BLOCKCHAIN ZOMBIE ARENA

## Overview

ZOMBIENEXUS is an upgraded version of the CryptoZombies starter DApp. It runs on a local Ganache chain and adds a React front end, an Avenger contract, battles, and a feeding mechanic that creates hero zombies.

- Create zombies, level them up, rename them, approve and transfer them.
- Feed a zombie on an on-chain Avenger to create a hero zombie.
- Battle Avengers or other owners' zombies.
- Browse on-chain activity and diagnostics.
- Everything runs locally. No testnet, no real ETH.

The original starter page is kept at `/legacy/`.

## Team

| Member | Name | CWID |
|---|---|---|---|
| 1 | Dhruvi Kotahri | 874294333 | dkk@csu.fullerton.edu |
| 2 | Het Siddhapura | 826929101 | hetsiddhapura@csu.fullerton.edu |

- GitHub repository: [GITHUB_REPO_URL]
- Canvas submission: [CANVAS_SUBMISSION_LINK]
- Demo slot: [DEMO_SLOT_TIME]

## Implemented improvements

1. Premium React front end (TypeScript, Vite, Tailwind, glass cards, responsive layout).
2. Wallet and network integration (MetaMask discovery, wrong-network detection, switch network, no page reloads).
3. Zombie Factory and Army (live DNA preview that matches the chain, sort and filter, zombie details).
4. Ownership transfer (fixed contract, transfer UI, activity feed entries).
5. Feeding and mutation with a local AvengerContract (hero zombies, before and after DNA).
6. Battle arena (vs Avengers, and PvP vs zombies).
7. Activity explorer (contract events from the local chain).
8. Diagnostics in Settings (RPC, chain id, contract wiring, latest block).
9. Starter bug fixes, plus 30 Truffle tests and 47 Vitest unit tests.
10. One-command demo, reset, snapshot and restore.

## Technology stack

- Smart contracts: Solidity 0.4.25, compiled with the local `solc` package.
- Contract tooling: Truffle 5.11.5 (compile, migrate, test).
- Local chain: Ganache 7.9.2 (CLI, not the GUI).
- Front end: React 19, TypeScript 6, Vite 8, Tailwind CSS 4, react-router 7, motion, lucide-react.
- Blockchain client: ethers 6.
- Fonts: self-hosted Space Grotesk and Inter (`@fontsource`).
- Scripts: plain Node.js (CommonJS). No global installs.

## Architecture

- Ganache runs on `127.0.0.1:7545` with chain id 1337. Its database is `.ganache/db`.
- Truffle migrations deploy `ZombieOwnership` and `AvengerContract`.
- `scripts/seed.js` creates the demo state.
- `scripts/export.js` writes `frontend/public/deployment.json` (addresses, ABIs, chain id).
- The front end reads the chain directly through the RPC URL. It writes through MetaMask.
- `scripts/serve.js` serves the built app at `http://127.0.0.1:8080/` and the legacy page at `/legacy/`.
- `scripts/check.js` verifies the wiring before you demo.

Ports (all on 127.0.0.1):

| Port | Used by |
|---|---|
| 7545 | Ganache demo chain (`npm run chain`, `npm run demo`) |
| 8080 | App (`npm run serve`, `npm run demo`) |
| 5173 | Vite dev server (`npm run dev`) |
| 8545 | Temporary Ganache for `npm test` only |

## Smart contracts

Inheritance chain: `Ownable` -> `ZombieFactory` -> `ZombieFeeding` -> `ZombieHelper` -> `ZombieAttack` -> `ZombieOwnership` (+ ERC721).

| Contract | File | Purpose |
|---|---|---|
| ZombieFactory | `contracts/zombiefactory.sol` | Creates one free zombie per address from a name hash. Emits `NewZombie`. |
| ZombieFeeding | `contracts/zombiefeeding.sol` | `feedOnAvenger` creates a hero zombie (DNA ends in 99). `setAvengerContractAddress` (owner only). Emits `AvengerFed`. |
| ZombieHelper | `contracts/zombiehelper.sol` | `levelUp` with public `levelUpFee` (0.001 ETH), `changeName` (level 2+), `changeDna` (level 20+), `getZombiesByOwner`, `getZombieCount`, owner-only `setLevelUpFee` and `withdraw`. Emits `LevelUp`. |
| ZombieAttack | `contracts/zombieattack.sol` | `attack` (vs zombies) and `attackAvenger` (vs Avengers). Enforces cooldowns. Emits `Battle` and `AvengerBattle`. |
| ZombieOwnership | `contracts/zombieownership.sol` | ERC721-style `transferFrom` and `approve` (emit `Transfer` and `Approval`), `balanceOf`, `ownerOf`. The deployed contract. |
| AvengerContract | `contracts/avengercontract.sol` | Standalone. `createAvenger(genes)` is open to anyone. `totalAvengers()` and `getAvenger(id)`. Emits `Birth`. |

Migrations:

- `migrations/2_deploy_contracts.js` deploys `ZombieOwnership`.
- `migrations/3_deploy_avengers.js` deploys `AvengerContract` and calls `setAvengerContractAddress`.

Unchanged starter files: `ownable.sol`, `safemath.sol`, `erc721.sol`, `Migrations.sol`, `migrations/1_initial_migration.js`.

## Main front end features

Routes (served by `npm run demo` at `http://127.0.0.1:8080/`):

| Route | What it does |
|---|---|
| `/` | Army. Your zombies with sort and filter, stats, recent activity. |
| `/create` | Factory. Name a zombie with a live DNA preview. Infect (feed on an Avenger). |
| `/zombie/:id` | Zombie details, DNA breakdown, level up, rename, approve, transfer. |
| `/avengers` | List Avengers. Summon a new Avenger with chosen or random genes. |
| `/battle` | Battle vs Avengers or PvP vs other owners' zombies, with an arena animation. |
| `/activity` | Contract events from the local chain, with filters. |
| `/settings` | Network, contract addresses, wallet, diagnostics, MetaMask help. |
| `/gallery` | 12 zombies and 6 Avengers. Works without a wallet. |
| `/legacy/` | The original starter page, with only the contract address updated. |

## Requirements

- An Apple Silicon (arm64) Mac running macOS.
- Node.js 20.19 or newer (minimum). Node.js 22.22 or newer is recommended, and required for `npm run test:ui`.
- Google Chrome with the MetaMask extension.
- Internet access for the first `npm run setup`. Later runs work offline, except the legacy page, which loads jQuery and web3 from a CDN.

## Run on a new Mac

1. Install Node.js 22.22 or newer. Check with `node -v`.
2. Open a terminal in the project folder.
3. Install dependencies and compile the contracts (needs internet once):

   ```
   npm run setup
   ```

4. Check the environment:

   ```
   npm run doctor
   ```

   FAIL lines stop the run. WARN lines are advice (for example, ports already in use).

5. Start the chain, deploy, seed, check and serve everything:

   ```
   npm run demo
   ```

6. Open the printed URLs:

   - App: `http://127.0.0.1:8080/`
   - Legacy page: `http://127.0.0.1:8080/legacy/`

7. Stop with Ctrl+C. This closes the server, and the chain if `npm run demo` started it. A chain you started yourself with `npm run chain` keeps running.

`npm run demo` starts the chain (or reuses one already running on port 7545), runs `truffle migrate --reset` and the seed only when the chain is empty (block 0), builds the front end only when `frontend/dist` is missing, exports `deployment.json`, runs the checks, and serves the app. If a check prints FAIL, it stops and exits with code 1.

### Other commands

| Command | What it does |
|---|---|
| `npm run compile` | Compile the contracts with the local solc 0.4.25. |
| `npm run doctor` | Check Node version, installed packages, free ports and registry access. |
| `npm run chain` | Start only the Ganache chain. |
| `npm run migrate` | Deploy the contracts to the running chain (`truffle migrate --reset`). Run it on an empty chain. On a chain that already holds contracts it deploys new ones at new addresses, so `index.html` line 34 no longer matches. |
| `npm run seed` | Seed the demo state. Fails with "already seeded" on a seeded chain. |
| `npm run export` | Write `frontend/public/deployment.json`. |
| `npm run check` | Run the wiring checks (PASS, FAIL, SKIP). Exit code 1 on FAIL. |
| `npm run serve` | Serve the app and legacy page only. |
| `npm run build` | Type-check and build the front end into `frontend/dist`. |
| `npm run dev` | Vite dev server on port 5173 (for front-end work). |
| `npm test` | Truffle tests on a temporary chain at port 8545 (30 tests). |
| `npm run test:ui` | Vitest unit tests (47 tests, Node 22.22 or newer). |
| `npm run reset` | Delete the chain database and keys. Refuses while the chain runs. |
| `npm run snapshot` | Save the chain database to `.ganache/snapshots/golden.tar`. Stop the chain first. |
| `npm run restore` | Restore the saved snapshot. Stop the chain first. |
| `npm run changes` | List project files changed compared with the starter copy. |

## Ganache configuration

Set in `scripts/chain.js`:

- Host `127.0.0.1`, port `7545`.
- `chainId` and `networkId`: `1337`.
- Deterministic wallet with 10 accounts, 1000 ETH each.
- Persistent database at `.ganache/db`.
- Account keys written to `.ganache/keys.json`.
- Quiet logging. Ganache may still print warnings about uWS or BigInt. These are expected.

`npm test` starts a second, temporary Ganache on port 8545 with no saved database.

## Truffle configuration

Set in `truffle-config.js`:

- `development`: host `127.0.0.1`, port `7545`, network id `1337`. Used by `npm run migrate`.
- `test`: host `127.0.0.1`, port `8545`, any network id. Used by `npm test`.
- Compiler: the local `node_modules/solc/soljson.js` (solc 0.4.25). No download at compile time.
- Mocha timeout: 100000 ms.

## MetaMask setup

### Add the network

Easiest: open the app and click **Switch network**. The app adds the network for you.

To add it by hand, in MetaMask choose Add network, then enter:

- Network name: `Ganache 1337 (ZOMBIENEXUS)`
- RPC URL: `http://127.0.0.1:7545`
- Chain ID: `1337`
- Currency symbol: `ETH`

### Already have a chain 1337 network?

MetaMask may already hold a network with chain ID 1337, for example "Localhost 8545".

- Edit that network and set its RPC URL to `http://127.0.0.1:7545`. Save.
- Do not keep a second chain 1337 entry that points at another RPC.
- The app shows "MetaMask's chain 1337 entry does not point at http://127.0.0.1:7545" until this is fixed.

### Import the demo accounts

1. Open `.ganache/keys.json` in the project folder.
2. For each account [1], [2] and [3] (see the table below), find the entry for its address and copy the private key.
3. In MetaMask, choose Add account or Import account, then Private key. Paste the key.
4. Do not import account [0].

Rules for the keys file:

- Never commit `.ganache/keys.json`. The `.ganache/` folder is git-ignored.
- Never share these keys. They control the demo accounts.
- Never paste keys, passwords or seed phrases into any project file.

### Reset MetaMask after a chain reset

Whenever the chain is reset or restored, MetaMask keeps an old nonce for the account. Transactions then fail with a nonce error.

- Open MetaMask, go to Settings > Advanced, then click **Clear activity tab data**.
- Do this for each demo account on that network.

## Demo accounts

| Role | Index | Address | Use |
|---|---|---|---|
| Deployer, seeder, opponent | [0] | `0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1` | Never imported to MetaMask. Owns The Warden. |
| A, army | [1] | `0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0` | Main demo wallet. Owns Rotfang, Grimjaw, Mossbelly, Duskwalker, Thunderrot. |
| B, fresh | [2] | `0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b` | Creates a zombie live and receives a transfer. |
| C, legacy | [3] | `0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d` | Runs the legacy page. Owns exactly one zombie. Do not send it transfers. |

These addresses come from the Ganache deterministic seed. Check them against `.ganache/keys.json`.

## Contract deployment

`npm run demo` does everything below. Run the steps by hand when you need them:

1. `npm run migrate` deploys `ZombieOwnership` and `AvengerContract` to the running chain, and wires the Avenger contract into `ZombieOwnership` (`setAvengerContractAddress`).
2. `npm run seed` creates the demo state. It runs only on a chain with no zombies.
3. `npm run export` writes `frontend/public/deployment.json`. This file holds the addresses, ABIs, chain id and the deploy block.
4. `npm run check` verifies the chain id, the contract code, the Avenger wiring, that `index.html` line 34 holds the ZombieOwnership address, that `deployment.json` matches the artifacts, and that at least 6 zombies exist (SKIP, not FAIL, when fewer).

Contract addresses are stable because the deployer account is deterministic. If the address changes, copy the ZombieOwnership address from `frontend/public/deployment.json` into `index.html` line 34.

Seeded state (ids 0 to 5, all ready at demo start):

| Id | Name | Owner | Level | Note |
|---|---|---|---|---|
| 0 | Rotfang | A | 2 | Demo feed on Avenger 2 (Thor). The seed already fed it once to make Thunderrot. |
| 1 | Grimjaw | A | 1 | Transfer demo (to account B) |
| 2 | Mossbelly | A | 5 | PvP vs The Warden |
| 3 | Duskwalker | A | 8 | Avenger battle |
| 4 | The Warden | D | 3 | PvP opponent |
| 5 | Thunderrot | A | 2 | Hero zombie made by the seed (DNA ends in 99). Spare. |

Seeded Avengers (ids 0 to 5, power in brackets): Iron Man (7), Captain America (6), Thor (9), Hulk (8), Black Widow (5), Hawkeye (4).

## Testing

Run from the project folder:

```
npm test
```

- Runs 30 Truffle tests on a temporary Ganache at port 8545. The app chain does not need to be running. Port 8545 must be free.
- The 30 tests are: 6 starter tests (`test/CryptoZombies.js`), 20 master scenarios S01 to S20 (`test/master.js`), and 4 Avenger tests A1 to A4 (`test/avengers.js`).
- No test depends on luck: battle tests recompute the on-chain roll.

```
npm run test:ui
```

- Runs 47 Vitest unit tests in 6 files (`frontend/src/test/`): DNA and rarity, the Avenger roster and win chance, the transaction state machine, error messages, formatting and the zombie art component.
- Needs Node.js 22.22 or newer.

Before a demo, also run `npm run check` while the chain is up. It should print no FAIL lines.

## Demo walk-through (10 minutes)

Setup before the demo:

1. Stop any running demo (Ctrl+C). Run `npm run reset`, then `npm run demo`. Wait for the App and Legacy URLs. (Or `npm run restore` instead of `reset` to return to the saved snapshot.)
2. In MetaMask, clear the activity tab data for the network (see above).
3. Import accounts [1], [2] and [3] (the keys are the same after every reset). Connect each one as needed.
4. Each seeded zombie can act once per demo: every feed or battle starts a one-day cooldown, and the demo does not move chain time.

Walk-through:

1. **Legacy page, account [3] (about 1.5 minutes).** Open `/legacy/`. Use the original trio: Create Zombie (the legacy page names the zombie with the account address), Show Zombies, and Level Up. Show that the starter flow still works. Account [3] must own exactly one zombie.
2. **Account [2], app tour and live Create (2 minutes).** Open `/create`. Type a name and show the live DNA preview. Create the zombie. Show that the DNA on chain matches the preview.
3. **Account [1], army and DNA art (1 minute).** Open `/`. Show the army, the rarity frames and the DNA breakdown on `/zombie/0`.
4. **Level up (1 minute).** On a zombie's details page, click Level Up (fee 0.001 ETH). Show the new level and the `LevelUp` event in Activity.
5. **Avengers, feed and hero zombie (2 minutes).** On `/avengers`, summon an Avenger (it becomes Avenger 6). On `/create?tab=infect`, feed Rotfang on Thor. Show the before and after DNA and the new hero zombie "NoName" (DNA ends in 99). Its DNA equals Thunderrot's, because Thunderrot was made the same way by the seed.
6. **Battle vs Avengers (1 minute).** On `/battle`, use Duskwalker (level 8). Show the odds against Hawkeye (70%) and Thor (45%). Fight one of them and show the result from the on-chain event.
7. **PvP vs zombies (30 seconds).** Use Mossbelly against The Warden (71% win chance). A win also spawns a "NoName" child zombie.
8. **Transfer, switch to account [2] (30 seconds).** Transfer Grimjaw to account [2]. Switch MetaMask to account [2] and show it in its army.
9. **Wrap-up (30 seconds).** Show the Activity page and the test results from before the demo (`npm test`: 30 passing, `npm run test:ui`: 47 passing). Mention the known limitations below.

Do not switch networks live during the demo.

## Known limitations

These are starter rules or conscious decisions. They are documented, not fixed:

- `levelUp` is ownerless. Any address can level up any zombie (original rule).
- PvP win chance is 71% (the starter's `rand <= 70` check, kept).
- Battles use predictable randomness (block time, sender and a nonce). This is not secure.
- Self-attack is possible on chain: a zombie can attack another zombie with the same owner. The UI lists only other owners' zombies.
- `createAvenger` is open to anyone, with any genes. Players can mint power-1 Avengers to farm levels, and choose the DNA a feed produces.
- An address can transfer its zombie away and then create another free one.
- `transferFrom` and `approve` are `payable`. ETH sent with them stays in the contract until the owner calls `withdraw`.
- The owner-set `avengerContract` is trusted. On solc 0.4.25 the external call uses `CALL`, not `STATICCALL`.
- `ownerOf` returns the zero address for unknown ids instead of reverting.
- `withdraw` uses `transfer`.
- Win and loss counters are `uint16`. After 65535 battles, the counter reverts.
- Each new zombie waits one day before its first action (starter rule). The demo seed skips ahead in chain time.
- One free zombie per address (starter rule).
- Readiness uses the latest block time. A cooldown that just expired can look "cooling" until another block is mined.
- Chain time runs ahead of wall-clock time after seeding. The app shows chain time.
- Contract addresses are stable only for the same migration sequence. `index.html` line 34 must match `deployment.json`.
- After a reset or restore, MetaMask must clear its activity data (see above).
- The legacy page (`/legacy/`) keeps the starter code. Only the contract address changed. It uses the deprecated `ethereum.enable()`, passes the whole id array to Level Up, names the new zombie with the account address, and inserts zombie names as raw HTML.
- On the legacy page, Feed on Kitty no longer works because the contract function was renamed to `feedOnAvenger`. The page has no button for it. It is not part of the graded trio (Create Zombie, Show Zombies, Level Up).
- The legacy page needs internet access to load jQuery and web3 from a CDN.
- Hero names (Iron Man, Captain America, Thor, Hulk, Black Widow, Hawkeye) are plain text. The art is original.

## Troubleshooting

- **`npm run doctor` shows FAIL for Node.** Install Node.js 20.19 or newer. Use 22.22 or newer for `npm run test:ui`.
- **Port 7545, 8080 or 8545 is busy.** Find the owner with `lsof -nP -iTCP:7545 -sTCP:LISTEN` (use the busy port number). Stop that process. `npm run demo` reuses a chain that already answers on 7545.
- **App shows "Local chain offline".** Run `npm run demo`.
- **App shows "Contracts not found on this chain".** Run `npm run demo`. It deploys and seeds automatically.
- **App shows "MetaMask is on chain ...".** Click **Switch network**, or switch MetaMask to Ganache 1337.
- **App shows "MetaMask's chain 1337 entry does not point at ...".** Edit that network's RPC URL to `http://127.0.0.1:7545` (see MetaMask setup).
- **Transactions fail with a nonce error.** Clear MetaMask activity data for the network (Settings > Advanced > Clear activity tab data).
- **`npm run seed` says "already seeded".** This is expected on a seeded chain. Run `npm run reset` and then `npm run demo` for a fresh start.
- **`npm run check` FAIL on `index.html`.** Copy the ZombieOwnership address from `frontend/public/deployment.json` into `index.html` line 34.
- **App says "deployment.json missing".** Run `npm run demo`, or `npm run export` while the chain runs.
- **Ganache prints uWS or BigInt warnings.** These are expected and harmless.
- **`npm ci` fails.** Check your internet connection. Run `npm run doctor` to test registry access.
- **Legacy page buttons do nothing.** Check the internet connection (jQuery and web3 load from a CDN). Check that MetaMask is on Ganache 1337. The page calls the deprecated `ethereum.enable()`, which a newer MetaMask may no longer provide. Rehearse the legacy trio before the demo.
- **Legacy Level Up fails.** Account [3] must own exactly one zombie (the page sends the whole id array).

## Project structure

```
ZOMBIENEXUS/
  contracts/        Solidity contracts (starter files plus avengercontract.sol)
  migrations/       Truffle migrations (1 unchanged, 2 and 3 deploy the contracts)
  test/             Truffle tests (starter, master scenarios, Avengers)
  scripts/          Node scripts: run, chain, seed, state, demo, export, check, serve, doctor, test, changes
  frontend/
    src/            React app (pages, components, lib, tests)
    public/         Favicon, and deployment.json (generated, git-ignored)
    dist/           Built app (generated by npm run build)
  build/            Truffle artifacts (generated, git-ignored)
  docs/             Plan, spec, progress, project guide, PPTX prompt, master prompt, agent notes
  index.html        Legacy starter page (line 34 holds the contract address)
  cryptozombies_abi.js   Legacy ABI file (unchanged)
  truffle-config.js Truffle and Ganache networks
  package.json      Scripts and pinned dependencies
  .npmrc            ignore-scripts, exact versions, local npm cache
  .ganache/         Chain database, keys.json, snapshots (git-ignored, never share)
```

## Placeholders checklist

Replace every token below before you submit. Search with `grep -rn "\[TEAM_MEMBER\|\[CWID_\|\[EMAIL_\|\[GITHUB_REPO_URL\|\[CANVAS_SUBMISSION_LINK\|\[DEMO_SLOT_TIME" README.md CHANGES.md docs`.

- [ ] `[TEAM_MEMBER_1_NAME]`
- [ ] `[TEAM_MEMBER_2_NAME]`
- [ ] `[TEAM_MEMBER_3_NAME]`
- [ ] `[CWID_1]`
- [ ] `[CWID_2]`
- [ ] `[CWID_3]`
- [ ] `[EMAIL_1]`
- [ ] `[EMAIL_2]`
- [ ] `[EMAIL_3]`
- [ ] `[GITHUB_REPO_URL]`
- [ ] `[CANVAS_SUBMISSION_LINK]`
- [ ] `[DEMO_SLOT_TIME]`
