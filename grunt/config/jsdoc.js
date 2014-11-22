/* global module:false */

module.exports = function() {
    'use strict';

    return {
        reference: {
            src: [
                'src/app/**/*.js',
                'README.md'
            ],
            options: {
                destination: 'refdoc',
                template: 'src/jsdoc-template'
            }
        }
    };
};