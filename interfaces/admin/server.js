var webpack = require('webpack'),
    Server = require('webpack-dev-server'),
    config = require('./webpack.config.js');

var PORT = 2000;

new Server(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  stats: {
    colors: true
  }
}).listen(PORT, 'localhost', function(err, result) {
  if (err)
    return console.error(err);

  console.log('Listening on port ' + PORT + '...\nWaiting for compilation...');
});
