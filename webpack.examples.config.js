const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * Webpack Examples Configuration
 * 
 * 开发环境: 端口 3334
 * 打包输出: webexamples 文件夹
 */

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return {
        mode: isDevelopment ? 'development' : 'production',
        entry: './src/examples/index.tsx',
        output: {
            path: path.resolve(__dirname, 'webexamples'),
            filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
            chunkFilename: isDevelopment ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
            clean: true,
            publicPath: '/',
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react',
                                '@babel/preset-typescript',
                            ],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/images/[name].[contenthash][ext]',
                    },
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/fonts/[name].[contenthash][ext]',
                    },
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@core': path.resolve(__dirname, 'src/core'),
                '@examples': path.resolve(__dirname, 'src/examples'),
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
                title: 'ZJPCY Workflow - Examples',
                inject: true,
                minify: isDevelopment
                    ? false
                    : {
                          removeComments: true,
                          collapseWhitespace: true,
                          removeRedundantAttributes: true,
                          useShortDoctype: true,
                          removeEmptyAttributes: true,
                          removeStyleLinkTypeAttributes: true,
                          keepClosingSlash: true,
                          minifyJS: true,
                          minifyCSS: true,
                          minifyURLs: true,
                      },
            }),
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, 'public'),
            },
            port: 3334,
            hot: true,
            open: true,
            historyApiFallback: true,
            compress: true,
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
        },
        devtool: isDevelopment ? 'eval-source-map' : 'source-map',
        optimization: isDevelopment
            ? {}
            : {
                  splitChunks: {
                      chunks: 'all',
                      cacheGroups: {
                          vendor: {
                              test: /[\\/]node_modules[\\/]/,
                              name: 'vendors',
                              chunks: 'all',
                          },
                      },
                  },
                  runtimeChunk: {
                      name: 'runtime',
                  },
              },
        performance: {
            hints: isDevelopment ? false : 'warning',
            maxEntrypointSize: 512000,
            maxAssetSize: 512000,
        },
    };
};
