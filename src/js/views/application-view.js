'use strict';

import Marionette from 'backbone.marionette';
import NavbarView from './navbar-view';

var ApplicationView = Marionette.LayoutView.extend({
    template: require('../templates/application.mustache'),
    regions: {
        header: '.header',
        content: '.content'
    },
    onBeforeShow: function() {
        var app = this.getOption('app'),
            navbarView = new NavbarView({
                app: app
            });

        app.addView(navbarView, 'navbar');
        this.getRegion('header').show(navbarView);
    }
});

module.exports = ApplicationView;