define([
    'marionette',
    './header-view',
    'hgn!templates/application'
], function(
    Marionette,
    HeaderView,
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
                headerView = new HeaderView({
                    app: app
                });

            app.addView(headerView, 'header');
            this.getRegion('header').show(headerView);
        }
    });

    return ApplicationView;
});