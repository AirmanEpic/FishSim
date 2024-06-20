const path = require('path');

module.exports = {
  //This property defines where the application starts
  entry:'./src/index.ts',
    
  //This property defines the file path and the file name which will be used for deploying the bundled file
  output:{
    path: path.join(__dirname, '/build'),
    filename: 'bundle.js'
  },
    
  //Setup loaders
  resolve:{
    extensions: ['.ts', '.tsx', '.js'],
  },
  module:{
    rules:[
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
}