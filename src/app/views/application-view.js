define([
    'marionette',
    './navbar-view',
    'hgn!templates/application'
], function(
    Marionette,
    NavbarView,
    template
) {
    'use strict';

    var ApplicationView = Marionette.LayoutView.extend({
        template: template,
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

    return ApplicationView;
});