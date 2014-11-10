/* global module:false */

module.exports = function(grunt) {
    'use strict';

    return {
        options: {
            jshintrc: '.jshintrc'
        },
        gruntfile: {
            files: {
                src: [
                    'Gruntfile.js',
                    'grunt/**/*.js'
                ]
            }
        },
        game: {
            files: {
                src: [
                    'src/app/**/*.js'
                ]
            }
        }
    };
};