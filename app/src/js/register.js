import { AppOfWeb3 } from './ofweb3.js';
import Web3 from 'web3';
$(document).ready(function () {
    // 初始化web3
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
        AppOfWeb3.web3 = window.web3;
    }

    // 头像预览功能
    document.getElementById('avatar').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('avatarPreview').src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // 注册表单提交处理
    document.getElementById('registerForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        // 验证两次密码是否一致
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }

        // 获取表单数据
        const formData = {
            username: document.getElementById('username').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            shippingAddress: document.getElementById('shippingAddress').value,
            phone: document.getElementById('phone').value,
            password: password,
            isSeller: document.querySelector('input[name="userType"]:checked').value === 'seller',
            avatar: 'default.png' // 默认头像
        };

        try {
            // 获取当前账户
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const currentAccount = accounts[0];
            // 确保User合约已经初始化
            if (!AppOfWeb3.User) {
                await AppOfWeb3.start();
            }

            // 调用User合约的register方法
            await AppOfWeb3.User.methods.register(
                formData.username,
                formData.gender,
                formData.shippingAddress,
                formData.phone,
                formData.avatar,
                formData.password,
                formData.isSeller
            ).send({
                from: currentAccount,
                gas: 999999
            });

            alert('注册成功！');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('注册失败:', error);
            alert('注册失败，请稍后重试');
        }
    });

    // MetaMask连接功能
    window.addEventListener('load', async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // 请求用户授权
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                document.getElementById('currentAddress').textContent = accounts[0];

                // 监听账户变化
                window.ethereum.on('accountsChanged', function (accounts) {
                    document.getElementById('currentAddress').textContent = accounts[0];
                });
            } catch (error) {
                console.error('用户拒绝了访问请求');
                document.getElementById('currentAddress').textContent = '连接被拒绝';
            }
        } else {
            console.error('请安装MetaMask!');
            document.getElementById('currentAddress').textContent = '请安装MetaMask';
        }
    });
});