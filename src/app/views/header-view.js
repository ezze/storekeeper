define([
    'marionette',
    'hgn!templates/header'
], function(
    Marionette,
    template
) {
    'use strict';

    var HeaderView = Marionette.LayoutView.extend({
        template: template
    });

    return HeaderView;
});