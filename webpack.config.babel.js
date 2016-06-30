'use strict';

const NODE_ENV = process.env.NODE_ENV || 'dev';

import webpack from 'webpack';
import path from 'path';

var config = {
    target: 'node',
    node: {
        __dirname: true,
        __filename: true
    },
    context: __dirname,
    entry: {
        index: ['./index.js']
    },
    output: {
        path: __dirname + '/assets/js',
        publicPath: '/assets/js',
        filename: '[name]' + '.js'
    },
    module: {
        preLoaders: [{
            test: /\.js$/,
            loader: 'jshint-loader',
            include: path.resolve(__dirname, 'lib')
        }],
        loaders: [{
            test: /\.jsx?$/,
            loader: 'babel',
            exclude: [
                path.resolve(__dirname, 'node_modules'),
                path.resolve(__dirname, 'bower_components')
            ]
        }, {
            test: /\.js/,
            loader: 'imports?define=>false'     // disabling AMD support
        }, {
            test: /\.mustache$/,
            loader: 'mustache',
            exclude: [
                path.resolve(__dirname, 'node_modules'),
                path.resolve(__dirname, 'bower_components')
            ]
        }, {
            include: [
                path.resolve(__dirname, 'bower_components/EaselJS'),
                path.resolve(__dirname, 'bower_components/TweenJS')
            ],
            loader: 'imports?this=>window'
        }, {
            include: [
                path.resolve(__dirname, 'bower_components/EaselJS'),
                path.resolve(__dirname, 'bower_components/TweenJS')
            ],
            loader: 'exports?createjs'
        }]
    },
    resolve: {
        modulesDirectories: ['node_modules', 'bower_components'],
        extensions: ['', '.js'],
        alias: {
            easel: 'EaselJS',
            tween: 'TweenJS',
            hgn: 'requirejs-hogan-plugin'
        }
    },
    resolveLoader: {
        modulesDirectories: ['node_modules'],
        moduleTemplates: ['*-loader', '*'],
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV)
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'Backbone.Wreqr': 'backbone.wreqr'
        }),
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
        ),
        new webpack.NoErrorsPlugin()
    ],
    jshint: {
        esversion: 6,
        node: true,
        
        browser: true,
        camelcase: true,
        curly: true,
        devel: true,
        eqeqeq: true,
        expr: false,
        indent: 4,
        maxdepth: 4,
        maxlen: 120,
        newcap: false,
        noarg: true,
        quotmark: "single",
        undef: true,
        unused: "vars",

        emitErrors: false,
        failOnHint: false
    },
    devtool: NODE_ENV === 'dev' ? 'cheap-inline-module-source-map' : null
};

if (NODE_ENV === 'production') {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            drop_console: true,
            unsafe: true
        }
    }));
}

export default config;