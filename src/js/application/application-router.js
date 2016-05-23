import Marionette from 'backbone.marionette';

var ApplicationRouter = Marionette.AppRouter.extend({
    initialize: function(options) {
        options.appRoutes = {
            '': 'game',
            'game': 'game',
            'editor': 'editor'
        };
    }
});

module.exports = ApplicationRouter;