import path from 'path';
import webpack from 'webpack';

import htmlTemplate from 'html-webpack-template';
import HtmlPlugin from 'html-webpack-plugin';
import FaviconsPlugin from 'favicons-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const PORT = process.env.PORT ? process.env.PORT : 55577;

const lessLoader = [{
    loader: 'css-loader',
    options: {
        discardComments: {
            removeAll: true
        }
    }
}, {
    loader: 'postcss-loader',
    options: {
        sourceMap: 'inline'
    }
}, {
    loader: 'resolve-url-loader',
    options: {
        keepQuery: true
    }
}, {
    loader: 'less-loader',
    options: {
        sourceMap: true
    }
}];

const config = {
    context: path.resolve(__dirname, 'src/js'),
    entry: {
        storekeeper: ['babel-polyfill', './index.js']
    },
    output: {
        path: path.resolve(__dirname, 'assets'),
        filename: 'js/[name].' + (NODE_ENV === 'development' ? '' : '[chunkhash:6].') + 'js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'assets'),
        port: PORT
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            use: 'babel-loader',
            include: [
                path.resolve(__dirname, 'src/js')
            ]
        }, {
            test: /\.json$/,
            use: 'json-loader',
            include: [
                path.resolve(__dirname, 'src/js'),
                path.resolve(__dirname, 'src/levels')
            ]
        }, {
            test: /\.mustache$/,
            use: 'mustache-loader',
            include: [
                path.resolve(__dirname, 'src/js')
            ]
        }, {
            test: /\.less$/,
            use: ExtractTextPlugin.extract({
                use: lessLoader,
                fallback: 'style-loader',
                publicPath: '../'
            }),
            include: [
                path.resolve(__dirname, 'src/less')
            ]
        }, {
            test: /\.(svg|eot|ttf|woff2?)$/,
            use: {
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[hash:6].[ext]'
                }
            },
            include: [
                path.resolve(__dirname, 'src/fonts'),
                path.resolve(__dirname, 'node_modules/bootstrap/fonts')
            ]
        }]
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.jsx']
    },
    resolveLoader: {
        modules: ['node_modules'],
        moduleExtensions: ['.js']
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV)
        }),
        new HtmlPlugin({
            filename: path.resolve(__dirname, 'assets/index.html'),
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
            appMountId: 'application',
            minify: {
                collapseWhitespace: NODE_ENV === 'production'
            }
        }),
        new FaviconsPlugin(path.resolve(__dirname, 'src/favicon/favicon.png')),
        new ExtractTextPlugin('css/[name].css', {
            allChunks: true
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'Backbone.Wreqr': 'backbone.wreqr'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: module => {
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            minChunks: Infinity
        })
    ],
    devtool: NODE_ENV === 'development' ? 'source-map' : false
};

if (NODE_ENV === 'production') {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        comments: false,
        compress: {
            warnings: false,
            drop_console: false,
            unsafe: false
        },
        sourceMap: false
    }));
}

export default config;
