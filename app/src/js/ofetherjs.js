// import Fun from './function.js';
import ecommerce_store_artifacts from '../../../build/contracts/EcommerceStore.json';
const { ethers } = require("ethers");

export const AppOfEthers = {
    provider: null,
    singer: null,
    EcommerceStore: null,
    start: async function () {
        try {
            // const { provider, singer } = this;
            // const network = await provider.getNetwork();
            // console.log(network.chainId);
            // const EcommerceStoreAddress = ecommerce_store_artifacts.networks[network.chainId].address;
            // this.EcommerceStore = new ethers.Contract(
            //     EcommerceStoreAddress,
            //     ecommerce_store_artifacts.abi,
            //     singer
            // );
        } catch (error) {
            console.error(error);
        }
    },

    // 获取密文
    // keccakWithamountAndsecretText: async function (amount, secretText) {
    //     const { keccak } = this.EcommerceStore;
    //     amount =  ethers.utils.parseEther(amount);
    //     var sealedBid = await keccak(amount.toString(), secretText);
    //     return sealedBid;
    // },

}