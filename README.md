# ebay-truffle-auction

基于truffle搭建的拍卖系统

声明：如有任何问题请联系wx：YQ-SmileATT

这个项目主要是基于以太坊开发拍卖系统DApp，拍卖的原理类似于eBay，所以又可以叫做“去中心化eBay”项目.

这个项目是根据[尚硅谷区块链项目硅谷拍卖系统](https://www.bilibili.com/video/BV1EJ411D7SL/)模仿做的，但是教程是很久之前的，用的版本都是好久之前的了.

我现在用的版本都是**较新版本**，其他细节请参考[原文档](https://github.com/confucianzuoyuan/blockchain-tutorial/tree/master/%E4%BB%A5%E5%A4%AA%E5%9D%8A%E6%95%99%E7%A8%8B/%E6%8B%8D%E5%8D%96%E5%BA%94%E7%94%A8).

首先确保电脑已经安装**truffle、webpack、ganache-cli**

```
npm install -g truffle@5.7.4 webpack@5.75.0 ganache-cli@6.12.2
```

新建一个空白文件夹，初始化项目(这一步应该要在域名文件添加一行**185.199.109.133  raw.githubusercontent.com**)

```
truffle unbox webpack
```

然后打开./app/package.json进行修改

```
// 这个是我的
{
  "name": "app",
  "version": "1.0.0",
  "description": "",
  "private": true,
  "scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server"
  },
  "devDependencies": {
    "copy-webpack-plugin": "^5.0.5",
    "webpack": "^4.41.2",
    "webpack-cli": "^3.3.10",
    "webpack-dev-server": "^3.9.0"
  },
  "dependencies": {
    "@babel/core": "^7.20.12",
    "ipfs-http-client": "^50.1.2",
    "web3": "^1.2.4"
  }
}
```

```
npm install
```

还要安装IPFS，[下载链接](https://dist.ipfs.tech/#kubo),我安装的版本是 kubo_v0.18.1

启动IPFS后，打开IPFS的[UI前端](http://localhost:5001/webui)，修改配置文件并保存，然后重启IPFS

```
{
	"API": {
		"HTTPHeaders": {
			"Access-Control-Allow-Credentials": ["true"],
			"Access-Control-Allow-Headers": ["Authorization"],
			"Access-Control-Allow-Methods": ["GET","POST"],
			"Access-Control-Allow-Origin": ["*"],
			"Access-Control-Expose-Headers": ["Location"]
		}
	},
	"Addresses": {
		...
		"Gateway": "/ip4/127.0.0.1/tcp/9001",
		...
     }
     ...
}     
```



# 最后

在启动 ganache-cli 、IPFS后，在项目根目录下使用 truffle 部署合约

```
truffle migrations
```

然后在项目app目录下启动项目

```
npm run dev
```




