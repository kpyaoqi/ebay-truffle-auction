const Web3 = require("web3");
const {ethers} = require("ethers");
import { AppOfWeb3 } from './ofweb3.js';
import { AppOfEthers } from './ofetherjs.js';
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
        AppOfWeb3.saveProduct(reader, decodedParams);
        event.preventDefault();
    });

    // 出价
    $("#bidding").submit(function (event) {
        $("#msg").hide();
        let amount = ($("#bid-amount").val()).toString();
        let sendAmount = ($("#bid-send-amount").val()).toString();
        let secretText = ($("#secret-text").val()).toString();
        let productId = $("#product-id").val();
        let sealedBid = AppOfWeb3.keccakWithamountAndsecretText(amount, secretText);
        sealedBid.then(sealedBid => {
            AppOfWeb3.bidProduct(productId, sealedBid, sendAmount);
        });
        event.preventDefault();
    });

    // 揭示报价
    $("#revealing").submit(function (event) {
        $("#msg").hide();
        let amount = ($("#actual-amount").val()).toString();
        let secretText = ($("#reveal-secret-text").val()).toString();
        let productId = $("#product-id").val();
        AppOfWeb3.revealProduct(productId, amount, secretText);
        event.preventDefault();
    });

    // 完成拍卖
    $("#finalize-auction").submit(function (event) {
        $("#msg").hide();
        let productId = $("#product-id").val();
        AppOfWeb3.finalizeProduct(productId);
        event.preventDefault();
    });

    // 释放资金给卖家
    $("#release-funds").click(function () {
        let productId = new URLSearchParams(window.location.search).get('product-id');
        $("#msg").html("您的交易已提交，请等待几秒钟确认").show();
        AppOfWeb3.releaseFunds(productId);
    });

    // 退款给买家
    $("#refund-funds").click(function () {
        let productId = new URLSearchParams(window.location.search).get('product-id');
        $("#msg").html("您的交易已提交，请等待几秒钟确认").show();
        AppOfWeb3.refundFunds(productId);
        alert("资金已退款！");
    });
});

window.web3.AppOfWeb3 = AppOfWeb3;
window.web3.AppOfEthers = AppOfEthers; 

// web3初始化
window.addEventListener("load", function () {
    if (window.ethereum) {
        AppOfWeb3.web3 = new Web3(window.ethereum);
        AppOfEthers.provider = new ethers.providers.Web3Provider(window.ethereum);
        AppOfEthers.singer = AppOfEthers.provider.getSigner();
        window.ethereum.enable();
    } else {
        AppOfWeb3.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
        AppOfEthers.provider = new ethers.providers.JsonRpcProvider();
        AppOfEthers.singer = AppOfEthers.provider.getSigner();
    }
    AppOfWeb3.start();
    AppOfEthers.start();
});
