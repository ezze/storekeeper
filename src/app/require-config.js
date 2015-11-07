define([], function() {
    'use strict';

    return {
        baseUrl: './src/app',
        waitSeconds: 60,
        map: {
            '*': {
                underscore: 'lodash'          // replacing Underscore with Lo-Dash
            }
        },
        paths: {
            backbone: '../lib/backbone/backbone',
            'backbone.babysitter': '../lib/backbone.babysitter/lib/backbone.babysitter',
            'backbone.wreqr': '../lib/backbone.wreqr/lib/backbone.wreqr',
            bootstrap: '../lib/bootstrap/dist/js/bootstrap',
            easel: '../lib/easeljs/lib/easeljs-0.8.1.combined',
            hgn: '../lib/requirejs-hogan-plugin/hgn',
            hogan: '../lib/requirejs-hogan-plugin/hogan',
            jquery: '../lib/jquery/dist/jquery',
            lodash: '../lib/lodash/lodash',
            marionette: '../lib/marionette/lib/backbone.marionette',
            mustache: '../lib/mustache.js/mustache',
            text: '../lib/text/text',
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