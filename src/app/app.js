require([
    './config'
], function(
    config
) {
    'use strict';

    require.config(config);

    require([
        'jquery',
        './storekeeper'
    ], function(
        $,
        Storekeeper
    ) {
        var container = document.querySelector('#game-field');

        new Storekeeper({
            container: container,
            levelSetSource: 'levels/classic.json'
        });
    });
});