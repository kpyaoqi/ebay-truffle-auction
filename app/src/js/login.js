import { AppOfWeb3 } from './ofweb3.js';
import Web3 from 'web3';

$(document).ready(async function() {
    // 初始化web3
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
        AppOfWeb3.web3 = window.web3;
        await AppOfWeb3.start();
    }

    // 生成验证码
    function generateCaptcha() {
        const canvas = document.getElementById('captchaCanvas');
        const ctx = canvas.getContext('2d');
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let captcha = '';

        // 清空画布
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 生成4位随机验证码
        ctx.fillStyle = '#333';
        ctx.font = '24px Arial';
        for (let i = 0; i < 4; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            captcha += char;
            ctx.fillText(char, 20 + i * 20, 30);
        }

        // 添加干扰线
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.strokeStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
            ctx.stroke();
        }

        return captcha;
    }

    // 存储当前验证码
    let currentCaptcha = generateCaptcha();

    // 点击验证码重新生成
    $('#captchaCanvas').click(function() {
        currentCaptcha = generateCaptcha();
    });

    // 获取当前MetaMask账户并显示用户名
    async function displayCurrentUser() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const currentAccount = accounts[0];
            
            // 显示当前地址
            $('#currentAddress').text(currentAccount);

            // 获取用户信息
            const userInfo = await AppOfWeb3.User.methods.getUserInfo(currentAccount).call();
            if (userInfo && userInfo.username) {
                $('#username').val(userInfo.username);
                $('#username').prop('readonly', true);
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
        }
    }

    // 页面加载时显示用户信息
    await displayCurrentUser();

    // 监听MetaMask账户变化
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', function (accounts) {
            displayCurrentUser();
        });
    }

    // 登录表单提交处理
    $('#loginForm').submit(async function(e) {
        e.preventDefault();

        const password = $('#password').val();
        const captchaInput = $('#captcha').val();

        // 验证码检查
        if (captchaInput.toLowerCase() !== currentCaptcha.toLowerCase()) {
            alert('验证码错误！');
            currentCaptcha = generateCaptcha();
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const currentAccount = accounts[0];

            // 获取用户信息并验证密码
            const userInfo = await AppOfWeb3.User.methods.getUserInfo(currentAccount).call();
            console.log(userInfo.password);
            console.log(password);
            if (userInfo && userInfo.password === password) {
                // 登录成功，存储登录状态
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userAddress', currentAccount);
                
                alert('登录成功！');
                window.location.href = 'index.html';
            } else {
                alert('密码错误！');
                currentCaptcha = generateCaptcha();
            }
        } catch (error) {
            console.error('登录失败:', error);
            alert('登录失败，请稍后重试');
            currentCaptcha = generateCaptcha();
        }
    });
});