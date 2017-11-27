import Marionette from 'backbone.marionette';

import Controller from './Controller';

const Router = Marionette.AppRouter.extend({
    controller: Controller,
    appRoutes: {
        '': 'game',
        'game': 'game',
        'editor': 'editor'
    },
    initialize() {
        this.controller = new Controller({
            app: this.getOption('app')
        });
    }
});

export default Router;
