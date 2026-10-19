<!-- verbatim copy of user master prompt, recovered from transcript -->
# MASTER DEVELOPMENT PROMPT: ZOMBIENEXUS

## ROLE

Act as a principal full stack blockchain engineer, Solidity smart contract specialist, Ethereum DApp architect, frontend gaming interface engineer, DevOps engineer, and smart contract security reviewer.

Your job is to **DEVELOP, IMPLEMENT, INTEGRATE, TEST, AND DELIVER** a complete, fully functional CryptoZombies decentralized application called:

# ZOMBIENEXUS: THE ULTIMATE BLOCKCHAIN ZOMBIE ARENA

This is a midterm project for an Advanced Blockchain university course at California State University, Fullerton.

I want an implementation that exceeds the professor's minimum requirements, includes a premium gaming frontend, uses actual Ethereum smart contracts for blockchain functionality, and can be demonstrated reliably within 10 minutes.

This prompt already includes the extracted assignment requirements and observed video details.

Do not spend time creating a general project proposal, academic research report, or long conceptual discussion.

**Focus on actual software development.**

Your deliverable is a complete working codebase with functioning frontend, smart contracts, blockchain integrations, contract tests, deployment scripts, and configuration.

You are operating through **Claude Cowork**, and I will provide direct access to the existing professor starter project directory.

You must inspect, modify, extend, and validate the files directly inside that existing project directory.

Do not create an unrelated project outside the provided directory.

If you have access to a terminal, execute the necessary commands, compile contracts, run tests, and validate the application.

Do not present mock functionality as working blockchain functionality.

---

# CRITICAL INSTRUCTION: EXISTING PROJECT DIRECTORY IS THE PRIMARY SOURCE OF TRUTH

## Project directory provided to Claude Cowork

I am providing my complete existing project directory through Claude Cowork.

The directory is named:

**Cryptozombie demo package**

This directory contains the professor's original starter code and associated project files.

**You must use this exact existing directory as your primary development workspace.**

The project already contains Solidity smart contracts, Truffle migrations, frontend files, ABI integration, package dependencies, and automated tests.

Your job is to enhance this existing application into ZOMBIENEXUS.

You are explicitly authorized to modify existing source files, create necessary new files and folders within this project, update dependencies and configurations, and improve the existing application.

However, follow these rules:

1. Do not create a completely separate project in another location.
2. Do not discard or replace the existing project wholesale.
3. Do not delete original Solidity contracts without a verified technical reason.
4. Preserve the original CryptoZombies contract inheritance architecture.
5. Preserve the original Truffle and Ganache deployment capabilities.
6. Reuse existing functionality wherever possible.
7. Make necessary improvements directly inside the supplied project directory.
8. Create the modern React frontend inside the existing project, preferably under a new `frontend/` folder.
9. Keep the original `index.html` as a functioning legacy reference until the React replacement is verified.
10. Ensure the final project runs from the original directory.
11. Avoid unnecessary duplication of smart contract functionality.
12. All generated files, configurations, tests, and documentation must remain within the same project.
13. Do not rename or relocate the project root without my permission.
14. Do not modify unrelated files outside the project directory.
15. Do not delete the professor's PDF, video, or reference materials.
16. Do not overwrite original files without first inspecting their contents.
17. Before significant refactoring, create a recoverable baseline using Git or a local backup within the project.
18. Exclude secrets, private keys, and generated dependency folders from source-control commits.
19. Maintain a clear record of files created, modified, or intentionally removed.
20. Prioritize working functionality over architectural changes that offer no practical benefit.

### Filesystem access and permissions

Claude Cowork should inspect the supplied folder using its available filesystem capabilities.

Use actual files in the folder, not assumptions from the screenshot or this prompt.

If shell execution is available, use it to verify the development environment and execute build and test commands.

If an action requires permission, follow Cowork's permission workflow.

If a required GUI interaction, MetaMask confirmation, Ganache configuration, or local system action cannot be performed through the available environment, identify that precise blocker and provide the necessary instructions.

Do not falsely report successful deployment, wallet connection, or browser testing when those actions have not been verified.

---

# VERIFIED ORIGINAL PROJECT DIRECTORY STRUCTURE

The professor's existing starter directory contains the following structure:

```text
Cryptozombie demo package/
│
├── contracts/
│   ├── 2_crypto_zombies.js
│   ├── erc721.sol
│   ├── Migrations.sol
│   ├── ownable.sol
│   ├── safemath.sol
│   ├── zombieattack.sol
│   ├── zombiefactory.sol
│   ├── zombiefeeding.sol
│   ├── zombiehelper.sol
│   └── zombieownership.sol
│
├── migrations/
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
│
├── test/
│   ├── CryptoZombies.js
│   └── helpers/
│       ├── time.js
│       └── utils.js
│
├── cryptozombies_abi.js
├── favicon.ico
├── index.html
├── Midterm project-Guidelines.pdf
├── package-lock.json
├── package.json
├── project-guideline.mp4
├── truffle-config.js
└── web3.min.js
```

