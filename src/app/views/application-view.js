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
            var app = this.getOption('app');
            this.getRegion('header').show(new HeaderView({
                app: app
            }));
        }
    });

    return ApplicationView;
});