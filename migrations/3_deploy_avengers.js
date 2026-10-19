const AvengerContract = artifacts.require("AvengerContract");
const ZombieOwnership = artifacts.require("ZombieOwnership");

module.exports = async (deployer) => {
  await deployer.deploy(AvengerContract);
  const zo = await ZombieOwnership.deployed();
  await zo.setAvengerContractAddress(AvengerContract.address);
};