This structure was verified from a screenshot of the project directory.

The exact contents of these files must now be inspected directly through Claude Cowork.

Do not assume functionality solely from the filenames.

The file `2_crypto_zombies.js` appears inside `contracts/`, which is unusual for a standard Truffle layout. Inspect its purpose before modifying or moving it.

## Required initial codebase inspection

Before beginning development:

1. Read every Solidity contract.
2. Read the deployment migration scripts.
3. Inspect `truffle-config.js`.
4. Inspect `package.json` and the lockfile.
5. Read the original `index.html`.
6. Inspect the existing Web3.js initialization.
7. Inspect `cryptozombies_abi.js`.
8. Examine the original test suite.
9. Review the time and utility test helpers.
10. Determine which features already exist.
11. Identify obsolete or incompatible code.
12. Verify the compiler and dependency configuration.
13. Confirm the smart contract inheritance chain.
14. Identify the deployed contract expected by the frontend.
15. Determine which existing contract functions can be exposed through a better UI.

- Dependency or compatibility problems.
- Required source changes.
- Reusable contracts and components.

**Do not waste development time recreating functionality that is already implemented.**

---

# 1. PROFESSOR'S ORIGINAL REQUIREMENTS

## 1.1 Minimum implementation

The professor requires:

1. A CryptoZombies decentralized application.
2. Backend smart contracts.
3. A functioning frontend website.
4. Local deployment on a Ganache blockchain.
5. Compatibility with the provided starter code.
6. Successful connection to MetaMask.
7. A working application demonstrable in person.
8. Additional functioning improvements for a higher grade.

The project must demonstrate actual integration between the browser, wallet provider, smart contracts, and Ganache.

## 1.2 Original development environment

The professor's starter package specifies:

| Technology | Starter Version |
| ---------- | --------------- |
| Truffle | 5.4.25 |
| Ganache | 2.5.4 |
| Solidity | 0.8.11 |
| Node.js | 14.16.0 |
| Web3.js | 1.2.7 |

These versions represent the original supported environment.

Before upgrading anything, determine whether the original starter can be compiled and deployed successfully.

Do not blindly replace the starter's Truffle infrastructure with Hardhat, Foundry, or another framework.

Use Truffle and Ganache as the baseline.

A modern React and TypeScript frontend may be introduced provided it communicates correctly with the existing contracts.

If a modern frontend dependency requires a newer Node.js version, isolate the environments or choose a compatible version. Clearly implement the solution rather than leaving dependency conflicts unresolved.

## 1.3 Expected minimum frontend

The professor's approximately 5-minute, 32-second demonstration video shows a simple browser interface with these visible controls:

- Show Zombies
- Create Zombie
- Level Up

The application uses a local server and connects to the blockchain environment.

Ganache is used to inspect the deployment and blockchain state.

MetaMask is configured for the local blockchain and displays a Ganache account with test ETH.

The video demonstrates the basic local development workflow, not a polished finished gaming application.

Treat the three visible frontend actions as the starter workflow that must be inspected and preserved where supported by the actual code.

The walkthrough also displays JavaScript source and Ganache contract information. It does not provide enough legible source material to establish the entire implementation. The original code is now available through the provided project directory, so inspect it before changing any contract.

## 1.4 Correct contract integration

The professor explicitly warns that these settings must match:

- Ganache RPC URL.
- Ganache port.
- Ganache account address.
- Truffle network configuration.
- MetaMask account.
- MetaMask network settings.
- Frontend contract address.
- Contract ABI.
- Actual deployed network.

The professor specifically instructs:

**Use the deployed ZombieOwnership contract address for the main application, not ZombieFactory or another contract address.**

Honor this instruction for the original contract architecture.

Do not use a fixed historical contract address from the tutorial video because contract addresses change between deployments.

## 1.5 Professor's enhancement recommendations

The PDF explicitly suggests the following improvements:

1. Deploy on another Ethereum testnet.
2. Create a more attractive frontend.
3. Add JavaScript integrations for additional contract functionality such as Kitty feeding and zombie transfers.
4. Add a Kitty smart contract to the backend.
5. Use zombie imagery for better visualization.
6. Implement a Zombie Factory or Zombie Army demonstrating multiple zombies.
7. Implement Zombie versus Kitty battles.
8. Create an NFT marketplace.
9. Remove unnecessary hardcoded values from the starter application.
10. Introduce additional meaningful improvements.

These suggestions are not all mandatory.

For this development, prioritize a reliable subset with strong technical and visual value.

The professor allows a maximum of 10 minutes for the live demonstration.

