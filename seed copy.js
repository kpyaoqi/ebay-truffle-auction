EcommerceStore = artifacts.require("./EcommerceStore.sol");
module.exports = function (callback) {
    current_time = Math.round(new Date() / 1000);
    // 艺术类商品
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('中国水墨画', '艺术', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 600, web3.utils.toWei('1.5', 'ether'), 0).then(function (f) { console.log(f) })
    });

    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('MacBook Pro 2023', '电子产品', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 630, web3.utils.toWei('5', 'ether'), 0).then(function (f) { console.log(f) })
    });


    // 时尚类
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('限量版手提包', '时尚', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 800, web3.utils.toWei('3', 'ether'), 0).then(function (f) { console.log(f) })
    });
}