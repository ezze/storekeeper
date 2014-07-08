define([
    'ring'
], function(
    Ring
) {
    "use strict";

    var Exception = Ring.create([Ring.Error], {
        name: 'StorekeeperException'
    });
    return Exception;
});