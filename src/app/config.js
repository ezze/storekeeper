define([], function() {
    'use strict';

    return {
        paths: {
            bootstrap: '../lib/bootstrap/dist/js/bootstrap',
            easel: '../lib/easeljs/lib/easeljs-0.8.1.combined',
            jquery: '../lib/jquery/dist/jquery',
            lodash: '../lib/lodash/dist/lodash',
            tween: '../lib/TweenJS/lib/tweenjs-0.6.1.combined'
        },
        shim: {
            bootstrap: {
                deps: ['jquery']
            },
            easel: {
                exports: 'createjs'
            },
            tween: {
                exports: 'createjs'
            }
        },
        urlArgs: 'q=' + (new Date()).getTime()
    };
});