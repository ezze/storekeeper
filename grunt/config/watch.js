/* global module:false */

module.exports = function(grunt) {
    'use strict';

    return {
        src: {
            files: [
                '**/*.html',
                'src/app/**/*.js',
                'src/app/**/*.tpl',
                'src/lib/**/*.js'
            ],
            tasks: ['default'],
            options: {
                spawn: false
            }
        }
    };
};