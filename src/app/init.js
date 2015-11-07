define([
    './require-config'
], function(
    requireConfig
) {
    'use strict';

    require.config(requireConfig);

    return function() {
        require([
            './application/application',
            './application/application-config'
        ], function (
            Application,
            appConfig
        ) {
            var app = new Application(appConfig);
            app.start();
        });
    };
});