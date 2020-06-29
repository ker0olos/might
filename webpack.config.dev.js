module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [ 'babel-loader' ]
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      }
    ]
  },
  resolve: {
    extensions: [ '*', '.js', '.jsx' ]
  },
  plugins: [],
  devServer: {
    contentBase: './public',
    port: 8888,
    hot: true
  },
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  }
};