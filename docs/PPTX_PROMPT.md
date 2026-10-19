# PROMPT FOR CODEX: build ZOMBIENEXUS.pptx

Paste everything below this line into a Codex agent that has shell access to the project folder (the folder that contains `package.json`, `contracts/`, `frontend/`, `docs/`). Run it from that folder.

---

## 1. Role and goal
You are a senior presentation designer and blockchain engineer. Build one PowerPoint file, `ZOMBIENEXUS.pptx`, for a university midterm demo of a Solidity + React project called ZOMBIENEXUS (an upgraded CryptoZombies starter running on a local Ganache chain with MetaMask).
The deck must be clear, honest, visually striking and fully editable. It supports a live demo; it does not replace it.

## 2. Audience, time, slide count
1. Audience: a CSUF Advanced Blockchain professor (grades with a rubric) and classmates (know Solidity basics, have seen CryptoZombies).
2. Slot: a 10 minute live demo plus about 6 minutes of slide talk. The slides are spoken in two blocks: slides 1-6 before the demo, slides 7-14 after it (they double as a fallback if the live demo breaks).
3. Total: exactly 14 slides. Do not add appendix slides.
4. Timing per slide is stated in section 6 and must be written into each slide's speaker notes as `TIME: m:ss`. Slide talk sums to 6:00.

## 3. Read first, and fact rules
1. Before writing anything, read completely: `docs/PROJECT.md`, `README.md`, `CHANGES.md`, `docs/SPEC.md`.
2. Facts, numbers, names, counts and claims on slides may come ONLY from those four files: `README.md`, `CHANGES.md`, `docs/PROJECT.md`, `docs/SPEC.md`. If two files disagree, `CHANGES.md` wins, then `docs/SPEC.md`. Do not read other files for facts. Images come only from `docs/screens/` (section 8).
3. No invented numbers, benchmarks, gas costs, user counts, dates or quotes. If a fact you want is missing, write the slide without it and put `TODO: <what is missing>` in that slide's speaker notes. Never print TODO on the slide face.
4. Keep these placeholders exactly as written, never replace them with real data: `[TEAM_MEMBER_1_NAME]` `[TEAM_MEMBER_2_NAME]` `[TEAM_MEMBER_3_NAME]` `[CWID_1]` `[CWID_2]` `[CWID_3]` `[EMAIL_1]` `[EMAIL_2]` `[EMAIL_3]` `[GITHUB_REPO_URL]`. Do not invent a course number, professor name or school logo.
5. Hero names (Iron Man, Captain America, Thor, Hulk, Black Widow, Hawkeye) appear as plain text only. No logos, no official artwork, no movie stills.
6. Never run git. Never install anything globally. Do not start Ganache or the app; screenshots are supplied (section 8).

## 4. Visual identity (apply to every slide)
1. Canvas 16:9, 13.333 in x 7.5 in. Background solid charcoal `#0B0D10`. Optional faint grain or vignette made from native shapes only.
2. Colours: electric green `#39FF88` = primary accent and success; muted purple `#8E7CC3` = secondary (Avengers, NPC); gold `#F2C14E` = rare/hero emphasis only (use sparingly, at most one gold element per slide); text `#E8ECF1`; muted text `#9AA4B2`; panels `#12151A` / `#181C23`; hairlines `#262C36`; danger `#FF5C6C`; warning `#FFB547`.
3. Fonts: headings Space Grotesk (bold); body Inter; code and DNA `Menlo` (fallback `Consolas`, `Courier New`). Set the font names in the file so they render if installed. Do not embed fonts. Fallback stack when not installed: Arial for both. After building, report which of the three families are installed on the build machine and make sure nothing overflows with the Arial fallback (Arial is wider than Inter; leave 10 percent slack).
4. Type scale: slide title 36 pt, subtitle 18 pt, body 18-20 pt (minimum 16 pt), captions 12 pt (minimum), code 14 pt. Max 5 bullets per slide, max 12 words per bullet.
5. Glass-card look: rounded rectangles (radius about 0.12 in), fill `#12151A` at 20-25 percent transparency, 0.75 pt hairline border `#262C36`, soft shadow, optional 1 pt accent top edge. Use native shape fills and transparency; no pictures of cards.
6. Grid: 0.6 in side margins, 0.5 in top margin. Title block top-left at y 0.5 in, height 0.9 in, with a 0.06 in wide green bar left of the title. 12-column grid, 0.25 in gutters. Content area y 1.7 in to 6.7 in. Footer strip at y 7.0 in: left `ZOMBIENEXUS`, right slide number, 11 pt muted. Same positions on every slide except slide 1 and 14.
7. No clip-art, no stock photos, no emoji, no gradients heavier than a subtle dark-to-darker panel. Icons, if any, are simple native shapes or text glyphs.
8. Contrast: body text on background at least 4.5:1. Never put muted grey `#6B7482` or purple text on panels for body copy; purple is for accents and borders.
9. Every slide has one visual anchor (screenshot, diagram, table or big number). No wall of text.

