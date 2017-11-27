import Bootstrap from 'bootstrap';

import Marionette from 'backbone.marionette';
import NavbarView from './NavbarView';

let ApplicationView = Marionette.View.extend({
    template: require('../templates/app.mustache'),
    regions: {
        header: '.header',
        content: '.content'
    },
    initialize(options) {
        this._app = options.app;
    },
    onBeforeShow() {
        this.getRegion('header').show(new NavbarView({
            app: this._app
        }));
    }
});

export default ApplicationView;