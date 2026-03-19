const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 加载 .env 文件中的环境变量
require('dotenv').config();

// 从 .env 文件或环境变量读取端口，默认 3333
const PORT = process.env.PORT || 3333;

console.log(PORT);

module.exports = {
  mode: 'development',
  entry: './src/dev/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    port: PORT,
    hot: true,
    open: true
  }
};
