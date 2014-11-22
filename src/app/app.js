require([
    './config'
], function(
    config
) {
    'use strict';

    require.config(config);

    require([
        './storekeeper'
    ], function(
        Storekeeper
    ) {
        new Storekeeper({
            container: document.querySelector('#game-field'),
            levelSetSource: 'levels/classic.json'
        });
    });
});