The grading is out of 30 points:

- 24 points for meeting the minimum requirements.
- Six separate improvement criteria, worth one point each.

Therefore, implement at least six clearly distinguishable, functional enhancements, with additional backup features where feasible.

A feature counts as implemented only when it functions and can be demonstrated.

---

# 2. PROJECT OBJECTIVE

Create a modern, immersive CryptoZombies game that feels like a premium Web3 collectible platform rather than a basic academic HTML page.

The application should have the following functionality:

- Ethereum wallet connection.
- Blockchain network detection.
- Zombie creation.
- Zombie collection management.
- Zombie DNA visualization.
- Zombie leveling.
- Zombie feeding or mutation.
- Zombie ownership tracking.
- NFT transfers.
- Blockchain transaction history.
- Zombie battle functionality where supported.
- Modern responsive interface.
- Meaningful blockchain statistics.
- Persistent smart contract state.
- Well-designed transaction feedback.

Additional advanced features should be implemented only when the core functionality is stable.

The application must use real smart contract data.

Never generate fake balances, fake token ownership, fake battle results, or fake transaction success messages.

---

# 3. RECOMMENDED TECHNICAL ARCHITECTURE

Use the following architecture unless the existing starter code provides a compelling compatibility reason to adjust it.

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide icons
- React Router
- Ethers.js or Web3.js
- Reusable hooks
- Shared wallet context
- Centralized blockchain service layer
- Reusable UI components
- Lightweight motion effects

Select a wallet library only after confirming compatibility with the local Ganache provider and ABI artifacts.

Avoid installing multiple competing wallet libraries.

## Blockchain backend

- Solidity
- Ethereum Virtual Machine
- Truffle
- Ganache
- CryptoZombies contract inheritance architecture
- ERC721-compatible ownership functionality where supported
- Smart contract event logging
- Automated Solidity contract tests

## Off-chain backend

A traditional server is not required for core gameplay.

Smart contracts are the authoritative backend for token ownership and blockchain game state.

Only introduce a Node.js or Express service if a necessary feature cannot be handled cleanly using frontend contract reads, emitted events, and local indexing.

Do not add MongoDB, PostgreSQL, Firebase, or other databases merely to increase the number of technologies.

If off-chain caching is introduced, it must not be treated as the authoritative source of ownership or game results.

## Interaction flow

React UI → MetaMask → Ethereum JSON-RPC Provider → Ganache → Deployed Solidity Contracts

Read operations should request current contract state.

Write operations should create wallet-authorized blockchain transactions.

Tra receipts and contract events should update the UI.

---

# 4. PROJECT STRUCTURE

Organize the final application into maintainable modules.

**Important:** The following is a suggested organization within the existing `Cryptozombie demo package` directory. Do not create another standalone `zombienexus` project directory outside it.

Preserve the original Solidity filenames, migrations, and tests unless a verified technical reason requires changing them.

Recommended enhanced structure:

```text
Cryptozombie demo package/
│
├── contracts/
│   ├── erc721.sol
│   ├── Migrations.sol
│   ├── ownable.sol
│   ├── safemath.sol
│   ├── zombieattack.sol
│   ├── zombiefactory.sol
│   ├── zombiefeeding.sol
│   ├── zombiehelper.sol
│   ├── zombieownership.sol
│   ├── KittyContract.sol
│   └── [other existing contract files]
│
├── migrations/
│   ├── 1_initial_migration.js
│   ├── 2_deploy_contracts.js
 helpers/
│       ├── time.js
│       └── utils.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── layout/
│       │   ├── wallet/
│       │   ├── zombies/
│       │   ├── battles/
│       │   └── transactions/
│       ├── pages/
│       ├── hooks/
│       ├── context/
│       ├── services/
│       ├── config/
│       ├── types/
│       ├── utils/
│       └── styles/
│
├── scripts/
├── docs/
├── cryptozombies_abi.js
├── index.html
├── favicon.ico
├── package.json
├── package-lock.json
├── truffle-config.js
├── web3.min.js
├── README.md
└── [original professor reference files]
```

The `frontend/` directory may contain its own `package.json`, configuration, and lockfile as required by the chosen frontend tooling.

Do n unnecessarily.

Every file must contain real working implementation.

Do not create empty placeholder files solely to match the directory structure.

---

# 5. SMART CONTRACT DEVELOPMENT

## 5.1 Preserve the CryptoZombies inheritance architecture

Inspect the actual starter Solidity contracts before modifying anything.

Expected CryptoZombies architectural concepts include:

- ZombieFactory
- ZombieFeeding
- ZombieHelper
- ZombieAttack
- ZombieOwnership
- ERC721 token ownership
- Kitty interface

Verify which components exist.

Maintain inheritance relationships so the deployed ZombieOwnership contract exposes the appropriate inherited gameplay functionality.

