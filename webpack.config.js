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

  externals: [
    // remove the line below if you don't want to use buildin versions
    'jquery', 'lodash', 'moment',
    function(context, request, callback) {
      var prefix = 'grafana/';
      if (request.indexOf(prefix) === 0) {
        return callback(null, request.substr(prefix.length));
      }
      callback();
    }
  ],

  // minify and prepare for grafana consumption
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // new WebpackSystemRegister({
    //   systemjsDeps: ['app/plugins/sdk', 'lodash', 'moment', 'angular']
    // }),
    // new webpack.optimize.UglifyJsPlugin({
    //   mangle: false
    // }),
    new CopyWebpackPlugin([
      { from: 'plugin.json' },
      { from: 'img/**/*' }
    ])
  ],

  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  // plugins: [
  //   new webpack.optimize.OccurrenceOrderPlugin(),
  // ],
  module: {
    loaders: [
      // {
      //   test: /\.tsx?$/,
      //   loaders: ['awesome-typescript-loader']
      // },
      {
        test: /\.tsx?$/,
        loaders: [
          {
            loader: "babel-loader",
            // options: { presets: ['env'] }
          },
          "ts-loader"
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.pug$/,
        loader: 'pug-html-loader'
      }
    ]
  }
}
