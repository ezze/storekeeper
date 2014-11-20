define([], function() {
    'use strict';

    return {
        map: {
            '*': {
                jquery: 'no-conflict/jquery',
                bootstrap: 'no-conflict/bootstrap'
            },
            'no-conflict/jquery': {
                jquery: 'jquery'
            },
            'no-conflict/bootstrap': {
                bootstrap: 'bootstrap'
            }
        },
        paths: {
            bootstrap: '../lib/bootstrap/dist/js/bootstrap',
            easel: '../lib/easeljs/lib/easeljs-0.7.1.combined',
            jquery: '../lib/jquery/dist/jquery',
            lodash: '../lib/lodash/dist/lodash',
            tween: '../lib/TweenJS/lib/tweenjs-0.5.1.combined'
        },
        shim: {
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