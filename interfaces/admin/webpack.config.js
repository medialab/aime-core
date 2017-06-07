var webpack = require('webpack'),
    path = require('path');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:2000',
    'webpack/hot/only-dev-server',
    './js/main.jsx'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
    library: 'app'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
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
      },

      // flexbox grid
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        include: /flexboxgrid/
      }
    ]
  }
};