## 5. Build rules
1. Output file: `ZOMBIENEXUS.pptx` in the project root.
2. Tool: use python-pptx or pptxgenjs, whichever already works. Check `python3 -c "import pptx"` and `node -e "require('pptxgenjs')"` (also look inside the project `node_modules`). If neither exists, create a LOCAL environment inside the project at `.pptx-build/` (a python venv `python3 -m venv .pptx-build/venv` or `npm install --prefix .pptx-build pptxgenjs`). Never install globally, never use sudo or brew, never touch `package.json`. Keep the generator script at `.pptx-build/build_deck.py` (or `.js`) so the deck can be regenerated.
3. All text is native, editable PowerPoint text boxes. No text baked into images. Diagrams are drawn with native shapes and connectors (rectangles, rounded rectangles, arrows, lines, chevrons) with real text inside.
4. Every picture has alt text (`descr` attribute) saying what it shows. Decorative shapes get empty alt text where the library allows it.
5. Speaker notes on EVERY slide, written in the first person, 60-120 words, starting with `TIME: m:ss`, then the talk track, then a line `DEMO CUE:` (what is on screen in the live demo at this point, or `none`), then any `TODO:` lines.
6. Transitions and animation: PowerPoint transitions and animations are not reliably supported by python-pptx/pptxgenjs. Therefore: set a short `Fade` transition on every slide if the library supports it, otherwise skip it. Do not hack raw XML for animations. Each slide's "Motion" line in section 6 is a hint: in notes write `BUILD:` with the click order a presenter should follow (for example "reveal bullets one by one"), and keep slides readable with all content visible.
7. Screenshots go in as pictures, scaled to keep aspect ratio, inside a glass card with a 1 pt border and a caption. See section 8 for missing files.
8. Core properties: title `ZOMBIENEXUS`, author left blank, no real names.

## 6. Slide-by-slide spec
For each slide: Title / Bullets / Visual / Notes focus / Motion hint. Bullets are short; reword to fit but keep meaning. Pull exact numbers from the four source files. Screenshot names below are the exact file names in `docs/screens/` (full list in section 8).

**S01 Title (0:15)**
- Title `ZOMBIENEXUS`, with NEXUS in green. Subtitle: "CryptoZombies, fixed and upgraded: Solidity 0.4.25 + React + MetaMask on a local Ganache chain". Small line: CSUF Advanced Blockchain midterm.
- Visual: large floating-card trio built from native shapes (common green frame, rare gold frame, hero purple-to-gold frame) with the DNA string as text, or `gallery-desktop.png` cropped.
- Footer: `[TEAM_MEMBER_1_NAME]  [TEAM_MEMBER_2_NAME]  [TEAM_MEMBER_3_NAME]`.
- Motion: none.


