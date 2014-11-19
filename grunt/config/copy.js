/* global module:false */

module.exports = function(grunt) {
    'use strict';

    // TODO: uncomment since grunt 0.4.6
    //var crypto = require('crypto');
    var encoding = null;

    function processFile(srcContent, srcPath, destPath) {
        // TODO: uncomment since grunt 0.4.6
        /*
        var srcCheckSum = crypto.createHash('sha1').update(srcContent).digest('hex');
        var destCheckSum = null;
        if (grunt.file.exists(destPath)) {
            destCheckSum = crypto.createHash('sha1').update(grunt.file.read(destPath, {
                encoding: encoding
            })).digest('hex');
        }
        return srcCheckSum === destCheckSum ? false : srcContent;
        */
        return true;
    }

    return {
        fonts: {
            files: [{
                expand: true,
                cwd: 'src/fonts',
                src: ['*'],
                dest: 'assets/fonts'
            }]
        },
        options: {
            encoding: encoding,
            process: processFile
        }
    };
};