Do not accidentally split gameplay logic into separate contracts that the frontend cannot call correctly.

Avoid changing original public function signatures unless strictly necessary.

## 5.2 Zombie creation

Implement or preserve:

- Zombie name.
- Zombie ID.
- Zombie DNA.
- Owner address.
- Creation timestamp or cooldown state if available.
- Zombie creation events.
- Owner-to-zombie mapping.

When a user creates a zombie:

1. Validate input.
2. Check whether creation is permitted.
3. Request wallet transaction.
4. Call the smart contract.
5. Wait for the transaction receipt.
6. Read the resulting zombie ID.
7. Refresh the zombie collection.
8. Display the newly created zombie.
9. Show the transaction hash.

Do not bypass limitations built into the original factory contract.

If the original factory permits only one initial zombie per account, preserve that rule unless a new authorized minting mechanic is implemented explicitly.

## 5.3 Zombie leveling

The professor's tutorial frontend visibly includes a Level Up action.

Identify its original contract method and determine any associated requirements, such as payment, ownership, or other conditions.

Preserve the original action if supported.

Display:

- Current level.
- Level-up eligibility.
- Required fee, if applicable.
- Transaction status.
- Updated level.

Optionally add experience points only if a coherent on-chain progression mechanism can be implemented.

Do not silently change the economics of the original game.

## 5.4 Zombie DNA

Implement a DNA visualization system using values from the actual smart contract.

Create reusable logic that maps DNA digits into visual character traits.

Possible visual traits:

- Head variation.
- Eye variation.
- Skin tone.
- Mouth variation.
- Accessories.
- Body variation.
- Expression.

The frontend should render the same visual traits consistently for the same DNA.

Keep this mapping deterministic.

Do not store redundant artwork data on-chain if it can be derived from existing DNA.

## 5.5 Zombie ownership

Preserve the token ownership model.

Implement functions or UI flows for:

- Reading owner.
- Displaying owned zombies.
- Transferring tokens.
- Verifying successful transfers.
- Showing ownership updates.
- Handling transfer events.

Use actual contract authorization.

Only valid token owners or authorized operators should be permitted to transfer tokens.

## 5.6 Kitty contract

The professor explains that the CryptoZombies lesson uses a Kitty interface that references the real CryptoKitties contract.

That interface alone is not enough to provide a local Kitty implementation.

If implementing Kitty feeding, create a local smart contract with the methods required by the original ZombieFeeding logic.

Implement:

- Creating a local Kitty.
- Retrieving Kitty information.
- Retrieving Kitty DNA.
- Validating Kitty IDs.
- Providing the required interface methods.
- Integrating the local Kitty contract address.
- Calling the zombie feeding method.
- Verifying resulting zombie state changes.

Avoid copying the entire production CryptoKitties contract when a minimal compatible local implementation is sufficient.

Preserve the distinction between simulated local Kitty feeding and actual interaction with the public CryptoKitties contract.

## 5.7 Battle functionality

Implement Zombie versus Zombie or Zombie versus Kitty battles when the existing architecture permits.

Support:

- Selecting a player zombie.
- Selecting an opponent.
- Ownership validation.
- Battle eligibility.
- Cooldown enforcement.
- On-chain battle execution.
- Win/loss state updates where supported.
- Experience or progression updates.
- Battle events.
- UI animations reflecting confirmed results.

Do not decide authoritative results in the frontend.

If the existing battle contract uses predictable blockchain randomness, retain or improve it with an explicit understanding of its limitations.

Do not describe predictable block-derived randomness as secure.

## 5.8 Transaction events

Ensure meaningful actions emit events.

Where applicable, use events for:

- Zombie creation.
- Ownership transfer.
- Level progression.
- Zombie feeding.
- Battle completion.
- Marketplace listing.
- Marketplace purchase.

Integrate events into the frontend activity feed.

Do not invent event names that are unsupported by the deployed ABI.

---

# 6. FRONTEND DESIGN AND DEVELOPMENT

## 6.1 Design identity

Build a polished modern gaming interface.

Brand name: ZOMBIENEXUS

Visual direction:

- Dark charcoal background.
- Electric green highlights.
- Muted purple accents.
- Gold highlights for rare characters.
- Clean modern typography.
- Rounded cards.
- Premium game artwork.
- Subtle animations.
- Clear hierarchy.
- Consistent spacing.

The frontend should combine a collectible NFT game aesthetic with a professional dashboard.

Avoid a generic admin template.

Avoid excessive neon, unnecessary animation, and visually crowded layouts.

## 6.2 Global application layout

Create a reusable application shell containing:

- Sidebar navigation.
- Header.
- Wallet connection control.
- Network indicator.
- Account address display.
- Main content.
- Toast notifications.
- Transaction notifications.
- Responsive mobile navigation.

Suggested navigation:

