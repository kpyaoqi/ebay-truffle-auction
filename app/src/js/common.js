import { AppOfWeb3 } from "./ofweb3";
const Web3 = require("web3");
export const common = {
  displayUserInfo: async function () {
    try {
      // 从localStorage获取登录状态和地址
      const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
      const currentAccount = localStorage.getItem('userAddress');

      if (!isLoggedIn || !currentAccount) {
        $('#userDisplayName').text('未登录');
        $('#userAvatar').attr('src', 'images/default.png');
        return;
      }
      if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
        AppOfWeb3.web3 = window.web3;
      }
      if (!AppOfWeb3.User) {
        await AppOfWeb3.start();
      }
      const userInfo = await AppOfWeb3.User.methods.getUserInfo(currentAccount).call();
      if (userInfo && userInfo.username) {
        $('#userDisplayName').text(userInfo.username);
        if (userInfo.avatar) {
          $('#userAvatar').attr('src', 'images/' + userInfo.avatar);
        }

        // 更新弹出框中的用户信息
        $('#popupUsername').text(userInfo.username);
        $('#popupGender').text(userInfo.gender);
        $('#popupPhone').text(userInfo.phone);
        $('#popupAddress').text(userInfo.shippingAddress);
      } else {
        $('#userDisplayName').text('未登录');
        $('#userAvatar').attr('src', 'images/default.png');

        // 未登录时清空弹出框信息
        $('#popupUsername').text('-');
        $('#popupGender').text('-');
        $('#popupPhone').text('-');
        $('#popupAddress').text('-');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      $('#userDisplayName').text('未登录');
      $('#userAvatar').attr('src', 'images/default.png');

      // 发生错误时清空弹出框信息
      $('#popupUsername').text('-');
      $('#popupGender').text('-');
      $('#popupPhone').text('-');
      $('#popupAddress').text('-');
    }
  }
}


