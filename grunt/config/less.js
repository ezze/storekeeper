/* global module:false */

module.exports = function() {
    'use strict';

    return {
        min: {
            options: {
                compress: true,
                cleancss: true,
                strictImports: true
            },
            files: [{
                expand: true,
                cwd: 'src/less',
                src: [
                    'storekeeper.less'
                ],
                dest: 'assets/css',
                ext: '.min.css'
            }]
        }
    };
};