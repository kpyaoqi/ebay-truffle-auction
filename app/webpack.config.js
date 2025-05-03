const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: {
    index: "./src/js/index.js",
    reveal: "./src/js/reveal.js",
    finalize: "./src/js/finalize.js",
    buys: "./src/js/buys.js",
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
      { from: "./src/finalize.html", to: "finalize.html" }
    ]),
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8080,
    proxy: {
      '/**': {
        target: 'http://localhost:8001',
        secure: false
      }
    }
  }
};
