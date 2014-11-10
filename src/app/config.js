define([], function() {
    'use strict';

    return {
        paths: {
            easel: '../lib/easeljs/lib/easeljs-0.7.1.combined',
            jquery: '../lib/jquery/dist/jquery',
            lodash: '../lib/lodash/dist/lodash'
        },
        shim: {
            easel: {
                exports: 'createjs'
            }
        },
        urlArgs: 'q=' + (new Date()).getTime()
    };
});