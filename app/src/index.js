import Web3 from "web3";
import ecommerce_store_artifacts from '../../build/contracts/EcommerceStore.json';
const { create } = require('ipfs-http-client');
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });
const App = {
  web3: null,
  account: null,
  EcommerceStore: null,

  start: async function () {
    const { web3 } = this;
    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ecommerce_store_artifacts.networks[networkId];
      this.EcommerceStore = new web3.eth.Contract(
        ecommerce_store_artifacts.abi,
        deployedNetwork.address,
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
        // this.renderStore();
        renderStore();
      }
      this.subscibeProduct();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  // 加载页面显示列表
  // renderStore: async function () {
  //   const { getProduct } = this.EcommerceStore.methods;
  //   const { productIndex } = this.EcommerceStore.methods;
  //   var Index = await productIndex().call();
  //   var product;
  //   if (Index > 0)
  //     for (let i = 1; i <= Index; i++) {
  //       product = await getProduct(i).call();
  //       $("#product-list").append(buildProduct(product));
  //     }
  // },


  // 添加商品
  saveProduct: async function (reader, decodedParams) {
    let imageId, descId;
    saveImageOnIpfs(reader).then(function (id) {
      imageId = id;
      saveTextBlobOnIpfs(decodedParams["product-description"]).then(function (id) {
        descId = id;
        App.saveProductToBlockchain(decodedParams, imageId, descId);
      })
    })
  },

  // 添加商品到区块链
  saveProductToBlockchain: async function (params, imageId, descId) {
    let auctionStartTime = Date.parse(params["product-auction-start"]) / 1000;
    let auctionEndTime = auctionStartTime + parseInt(params["product-auction-end"]) * 24 * 60 * 60;
    const { addProductToStore } = this.EcommerceStore.methods;
    await addProductToStore(params["product-name"], params["product-category"], imageId, descId, auctionStartTime,
      auctionEndTime, this.web3.utils.toWei(params["product-price"], 'ether'), parseInt(params["product-condition"]))
      .send({ from: this.account, gas: 999999 }).then(console.log);
    $("#msg").show();
    $("#msg").html("Your product was successfully added to your store!");
  },

  // 商品详情
  renderProductDetails: async function (productId) {
    const { getProduct } = this.EcommerceStore.methods;
    await getProduct(productId).call().then(res => {
      let content = "";
      content = ipfs.cat(res[4]);
      content.next().then(res => $("#product-desc").append("<div>" + Utf8ArrayToStr(res.value) + "</div>"));
      $("#product-image").append("<img src='http://localhost:9001/ipfs/" + res[3] + "' width='250px' />");
      $("#product-price").html(this.web3.utils.fromWei(res[7], 'ether') + "ETH");
      $("#product-name").html(res[1]);
      $("#product-auction-end").html(displayEndHours(res[6]));
      $("#revealing, #bidding, #finalize-auction, #escrow-info").hide();
      $("#product-id").val(res[0]);
      let currentTime = Math.round(new Date() / 1000);
      if (res[8] == 1) {
        $("#escrow-info").show();
        this.highestBidder(productId);
        this.escrowData(productId);
      } else if (res[8] == 2) {
        $("#product-status").html("Product was not sold");
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
      $("#msg").html("Your bid has been successfully submitted!");
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
      $("#msg").html("Your bid has been successfully revealed!");
      console.log(res);
    })
  },

  // 托管
  finalizeProduct: async function (productId) {
    const { finalizeAuction } = this.EcommerceStore.methods;
    await finalizeAuction(productId).send({ from: this.account, gas: 999999 }).then(res => {
      $("#msg").show();
      $("#msg").html("The auction has been finalized and winner declared.");
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
        $("#product-status").html("Auction has ended. No bids were revealed");
      } else {
        $("#product-status").html("Auction has ended. Product sold to " + res[0] + " for Ξ:" + this.web3.utils.fromWei(res[2], 'ether') +
          "The money is in the escrow. Two of the three participants (Buyer, Seller and Arbiter) have to " +
          "either release the funds to seller or refund the money to the buyer");
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
        $("#release-count").html("Amount from the escrow has been released");
      } else {
        $("#release-count").html(res[4] + " of 3 participants have agreed to release funds");
        $("#refund-count").html(res[5] + " of 3 participants have agreed to refund the buyer");
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
    this.EcommerceStore.events.NewProduct({
      fromBlock: 'latest'
    }, function (error, result) {
      // 结果包含 非索引参数 以及 主题 topic
      if (error) {
        console.log(error);
        return;
      }
      saveProduct(result.returnValues);
    });
  }
};

$(document).ready(function () {
  var reader;
  // 照片选择
  $("#product-image").change(function (event) {
    const file = event.target.files[0];
    reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
  });

  // 添加商品表单提交
  $("#add-item-to-store").submit(function (event) {
    const req = $("#add-item-to-store").serialize();
    let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    let decodedParams = {};
    Object.keys(params).forEach(function (v) {
      decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
    });
    App.saveProduct(reader, decodedParams);
    event.preventDefault();
  });

  // 出价
  $("#bidding").submit(function (event) {
    $("#msg").hide();
    let amount = ($("#bid-amount").val()).toString();
    let sendAmount = ($("#bid-send-amount").val()).toString();
    let secretText = ($("#secret-text").val()).toString();
    let productId = $("#product-id").val();
    let sealedBid = App.keccakWithamountAndsecretText(amount, secretText);
    sealedBid.then(sealedBid => {
      App.bidProduct(productId, sealedBid, sendAmount);
    });
    event.preventDefault();
  });

  // 揭示报价
  $("#revealing").submit(function (event) {
    $("#msg").hide();
    let amount = ($("#actual-amount").val()).toString();
    let secretText = ($("#reveal-secret-text").val()).toString();
    let productId = $("#product-id").val();
    App.revealProduct(productId, amount, secretText);
    event.preventDefault();
  });

  // 托管
  $("#finalize-auction").submit(function (event) {
    $("#msg").hide();
    let productId = $("#product-id").val();
    App.finalizeProduct(productId);
    event.preventDefault();
  });

  // 释放给卖家
  $("#release-funds").click(function () {
    let productId = new URLSearchParams(window.location.search).get('product-id');
    $("#msg").html("Your transaction has been submitted. Please wait for few seconds for the confirmation").show();
    App.releaseFunds(productId);
  });

  // 回退给买家
  $("#refund-funds").click(function () {
    let productId = new URLSearchParams(window.location.search).get('product-id');
    $("#msg").html("Your transaction has been submitted. Please wait for few seconds for the confirmation").show();
    App.refundFunds(productId);
    alert("refund the funds!");
  });
});

// 加载页面显示列表
function renderStore() {
  const categories = ["Art", "Books", "Cameras", "Cell Phones & Accessories", "Clothing", "Computers & Tablets", "Gift Cards & Coupons", "Musical Instruments & Gear", "Pet Supplies", "Pottery & Glass", "Sporting Goods", "Tickets", "Toys & Hobbies", "Video Games"];
  renderProducts("product-list", {});
  renderProducts("product-reveal-list", { productStatus: "reveal" });
  renderProducts("product-finalize-list", { productStatus: "finalize" });
  categories.forEach(value => {
    $("#categories").append("<div>" + value + "</div>");
  });
}

// 
function renderProducts(div, filter) {
  $.ajax({
    type: 'GET',
    url: '/product/allProduct',
    contentType: 'application/json;charset=UTF-8',
    data: filter,
    success: function (data) {
      if (data.length == 0) {
        $("#" + div).html('No products found');
      }
      while (data.length > 0) {
        let chunks = data.splice(0, 4);
        let row = $("<div/>");
        row.addClass("row");
        chunks.forEach(value => {
          let node = buildProduct(value);
          row.append(node);
        });
        $("#" + div).append(row);
      }
    }
  });
}

// 商品列表样式
function buildProduct(product) {
  let node = $("<div/>");
  node.addClass("col-sm-3 text-center col-margin-bottom-1");
  // node.append("<img src='https://ipfs.io/ipfs/" + product[3] + "' width='150px' />");
  node.append("<a href='product.html?product-id=" + product.blockchainId + "'><img src='http://localhost:9001/ipfs/" + product.ipfsImageHash + "' width='150px' height='100px' /></a>");
  node.append("<div>" + product.productName + "</div>");
  node.append("<div>" + product.productName + "</div>");
  node.append("<div>" + product.category + "</div>");
  node.append("<div>" + product.auctionStartTime + "</div>");
  node.append("<div>Ether " + product.price + "</div>");
  return node;
}

// 商品列表样式
// function buildProduct(product) {
//   let node = $("<div/>");
//   node.addClass("col-sm-3 text-center col-margin-bottom-1");
//   // node.append("<img src='https://ipfs.io/ipfs/" + product[3] + "' width='150px' />");
//   node.append("<a href='product.html?product-id=" + product[0] + "'><img src='http://localhost:9001/ipfs/" + product[3] + "' width='150px' height='100px' /></a>");
//   node.append("<div>" + product[1] + "</div>");
//   node.append("<div>" + product[2] + "</div>");
//   node.append("<div>" + product[5] + "</div>");
//   node.append("<div>" + product[6] + "</div>");
//   node.append("<div>Ether " + product[7] + "</div>");
//   return node;
// }

// 添加商品图片到IPFS
function saveImageOnIpfs(reader) {
  return new Promise(function (resolve, reject) {
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer)
      .then((response) => {
        console.log(response)
        resolve(response.path);
      }).catch((err) => {
        console.error(err)
        reject(err);
      })
  })
}

// 添加商品描述到IPFS
function saveTextBlobOnIpfs(blob) {
  return new Promise(function (resolve, reject) {
    const descBuffer = Buffer.from(blob, 'utf-8');
    ipfs.add(descBuffer)
      .then((response) => {
        console.log(response)
        resolve(response.path);
      }).catch((err) => {
        console.error(err)
        reject(err);
      })
  })
}

// 显示结束时间
function displayEndHours(seconds) {
  let current_time = Math.round(new Date() / 1000);
  let remaining_seconds = seconds - current_time;

  if (remaining_seconds <= 0) {
    return "Auction has ended";
  }

  let days = Math.trunc(remaining_seconds / (24 * 60 * 60));
  remaining_seconds -= days * 24 * 60 * 60;

  let hours = Math.trunc(remaining_seconds / (60 * 60));
  remaining_seconds -= hours * 60 * 60;

  let minutes = Math.trunc(remaining_seconds / 60);
  remaining_seconds -= minutes * 60;

  if (days > 0) {
    return "Auction ends in " + days + " days, " + hours + ", hours, " + minutes + " minutes";
  } else if (hours > 0) {
    return "Auction ends in " + hours + " hours, " + minutes + " minutes ";
  } else if (minutes > 0) {
    return "Auction ends in " + minutes + " minutes ";
  } else {
    return "Auction ends in " + remaining_seconds + " seconds";
  }
}

// 添加商品信息到数据库
function saveProduct(product) {
  var data = {
    blockchainId: product._productId, name: product._name, category: product._category,
    ipfsImageHash: product._imageLink, ipfsDescHash: product._descLink, auctionStartTime: product._auctionStartTime,
    auctionEndTime: product._auctionEndTime, price: product._startPrice, condition: product._productCondition,
    productStatus: 0
  }
  $.ajax({
    type: 'POST',
    url: '/product/saveProduct',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify(data)
  });
}

// Utf8Array转换Str
function Utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3;
  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx 10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx 10xx xxxx 10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
        break;
    }
  }
  return out;
}

window.App = App;

// web3初始化
window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
