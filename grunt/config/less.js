/* global module: false, require: false  */
module.exports = function() {
    'use strict';

    var _ = require('lodash'),
        config = {
            options: {
                strictImports: true,
                relativeUrls: true
            }
        };

    _.each(['combined', 'minified'], function(version) {
        config[version] = {
            options: {
                compress: version === 'minified'
            },
            files: [{
                expand: true,
                cwd: 'src/less',
                src: ['storekeeper.less'],
                dest: 'assets/css',
                ext: (version === 'minified' ? '.min' : '') + '.css'
            }]
        };
    });

    return config;
};