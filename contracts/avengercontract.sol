pragma solidity ^0.4.25;

// Local stand-in for the CryptoKitties contract: a public registry of "genes".
contract AvengerContract {

  struct Avenger {
    uint256 genes;
    uint256 birthTime;
  }

  Avenger[] avengers;

  event Birth(address indexed owner, uint256 indexed avengerId, uint256 genes);

  function createAvenger(uint256 _genes) external returns (uint256) {
    uint256 id = avengers.push(Avenger(_genes, now)) - 1;
    emit Birth(msg.sender, id, _genes);
    return id;
  }

  function totalAvengers() external view returns (uint256) {
    return avengers.length;
  }

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
  ) {
    require(_id < avengers.length, "no such avenger");
    Avenger storage a = avengers[_id];
    return (false, true, 0, 0, 0, a.birthTime, 0, 0, 0, a.genes);
  }
}
