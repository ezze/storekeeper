'use strict';

import $ from 'jquery';
import Marionette from 'backbone.marionette';

import formatter from '../helpers/formatter';

function formatLevelNumber(levelNumber) {
    return formatter.formatInteger(levelNumber, 3);
}

function formatBoxesCount(boxesOverGoalsCount, boxesCount) {
    return formatter.formatInteger(boxesOverGoalsCount, 3) + '/' +
        formatter.formatInteger(boxesCount, 3);
}

function formatPushesCount(pushesCount) {
    return formatter.formatInteger(pushesCount, 5);
}

function formatMovesCount(movesCount) {
    return formatter.formatInteger(movesCount, 5);
}

let NavbarView = Marionette.ItemView.extend({
    template: require('../templates/navbar.mustache'),
    ui: {
        link: 'a',
        commandLink: '.navbar-command-link',
        levelSetFile: '.navbar-level-set-file',
        level: '.navbar-level',
        boxesCount: '.navbar-boxes-count',
        pushesCount: '.navbar-pushes-count',
        movesCount: '.navbar-moves-count'
    },
    events: {
        'click @ui.link': 'onLinkClick',
        'click @ui.commandLink': 'onCommandLinkClick',
        'change @ui.levelSetFile': 'onLevelSetFileChange'
    },
    initialize(options) {
        this._app = options.app;

        this.listenTo(this._app.vent, 'game:level:number', this.render);
        this.listenTo(this._app.vent, 'game:level:move:start', this.render);
        this.listenTo(this._app.vent, 'game:level:move:end', this.render);

        this.listenTo(this._app.vent, 'level-set-load', this.onLevelSetLoad);
        this._app.commands.setHandler('browse-level-set', this.browseLevelSet);
    },
    serializeData() {
        let data = NavbarView.__super__.serializeData.apply(this, arguments);

        let levelNumber = this._app.reqres.request('game:levelNumber');
        if (levelNumber) {
            data.levelNumber = formatLevelNumber(levelNumber);
        }

        let level = this._app.reqres.request('game:level');
        if (level) {
            data.boxesCount = formatBoxesCount(level.boxesOverGoalsCount, level.boxesCount);
            data.pushesCount = formatPushesCount(level.pushesCount);
            data.movesCount = formatMovesCount(level.movesCount);
        }

        data.isFileApiSupported = (window.File && window.FileList) ? true : false;
        data.levels = this._app.getOption('levels');

        return data;
    },
    browseLevelSet() {
        this.ui.levelSetFile.trigger('click');
    },
    onLinkClick(event) {
        var $link = $(event.currentTarget);

        if ($link.parent('li').hasClass('disabled')) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if ($link.siblings('.dropdown-menu').length === 0) {
            var $navbarCollapse = $(this).parents('.navbar-collapse');
            if ($navbarCollapse.hasClass('in')) {
                $navbarCollapse.collapse('hide');
            }
        }
    },
    onCommandLinkClick(event) {
        event.preventDefault();

        var $link = $(event.currentTarget),
            command = $link.attr('data-command');

        var $navbarCollapse = $link.parents('.navbar-collapse');
        if ($navbarCollapse.hasClass('in')) {
            $navbarCollapse.collapse('hide');
        }

        this._app.commands.execute(command, {
            link: $link.attr('href')
        });
    },
    onLevelSetFileChange(event) {
        var files = event.target.files;
        if (files.length === 0) {
            return;
        }

        var file = files[0];

        this._app.commands.execute('load-level-set', {
            link: file
        });
    },
    onLevelSetLoad(source) {
        var $levelSetLinks = this.ui.commandLink.filter('[data-command="load-level-set"]');

        $levelSetLinks.each(function() {
            if ($(this).attr('href') === source) {
                $(this).parent('li').addClass('active');
            }
            else {
                $(this).parent('li').removeClass('active');
            }
        });

        var $browseLevelSetItem = this.ui.link.filter('[data-command="browse-level-set"]').parent('li'),
            $localLevelSetItem = this.$el.find('.navbar-local-level-set');

        if (window.File && source instanceof window.File) {
            var levelSetName = source.name;

            if ($localLevelSetItem.length === 0) {
                $localLevelSetItem = $('<li></li>')
                    .addClass('navbar-local-level-set')
                    .addClass('active')
                    .append($('<a></a>')
                        .text(levelSetName)
                    );

                $browseLevelSetItem.after($localLevelSetItem);
                $browseLevelSetItem.after($('<li></li>')
                    .addClass('divider')
                );
            }
            else {
                $localLevelSetItem.children('a').text(levelSetName);
            }
        }
        else {
            $localLevelSetItem.prev('li').remove();
            $localLevelSetItem.remove();
        }
    }
});

export default NavbarView;