requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        parallel: {
            'exports': 'Parallel'
        },
        easel: {
            exports: 'createjs'
        }
    },
    urlArgs: 'q=' + (new Date()).getTime()
});

require([
    'app/storekeeper'
], function(
    Storekeeper
) {
    "use strict";
    var storekeeper = new Storekeeper('.storekeeper-canvas', 'levels/classic.json');
});
