import _ from 'underscore';
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

function getFileName(source) {
    return source instanceof File ? source.name : source.replace(/^.+(\/|\\)([^\/\\]+)$/, '$2');
}

let NavbarView = Marionette.ItemView.extend({
    template: require('../templates/navbar.mustache'),
    ui: {
        link: 'a',
        commandLink: '.navbar-command-link',
        level: '.navbar-level',
        boxesCount: '.navbar-boxes-count',
        pushesCount: '.navbar-pushes-count',
        movesCount: '.navbar-moves-count'
    },
    events: {
        'click @ui.link': 'onLinkClick',
        'click @ui.commandLink': 'onCommandLinkClick'
    },
    initialize(options) {
        this._app = options.app;

        this._levelSetSourceName = null;

        this.listenTo(this._app.vent, 'game:level:number', this.render);
        this.listenTo(this._app.vent, 'game:level:move:start', this.render);
        this.listenTo(this._app.vent, 'game:level:move:end', this.render);
        this.listenTo(this._app.vent, 'game:levelSet:load', (levelSet, source) => {
            this._levelSetSourceName = getFileName(source);
            this.render();
        });
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

        data.isFileApiSupported = File ? true : false;

        data.levelSetName = this._levelSetSourceName;
        data.levels = this._app.levels;
        _.each(data.levels, group => {
            _.each(group.levelSets, levelSet => {
                levelSet.active = getFileName(levelSet.url) === this._levelSetSourceName;
                if (levelSet.active) {
                    data.levelSetName = null;
                }
            });
        });

        return data;
    },
    onLinkClick(event) {
        let $link = $(event.currentTarget);

        if ($link.parent('li').hasClass('disabled')) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if ($link.siblings('.dropdown-menu').length === 0) {
            let $navbarCollapse = $(this).parents('.navbar-collapse');
            if ($navbarCollapse.hasClass('in')) {
                $navbarCollapse.collapse('hide');
            }
        }
    },
    onCommandLinkClick(event) {
        event.preventDefault();

        let $link = $(event.currentTarget),
            command = $link.attr('data-command');

        let $navbarCollapse = $link.parents('.navbar-collapse');
        if ($navbarCollapse.hasClass('in')) {
            $navbarCollapse.collapse('hide');
        }

        if ($link.attr('href') && $link.attr('href') !== '#') {
            this._app.commands.execute(command, $link.attr('href'));
        }
        else {
            this._app.commands.execute(command);
        }
    }
});

export default NavbarView;