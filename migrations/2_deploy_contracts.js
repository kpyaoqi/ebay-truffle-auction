const EcommerceStore = artifacts.require("EcommerceStore");

module.exports = function(deployer) {
  deployer.deploy(EcommerceStore)
};
