const { create } = require('ipfs-http-client');
const web3 = require('web3');import {common} from './common.js';
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });
class Fun {
  constructor() {
    // 加载页面显示列表
    this.renderStore = function renderStore() {
      this.renderProducts("product-finalize-list", { productStatus: "finalize" });
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
          if (div === "product-finalize-list") {
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
    common.displayUserInfo();

  }
}

// 在页面加载时创建实例并调用renderStore
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
    statusText = '已结束';
  } else if (timeRemaining < 3600) { // 小于1小时
    statusClass = 'status-reveal status-urgent';
    statusText = '即将结束';
  } else {
    statusClass = 'status-active';
    statusText = '进行中';
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
    <div class="product-card" style="margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: all 0.3s ease; overflow: hidden;">
      <div class="product-image" style="position: relative; height: 200px; overflow: hidden;">
        <div class="status-badge ${statusClass}" style="position: absolute; top: 10px; right: 10px; padding: 4px 10px; font-size: 12px; font-weight: bold; color: white; background: ${statusClass === 'status-active' ? '#4CAF50' : statusClass === 'status-reveal' ? '#FF9800' : '#F44336'}; border-radius: 0;">
          ${statusText}
        </div>
        <a href='product.html?product-id=${product.blockchainId}'>
          <img src='http://localhost:9001/ipfs/${product.ipfsImageHash}' style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
        </a>
      </div>
      <div class="product-info" style="padding: 15px; background: white;">
        <h4 class="product-name" style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: 600;">${product.productName}</h4>
        <div class="product-meta" style="margin-bottom: 10px;">
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
        <div class="auction-time" style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
          <div class="time-remaining" style="margin-bottom: 5px;">
            <i class="glyphicon glyphicon-time"></i> 
            剩余时间: <strong>${timeDisplay}</strong>
          </div>
          <div class="auction-dates" style="font-size: 11px;">
            <div style="margin-bottom: 3px;">开始: ${new Date(product.auctionStartTime * 1000).toLocaleString()}</div>
            <div>结束: ${new Date(product.auctionEndTime * 1000).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  `);
  return node;
}

