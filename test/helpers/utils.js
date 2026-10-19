async function shouldThrow(promise) {
    try {
        await promise;
       assert(true);
    }
    catch (err) {
        return;
    }
  assert(false, "The contract did not throw.");

  }

// Passes only when the promise rejects and the error message contains `reason`.
async function expectRevert(promise, reason) {
  try {
    await promise;
  } catch (err) {
    assert.include(err.message, reason, `expected revert "${reason}", got: ${err.message}`);
    return;
  }
  assert.fail(`expected revert "${reason}" but the call succeeded`);
}

async function blockTime(receipt) {
  return (await web3.eth.getBlock(receipt.receipt.blockNumber)).timestamp;
}

// Replays ZombieAttack.randMod(100): keccak256(now, msg.sender, nonce) % 100.
// `nonce` is the 1-based count of randMod calls on a freshly deployed contract.
async function predictRoll(receipt, sender, nonce) {
  const hash = web3.utils.soliditySha3(
    { t: "uint256", v: await blockTime(receipt) },
    { t: "address", v: sender },
    { t: "uint256", v: nonce }
  );
  return BigInt(hash) % 100n;
}

module.exports = {
  shouldThrow,
  expectRevert,
  blockTime,
  predictRoll,
};
