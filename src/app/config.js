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