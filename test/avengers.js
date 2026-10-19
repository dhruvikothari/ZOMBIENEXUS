const ZombieOwnership = artifacts.require("ZombieOwnership");
const AvengerContract = artifacts.require("AvengerContract");
const utils = require("./helpers/utils");
const time = require("./helpers/time");

const READY = 86401; // makes a fresh or just-fought zombie ready again
const ONE_DAY = 86400;
const THOR = "9902671358840708";

// Same formula as attackAvenger; genes 0..9 give power 1..10.
const chanceFor = (level, power) => Math.min(90, Math.max(10, 50 + 5 * level - 5 * power));

contract("AvengerContract", (accounts) => {
    const [owner, alice] = accounts;
    let av;

    beforeEach(async () => {
        av = await AvengerContract.new();
    });

    it("A1 createAvenger stores genes, emits Birth and increments totalAvengers", async () => {
        assert.equal((await av.totalAvengers()).toNumber(), 0);
        const result = await av.createAvenger(THOR, { from: alice });
        const birth = result.logs[0];
        assert.equal(birth.event, "Birth");
        assert.equal(birth.args.owner, alice);
        assert.equal(birth.args.avengerId.toNumber(), 0);
        assert.equal(birth.args.genes.toString(), THOR);
        assert.equal((await av.totalAvengers()).toNumber(), 1);
        assert.equal((await av.getAvenger(0)).genes.toString(), THOR);
    });

    it("A2 getAvenger returns the 10-tuple with genes last and reverts for an unknown id", async () => {
        const result = await av.createAvenger(THOR);
        const a = await av.getAvenger(0);
        assert.equal(a[0], false);
        assert.equal(a[1], true);
        assert.equal(a[5].toNumber(), await utils.blockTime(result));
        assert.equal(Object.keys(a).filter((k) => /^\d+$/.test(k)).length, 10);
        assert.equal(a[9].toString(), THOR);
        await utils.expectRevert(av.getAvenger(1), "no such avenger");
    });

    context("battles against the wired ZombieOwnership", () => {
        let zo;

        // Fresh ZombieOwnership: randNonce starts at 0, so the nth attackAvenger hashes nonce n.
        beforeEach(async () => {
            zo = await ZombieOwnership.new();
            await zo.setAvengerContractAddress(av.address, { from: owner });
            for (let power = 1; power <= 10; power++) await av.createAvenger(power - 1);
            await zo.createRandomZombie("Rotfang", { from: alice });
            await time.increase(READY);
        });

        const level = async () => (await zo.zombies(0)).level.toNumber();

        it("A3 attackAvenger outcome matches the on-chain odds formula", async () => {
            // [level-ups before the fight, avenger id]; avenger id i has power i + 1
            const plan = [[0, 9], [0, 0], [3, 5], [0, 3], [5, 8], [10, 1], [0, 9]];
            const chances = new Set();
            let nonce = 0;
            for (const [ups, avengerId] of plan) {
                for (let i = 0; i < ups; i++) await zo.levelUp(0, { from: alice, value: await zo.levelUpFee() });
                const chance = chanceFor(await level(), avengerId + 1);
                const result = await zo.attackAvenger(0, avengerId, { from: alice });
                const roll = await utils.predictRoll(result, alice, ++nonce);
                const battle = result.logs.find((l) => l.event === "AvengerBattle");
                assert.equal(battle.args.won, roll < BigInt(chance), `battle ${nonce}: roll ${roll}, chance ${chance}`);
                chances.add(chance);
                await time.increase(READY);
            }
            assert.isAtLeast(plan.length, 6);
            assert.include([...chances], 10, "level 1 vs power 10 is clamped to 10");
        });

        it("A4 attackAvenger updates wins, losses, level, cooldown and emits AvengerBattle", async () => {
            let wins = 0;
            let losses = 0;
            let nonce = 0;
            for (let i = 0; i < 5; i++) {
                const avengerId = i * 2 % 10;
                const chance = chanceFor(await level(), avengerId + 1);
                const result = await zo.attackAvenger(0, avengerId, { from: alice });
                const roll = await utils.predictRoll(result, alice, ++nonce);
                const won = roll < BigInt(chance);
                won ? wins++ : losses++;

                const battle = result.logs.find((l) => l.event === "AvengerBattle");
                assert.equal(battle.args.zombieId.toNumber(), 0);
                assert.equal(battle.args.avengerId.toNumber(), avengerId);
                assert.equal(battle.args.won, won);

                const z = await zo.zombies(0);
                assert.equal(z.winCount.toNumber(), wins);
                assert.equal(z.lossCount.toNumber(), losses);
                assert.equal(z.level.toNumber(), 1 + wins);
                assert.equal(z.readyTime.toNumber(), (await utils.blockTime(result)) + ONE_DAY);
                await time.increase(READY);
            }
        });
    });
});
