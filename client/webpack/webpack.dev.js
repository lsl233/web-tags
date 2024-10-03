const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

console.log(path.join(__dirname, "../dist"));

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "../dist"),
    },
  },
  //     compress: true,
  //     historyApiFallback: true,
  //     https: false,
  //     open: true,
  //     hot: true,
  //     port: 9002,
  //     devMiddleware: {
  //       writeToDisk: true,
  //     },
  //   },
});