Dashboard  
Zombie Factory  
My Zombie Army  
Battle Arena  
Zombie Details  
Transactions  
Settings

Only expose pages for genuinely implemented functionality.

An incomplete marketplace should not appear as a functioning page.

## 6.3 Dashboard

The dashboard is the first screen after wallet connection.

Display:

- Welcome message.
- Connected wallet.
- Current network.
- Test ETH balance.
- Total owned zombies.
- Zombie army preview.
- Total zombie levels if meaningful.
- Recent transactions.
- Action buttons.
- Useful blockchain status.

Use actual values wherever blockchain data is presented.

The dashboard should update when:

- The wallet changes.
- The network changes.
- A zombie is created.
- A zombie is transferred.
- A zombie levels up.
- A transaction is confirmed.

## 6.4 Zombie Factory page

Create a visually attractive factory screen.

Include:

- Character creation panel.
- Zombie name input.
- DNA preview.
- Creation eligibility.
- Create Zombie button.
- Wallet transaction feedback.
- Successful creation animation.
- New zombie details.

Explain creation restrictions to the user before requesting an invalid transaction.

## 6.5 Zombie Army page

Display the connected wallet's zombie collection.

Use a responsive card grid.

Each card should display:

- Character artwork.
- Name.
- Zombie ID.
- Level.
- DNA.
- Owner.
- Cooldown status if available.
- View Details action.

Implement:

- Sorting.
- Filtering.
- Empty states.
- Loading skeletons.
- Error handling.
- Refresh functionality.

The frontend should support multiple zombies if the contract state permits them.

Do not fake multiple owned NFTs when only one exists.

## 6.6 Zombie Details page

Display:

- Large zombie artwork.
- Name.
- ID.
- Level.
- DNA.
- Owner address.
- DNA-derived visual traits.
- Cooldown.
- Available actions.

Provide functional action controls for:

- Level Up.
- Transfer.
- Feed.
- Battle.

Only show enabled actions if they are implemented and permitted.

## 6.7 Battle Arena

Design a two-character battle screen.

Display the player's zombie on one side and the opponent on the other.

Include:

- Character artwork.
- Names.
- Levels.
- Relevant attributes.
- Eligibility indicators.
- Battle button.
- Transaction progress.
- Outcome.
- Updated blockchain state.

Animations should accompany confirmed contract events and should never be presented as proof of blockchain success by themselves.

## 6.8 Transactions page

Display relevant blockchain activity.

Include:

- Transaction hash.
- Action type.
- Status.
- Block number.
- Sender.
- Contract address.
- Gas used when available.
- Confirmation time if available.

Query transaction receipts and contract events.

Clearly distinguish locally indexed contract events from a complete blockchain transaction history.

Avoid suggesting that Ganache transactions exist on Etherscan.

## 6.9 Wallet modal

Provide:

- Connect MetaMask.
- Connected address.
- Network name.
- Chain ID.
- Wallet balance.
- Disconnect application session.
- Refresh connection.
- Incorrect network guidance.

The wallet modal should be functional.

Do not claim that an application disconnect action revokes MetaMask permissions unless it actually does.

---

# 7. MODERN METAMASK INTEGRATION

The professor explicitly identifies older wallet integration code as obsolete.

Do not use this old polling mechanism:

```javascript
var accountInterval = setInterval(function () {
  if (web3.eth.accounts[0] !== userAccount) {
    userAccount = web3.eth.accounts[0];
    getZombiesByOwner(userAccount)
      .then(displayZombies);
  }
}, 100);
```

Instead, detect changes through wallet events.

The professor provided the following approach:

```javascript
ethereum.on("accountsChanged", (accounts) => {
  window.location.reload();
});

ethereum.on("chainChanged", (chainId) => {
  window.location.reload();
});
```

Preserve the event-driven behavior.

The professor also supplied a replacement startup example using `ethereum.enable()`, but for this new frontend prefer the modern provider request interface.

Implement:

```javascript
async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  return accounts[0];
}
```

Also support:

```javascript
ethereum.request({
  method: "eth_accounts"
});

ethereum.request({
  method: "eth_chainId"
});
```

Create a single WalletProvider or equivalent wallet service.

Handle account and network changes without registering duplicate event listeners.

Implement graceful UI refreshes and cleanup.

Handle:

- Missing MetaMask.
- User rejection.
- Wrong network.
- No connected account.
- RPC disconnection.
- Contract not deployed.
- Failed transaction.
- Reverted transaction.
- Insufficient test ETH.
- Pending confirmations.
- Network switching.

Never use a real private key in frontend source code.

---

# 8. BLOCKCHAIN CONFIGURATION

Create centralized configuration.

Use compiled Truffle artifacts where appropriate.

Resolve the contract address using the actual current deployment.

Support local configuration of:

