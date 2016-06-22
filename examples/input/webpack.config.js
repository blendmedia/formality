const webpack = require("webpack");
const path = require("path");
const env = process.env.NODE_ENV;

const entry = [
  path.join(__dirname, "index.js"),
];
const argv = require("yargs").argv;

if (env === "development") {
  entry.unshift(
    `webpack-dev-server/client?http://localhost:${argv.port || 8080}`,
    "webpack/hot/only-dev-server"
  );
}

module.exports = {
  devtool: "eval",
  output: {
    path: path.join(__dirname, "static"),
    filename: "bundle.js",
    publicPath: "/static/",
  },
  entry,
  resolve: {
    alias: {
      "@thinmartian/formality": path.join(__dirname, "../../src"),
    },
  },
  resolveLoader: {
    modulesDirectories: [
      path.join(__dirname, "node_modules"),
    ],
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ["babel-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.styl$/,
        loaders: [
          "style-loader",
          "css-loader",
          "stylus-loader",
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV" : `"${env}"`,
    }),
  ],
};
