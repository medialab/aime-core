var webpack = require('webpack'),
    path = require('path');

module.exports = {
  entry: [
    './js/main.jsx'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
    library: 'app'
  },
  module: {
    noParse: /djax-client/,
    loaders: [

      // ES6 and jsx
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|abstract_parser)/,
        loaders: ['react-hot', 'babel-loader']
      },

      // JSON configuration file
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json-loader'
      }
    ]
  }
};
