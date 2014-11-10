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
        var storekeeper = new Storekeeper('.game-field', 'levels/classic.json');
    });
});