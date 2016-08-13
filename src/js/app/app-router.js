import Marionette from 'backbone.marionette';

var ApplicationRouter = Marionette.AppRouter.extend({
    initialize(options) {
        options.appRoutes = {
            '': 'game',
            'game': 'game',
            'editor': 'editor'
        };
    }
});

export default ApplicationRouter;