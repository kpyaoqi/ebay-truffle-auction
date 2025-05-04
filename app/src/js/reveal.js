const { create } = require('ipfs-http-client');
const web3 = require('web3');import {common} from './common.js';
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });
class Fun {
  constructor() {
    common.displayUserInfo();

    // 加载页面显示列表
    this.renderStore = function renderStore() {
      this.renderProducts("product-reveal-list", { productStatus: "reveal" });
    };

    // 
    this.renderProducts = function renderProducts(div, filter) {
      $.ajax({
        type: 'GET',
        url: '/product/allProduct',
        contentType: 'application/json;charset=UTF-8',
        data: filter,
        success: function (data) {
          // 更新商品总数显示
          if (div === "product-reveal-list") {
            $("#total-products").text(data.length);
          }
          
          if (data.length == 0) {
            $("#" + div).html('未找到商品');
          }
          while (data.length > 0) {
            let chunks = data.splice(0, 3);  // 修改为3个一组
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
    // 添加商品图片到IPFS
    this.saveImageOnIpfs = function saveImageOnIpfs(reader) {
      return new Promise(function (resolve, reject) {
        const buffer = Buffer.from(reader.result);
        ipfs.add(buffer)
          .then((response) => {
            console.log(response);
            resolve(response.path);
          }).catch((err) => {
            console.error(err);
            reject(err);
          });
      });
    };
    // 添加商品描述到IPFS
    this.saveTextBlobOnIpfs = function saveTextBlobOnIpfs(blob) {
      return new Promise(function (resolve, reject) {
        const descBuffer = Buffer.from(blob, 'utf-8');
        ipfs.add(descBuffer)
          .then((response) => {
            console.log(response);
            resolve(response.path);
          }).catch((err) => {
            console.error(err);
            reject(err);
          });
      });
    };

    // 显示结束时间
    this.displayEndHours = function displayEndHours(seconds) {
      let current_time = Math.round(new Date() / 1000);
      let remaining_seconds = seconds - current_time;

      if (remaining_seconds <= 0) {
        return "拍卖已结束";
      }

      let days = Math.trunc(remaining_seconds / (24 * 60 * 60));
      remaining_seconds -= days * 24 * 60 * 60;

      let hours = Math.trunc(remaining_seconds / (60 * 60));
      remaining_seconds -= hours * 60 * 60;

      let minutes = Math.trunc(remaining_seconds / 60);
      remaining_seconds -= minutes * 60;

      if (days > 0) {
        return "拍卖将在" + days + "天" + hours + "小时" + minutes + "分钟后结束";
      } else if (hours > 0) {
        return "拍卖将在" + hours + "小时" + minutes + "分钟后结束";
      } else if (minutes > 0) {
        return "拍卖将在" + minutes + "分钟后结束";
      } else {
        return "拍卖将在" + remaining_seconds + "秒后结束"; 
      }
    };

    // 添加商品信息到数据库
    this.saveProduct = function saveProduct(product) {
      var data = {
        blockchainId: product._productId, name: product._name, category: product._category,
        ipfsImageHash: product._imageLink, ipfsDescHash: product._descLink, auctionStartTime: product._auctionStartTime,
        auctionEndTime: product._auctionEndTime, price: product._startPrice, condition: product._productCondition,
        productStatus: 0
      };
      var product_ = JSON.stringify(data);
      $.ajax({
        type: 'POST',
        url: '/product/saveProduct',
        contentType: 'application/json;charset=UTF-8',
        data: product_
      });
    };

    // Utf8Array转换Str
    this.Utf8ArrayToStr = function Utf8ArrayToStr(array) {
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
    };
  }
}
document.addEventListener('DOMContentLoaded', function() {
  const funInstance = new Fun();
  funInstance.renderStore();
});



// 商品列表样式
function buildProduct(product) {
  // 计算拍卖状态
  const current_time = Math.round(new Date() / 1000);
  const timeRemaining = product.auctionEndTime - current_time;
  let statusClass = '';
  let statusText = '';
  
  if (timeRemaining <= 0) {
    statusClass = 'status-finalize';
    statusText = '拍卖结束';  // 修改为"拍卖结束"
  } else if (timeRemaining < 3600) { // 小于1小时
    statusClass = 'status-reveal status-urgent';
    statusText = '即将截标';  // 修改为"即将截标"
  } else {
    statusClass = 'status-active';
    statusText = '竞拍中';    // 修改为"竞拍中"
  }

  // 价格转换（从Wei到ETH）
  const priceInEth = web3.utils.fromWei(product.price, 'ether');

  // 计算剩余时间显示
  let timeDisplay = '';
  if (timeRemaining > 0) {
    const days = Math.floor(timeRemaining / (24 * 60 * 60));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
    
    if (days > 0) {
      timeDisplay = `${days}天${hours}小时`;
    } else if (hours > 0) {
      timeDisplay = `${hours}小时${minutes}分钟`;
    } else {
      timeDisplay = `${minutes}分钟`;
    }
  } else {
    timeDisplay = '已结束';
  }

  let node = $("<div/>");
  node.addClass("col-sm-4");
  node.append(`
    <div class="product-card" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s ease;">
      <div class="product-image" style="position: relative; overflow: hidden; border-radius: 8px 8px 0 0;">
        <div class="status-badge ${statusClass}" style="position: absolute; top: 10px; right: 10px; padding: 4px 8px; font-size: 12px; font-weight: bold; color: white; background: ${statusClass === 'status-active' ? '#4CAF50' : statusClass === 'status-reveal' ? '#FF9800' : '#F44336'}; border-radius: 0;">
          ${statusText}
        </div>
        <a href='product.html?product-id=${product.blockchainId}'>
          <img src='http://localhost:9001/ipfs/${product.ipfsImageHash}' class='img-responsive' style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s ease;"/>
        </a>
      </div>
      <div class="product-info" style="padding: 16px;">
        <h4 class="product-name" style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${product.productName}</h4>
        <div class="product-meta" style="margin-bottom: 8px;">
          <span class="category" style="font-size: 12px; color: #666;">
            <i class="glyphicon glyphicon-tag"></i> ${product.category}
          </span>
        </div>
        <div class="price-tag" style="margin-bottom: 12px;">
          <div class="price" style="font-size: 18px; font-weight: bold; color: #2196F3;">
            <i class="glyphicon glyphicon-usd"></i> ${priceInEth}
            <span class="price-eth" style="font-size: 12px; color: #666;">ETH</span>
          </div>
        </div>
        <div class="auction-time" style="font-size: 12px; color: #666;">
          <div class="time-remaining" style="margin-bottom: 4px;">
            <i class="glyphicon glyphicon-time"></i> 
            剩余时间: ${timeDisplay}
          </div>
          <div class="auction-dates">
            <small>开始: ${new Date(product.auctionStartTime * 1000).toLocaleString()}</small>
            <br>
            <small>结束: ${new Date(product.auctionEndTime * 1000).toLocaleString()}</small>
          </div>
        </div>
      </div>
    </div>
  `);
  return node;
}

