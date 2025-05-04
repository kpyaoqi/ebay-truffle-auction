import Fun from './function.js';
import ecommerce_store_artifacts from '../../../build/contracts/EcommerceStore.json';
import user_artifacts from '../../../build/contracts/User.json';
const { create } = require('ipfs-http-client');
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });


export const AppOfWeb3 = {
  web3: null,
  account: null,
  EcommerceStore: null,
  fun: new Fun(),
  start: async function () {
    const { web3 } = this;
    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      const deployedNetwork = ecommerce_store_artifacts.networks[networkId];
      this.EcommerceStore = new web3.eth.Contract(
        ecommerce_store_artifacts.abi,
        deployedNetwork.address,
      );

      // 初始化User合约
      const userNetwork = user_artifacts.networks[networkId];
      this.User = new web3.eth.Contract(
        user_artifacts.abi,
        userNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      // 判断是详情页还是首页
      if ($("#product-details").length > 0) {
        //This is product details page
        let productId = new URLSearchParams(window.location.search).get('product-id');
        $("#revealing, #bidding").hide();
        this.renderProductDetails(productId);
      } else {
        this.fun.renderStore();
      }
      this.subscibeProduct();
    } catch (error) {
      console.error(error);
    }
  },

  // 添加商品
  saveProduct: async function (reader, decodedParams) {
    let imageId, descId;
    let that = this;
    that.fun.saveImageOnIpfs(reader).then(function (id) {
      imageId = id;
      that.fun.saveTextBlobOnIpfs(decodedParams["product-description"]).then(function (id) {
        descId = id;
        AppOfWeb3.saveProductToBlockchain(decodedParams, imageId, descId);
      })
    })
  },

  // 添加商品到区块链
  saveProductToBlockchain: async function (params, imageId, descId) {
    let auctionStartTime = Date.parse(params["product-auction-start"]) / 1000;
    let duration = parseInt(params["product-auction-end"]);
    let multiplier = params["product-auction-end-type"] === "days" ? 24 * 60 * 60 : 60;
    let auctionEndTime = auctionStartTime + duration * multiplier;

    const { addProductToStore } = this.EcommerceStore.methods;
    await addProductToStore(params["product-name"], params["product-category"], imageId, descId, auctionStartTime,
      auctionEndTime, this.web3.utils.toWei(params["product-price"], 'ether'), parseInt(params["product-condition"]))
      .send({ from: this.account, gas: 999999 }).then(console.log);
    $("#msg").show();
    $("#msg").html("您的商品已成功添加到商店！");
  },

  // 商品详情
  renderProductDetails: async function (productId) {
    const { getProduct } = this.EcommerceStore.methods;
    await getProduct(productId).call().then(res => {
      let content = "";
      content = ipfs.cat(res[4]);
      content.next().then(res => $("#product-desc").append("<div>" + this.fun.Utf8ArrayToStr(res.value) + "</div>"));
      $("#product-image").append("<img src='http://localhost:9001/ipfs/" + res[3] + "' width='250px' />");
      $("#product-price").html(this.web3.utils.fromWei(res[7], 'ether') + "ETH");
      $("#product-name").html(res[1]);
      $("#product-auction-end").html(this.fun.displayEndHours(res[6]));
      $("#revealing, #bidding, #finalize-auction, #escrow-info").hide();
      $("#product-id").val(res[0]);
      let currentTime = Math.round(new Date() / 1000);
      if (res[8] == 1) {
        $("#escrow-info").show();
        this.highestBidder(productId);
        this.escrowData(productId);
      } else if (res[8] == 2) {
        $("#product-status").html("商品未售出");
      } else if (currentTime < res[6]) {
        $("#bidding").show();
      } else if (currentTime - (200) < res[6]) {
        $("#revealing").show();
      } else {
        $("#finalize-auction").show();
      }
    })
  },

  // 出价
  bidProduct: async function (productId, sealedBid, sendAmount) {
    const { bid } = this.EcommerceStore.methods;
    await bid(productId, sealedBid).send({ value: this.web3.utils.toWei(sendAmount, 'ether'), from: this.account, gas: 999999 }).then(res => {
      $("#msg").html("您的出价已成功提交！");
      $("#msg").show();
      console.log(res);
    })
  },

  // 揭示报价
  revealProduct: async function (productId, amount, secretText) {
    const { revealBid } = this.EcommerceStore.methods;
    let amounts = this.web3.utils.toWei(amount, 'ether');
    await revealBid(productId, amounts, secretText).send({ from: this.account, gas: 999999 }).then(res => {
      $("#msg").show();
      $("#msg").html("您的出价已成功揭示！");
      console.log(res);
    })
  },

  // 托管
  finalizeProduct: async function (productId) {
    const { finalizeAuction } = this.EcommerceStore.methods;
    await finalizeAuction(productId).send({ from: this.account, gas: 999999 }).then(res => {
      $("#msg").show();
      $("#msg").html("拍卖已完成，获胜者已确定");
      console.log(res);
      location.reload();
    }).catch(err => {
      console.log(err);
      $("#msg").show();
      $("#msg").html("The auction can not be finalized by the buyer or seller, only a third party aribiter can finalize it");
    })
  },

  // 最终竞拍人
  highestBidder: async function (productId) {
    const { highestBidderInfo } = this.EcommerceStore.methods;
    await highestBidderInfo(productId).call().then(res => {
      if (res[2].toLocaleString() == '0') {
        $("#product-status").html("拍卖已结束，未揭示任何出价");
      } else {
        $("#product-status").html(`拍卖已结束。商品以Ξ:${this.web3.utils.fromWei(res[2], 'ether')}的价格售予${res[0]}。资金已托管，需要买家、卖家和仲裁者中的两位同意才能释放资金给卖家或退款给买家`);
      }
    })
  },

  // 托管合约信息
  escrowData: async function (productId) {
    const { escrowInfo } = this.EcommerceStore.methods;
    await escrowInfo(productId).call().then(res => {
      $("#buyer").html('Buyer: ' + res[0]);
      $("#seller").html('Seller: ' + res[1]);
      $("#arbiter").html('Arbiter: ' + res[2]);
      if (res[3] == true) {
        $("#release-count").html("托管资金已释放给卖家");
      } else {
        $("#release-count").html(`${res[4]}位参与者同意释放资金(共需3位)`);
        $("#refund-count").html(`${res[5]}位参与者同意退款给买家(共需3位)`);
      }
    })
  },

  // 释放给卖家
  releaseFunds: async function (productId) {
    const { releaseAmountToSeller } = this.EcommerceStore.methods;
    await releaseAmountToSeller(productId).send({ from: this.account, gas: 999999 }).then(res => {
      console.log(res);
      location.reload();
    }).catch(err => { console.log(err) });
  },

  // 回退给买家
  refundFunds: async function (productId) {
    const { refundAmountToBuyer } = this.EcommerceStore.methods;
    await refundAmountToBuyer(productId).send({ from: this.account, gas: 999999 }).then(res => {
      console.log(res);
      location.reload();
    }).catch(err => { console.log(err) });
  },

  // 获取密文
  keccakWithamountAndsecretText: async function (amount, secretText) {
    const { keccak } = this.EcommerceStore.methods;
    amount = this.web3.utils.toWei(amount, 'ether');
    var sealedBid = await keccak(amount, secretText).call();
    return sealedBid;
  },

  // 订阅商品添加
  subscibeProduct: async function () {
    var that = this;
    this.EcommerceStore.events.NewProduct({
      fromBlock: 'latest'
    }, function (error, result) {
      // 结果包含 非索引参数 以及 主题 topic
      if (error) {
        console.log(error);
        return;
      }
      var product = result.returnValues;
      that.fun.saveProduct(product);
    });
  },

};

