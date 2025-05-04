const EcommerceStore = artifacts.require('EcommerceStore');
const User = artifacts.require('User');
 
const { deployProxy } = require('../app/node_modules/@openzeppelin/truffle-upgrades'); 
module.exports = async function (deployer) {
  // const instance=await deployProxy(EcommerceStore, [0], { deployer});
  const instance=await deployProxy(EcommerceStore, [0], { deployer, initializer: 'store' });
  const userInfo=await deployProxy(User);
  console.log('Deployed', instance.address);
  console.log('Deployed', userInfo.address);
  // await deployProxy(EcommerceStore, [0], { deployer, initializer: 'store' });
};