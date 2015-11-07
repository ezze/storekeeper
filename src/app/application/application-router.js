define([
    'marionette'
], function(
    Marionette
) {
    'use strict';

    var ApplicationRouter = Marionette.AppRouter.extend({
        initialize: function(options) {
            options.appRoutes = {
                '': 'game',
                'game': 'game',
                'editor': 'editor'
            };
        }
    });

    return ApplicationRouter;
});