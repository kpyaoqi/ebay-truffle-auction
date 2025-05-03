const EcommerceStore = artifacts.require('EcommerceStore');
 
const { deployProxy } = require('../app/node_modules/@openzeppelin/truffle-upgrades'); 
module.exports = async function (deployer) {
  // const instance=await deployProxy(EcommerceStore, [0], { deployer});
  const instance=await deployProxy(EcommerceStore, [0], { deployer, initializer: 'store' });
  console.log('Deployed', instance.address);
  // await deployProxy(EcommerceStore, [0], { deployer, initializer: 'store' });
};