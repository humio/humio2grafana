const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackSystemRegister = require('webpack-system-register');


module.exports = {
  context: __dirname + "/src",
  entry: './module.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'module.js'
  },

  // minify and prepare for grafana consumption
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new WebpackSystemRegister({
      systemjsDeps: ['app/plugins/sdk', 'lodash', 'moment', 'angular']
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   mangle: false
    // }),
    new CopyWebpackPlugin([
      { from: 'plugin.json' },
      { from: 'img/**/*' }
    ])
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  // plugins: [
  //   new webpack.optimize.OccurrenceOrderPlugin(),
  // ],
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  }
}
