const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: "./src/js/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "./src/index.html", to: "index.html" },
      { from: "./src/list-item.html", to: "list-item.html" },
      { from: "./src/product.html", to: "product.html" },
    ]),
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),  compress: true,port: 8080,
    proxy: {
      '/**': {
        target: 'http://localhost:8001',
        secure: false
      }
    }
  }
};
