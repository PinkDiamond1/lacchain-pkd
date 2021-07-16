const Migrations = artifacts.require("Migrations");
const PKD = artifacts.require("PKD");
const TrustedList = artifacts.require("TrustedList");

module.exports = async function (deployer) {
  await deployer.deploy( Migrations );
  const pkd = await deployer.deploy( PKD );
  await deployer.deploy( TrustedList, pkd.address, "0x203" );
};
