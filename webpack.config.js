var path = require('path');

module.exports = {
  mode: 'development',
  entry: './Demo/main.js',
  output: {
    path: path.resolve(__dirname, './Demo/'),
    filename: 'main.bundle.js'
  }
};