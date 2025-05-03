
import web3 from 'web3';

$(document).ready(function () {
    // 分类筛选点击事件
    $('.category-filter button').click(function () {
        $('.category-filter button').removeClass('active');
        $(this).addClass('active');

        const category = $(this).data('category');
        loadProductsByCategory(category);
    });

    // 初始加载全部商品
    loadProductsByCategory('all');
});

function loadProductsByCategory(category) {
    $('#product-list').empty();
    $.ajax({
        url: '/product/productsByCategory',
        method: 'GET',
        data: { category: category },
        success: function (data) {
            // 更新商品总数显示
            if ("product-list" === "product-list") {
                $("#total-products").text(data.length);
            }

            if (data.length == 0) {
                $("#" + "product-list").html('未找到商品');
            }
            while (data.length > 0) {
                let chunks = data.splice(0, 3);  // 修改为3个一组
                let row = $("<div/>");
                row.addClass("row");
                chunks.forEach(value => {
                    let node = buildProduct(value); // 通过实例调用方法
                    row.append(node);
                });
                $("#" + "product-list").append(row);
            }
        }
    });
}


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
      <div class="product-card">
        <div class="product-image">
          <div class="status-badge ${statusClass}">${statusText}</div>
          <a href='product.html?product-id=${product.blockchainId}'>
            <img src='http://localhost:9001/ipfs/${product.ipfsImageHash}' class='img-responsive'/>
          </a>
        </div>
        <div class="product-info">
          <h4 class="product-name">${product.productName}</h4>
          <div class="product-meta">
            <span class="category">
              <i class="glyphicon glyphicon-tag"></i> ${product.category}
            </span>
          </div>
          <div class="price-tag">
            <div class="price">
              <i class="glyphicon glyphicon-usd"></i> ${priceInEth}
              <span class="price-eth">ETH</span>
            </div>
          </div>
          <div class="auction-time">
            <div class="time-remaining">
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