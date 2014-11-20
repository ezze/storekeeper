require([
    './config'
], function(
    config
) {
    'use strict';

    require.config(config);

    require([
        'jquery',
        './storekeeper'
    ], function(
        $,
        Storekeeper
    ) {
        var container = document.querySelector('#game-field');
        var jqContainer = $(container);

        new Storekeeper({
            container: container,
            levelSetSource: 'levels/classic.json'
        });

        jqContainer.css('position', 'absolute');

        $(window).resize(function(event) {
            var top = ($(this).outerHeight() - jqContainer.outerHeight()) / 2;
            if (top < 0) {
                top = 0;
            }

            var left = ($(this).outerWidth() - jqContainer.outerWidth()) / 2;
            if (left < 0) {
                left = 0;
            }

            jqContainer.css('top', top).css('left', left);
        });

        $(document).ready(function() {
            $(window).trigger('resize');
        });
    });
});