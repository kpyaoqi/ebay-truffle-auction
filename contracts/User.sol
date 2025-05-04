// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract User {
    struct UserInfo {
        string username;
        string gender;
        string shippingAddress;
        string phone;
        string avatar;
        string password; // 添加密码字段
        bool isSeller; // true表示商家,false表示普通用户
        bool isRegistered;
    }
    
    mapping(address => UserInfo) public users;
    
    event UserRegistered(address userAddress, string username, bool isSeller);
    event UserUpdated(address userAddress, string username);
    
    function register(
        string memory _username,
        string memory _gender,
        string memory _shippingAddress,
        string memory _phone,
        string memory _avatar,
        string memory _password,  // 添加密码参数
        bool _isSeller
    ) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        
        users[msg.sender] = UserInfo({
            username: _username,
            gender: _gender,
            shippingAddress: _shippingAddress,
            phone: _phone,
            avatar: _avatar,
            password: _password,  // 存储密码
            isSeller: _isSeller,
            isRegistered: true
        });
        
        emit UserRegistered(msg.sender, _username, _isSeller);
    }
    
    function updateProfile(
        string memory _username,
        string memory _gender,
        string memory _shippingAddress,
        string memory _phone,
        string memory _avatar,
        string memory _password  // 添加密码参数
    ) public {
        require(users[msg.sender].isRegistered, "User not registered");
        
        UserInfo storage user = users[msg.sender];
        user.username = _username;
        user.gender = _gender;
        user.shippingAddress = _shippingAddress;
        user.phone = _phone;
        user.avatar = _avatar;
        user.password = _password;  // 更新密码
        
        emit UserUpdated(msg.sender, _username);
    }
    
    function getUserInfo(address userAddress) public view returns (
        string memory username,
        string memory gender,
        string memory shippingAddress,
        string memory phone,
        string memory avatar,
        string memory password,  // 添加密码返回
        bool isSeller,
        bool isRegistered
    ) {
        UserInfo memory user = users[userAddress];
        return (
            user.username,
            user.gender,
            user.shippingAddress,
            user.phone,
            user.avatar,
            user.password,    // 返回密码
            user.isSeller,
            user.isRegistered
        );
    }
}