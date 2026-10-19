pragma solidity ^0.4.25;

import "./zombiehelper.sol";

contract ZombieAttack is ZombieHelper {
  uint randNonce = 0;
  uint attackVictoryProbability = 70;

  function randMod(uint _modulus) internal returns(uint) {
    randNonce = randNonce.add(1);
    return uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % _modulus;
  }

  event Battle(uint indexed zombieId, uint indexed targetId, bool won);
  event AvengerBattle(uint indexed zombieId, uint indexed avengerId, bool won);

  function attack(uint _zombieId, uint _targetId) external onlyOwnerOf(_zombieId) {
    require(_targetId < zombies.length, "no such target");
    Zombie storage myZombie = zombies[_zombieId];
    require(_isReady(myZombie), "zombie is not ready");
    Zombie storage enemyZombie = zombies[_targetId];
    uint rand = randMod(100);
    bool won = rand <= attackVictoryProbability;
    if (won) {
      myZombie.winCount = myZombie.winCount.add(1);
      myZombie.level = myZombie.level.add(1);
      enemyZombie.lossCount = enemyZombie.lossCount.add(1);
      feedAndMultiply(_zombieId, enemyZombie.dna, "zombie");
    } else {
      myZombie.lossCount = myZombie.lossCount.add(1);
      enemyZombie.winCount = enemyZombie.winCount.add(1);
      _triggerCooldown(myZombie);
    }
    emit Battle(_zombieId, _targetId, won);
  }

  function attackAvenger(uint _zombieId, uint _avengerId) external onlyOwnerOf(_zombieId) {
    require(address(avengerContract) != address(0), "avenger contract not set");
    require(_avengerId < avengerContract.totalAvengers(), "no such avenger");
    Zombie storage myZombie = zombies[_zombieId];
    require(_isReady(myZombie), "zombie is not ready");
    uint genes;
    (,,,,,,,,,genes) = avengerContract.getAvenger(_avengerId);
    uint power = (genes % 10) + 1;
    // signed so a weak zombie vs a strong hero cannot underflow
    int256 chance = 50 + 5 * int256(myZombie.level) - 5 * int256(power);
    if (chance < 10) chance = 10;
    if (chance > 90) chance = 90;
    bool won = randMod(100) < uint256(chance);
    if (won) {
      myZombie.winCount = myZombie.winCount.add(1);
      myZombie.level = myZombie.level.add(1);
    } else {
      myZombie.lossCount = myZombie.lossCount.add(1);
    }
    _triggerCooldown(myZombie);
    emit AvengerBattle(_zombieId, _avengerId, won);
  }
}
