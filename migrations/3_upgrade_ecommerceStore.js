const EcommerceStore = artifacts.require('EcommerceStore');
const EcommerceStoreV2 = artifacts.require('EcommerceStoreV2');

const { upgradeProxy } = require('../app/node_modules/@openzeppelin/truffle-upgrades/dist');


module.exports = async function (deployer) {
  const ecom = await EcommerceStore.deployed();
  const instance=await upgradeProxy(ecom.address, EcommerceStoreV2, { deployer });
  console.log("Upgraded", instance.address);
};