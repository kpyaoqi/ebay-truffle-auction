EcommerceStore = artifacts.require("./EcommerceStore.sol");
UserSore = artifacts.require("./User.sol");
module.exports = function (callback) {
    current_time = Math.round(new Date() / 1000);
    UserSore.deployed().then(function (i) {
        i.getUserInfo("0x45065f7F3449e1859fcc42aA3a69e410e3BBa581").then(function (f) { console.log(f) })
    });
   
}