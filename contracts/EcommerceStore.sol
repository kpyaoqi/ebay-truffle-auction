// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../contracts/Escrow.sol";

contract EcommerceStore {
	// 商品状态
	enum ProductStatus { Open, Sold, Unsold }
	enum ProductCondition { New, Used }

	// 商品计数器
	uint public productIndex;
	// 商店商品列表
	mapping (address => mapping(uint => Product)) stores;
	// 商品ID对应商店的地址
	mapping (uint => address) productIdInStore;
	
	mapping (uint => address) productEscrow;

	// 商品结构体
	struct Product {
		// 商品ID
		uint id;
		// 商品名字
		string name;
		// 商品类别
		string category;
		// 商品图片链接
		string imageLink;
		// 商品描述文本链接
		string descLink;
		// 开始拍卖时间
		uint auctionStartTime;
		// 结束拍卖时间
		uint auctionEndTime;
		// 起拍价
		uint startPrice;
		// 最高出价人地址
		address highestBidder;
		// 最高价
		uint highestBid;
		// 第二高出价人出价
		uint secondHighestBid;
		// 总共出价
		uint totalBids;
		// 商品状态
		ProductStatus status;
		ProductCondition condition;
		// 竞拍人详情
		mapping (address => mapping(bytes32 => Bid)) bids;
	}
	
	// 竞拍人报价信息
	struct Bid {
		address bidder;
		uint productId;
		uint value;
		bool revealed;
	}

	constructor() {
		productIndex = 0;
	}
	
	//添加商品
	function addProductToStore(string memory _name, string memory _category, string memory _imageLink, string memory _descLink, uint _auctionStartTime, uint _auctionEndTime, string memory _startPrice, uint _productCondition) public {
		require(_auctionStartTime < _auctionEndTime);
		productIndex += 1;
		// 添加商品在以msg.sender为索引的商店里
		Product storage product = stores[msg.sender][productIndex] ;
		product.id=productIndex;
		product.name=_name;
		product.category=_category;
		product.imageLink=_imageLink;
		product.descLink=_descLink;
		product.auctionStartTime=_auctionStartTime;
		product.auctionEndTime= _auctionEndTime;
		product.startPrice= stringToUint( _startPrice);
		product.status= ProductStatus.Open;
		product.condition= ProductCondition(_productCondition);
		// 商品ID对应的商店
		productIdInStore[productIndex] = msg.sender;
	}

	// 获取商品信息
	function getProduct(uint _productId) view public returns (uint, string memory, string memory, string memory, string memory, uint, uint, uint, ProductStatus, ProductCondition) {
		Product storage product = stores[productIdInStore[_productId]][_productId];
		return (product.id, product.name, product.category, product.imageLink, product.descLink, product.auctionStartTime, product.auctionEndTime, product.startPrice, product.status, product.condition);
	}
	
	// 出价
	function bid(uint _productId, bytes32 _bid) payable public returns (bool) {
		Product storage product = stores[productIdInStore[_productId]][_productId];
		require(block.timestamp >= product.auctionStartTime,">");
		require(block.timestamp <= product.auctionEndTime,"<");
		require(msg.value >= product.startPrice,"=");
		require(product.bids[msg.sender][_bid].bidder == 0x0000000000000000000000000000000000000000,"==");
		product.bids[msg.sender][_bid] = Bid(msg.sender, _productId, msg.value, false);
		product.totalBids += 1;
		return true;
	}
	
	// 揭示出价
	function revealBid(uint _productId, string memory _amount, string memory _secret) public {
		Product storage product = stores[productIdInStore[_productId]][_productId];
		require (block.timestamp > product.auctionStartTime);
		// 进行加密后的出价的keccak256哈希值
		bytes32 sealedBid = keccak256(abi.encode(_amount, _secret));
		Bid memory bidInfo = product.bids[msg.sender][sealedBid];
		require (bidInfo.bidder > 0x0000000000000000000000000000000000000000);
		require (bidInfo.revealed == false);
		// 需要回退的数量
		uint refund;
		// 出价数量
		uint amount = stringToUint(_amount);

		uint bidInfov=bidInfo.value;
		// 发送数量小于出价数量，无效出价
		if(bidInfov < amount) {
			refund = bidInfov;
		} else {
			// 第一次出价的人
			if (address(product.highestBidder) == 0x0000000000000000000000000000000000000000) {
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
	function highestBidderInfo(uint _productId) view public returns (address, uint, uint) {
		Product storage product = stores[productIdInStore[_productId]][_productId];
		return (product.highestBidder, product.highestBid, product.secondHighestBid);
	}
	
	// 总共出价数量
	function totalBids(uint _productId) view public returns (uint) {
		Product storage product = stores[productIdInStore[_productId]][_productId];
		return product.totalBids;
	}

	// 字符串转为整数
	function stringToUint(string memory s) pure private returns (uint) {
		bytes memory b = bytes(s);
		uint result = 0;
		for (uint i = 0; i < b.length; i++) {
			if (uint8(b[i]) >= 48 && uint8(b[i]) <= 57) {
				result = result * 10 + (uint8(b[i]) - 48);
			}
		}
		return result;
	}
	


	function finalizeAuction(uint _productId) public {
		Product storage product = stores[productIdInStore[_productId]][_productId];
		// 48 hours to reveal the bid
		require(block.timestamp > product.auctionEndTime);
		require(product.status == ProductStatus.Open);
		require(product.highestBidder != msg.sender);
		require(productIdInStore[_productId] != msg.sender);

		if (product.highestBidder == 0x0000000000000000000000000000000000000000) {
			product.status = ProductStatus.Unsold;
		} else {
			// Whoever finalizes the auction is the arbiter
			Escrow escrow = (new Escrow){value:product.secondHighestBid}(_productId, product.highestBidder, productIdInStore[_productId], msg.sender);
			productEscrow[_productId] = address(escrow);
			product.status = ProductStatus.Sold;
			// The bidder only pays the amount equivalent to second highest bidder
			// Refund the difference
			uint refund = product.highestBid - product.secondHighestBid;
			payable(product.highestBidder).transfer(refund);
		}
	}

	function escrowAddressForProduct(uint _productId) view public returns (address) {
		return productEscrow[_productId];
	}

	function escrowInfo(uint _productId) view public returns (address, address, address, bool, uint, uint) {
		return Escrow(productEscrow[_productId]).escrowInfo();
	}

	function releaseAmountToSeller(uint _productId) public {
		Escrow(productEscrow[_productId]).releaseAmountToSeller(msg.sender);
	}

	function refundAmountToBuyer(uint _productId) public {
		Escrow(productEscrow[_productId]).refundAmountToBuyer(msg.sender);
	}

	// 生成密钥
	function keccak( string memory _amount, string memory _secret)pure  public returns (bytes32) {
		bytes32 _bid=keccak256(abi.encode(_amount,_secret));
		return _bid;
	}
}