- RPC URL.
- Chain ID.
- Network ID.
- Contract ABI.
- ZombieOwnership address.
- Local Kitty contract address if implemented.

Avoid embedding one fixed account or contract address throughout the React components.

Verify bytecode is deployed at the configured address before allowing contract writes.

Prevent transactions on unsupported networks.

Use Ganache accounts funded with test ETH.

Never request or expose actual wallet seed phrases.

---

# 9. SIX PRIMARY ENHANCEMENTS

Implement at least six independent improvements beyond the video demonstration.

## Enhancement 1: Premium full React frontend

Replace the basic three-button HTML page with a professional responsive game interface.

Include:

- Dashboard.
- Navigation.
- Zombie artwork.
- Wallet status.
- Responsive cards.
- Loading states.
- Notifications.
- Consistent visual design.

## Enhancement 2: Dynamic wallet and network integration

Add:

- MetaMask connection.
- Account change handling.
- Chain change handling.
- Real-time balance retrieval.
- Network validation.
- Dynamic contract configuration.
- Wallet-related error handling.

## Enhancement 3: Zombie Factory and Army

Provide:

- Zombie creation.
- Owned zombie collection.
- Multiple zombie support where authorized.
- Individual character detail pages.
- DNA information.
- Sorting and filtering.

## Enhancement 4: Ownership Transfer

Enable actual NFT transfers between two Ganache wallet accounts.

After transfer:

- Update both collections.
- Display the transaction hash.
- Verify the new owner from the contract.
- Show the ownership change in the activity feed.

## Enhancement 5: Zombie Feeding and Mutation

Implement working feeding or mutation functionality using the existing CryptoZombies architecture and a local Kitty contract if required.

Display the before-and-after zombie DNA or traits.

## Enhancement 6: Battle Arena

Implement at least one working blockchain battle mechanic.

Display the participants, initiate a real transaction, verify the resulting state, and show the outcome.

If the underlying battle mechanism proves incompatible or too complex, substitute another independently demonstrable improvement such as additional leveling functionality, automated on-chain statistics, or a more advanced event-driven activity explorer.

## Backup enhancement 7: Transaction Explorer

Build a real event and transaction monitoring interface.

## Backup enhancement 8: Smart Contract Test Dashboard

Provide a developer diagnostics screen showing the connected contract address, chain ID, supported methods, and verified deployment status.

Actual automated tests should still run independently through Truffle.

## Optional advanced enhancement 9: NFT Marketplace

Implement only after all core features work.

Use a simple fixed-price marketplace with proper approvals, listing cancellation, payment handling, and ownership verification.

Do not sacrifice the working baseline to build this feature.

---

# 10. SMART CONTRACT TESTING

Create meaningful automated Truffle tests.

Required test scenarios:

1. Contracts compile.
2. Contracts deploy.
3. Zombie creation works.
4. Zombie data is correct.
5. Ownership is assigned correctly.
6. Zombie retrieval works.
7. Creation restrictions are enforced.
8. Authorized transfers succeed.
9. Unauthorized transfers revert.
10. Ownership changes after a transfer.
11. Level-up eligibility is enforced.
12. Level changes persist.
13. Feeding succeeds where implemented.
14. Invalid Kitty interactions revert.
15. Battles enforce authorization.
16. Battle cooldowns work.
17. Contract events contain correct values.
18. Wrong-account transactions are rejected.
19. Invalid IDs fail safely.
20. New state persists across frontend reloads.

Tests must use actual local blockchain execution.

Do not claim a test has passed unless the test runner has executed it.

Fix failing tests before continuing.

---

# 11. FRONTEND TESTING AND QUALITY

Test all significant user flows.

Verify:

- Wallet connection.
- Wallet switching.
- Network switching.
- Zombie creation.
- Zombie retrieval.
- Display of multiple zombies.
- Level-up actions.
- Ownership transfers.
- Feeding.
- Battles.
- Transaction notifications.
- Contract errors.
- Page refreshing.
- Responsive design.

Handle both success and failure states.

Use appropriate component testing if compatible with the chosen frontend stack.

Do not create fragile tests that depend on arbitrary timeout delays.

---

# 12. DEPLOYMENT ENGINEERING

Create working Truffle migration scripts.

Ensure the correct contracts are deployed in dependency order.

Compile the contracts with Solidity 0.8.11 where required by the starter code.

Resolve compilation incompatibilities rather than replacing Solidity behavior with unsafe shortcuts.

Configure Ganache and Truffle consistently.

Provide scripts to:

- Install dependencies.
- Compile contracts.
- Run tests.
- Deploy locally.
- Export deployed contract addresses.
- Start the React frontend.
- Verify contract availability.

The application should not depend on manually editing contract addresses in several locations after every deployment.

Prefer generating a frontend deployment configuration from the actual Truffle artifacts.

