import path from 'path';

import webpack from 'webpack';

import HtmlPlugin from 'html-webpack-plugin';
import htmlTemplate from 'html-webpack-template';
import FaviconsPlugin from 'favicons-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const port = process.env.PORT || 55577;

export default (env, argv) => {
  const { mode } = argv;
  return {
    context: path.resolve(__dirname, 'src'),
    entry: {
      yellowberry: ['@babel/polyfill', './index.js']
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `[name].${mode === 'production' ? '[chunkhash:6].' : ''}js`,
      publicPath: '/'
    },
    devtool: mode === 'development' ? 'source-map' : false,
    devServer: {
      contentBase: path.resolve(__dirname, 'dist'),
      port,
      historyApiFallback: true
    },
    resolve: {
      symlinks: false,
      modules: ['node_modules'],
      extensions: ['.js', '.jsx']
    },
    resolveLoader: {
      modules: ['node_modules'],
      moduleExtensions: ['.js']
    },
    module: {
      rules: [{
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: path.resolve(__dirname, 'src')
      }, {
        test: /\.(sa|sc|c)ss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' } },
          'css-loader',
          'postcss-loader',
          { loader: 'resolve-url-loader', options: { keepQuery: true } },
          'sass-loader'
        ]
      }, {
        test: /\.(jpg|png)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'img/[name].[hash:6].[ext]'
          }
        }
      }]
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /node_modules/,
            chunks: 'initial',
            enforce: true
          }
        }
      },
      runtimeChunk: true
    },
    performance: {
      maxEntrypointSize: 1024 * 1024,
      maxAssetSize: 1024 * 1024
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new HtmlPlugin({
        filename: path.resolve(__dirname, 'dist/index.html'),
        inject: false,
        template: htmlTemplate,
        title: 'Storekeeper',
        meta: [{
          'http-equiv': 'Cache-Control',
          content: 'no-cache, no-store, must-revalidate'
        }, {
          'http-equiv': 'Pragma',
          content: 'no-cache'
        }, {
          'http-equiv': 'Expires',
          content: '0'
        }],
        appMountId: 'container',
        minify: {
          collapseWhitespace: mode === 'production'
        }
      }),
      new FaviconsPlugin(path.resolve(__dirname, 'src/favicon/favicon.png')),
      new MiniCssExtractPlugin({
        filename: `css/${mode === 'development' ? '[name].css' : '[name].[hash:6].css'}`,
        chunkFilename: `css/${mode === 'development' ? '[name].css' : '[name].[hash:6].css'}`
      }),
      new CopyPlugin([{
        from: path.resolve(__dirname, 'src/levels'),
        to: path.resolve(__dirname, 'dist/levels')
      }])
    ]
  };
};
