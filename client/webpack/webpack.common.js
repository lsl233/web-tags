const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");
const dotenv = require("dotenv");

const env = dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
}).parsed;

const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: {
    popup: path.join(srcDir, "popup/page.tsx"),
    // options: path.join(srcDir, "options.tsx"),
    "new-tab": path.join(srcDir, "new-tab/page.tsx"),
    background: path.join(srcDir, "background.ts"),
    "content-script": path.join(srcDir, "content-script.tsx"),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== "background";
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/, // 处理 CSS 文件的规则
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader", // 使用 postcss-loader 处理 Tailwind 和 Shadcn UI
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "../postcss.config.js"),
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "@": path.resolve(__dirname, "..", "src"),
    },
  },
  plugins: [
    new webpack.DefinePlugin(envKeys),
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "public" }],
      options: {},
    }),
  ],
};
