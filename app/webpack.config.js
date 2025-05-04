const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: {
    index: "./src/js/index.js",
    reveal: "./src/js/reveal.js",
    finalize: "./src/js/finalize.js",
    buys: "./src/js/buys.js",
    login: "./src/js/login.js",    
    register: "./src/js/register.js"  
  },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/index.html", to: "index.html" },
      { from: "./src/list-item.html", to: "list-item.html" },
      { from: "./src/product.html", to: "product.html" },
      { from: "./src/reveal.html", to: "reveal.html" },
      { from: "./src/finalize.html", to: "finalize.html" },
      { from: "./src/login.html", to: "login.html" },      
      { from: "./src/register.html", to: "register.html" },
      { from: "./src/images", to: "images" }  // Add this line to copy images folder
    ]),
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8080,
    index: 'login.html',  // 设置默认打开的页面为login.html
    proxy: {
      '/**': {
        target: 'http://localhost:8001',
        secure: false
      }
    }
  }
};
