define([], function() {
    'use strict';

    return {
        baseUrl: './app',
        waitSeconds: 60,
        map: {
            '*': {
                underscore: 'lodash'          // replacing Underscore with Lo-Dash
            }
        },
        paths: {
            bootstrap: '../lib/bootstrap/dist/js/bootstrap',
            easel: '../lib/easeljs/lib/easeljs-0.8.1.combined',
            jquery: '../lib/jquery/dist/jquery',
            lodash: '../lib/lodash/lodash',
            marionette: '../lib/marionette/lib/backbone.marionette',
            mustache: '../lib/mustache.js/mustache',
            tween: '../lib/TweenJS/lib/tweenjs-0.6.1.combined'
        },
        shim: {
            bootstrap: {
                deps: ['jquery']
            },
            easel: {
                exports: 'createjs'
            },
            marionette: {
                deps: ['jquery', 'underscore', 'backbone'],
                exports: 'Marionette'
            },
            tween: {
                exports: 'createjs'
            }
        },
        urlArgs: 'q=' + (new Date()).getTime()
    };
});