**S02 Problem and starter (0:35)**
- Title "The starter works, until you look closely".
- Bullets: the CryptoZombies starter bugs actually listed in `CHANGES.md` (expect: `_transfer` decrements the sender's count instead of `_from`; approvals never cleared; `transferFrom` never checks `_from`; `attack` has no readiness check; hard-coded address in the legacy `index.html`). Use only bugs that CHANGES.md or PROJECT.md confirms.
- Visual: three red-bordered glass cards with a one-line bug each and a small code snippet from the starter if given in CHANGES.md.
- Notes: why each bug matters (stuck sender, stale approval, free attacks).
- Motion: cards appear left to right.


**S03 Solution overview (0:30)**
- Title "What we built".
- Bullets (6 improvements in five words each): React frontend; wallet and network handling; Factory and Army; ownership transfer; Avenger feeding (hero zombies); battle arena.
- Visual: 2x3 grid of numbered glass tiles 1-6, tile 5 and 6 outlined purple.
- Notes: the legacy trio still works at `/legacy/`.
- Motion: tiles fade in sequentially.


**S04 Architecture (0:35)**
- Title "Architecture".
- Visual: native-shape diagram, left to right: Browser (React + ethers v6, Vite) -> MetaMask (signs) -> Ganache chain (127.0.0.1:7545, chain 1337) hosting two boxes `ZombieOwnership` and `AvengerContract`; a second arrow from React straight to Ganache labelled "reads via RPC (no wallet needed)"; a box `scripts/` (demo, seed, check, serve) below; a small box `deployment.json` between scripts and React ("no hard-coded addresses"). Use ports and names exactly as in SPEC section 3.4.
- Bullets under diagram: max 3 (single page app on :8080; `/legacy/` serves original trio; reads direct, writes via wallet).
- Motion: build diagram left to right.


**S05 Contract changes and bug fixes (0:35)**
- Title "Contract fixes: before and after".
- Visual: two-column before/after table, 4-5 rows from CHANGES.md (transfer accounting, approval cleared, `transferFrom` checks `_from`, ready check before attack, level-up fee public + events, require messages). Left column red-tinted, right column green-tinted, code in Menlo 14 pt (short fragments, from SPEC section 1).
- Notes: mention the inheritance chain Ownable -> ZombieFactory -> ZombieFeeding -> ZombieHelper -> ZombieAttack -> ZombieOwnership.
- Motion: reveal row by row.


**S06 Avenger NPC contract and odds (0:35)**
- Title "AvengerContract: a local NPC".
- Bullets: standalone contract, anyone can `createAvenger(genes)`; `feedOnAvenger` creates a hero zombie (DNA ends in 99); `attackAvenger` uses a fair odds formula.
- Visual: formula card in gold outline using SPEC section 1.5: `power = genes % 10 + 1`; `chance = clamp(50 + 5*level - 5*power, 10, 90)`; win if `roll < chance`. Beside it a small native bar chart (shapes) of the worked examples from SPEC section 8.5 ((level 8 vs power 4 = 70 percent), (level 8 vs power 9 = 45 percent), (level 1 vs power 10 = 10 percent), (level 20 vs power 1 = 90 percent)). Then a footnote row: "Replaces CryptoKitties; local, deterministic, testable".
- Notes end with: "Now the live demo" and the demo order from the demo runbook in PROJECT.md or README.md (TODO if absent).
- Motion: formula first, then chart.


**--- LIVE DEMO (10:00), not a slide. ---**

**S07 Frontend tour (0:20)**
- Title "Frontend tour".
- Visual: 2x3 mosaic of screenshots with captions: `home-army.png` (Army), `create-preview.png` (Factory), `zombie-detail.png` (Detail), `avengers.png`, `activity.png`, `settings-diagnostics.png`. Add a thin strip below with `gallery-desktop.png` and `gallery-mobile.png` thumbnails labelled "Responsive, wallet-free Gallery".
- Bullets: none beyond captions (route name in Menlo under each tile, from SPEC section 6).
- Notes: one sentence per area, in route order.
- Motion: none.


**S08 Wallet, network and transaction lifecycle (0:25)**
- Title "Wallet and tx handling".
- Visual left: state machine drawn with native shapes using the exact 7 states from SPEC section 4.2: `no-metamask`, `disconnected`, `connecting`, `wrong-network`, `no-contract`, `rpc-down`, `ready`, with arrows (disconnected -> connecting -> ready; ready <-> wrong-network via switch; rpc-down / no-contract as top-priority banners).
- Visual right: horizontal tx stepper of the 7 tx states in SPEC (idle, awaiting-signature, pending, confirmed, reverted, rejected, failed) with green path and red/amber terminals. Under it a mini-table of the 5 error kinds (rejected, funds, network, reverted, unknown) with one example message from SPEC section 4.3.
- Bullets: 3 max ("success only when receipt.status is 1"; "no page reload on chain change"; "readable errors").
- Motion: stepper builds left to right.


**S09 Battle arena (0:15)**
- Title "Battle arena".
- Visual: `battle-arena.png` and `battle-result.png` side by side.
- Bullets: vs Avengers and vs Zombies; result comes from the on-chain event, not the animation; odds shown before you fight.
- Motion: none.


**S10 Testing (0:25)**
- Title "Tested, not trusted". Big number "30" in green: Truffle scenarios (6 starter + 20 master + 4 Avenger, per SPEC section 8) plus a second big number "47" in green for Vitest unit tests (47 tests in 6 files, per README.md and CHANGES.md). If a source file disagrees, follow CHANGES.md; if no count is given anywhere, show "Vitest" without a number and add a TODO in notes.
- Visual: `tests-passing.png` right side.
- Bullets: no test depends on luck (the randomness is recomputed in the test); every revert message asserted; DNA preview in the UI equals the on-chain DNA.
- Motion: numbers count up is not required, plain.


**S11 One-command demo and reset (0:15)**
- Title "One command".
- Visual: a terminal-style glass card (native shapes, Menlo) with the real npm scripts from README.md (expect `npm run setup`, `npm run demo`, `npm run reset`, `npm run snapshot`, `npm run restore`, `npm run check`, `npm test`). Include only commands that README confirms.
- Bullets: golden snapshot gives the same demo state every time; `check` verifies chain, contracts and wiring.
- Motion: none.


**S12 Improvements mapped to the grading rubric (0:30)**
- Title "Rubric map".
- Visual: table. Row 0: "Starter runs on Ganache (24 pts)" with `legacy-trio.png` thumbnail and note "original index.html at /legacy/". Rows 1-6: "+1 pt each" with the six improvements from SPEC section 7 (premium React frontend; wallet + network integration; Factory + Army; ownership transfer; feeding/mutation with local AvengerContract; battle arena), each with the proof column (screen name or test id). A muted line "Backups: activity explorer, diagnostics, starter bug fixes + 30 tests, one-command demo/reset". Do not claim a score.
- Motion: rows appear one by one.


**S13 Known limitations and what we learned (0:30)**
- Title "Honest limits, real lessons". Two columns. Limits (from CHANGES.md "Known limitations"; pick the 5 most important, for example: ownerless `levelUp`, 71 percent PvP win rate, predictable on-chain randomness, open `createAvenger` with any genes, self-attack possible on-chain; the rest go in speaker notes). Lessons (from PROJECT.md/CHANGES.md only; if none are written there, write 3 neutral, factual ones derived from the bugs listed on S02 and put `TODO: confirm lessons with the team` in notes).
- Motion: left column then right column.


**S14 Q&A and team (0:15)**
- Title "Questions?". Big green "Q&A". Team card with three rows: `[TEAM_MEMBER_1_NAME]  [CWID_1]  [EMAIL_1]`, `[TEAM_MEMBER_2_NAME]  [CWID_2]  [EMAIL_2]`, `[TEAM_MEMBER_3_NAME]  [CWID_3]  [EMAIL_3]`; below: `[GITHUB_REPO_URL]` in Menlo; below that "Run it: npm run setup, npm run demo" if README confirms.
- Notes: list likely questions and answers drawn from CHANGES.md limitations (randomness, ownerless levelUp, open `createAvenger`, payable `transferFrom` and `approve`, trusted Avenger contract, Ganache-only).
- Motion: none.


## 7. Layout reminders per slide type
1. Title text must fit on one line at 36 pt (max about 38 characters); shorten rather than shrink below 32 pt.
2. Screenshot tiles keep the source aspect ratio; letterbox inside the card, never stretch or crop faces of UI.
3. Tables are native PowerPoint tables or aligned text boxes with hairline rules; header row in muted caps 12 pt.
4. Diagram arrows are real connectors with arrowheads, 1.5 pt, `#9AA4B2`; active path `#39FF88`.

## 8. Screenshots in docs/screens/
The folder `docs/screens/` may not exist yet: the team creates it and captures the images from the running app. Expected files (PNG, exactly 13, these exact names):
1. `gallery-desktop.png` - `/gallery` at about 1440 px wide: 12 zombie cards and 6 Avengers, all rarity frames visible.
2. `gallery-mobile.png` - `/gallery` at about 375 px wide, single column, bottom navigation visible.
3. `home-army.png` - `/` with a connected wallet: stat row, filter chips and the army grid of zombie cards.
4. `create-preview.png` - `/create` Factory: name typed, live DNA preview art, DNA digits and trait legend.
5. `create-hero-reveal.png` - the Infect result: hero zombie reveal after feeding on an Avenger, before/after DNA.
6. `zombie-detail.png` - `/zombie/:id`: large card, DNA breakdown table, action panel (level up, rename, approve, transfer).
7. `avengers.png` - `/avengers`: Avenger cards with power pips and the summon panel.
8. `battle-arena.png` - `/battle`: zombie vs Avenger, odds percentage, Battle button.
9. `battle-result.png` - arena after the transaction: VICTORY or DEFEAT banner and stat deltas.
10. `activity.png` - `/activity`: event feed with filter chips, gas used and tx hashes.
11. `settings-diagnostics.png` - `/settings`: network, contract addresses and PASS/FAIL diagnostics list.
12. `legacy-trio.png` - the original `/legacy/` page showing create, list and level up working.
13. `tests-passing.png` - terminal showing the Truffle summary (30 passing) and optionally Vitest green (47 passing).

Missing-file rule: before building, list which of the 13 files exist. For each missing file draw a labelled placeholder frame in its place: a dashed `#353D4A` rounded rectangle, fill `#12151A`, centred text `SCREENSHOT PENDING` (14 pt, muted) and under it the exact filename and one line of what it should show. NEVER fabricate, mock up or redraw a screenshot of the app, and never reuse another screenshot as a stand-in. Add `TODO: replace placeholder <filename>` to that slide's notes. The deck must be rebuildable: re-running the build script after the files appear swaps placeholders for real images.

## 9. Final self-check (run it, then print the result as a checklist)
1. File `ZOMBIENEXUS.pptx` exists in the project root and opens (re-open it with the library and count slides). Slide count is exactly 14.
2. Every slide has a title, a footer and speaker notes starting with `TIME:`; the timings add up to 6:00.
3. Fonts: list the fonts used (Space Grotesk, Inter, Menlo) and which are installed; no text smaller than 12 pt; body text 16 pt or larger.
4. Overflow: for every text box estimate the rendered height with the fallback font (about 0.5 em average character width); none may overflow its box or leave the slide bounds; no overlapping shapes except intended layering. If LibreOffice (`soffice`) is already installed, also export to PDF and inspect pages; do not install it.
5. Contrast: confirm text colours against `#0B0D10` and panel fills meet 4.5:1.
6. All pictures have alt text; no text is baked into images; no real names, CWIDs or emails; placeholders appear exactly as spelled in section 3.
7. Every number on a slide can be traced to PROJECT.md, README.md, CHANGES.md or SPEC.md; unknowns are TODO lines in notes.
8. Report the list of missing screenshots, the list of TODO lines, the generator script path and the exact command to rebuild.
Do not leave helper processes running. Do not modify any file other than `ZOMBIENEXUS.pptx` and the `.pptx-build/` folder.
