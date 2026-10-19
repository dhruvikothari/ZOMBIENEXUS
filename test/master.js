const ZombieOwnership = artifacts.require("ZombieOwnership");
const AvengerContract = artifacts.require("AvengerContract");
const utils = require("./helpers/utils");
const time = require("./helpers/time");

const ZERO = "0x0000000000000000000000000000000000000000";
const ONE_DAY = 86400;
const READY = ONE_DAY + 1; // time.increase amount that makes a fresh zombie ready
const DNA_MOD = 10n ** 16n;
// Roster genes as strings: they exceed 2^53. Thor has power 9, Hawkeye power 4.
const THOR = "9902671358840708";
const HAWKEYE = "5560218743309963";

const logOf = (result, name) => result.logs.find((l) => l.event === name);
const previewDna = (name) => {
    const dna = BigInt(web3.utils.soliditySha3(name)) % DNA_MOD;
    return dna - (dna % 100n);
};

contract("ZOMBIENEXUS master scenarios", (accounts) => {
    const [owner, alice, bob, carol] = accounts;
    let zo, av;

    // Fresh contracts per test: randNonce starts at 0 for every battle test.
    beforeEach(async () => {
        zo = await ZombieOwnership.new();
        av = await AvengerContract.new();
        await zo.setAvengerContractAddress(av.address, { from: owner });
        await av.createAvenger(THOR);
        await av.createAvenger(HAWKEYE);
    });

    const create = async (name, from) => {
        const result = await zo.createRandomZombie(name, { from });
        return result.logs[0].args.zombieId.toNumber();
    };

    it("S01 contracts compile: artifacts carry bytecode", async () => {
        for (const artifact of [ZombieOwnership, AvengerContract]) {
            assert.isAbove(artifact.bytecode.length, 2, `${artifact.contractName} has no bytecode`);
        }
    });

    it("S02 contracts deploy: deployed instances have code and avenger contract is wired", async () => {
        const deployedZo = await ZombieOwnership.deployed();
        const deployedAv = await AvengerContract.deployed();
        assert.notEqual(await web3.eth.getCode(deployedZo.address), "0x");
        assert.notEqual(await web3.eth.getCode(deployedAv.address), "0x");
        assert.equal(await deployedZo.avengerContract(), deployedAv.address);
    });

    it("S03 zombie creation works and emits NewZombie", async () => {
        const result = await zo.createRandomZombie("Rotfang", { from: alice });
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, "NewZombie");
        assert.equal(result.logs[0].args.zombieId.toNumber(), 0);
        assert.equal(result.logs[0].args.name, "Rotfang");
    });

    it("S04 zombie data is correct (name, DNA ends 00 and matches keccak preview, level 1, counters 0)", async () => {
        const result = await zo.createRandomZombie("Rotfang", { from: alice });
        const z = await zo.zombies(0);
        const dna = BigInt(z.dna.toString());
        assert.equal(z.name, "Rotfang");
        assert.equal(dna % 100n, 0n);
        assert.equal(dna, previewDna("Rotfang"));
        assert.equal(dna, 2521625881949400n);
        assert.equal(z.level.toString(), "1");
        assert.equal(z.winCount.toString(), "0");
        assert.equal(z.lossCount.toString(), "0");
        assert.equal(z.readyTime.toNumber(), (await utils.blockTime(result)) + ONE_DAY);
    });

    it("S05 ownership is assigned (ownerOf, balanceOf)", async () => {
        const id = await create("Rotfang", alice);
        assert.equal(await zo.ownerOf(id), alice);
        assert.equal(await zo.zombieToOwner(id), alice);
        assert.equal((await zo.balanceOf(alice)).toNumber(), 1);
        assert.equal((await zo.balanceOf(bob)).toNumber(), 0);
    });

    it("S06 zombie retrieval works (getZombiesByOwner, getZombieCount, zombies)", async () => {
        await create("Rotfang", alice);
        const bobId = await create("Grimjaw", bob);
        await create("Mossbelly", carol);
        await zo.transferFrom(bob, alice, bobId, { from: bob });
        const ids = (await zo.getZombiesByOwner(alice)).map((n) => n.toNumber());
        assert.deepEqual(ids, [0, 1]);
        assert.deepEqual((await zo.getZombiesByOwner(bob)).map((n) => n.toNumber()), []);
        assert.equal((await zo.getZombieCount()).toNumber(), 3);
        assert.equal((await zo.zombies(2)).name, "Mossbelly");
    });

    it("S07 creation restriction: second free zombie reverts", async () => {
        await create("Rotfang", alice);
        await utils.expectRevert(zo.createRandomZombie("Grimjaw", { from: alice }), "only one free zombie per address");
        assert.equal((await zo.getZombieCount()).toNumber(), 1);
    });

    it("S08 authorized transfers succeed (owner and approved)", async () => {
        const aliceId = await create("Rotfang", alice);
        const bobId = await create("Grimjaw", bob);
        await zo.transferFrom(alice, carol, aliceId, { from: alice });
        assert.equal(await zo.ownerOf(aliceId), carol);
        await zo.approve(alice, bobId, { from: bob });
        await zo.transferFrom(bob, alice, bobId, { from: alice });
        assert.equal(await zo.ownerOf(bobId), alice);
    });

    it("S09 unauthorized transfers revert (stranger, wrong from, zero address)", async () => {
        const id = await create("Rotfang", alice);
        await utils.expectRevert(zo.transferFrom(alice, carol, id, { from: bob }), "not owner or approved");
        await utils.expectRevert(zo.transferFrom(bob, carol, id, { from: alice }), "from is not the owner");
        await utils.expectRevert(zo.transferFrom(alice, ZERO, id, { from: alice }), "zero address");
        assert.equal(await zo.ownerOf(id), alice);
    });

    it("S10 ownership changes after transfer (both balances, approval cleared, sender can create again)", async () => {
        const id = await create("Rotfang", alice);
        await zo.approve(carol, id, { from: alice });
        await zo.transferFrom(alice, bob, id, { from: alice });
        assert.equal((await zo.balanceOf(alice)).toNumber(), 0);
        assert.equal((await zo.balanceOf(bob)).toNumber(), 1);
        assert.deepEqual((await zo.getZombiesByOwner(bob)).map((n) => n.toNumber()), [id]);
        // the old approval must not survive the transfer
        await utils.expectRevert(zo.transferFrom(bob, carol, id, { from: carol }), "not owner or approved");
        // sender's count is really 0, so the one-free-zombie rule lets alice create again
        await create("Grimjaw", alice);
        assert.equal((await zo.balanceOf(alice)).toNumber(), 1);
    });

    it("S11 level-up eligibility is enforced (wrong fee, unknown id, rename below level 2)", async () => {
        const id = await create("Rotfang", alice);
        await utils.expectRevert(zo.levelUp(id, { from: alice, value: 0 }), "wrong level up fee");
        await utils.expectRevert(zo.levelUp(id, { from: alice, value: web3.utils.toWei("0.002", "ether") }), "wrong level up fee");
        await utils.expectRevert(zo.levelUp(99, { from: alice, value: await zo.levelUpFee() }), "no such zombie");
        await utils.expectRevert(zo.changeName(id, "Renamed", { from: alice }), "level too low");
        assert.equal((await zo.zombies(id)).level.toString(), "1");
    });

    it("S12 level changes persist and LevelUp is emitted", async () => {
        const id = await create("Rotfang", alice);
        const result = await zo.levelUp(id, { from: alice, value: await zo.levelUpFee() });
        const ev = logOf(result, "LevelUp");
        assert.equal(ev.args.zombieId.toNumber(), id);
        assert.equal(ev.args.newLevel.toString(), "2");
        assert.equal((await zo.zombies(id)).level.toString(), "2");
        await zo.changeName(id, "Renamed", { from: alice });
        assert.equal((await zo.zombies(id)).name, "Renamed");
        assert.equal((await zo.zombies(id)).level.toString(), "2");
    });

    it("S13 feeding on an Avenger creates a hero zombie (DNA ends 99, AvengerFed)", async () => {
        const id = await create("Rotfang", alice);
        await time.increase(READY);
        const myDna = BigInt((await zo.zombies(id)).dna.toString());
        const result = await zo.feedOnAvenger(id, 0, { from: alice });
        const born = logOf(result, "NewZombie");
        const fed = logOf(result, "AvengerFed");
        assert.equal(fed.args.zombieId.toNumber(), id);
        assert.equal(fed.args.avengerId.toNumber(), 0);
        const heroId = born.args.zombieId.toNumber();
        assert.equal(heroId, 1);
        assert.equal(born.args.name, "NoName");
        let expected = (myDna + (BigInt(THOR) % DNA_MOD)) / 2n;
        expected = expected - (expected % 100n) + 99n;
        const hero = await zo.zombies(heroId);
        assert.equal(BigInt(hero.dna.toString()), expected);
        assert.equal(BigInt(hero.dna.toString()) % 100n, 99n);
        assert.equal(await zo.ownerOf(heroId), alice);
        // the fed zombie goes back on cooldown
        assert.equal((await zo.zombies(id)).readyTime.toNumber(), (await utils.blockTime(result)) + ONE_DAY);
    });

    it("S14 invalid Avenger interactions revert (unknown avenger, contract not set, zombie not ready)", async () => {
        const id = await create("Rotfang", alice);
        await utils.expectRevert(zo.feedOnAvenger(id, 0, { from: alice }), "zombie is not ready");
        await time.increase(READY);
        await utils.expectRevert(zo.feedOnAvenger(id, 99, { from: alice }), "no such avenger");
        const unwired = await ZombieOwnership.new();
        await unwired.createRandomZombie("Rotfang", { from: alice });
        await utils.expectRevert(unwired.feedOnAvenger(0, 0, { from: alice }), "avenger contract not set");
        assert.equal((await zo.getZombieCount()).toNumber(), 1);
    });

    it("S15 battles enforce authorization (attack and attackAvenger by non-owner)", async () => {
        const aliceId = await create("Rotfang", alice);
        const bobId = await create("Grimjaw", bob);
        await time.increase(READY);
        await utils.expectRevert(zo.attack(aliceId, bobId, { from: bob }), "not the zombie owner");
        await utils.expectRevert(zo.attackAvenger(aliceId, 0, { from: bob }), "not the zombie owner");
        const z = await zo.zombies(aliceId);
        assert.equal(z.winCount.toNumber() + z.lossCount.toNumber(), 0);
    });

    it("S16 battle cooldowns work (not-ready reverts, readyTime = block time + 1 day after battle)", async () => {
        const aliceId = await create("Rotfang", alice);
        const bobId = await create("Grimjaw", bob);
        await utils.expectRevert(zo.attack(aliceId, bobId, { from: alice }), "zombie is not ready");
        await utils.expectRevert(zo.attackAvenger(aliceId, 0, { from: alice }), "zombie is not ready");

        await time.increase(READY);
        const hero = await zo.attackAvenger(aliceId, 1, { from: alice });
        assert.equal((await zo.zombies(aliceId)).readyTime.toNumber(), (await utils.blockTime(hero)) + ONE_DAY);
        await utils.expectRevert(zo.attackAvenger(aliceId, 1, { from: alice }), "zombie is not ready");

        // PvP sets the cooldown on both the win and the loss branch
        await time.increase(READY);
        const pvp = await zo.attack(aliceId, bobId, { from: alice });
        assert.equal((await zo.zombies(aliceId)).readyTime.toNumber(), (await utils.blockTime(pvp)) + ONE_DAY);
        await utils.expectRevert(zo.attack(aliceId, bobId, { from: alice }), "zombie is not ready");
    });

    it("S17 events contain correct values (NewZombie, Transfer, Approval, LevelUp, Battle)", async () => {
        const created = await zo.createRandomZombie("Rotfang", { from: alice });
        assert.equal(created.logs[0].args.dna.toString(), previewDna("Rotfang").toString());

        const approved = await zo.approve(bob, 0, { from: alice });
        const approval = logOf(approved, "Approval");
        assert.equal(approval.args._owner, alice);
        assert.equal(approval.args._approved, bob);
        assert.equal(approval.args._tokenId.toNumber(), 0);

        const moved = await zo.transferFrom(alice, carol, 0, { from: alice });
        const transfer = logOf(moved, "Transfer");
        assert.equal(transfer.args._from, alice);
        assert.equal(transfer.args._to, carol);
        assert.equal(transfer.args._tokenId.toNumber(), 0);

        const leveled = await zo.levelUp(0, { from: bob, value: await zo.levelUpFee() });
        assert.equal(logOf(leveled, "LevelUp").args.newLevel.toString(), "2");

        // first randMod call on this fresh contract hashes nonce 1
        const target = await create("Grimjaw", bob);
        await time.increase(READY);
        const dna0 = (await zo.zombies(0)).dna;
        const dnaTarget = (await zo.zombies(target)).dna;
        const fight = await zo.attack(0, target, { from: carol });
        const battle = logOf(fight, "Battle");
        const roll = await utils.predictRoll(fight, carol, 1);
        assert.equal(battle.args.zombieId.toNumber(), 0);
        assert.equal(battle.args.targetId.toNumber(), target);
        assert.equal(battle.args.won, roll <= 70n);

        // the state branch matching the roll
        const z0 = await zo.zombies(0);
        const zt = await zo.zombies(target);
        const count = (await zo.getZombieCount()).toNumber();
        if (battle.args.won) {
            const child = await zo.zombies(2);
            assert.equal(z0.level.toString(), "3");
            assert.equal(z0.winCount.toString(), "1");
            assert.equal(zt.lossCount.toString(), "1");
            assert.equal(count, 3);
            assert.equal(child.name, "NoName");
            assert.equal(await zo.zombieToOwner(2), carol);
            const expected = web3.utils.toBN(dna0).add(web3.utils.toBN(dnaTarget).mod(web3.utils.toBN(DNA_MOD.toString()))).divn(2);
            assert.equal(child.dna.toString(), expected.toString());
        } else {
            assert.equal(z0.lossCount.toString(), "1");
            assert.equal(z0.level.toString(), "2");
            assert.equal(zt.winCount.toString(), "1");
            assert.equal(count, 2);
        }
        assert.equal(z0.readyTime.toNumber(), (await utils.blockTime(fight)) + ONE_DAY);
    });

    it("S18 wrong-account transactions are rejected (changeName, approve, setAvengerContractAddress)", async () => {
        const id = await create("Rotfang", alice);
        await zo.levelUp(id, { from: alice, value: await zo.levelUpFee() });
        await utils.expectRevert(zo.changeName(id, "Hijacked", { from: bob }), "not the zombie owner");
        await utils.expectRevert(zo.approve(bob, id, { from: bob }), "not the zombie owner");
        await utils.expectRevert(zo.setAvengerContractAddress(bob, { from: bob }), "revert");
        assert.equal((await zo.zombies(id)).name, "Rotfang");
        assert.equal(await zo.avengerContract(), av.address);
    });

    it("S19 invalid IDs fail safely (attack target, levelUp, changeName, getAvenger revert with reasons; ownerOf returns zero address)", async () => {
        const id = await create("Rotfang", alice);
        await time.increase(READY);
        await utils.expectRevert(zo.attack(id, 99, { from: alice }), "no such target");
        await utils.expectRevert(zo.attackAvenger(id, 99, { from: alice }), "no such avenger");
        await utils.expectRevert(zo.levelUp(99, { from: alice, value: await zo.levelUpFee() }), "no such zombie");
        await utils.expectRevert(zo.changeName(99, "Ghost", { from: alice }), "no such zombie");
        await utils.expectRevert(av.getAvenger(99), "no such avenger");
        assert.equal(await zo.ownerOf(99), ZERO);
    });

    it("S20 state persists across frontend reloads (a fresh ZombieOwnership.at(address) handle reads identical zombies, owners and counts)", async () => {
        const aliceId = await create("Rotfang", alice);
        const bobId = await create("Grimjaw", bob);
        await zo.levelUp(aliceId, { from: alice, value: await zo.levelUpFee() });
        await zo.transferFrom(bob, carol, bobId, { from: bob });

        const reloaded = await ZombieOwnership.at(zo.address);
        assert.equal((await reloaded.getZombieCount()).toNumber(), 2);
        for (const id of [aliceId, bobId]) {
            const before = await zo.zombies(id);
            const after = await reloaded.zombies(id);
            for (const key of ["name", "dna", "level", "readyTime", "winCount", "lossCount"]) {
                assert.equal(after[key].toString(), before[key].toString(), `${key} of #${id}`);
            }
            assert.equal(await reloaded.ownerOf(id), await zo.ownerOf(id));
        }
        assert.equal(await reloaded.ownerOf(bobId), carol);
        assert.equal((await reloaded.balanceOf(carol)).toNumber(), 1);
        assert.equal(await reloaded.avengerContract(), av.address);
    });
});
