define([
    'marionette'
], function(
    Marionette
) {
    'use strict';

    var ApplicationRouter = Marionette.AppRouter.extend({
        initialize: function(options) {
            options.appRoutes = {
                '': 'main'
            };
        }
    });

    return ApplicationRouter;
});