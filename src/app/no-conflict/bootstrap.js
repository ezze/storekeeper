define([
    'require',
    'jquery'
], function(
    require,
    $
) {
    'use strict';

    var jQueryStored = window.jQuery;
    var $stored = window.$;

    window.jQuery = $;
    window.$ = $;

    require(['bootstrap'], function() {
        window.jQuery = jQueryStored;
        window.$ = $stored;
    });
});