# MASTER_PROMPT index

Source: `docs/MASTER_PROMPT.md` (1494 lines incl. line-1 header comment). Line numbers refer to that file. Read slices, not the whole file.
Note: the transcript copy has paste glitches kept verbatim (line 370 "Tra receipts", line 403 "helpers/", line 441 "Do n unnecessarily", line 163-165 orphan bullets).

## Section map (lines)
| Lines | Title |
|---|---|
| 2-33 | Master prompt header, ROLE, deliverable |
| 36-92 | CRITICAL: existing project directory is source of truth (20 rules, filesystem) |
| 95-168 | Verified original directory structure + required initial inspection |
| 171-284 | 1. Professor's original requirements (1.1 minimum, 1.2 env, 1.3 frontend, 1.4 integration, 1.5 enhancement list + grading) |
| 286-314 | 2. Project objective |
| 316-372 | 3. Recommended technical architecture |
| 374-447 | 4. Project structure |
| 449-624 | 5. Smart contract development (5.1 inheritance, 5.2 creation, 5.3 level, 5.4 DNA, 5.5 ownership, 5.6 Kitty, 5.7 battle, 5.8 events) |
| 626-837 | 6. Frontend design (6.1 identity, 6.2 shell, 6.3 dashboard, 6.4 factory, 6.5 army, 6.6 details, 6.7 arena, 6.8 transactions, 6.9 wallet modal) |
| 839-923 | 7. Modern MetaMask integration |
| 925-952 | 8. Blockchain configuration |
| 954-1039 | 9. Six primary enhancements (+ backups 7, 8, optional 9) |
| 1041-1074 | 10. Smart contract testing (20 scenarios) |
| 1076-1103 | 11. Frontend testing and quality |
| 1105-1135 | 12. Deployment engineering |
| 1137-1159 | 13. Transaction UX lifecycle |
| 1161-1185 | 14. Security requirements |
| 1187-1224 | 15. Demonstration readiness |
| 1226-1253 | 16. Documentation (README) |
| 1255-1342 | 17. Implementation order (milestones 1-8) |
| 1344-1396 | 18. Output instructions |
| 1398-1428 | 19. Final acceptance checklist |
| 1430-1494 | Execution instruction (steps 1-6, final objective) |

## Verbatim extracts
Each extract below is copied verbatim from the line range shown.

---

### A. The 20 Truffle test scenarios (lines 1041-1072)

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

### B. README requirements (lines 1226-1251)

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

### C. Demo / rehearsal requirements (lines 1187-1222)

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

### D1. Professor's enhancement recommendations and grading (lines 254-282)

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

### D2. Six primary enhancements + backups (lines 954-1039)

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
