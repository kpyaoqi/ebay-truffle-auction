// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "./Escrow.sol";

contract EcommerceStoreV2 {
    // 商品状态
    enum ProductStatus {
        Open,
        Sold,
        Unsold
    }

    enum ProductCondition {
        New,
        Used,
        Repair
    }

    // 商品计数器
    uint256 public productIndex;
    // 商店商品列表
    mapping(address => mapping(uint256 => Product)) stores;
    // 商品ID对应商店的地址
    mapping(uint256 => address) productIdInStore;

    mapping(uint256 => address) productEscrow;

    // 商品结构体
    struct Product {
        // 商品ID
        uint256 id;
        // 商品名字
        string name;
        // 商品类别
        string category;
        // 商品图片链接
        string imageLink;
        // 商品描述文本链接
        string descLink;
        // 开始拍卖时间
        uint256 auctionStartTime;
        // 结束拍卖时间
        uint256 auctionEndTime;
        // 起拍价
        uint256 startPrice;
        // 最高出价人地址
        address highestBidder;
        // 最高价
        uint256 highestBid;
        // 第二高出价人出价
        uint256 secondHighestBid;
        // 总共出价
        uint256 totalBids;
        // 商品状态
        ProductStatus status;
        ProductCondition condition;
        // 竞拍人详情
        mapping(address => mapping(bytes32 => Bid)) bids;
    }

    // 竞拍人报价信息
    struct Bid {
        address bidder;
        uint256 productId;
        uint256 value;
        bool revealed;
    }

    // 添加商品事件
    event NewProduct(
        uint256 _productId,
        string _name,
        string _category,
        string _imageLink,
        string _descLink,
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        uint256 _startPrice,
        uint256 _productCondition
    );

    // constructor() {
    //     productIndex = 0;
    // }

    // 商品初始下标
    function store(uint256 index_) public {
        productIndex = index_;
    }

    //添加商品
    function addProductToStore(
        string memory _name,
        string memory _category,
        string memory _imageLink,
        string memory _descLink,
        uint256 _auctionStartTime,
        uint256 _auctionEndTime,
        string memory _startPrice,
        uint256 _productCondition
    ) public {
        require(_auctionStartTime < _auctionEndTime);
        productIndex += 1;
        // 添加商品在以msg.sender为索引的商店里
        Product storage product = stores[msg.sender][productIndex];
        product.id = productIndex;
        product.name = _name;
        product.category = _category;
        product.imageLink = _imageLink;
        product.descLink = _descLink;
        product.auctionStartTime = _auctionStartTime;
        product.auctionEndTime = _auctionEndTime;
        product.startPrice = stringToUint(_startPrice);
        product.status = ProductStatus.Open;
        product.condition = ProductCondition(_productCondition);
        // 商品ID对应的商店
        productIdInStore[productIndex] = msg.sender;
        emit NewProduct(
            productIndex,
            _name,
            _category,
            _imageLink,
            _descLink,
            _auctionStartTime,
            _auctionEndTime,
            stringToUint(_startPrice),
            _productCondition
        );
    }

    // 获取商品信息
    function getProduct(
        uint256 _productId
    )
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            ProductStatus,
            ProductCondition
        )
    {
        Product storage product = stores[productIdInStore[_productId]][
            _productId
        ];
        return (
            product.id,
            product.name,
            product.category,
            product.imageLink,
            product.descLink,
            product.auctionStartTime,
            product.auctionEndTime,
            product.startPrice,
            product.status,
            product.condition
        );
    }

    // 出价
    function bid(
        uint256 _productId,
        bytes32 _bid
    ) public payable returns (bool) {
        Product storage product = stores[productIdInStore[_productId]][
            _productId
        ];
        require(block.timestamp >= product.auctionStartTime, ">");
        require(block.timestamp <= product.auctionEndTime, "<");
        require(msg.value >= product.startPrice, "=");
        require(
            product.bids[msg.sender][_bid].bidder ==
                0x0000000000000000000000000000000000000000,
            "=="
        );
        product.bids[msg.sender][_bid] = Bid(
            msg.sender,
            _productId,
            msg.value,
            false
        );
        product.totalBids += 1;
        return true;
    }

    // 揭示出价
    function revealBid(
        uint256 _productId,
        string memory _amount,
        string memory _secret
    ) public {
        Product storage product = stores[productIdInStore[_productId]][
            _productId
        ];
        require(block.timestamp > product.auctionStartTime);
        // 进行加密后的出价的keccak256哈希值
        bytes32 sealedBid = keccak256(abi.encode(_amount, _secret));
        Bid memory bidInfo = product.bids[msg.sender][sealedBid];
        require(bidInfo.bidder > 0x0000000000000000000000000000000000000000);
        require(bidInfo.revealed == false);
        // 需要回退的数量
        uint256 refund;
        // 出价数量
        uint256 amount = stringToUint(_amount);

        uint256 bidInfov = bidInfo.value;
        // 发送数量小于出价数量，无效出价
        if (bidInfov < amount) {
            refund = bidInfov;
        } else {
            // 第一次出价的人
            if (
                address(product.highestBidder) ==
                0x0000000000000000000000000000000000000000
            ) {
                product.highestBidder = msg.sender;
                product.highestBid = amount;
                product.secondHighestBid = product.startPrice;
                refund = bidInfov - amount;
            } else {
                // 出价大于最高价
                if (amount > product.highestBid) {
                    product.secondHighestBid = product.highestBid;
                    payable(product.highestBidder).transfer(product.highestBid);
                    product.highestBidder = msg.sender;
                    product.highestBid = amount;
                    refund = bidInfov - amount;
                } else if (amount > product.secondHighestBid) {
                    // 出价大于第二高价
                    product.secondHighestBid = amount;
                    refund = amount;
                } else {
                    // 有效出价，但出局
                    refund = amount;
                }
            }
        }
        // 揭示成功，无法再次揭示
        product.bids[msg.sender][sealedBid].revealed = true;

        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
    }

    // 最高出价人信息
    function highestBidderInfo(
        uint256 _productId
    ) public view returns (address, uint256, uint256) {
        Product storage product = stores[productIdInStore[_productId]][
            _productId
        ];
        return (
            product.highestBidder,
            product.highestBid,
            product.secondHighestBid
        );
    }

    // 总共出价数量
    function totalBids(uint256 _productId) public view returns (uint256) {
        Product storage product = stores[productIdInStore[_productId]][
            _productId
        ];
        return product.totalBids;
    }

    // 字符串转为整数
    function stringToUint(string memory s) private pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            if (uint8(b[i]) >= 48 && uint8(b[i]) <= 57) {
                result = result * 10 + (uint8(b[i]) - 48);
            }
        }
        return result;
    }

    function finalizeAuction(uint256 _productId) public {
        Product storage product = stores[productIdInStore[_productId]][
            _productId
        ];
        // 48 hours to reveal the bid
        require(block.timestamp > product.auctionEndTime);
        require(product.status == ProductStatus.Open);
        require(product.highestBidder != msg.sender);
        require(productIdInStore[_productId] != msg.sender);

        if (
            product.highestBidder == 0x0000000000000000000000000000000000000000
        ) {
            product.status = ProductStatus.Unsold;
        } else {
            // Whoever finalizes the auction is the arbiter
            Escrow escrow = (new Escrow){value: product.secondHighestBid}(
                _productId,
                product.highestBidder,
                productIdInStore[_productId],
                msg.sender
            );
            productEscrow[_productId] = address(escrow);
            product.status = ProductStatus.Sold;
            // The bidder only pays the amount equivalent to second highest bidder
            // Refund the difference
            uint256 refund = product.highestBid - product.secondHighestBid;
            payable(product.highestBidder).transfer(refund);
        }
    }

    function escrowAddressForProduct(
        uint256 _productId
    ) public view returns (address) {
        return productEscrow[_productId];
    }

    function escrowInfo(
        uint256 _productId
    ) public view returns (address, address, address, bool, uint256, uint256) {
        return Escrow(productEscrow[_productId]).escrowInfo();
    }

    function releaseAmountToSeller(uint256 _productId) public {
        Escrow(productEscrow[_productId]).releaseAmountToSeller(msg.sender);
    }

    function refundAmountToBuyer(uint256 _productId) public {
        Escrow(productEscrow[_productId]).refundAmountToBuyer(msg.sender);
    }

    // 生成密钥
    function keccak(
        string memory _amount,
        string memory _secret
    ) public pure returns (bytes32) {
        bytes32 _bid = keccak256(abi.encode(_amount, _secret));
        return _bid;
    }

    // 需要升级的方法
    function increment() public {
        productIndex = productIndex + 1;
    }
}
