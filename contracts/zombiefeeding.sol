pragma solidity ^0.4.25;

import "./zombiefactory.sol";

contract AvengerInterface {
  function totalAvengers() external view returns (uint256);
  function getAvenger(uint256 _id) external view returns (
    bool isGestating,
    bool isReady,
    uint256 cooldownIndex,
    uint256 nextActionAt,
    uint256 siringWithId,
    uint256 birthTime,
    uint256 matronId,
    uint256 sireId,
    uint256 generation,
    uint256 genes
  );
}

contract ZombieFeeding is ZombieFactory {

  event AvengerFed(uint indexed zombieId, uint indexed avengerId);

  AvengerInterface public avengerContract;

  modifier onlyOwnerOf(uint _zombieId) {
    require(msg.sender == zombieToOwner[_zombieId], "not the zombie owner");
    _;
  }

  function setAvengerContractAddress(address _address) external onlyOwner {
    avengerContract = AvengerInterface(_address);
  }

  function _triggerCooldown(Zombie storage _zombie) internal {
    _zombie.readyTime = uint32(now + cooldownTime);
  }

  function _isReady(Zombie storage _zombie) internal view returns (bool) {
      return (_zombie.readyTime <= now);
  }

  function feedAndMultiply(uint _zombieId, uint _targetDna, string _species) internal onlyOwnerOf(_zombieId) {
    Zombie storage myZombie = zombies[_zombieId];
    require(_isReady(myZombie), "zombie is not ready");
    _targetDna = _targetDna % dnaModulus;
    uint newDna = (myZombie.dna + _targetDna) / 2;
    if (keccak256(abi.encodePacked(_species)) == keccak256(abi.encodePacked("avenger"))) {
      newDna = newDna - newDna % 100 + 99;
    }
    _createZombie("NoName", newDna);
    _triggerCooldown(myZombie);
  }

  function feedOnAvenger(uint _zombieId, uint _avengerId) public {
    require(address(avengerContract) != address(0), "avenger contract not set");
    require(_avengerId < avengerContract.totalAvengers(), "no such avenger");
    uint avengerGenes;
    (,,,,,,,,,avengerGenes) = avengerContract.getAvenger(_avengerId);
    feedAndMultiply(_zombieId, avengerGenes, "avenger");
    emit AvengerFed(_zombieId, _avengerId);
  }
}
