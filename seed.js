EcommerceStore = artifacts.require("./EcommerceStore.sol");
module.exports = function (callback) {
    current_time = Math.round(new Date() / 1000);
    EcommerceStore.deployed().then(function (i) { i.addProductToStore('iphone 5', 'Cell Phones & Accessories', 'Qma22nntN8pDskbu8vCFPcZahf2jPiyzwjo74vtS6dTCfr', 'QmWsXfZEMMeAEFt8rmedeCDU6qcagCWXM8wzReYehmoZbN', current_time, current_time + 120, web3.utils.toWei('2', 'ether'), 0).then(function (f) { console.log(f) }) });
    EcommerceStore.deployed().then(function (i) { i.addProductToStore('iphone 5s', 'Cell Phones & Accessories', 'Qma22nntN8pDskbu8vCFPcZahf2jPiyzwjo74vtS6dTCfr', 'QmWsXfZEMMeAEFt8rmedeCDU6qcagCWXM8wzReYehmoZbN', current_time, current_time + 300, web3.utils.toWei('3', 'ether'), 0).then(function (f) { console.log(f) }) });
    EcommerceStore.deployed().then(function (i) { i.productIndex.call().then(function (f) { console.log(f) }) });
}