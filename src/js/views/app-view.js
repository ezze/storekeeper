'use strict';

/* jshint ignore:start */
import Bootstrap from 'bootstrap';
/* jshint ignore:end */

import Marionette from 'backbone.marionette';
import NavbarView from './navbar-view';

let ApplicationView = Marionette.LayoutView.extend({
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