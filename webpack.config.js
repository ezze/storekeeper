'use strict';

const NODE_ENV = process.env.NODE_ENV || 'dev';

var webpack = require('webpack'),
    path = require('path');

module.exports = {
    entry: './src/js/init.js',
    output: {
        path: __dirname + '/assets/js',
        filename: 'storekeeper' + '.js'
    },
    module: {
        preLoaders: [{
            test: /\.js$/,
            loader: 'jshint-loader',
            include: path.resolve(__dirname, 'src/js')
        }],
        loaders: [{
            test: /\.jsx?$/,
            loader: 'babel',
            exclude: [
                path.resolve(__dirname, 'node_modules'),
                path.resolve(__dirname, 'bower_components')
            ],
            query: {
                presets: ['es2015'],
                plugins: ['transform-runtime']
            }
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
            marionette: 'backbone.marionette',
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
    devtool: NODE_ENV === 'dev' ? 'cheap-inline-module-source-map' : null,
    watch: false
};

if (NODE_ENV === 'production') {
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            drop_console: true,
            unsafe: true
        }
    }));
}