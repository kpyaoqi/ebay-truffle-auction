EcommerceStore = artifacts.require("./EcommerceStore.sol");
module.exports = function (callback) {
    current_time = Math.round(new Date() / 1000);

    // 艺术类商品
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('中国水墨画', '艺术', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 60, web3.utils.toWei('1.5', 'ether'), 0).then(function (f) { console.log(f) })
    });
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('油画作品集', '艺术', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 62, web3.utils.toWei('2.5', 'ether'), 0).then(function (f) { console.log(f) })
    });

    // 电子产品
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('MacBook Pro 2023', '电子产品', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 63, web3.utils.toWei('5', 'ether'), 0).then(function (f) { console.log(f) })
    });
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('索尼相机 A7M4', '电子产品', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 69, web3.utils.toWei('4', 'ether'), 0).then(function (f) { console.log(f) })
    });

    // 时尚类
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('限量版手提包', '时尚', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 80, web3.utils.toWei('3', 'ether'), 0).then(function (f) { console.log(f) })
    });
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('复古手表', '时尚', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 120, web3.utils.toWei('1.8', 'ether'), 0).then(function (f) { console.log(f) })
    });

    // 家居类
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('北欧风格沙发', '家居', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 60, web3.utils.toWei('4.5', 'ether'), 0).then(function (f) { console.log(f) })
    });
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('实木餐桌套装', '家居', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 500, web3.utils.toWei('3.8', 'ether'), 0).then(function (f) { console.log(f) })
    });

    // 运动类
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('专业网球拍', '运动', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 160, web3.utils.toWei('0.8', 'ether'), 0).then(function (f) { console.log(f) })
    });
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('瑜伽套装', '运动', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 360, web3.utils.toWei('0.5', 'ether'), 0).then(function (f) { console.log(f) })
    });

    // 其他类
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('古董钢笔', '其他', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 240, web3.utils.toWei('1.2', 'ether'), 0).then(function (f) { console.log(f) })
    });
    EcommerceStore.deployed().then(function (i) {
        i.addProductToStore('收藏版邮票', '其他', 'QmNQwKnRvjqNuXBKscGNr3xgXuxJjUxmcCNArZvDZcGW5j', 'QmTqFrrUw9rgsBKu4weuW3CgbFgYXGkox5h2ayUmdUXiBS', current_time, current_time + 50, web3.utils.toWei('0.6', 'ether'), 0).then(function (f) { console.log(f) })
    });
}