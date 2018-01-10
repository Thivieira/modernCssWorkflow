const path = require("path");
const glob = require("glob");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const PurifyCSSPlugin = require("purifycss-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const buildPath = __dirname + "/dist";
// the path(s) that should be cleaned
let pathsToClean = ["dist", "build"];

module.exports = {
  entry: {
    app: "./src/app.js"
  },
  output: {
    filename: "[name].[chunkhash].js",
    path: buildPath
  },
  devtool: "cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            { loader: "css-loader", options: { minimize: true } },
            "postcss-loader"
          ]
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("[name].[contenthash].css"),
    // Make sure this is after ExtractTextPlugin!
    new PurifyCSSPlugin({
      // Give paths to parse for rules. These should be absolute!
      paths: glob.sync(path.join(__dirname, "src/*.html"))
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.[chunkhash].js",
      minChunks(module) {
        return module.context && module.context.indexOf("node_modules") >= 0;
      }
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/index.html"),
      path: buildPath,
      excludeChunks: ["base"],
      filename: "index.html",
      minify: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true
      },
      output: {
        comments: false
      }
    }),
    new webpack.HashedModuleIdsPlugin(),
    new CleanWebpackPlugin(pathsToClean)
  ]
};
