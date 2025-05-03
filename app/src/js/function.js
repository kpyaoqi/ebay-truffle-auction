const { create } = require('ipfs-http-client');
const web3 = require('web3');
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });
class Fun {
  constructor() {
    // 加载页面显示列表
    this.renderStore = function renderStore() {
      // this.renderProducts("product-list", {});
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
          if (div === "product-list") {
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



// 商品列表样式


module.exports = Fun;