Provide an `.env.example` where appropriate.

Do not include secrets in the repository.

---

# 13. TRANSACTION UX

Every blockchain write action must follow this lifecycle:

1. User initiates an action.
2. Validate inputs and eligibility.
3. Display wallet confirmation status.
4. Submit transaction.
5. Display pending status.
6. Capture transaction hash.
7. Wait for receipt.
8. Confirm execution success.
9. Retrieve updated smart contract state.
10. Update affected frontend components.
11. Display success or error feedback.

For a rejected transaction, do not change the UI as though the transaction succeeded.

Avoid unnecessary page reloads.

Prevent accidental duplicate submissions while a transaction is pending.

---

# 14. SECURITY REQUIREMENTS

Review Solidity code for:

- Unauthorized transfers.
- Incorrect access control.
- Unsafe external calls.
- Reentrancy.
- Weak randomness.
- Improper cooldown enforcement.
- Invalid token IDs.
- Incorrect ownership mapping.
- Unbounded loops.
- Gas-intensive operations.
- Missing state validation.
- Incorrect token approvals.
- Unexpected economic behavior.

Use conservative modifications to the original CryptoZombies contracts.

Never introduce production claims that are unsupported by auditing or tests.

This is a local educational DApp, so clearly document any simplified game mechanics.

---

# 15. DEMONSTRATION READINESS

The professor has a strict 10-minute demonstration limit.

The application must be fully deployed before the demonstration begins.

Create a demo-friendly environment containing:

- Running Ganache blockchain.
- Connected MetaMask.
- Deployed contracts.
- A wallet with adequate test ETH.
- Existing zombie NFTs.
- A second wallet for transfers.
- Suitable test characters for battling.
- Working activity history.
- No pending compilation or installation steps.

The following live interactions should be possible:

1. Open the dashboard.
2. Connect wallet.
3. Show the Ganache network.
4. Create a zombie where authorized.
5. Display owned zombies.
6. Inspect DNA and character details.
7. Level up or mutate a zombie.
8. Transfer a zombie to another Ganache account.
9. Switch wallet and confirm ownership.
10. Run a battle if implemented.
11. Display the relevant blockchain transaction.
12. Show the completed improvement functionality.

Keep these actions quick and reliable.

Do not require resetting the blockchain in the middle of the demo.

---

# 16. DOCUMENTATION REQUIRED FOR THE FINISHED CODEBASE

Generate a README with:

- Project name.
- Overview.
- Technology stack.
- Architecture.
- Smart contract descriptions.
- Main frontend features.
- Setup instructions.
- Ganache configuration.
- Truffle configuration.
- MetaMask setup.
- Contract deployment instructions.
- Testing commands.
- Frontend startup commands.
- Troubleshooting.
- Implemented improvements.
- Team member placeholders for name, CWID, and email.

The professor requests that the final DApp, video demo, and any slides be included in a `.rar` package, or that a GitHub repository link be provided in the README where applicable.

Create complete reproducible development instructions.

Do not invent team details.

---

# 17. IMPLEMENTATION ORDER

Follow these exact development milestones.

## Milestone 1: Restore and run the starter DApp

- Inspect the existing project directory.
- Install matching dependencies.
- Compile smart contracts.
- Deploy contracts to Ganache.
- Verify ZombieOwnership deployment.
- Connect MetaMask.
- Run original frontend.
- Verify Show Zombies, Create Zombie, and Level Up where the actual starter supports them.
- Run the existing Truffle tests.
- Preserve a recoverable baseline before substantial changes.

Do not continue until the minimum DApp works.

## Milestone 2: Build the modern frontend foundation

Inside the existing project directory:

- Create `frontend/`.
- Configure React and TypeScript.
- Integrate Tailwind.
- Build global layout.
- Implement wallet context.
- Add contract service.
- Add routing.
- Add notifications.
- Establish design tokens.

Do not relocate the original Solidity contracts.

## Milestone 3: Implement the dashboard and factory

- Create dashboard.
- Implement zombie creation.
- Retrieve zombie data.
- Render zombie images.
- Handle transaction states.

## Milestone 4: Implement Zombie Army

- Display owned zombies.
- Add character details.
- Add sorting and filters.
- Display DNA and level.
- Support multiple tokens.

## Milestone 5: Implement NFT transfer

- Integrate transfer function.
- Add wallet address validation.
- Show transaction confirmation.
- Verify ownership updates.

## Milestone 6: Implement additional gameplay

- Add local Kitty contract where needed.
- Implement feeding or mutation.
- Implement battle functionality if feasible.
- Integrate contract events.

## Milestone 7: Add blockchain explorer

- Retrieve transactions and relevant events.
- Display transaction details.
- Add history filters.
- Handle provider refreshes.

## Milestone 8: Test, polish, and finalize

