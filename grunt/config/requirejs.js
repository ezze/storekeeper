/* global module: false */

module.exports = function(grunt) {
    'use strict';

    // Retrieving RequireJS config to use paths parameters for r.js optimizer
    var configString = grunt.file.read('src/app/config.js');
    var configRegExp = /return (\{[\s\S]*\});/i;
    var configMatch = configString.match(configRegExp);
    if (configMatch === null) {
        throw new Error('Unable to retrieve RequireJS config object.');
    }
    configString = configMatch[1];

    var config;
    /* jshint ignore:start */
    config = eval('(' + configString + ')');
    /* jshint ignore:end */

    var pluginConfig = {};
    ['combined', 'min'].forEach(function(item) {
        pluginConfig[item] = {
            options: {
                almond: true,
                baseUrl: 'src/app',
                include: ['app'],
                out: 'assets/js/storekeeper.' + item + '.js',
                optimize: item === 'combined' ? 'none' : 'uglify2',
                preserveLicenseComments: false,
                generateSourceMaps: item === 'min',
                findNestedDependencies: true,
                map: config.map,
                paths: config.paths,
                shim: config.shim,
                tpl: config.tpl,
                stubModules: [
                    'text',
                    'tpl',
                    'underscore'
                ]
            }
        };
    });
    return pluginConfig;
};