- Run smart contract tests.
- Run frontend checks.
- Fix errors.
- Test account switching.
- Verify network handling.
- Improve responsive layouts.
- Prepare seeded demo state.
- Generate README.
- Verify that every new file and modification remains inside the original project directory.
- Confirm the original Truffle and Ganache workflow remains functional.

Every milestone must finish with working code.

---

# 18. OUTPUT INSTRUCTIONS

I do not want a generic explanation of how to build the application.

I want the actual implementation directly inside my existing project directory.

For every milestone:

1. Create or modify the required project files in the supplied folder.
2. Identify the exact files changed.
3. Write complete working code into those files.
4. Install or identify necessary dependencies.
5. Integrate with the existing project.
6. Execute validation where tools permit.
7. Explain any failures.
8. Fix the failures.
9. Confirm what is actually working.
10. Proceed to the next milestone.

**Do not merely print large code blocks when you have permission and the capability to write them directly into the project files.**

Use Claude Cowork's filesystem capabilities to perform the work.

After major milestones, provide a concise summary containing:

- Files created.
- Files modified.
- Functionality implemented.
- Commands executed.
- Tests passed.
- Tests failed.
- Remaining limitations.
- Next development milestone.

Do not provide pseudocode instead of implementation.

Do not create visually attractive screens with nonfunctional buttons.

Do not use mocked transactions or fictional zombie data in the finished application.

Do not abandon the professor's original Truffle and Ganache requirements.

Do not skip smart contract testing.

Do not introduce unnecessary infrastructure.

Do not rewrite functioning starter contracts without justification.

Do not mark incomplete features as complete.

Prioritize a stable and impressive finished DApp over speculative advanced features.

---

# 19. FINAL ACCEPTANCE CHECKLIST

The project is development-complete only when:

- The original starter functionality works.
- Smart contracts compile successfully.
- Contracts deploy on Ganache.
- The correct ZombieOwnership address is used.
- MetaMask connects successfully.
- Account and network changes are handled.
- The React frontend loads correctly.
- Zombie creation works.
- Zombie ownership is displayed accurately.
- Zombie details and DNA are visible.
- Level-up works where supported.
- Transfers execute correctly.
- At least six additional meaningful improvements have been implemented and can be demonstrated.
- Advanced features execute correctly if included.
- Smart contract tests pass.
- The frontend has no critical runtime errors.
- All primary interactions use actual blockchain state.
- Configuration is reproducible.
- README and startup instructions are complete.
- The application is ready for a 10-minute demonstration.
- The finished application remains inside the original `Cryptozombie demo package` directory.
- The original contracts, migrations, and tests have been preserved or carefully extended.
- The modern React frontend integrates with the existing deployed Solidity architecture.
- The original project can still be compiled and deployed using Truffle and Ganache.
- All modifications are documented and traceable.

---

# EXECUTION INSTRUCTION FOR CLAUDE COWORK

**Begin actual development immediately using the project directory I have provided.**

You have access to the existing:

`Cryptozombie demo package`

This directory is your primary workspace and authoritative code reference.

Do not create a separate replacement application.

### Step 1: Inspect the existing project

Read the real project files and identify:

- Solidity contract hierarchy.
- Available functions.
- Existing frontend logic.
- Contract ABI.
- Truffle configuration.
- Deployment scripts.
- Existing automated tests.
- Dependency compatibility.
- Existing blockchain functionality.

### Step 2: Establish a working baseline

Run the original project, using Ganache and MetaMask when the environment supports them.

Compile contracts, deploy them, and execute existing tests.

Preserve the starter functionality.

### Step 3: Extend the existing application

Create the modern ZOMBIENEXUS frontend inside the same project.

Reuse the original Solidity contracts and expose their functionality through the new frontend.

Make necessary backend modifications only when required for additional functionality.

### Step 4: Implement six primary improvements

Develop and integrate the selected enhancements, prioritizing features that can be demonstrated reliably.

### Step 5: Validate the complete system

Run automated tests, verify contract integration, test the frontend, resolve failures, and prepare the application for demonstration.

### Step 6: Deliver the finished application in place

Leave all completed source files, dependencies, deployment scripts, documentation, and test files inside the existing project directory.

Provide exact startup commands and a summary of verified functionality.

If the environment cannot perform a required action, explain that specific limitation rather than pretending the action succeeded.

Do not pause for unnecessary questions.

Only request user input when an essential detail, permission, or manual action is required.

**Most important instruction: This is an enhancement of the professor's existing CryptoZombies project, not a greenfield development project. Preserve the original foundation, extend it intelligently, and make all changes directly within the supplied directory.**

**Final objective: Deliver a complete, working, visually exceptional CryptoZombies blockchain application that exceeds the professor's minimum starter project while maintaining compatibility, security, and a reliable live demonstration workflow.**
