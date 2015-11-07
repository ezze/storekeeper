define([
    'jquery',
    'lodash',
    'marionette',
    '../helpers/formatter',
    '../helpers/is-integer',
    'hgn!templates/navbar'
], function(
    $,
    _,
    Marionette,
    formatter,
    isInteger,
    template
) {
    'use strict';

    var NavbarView = Marionette.LayoutView.extend({
        template: template,
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
        initialize: function(options) {
            _.bindAll(this);

            var app = options.app,
                vent = app.vent,
                commands = app.commands;

            this.listenTo(vent, 'level-set-load', this.onLevelSetLoad);
            this.listenTo(vent, 'level-info-update', this.onLevelInfoUpdate);
            commands.setHandler('browse-level-set', this.browseLevelSet);
        },
        serializeData: function() {
            var data = NavbarView.__super__.serializeData.apply(this, arguments),
                app = this.getOption('app');

            data.isFileApiSupported = (window.File && window.FileList) ? true : false;
            data.levels = app.getOption('levels');

            return data;
        },
        browseLevelSet: function() {
            this.ui.levelSetFile.trigger('click');
        },
        onLinkClick: function(event) {
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
        onCommandLinkClick: function(event) {
            event.preventDefault();

            var $link = $(event.currentTarget),
                command = $link.attr('data-command'),
                app = this.getOption('app'),
                commands = app.commands;

            commands.execute(command, {
                link: $link.attr('href')
            });
        },
        onLevelSetFileChange: function(event) {
            var files = event.target.files;
            if (files.length === 0) {
                return;
            }

            var file = files[0],
                app = this.getOption('app'),
                commands = app.commands;

            commands.execute('load-level-set', {
                link: file
            });
        },
        onLevelSetLoad: function(source) {
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
        },
        onLevelInfoUpdate: function(info) {
            if (isInteger(info.levelNumber)) {
                this.ui.level.find('.name').text('Level');
                this.ui.level.find('.value').text(formatter.formatInteger(info.levelNumber, 3));
            }

            if (isInteger(info.boxesOnGoalCount) && isInteger(info.boxesCount)) {
                this.ui.boxesCount.find('.name').text('Boxes');
                this.ui.boxesCount.find('.value').text(
                    formatter.formatInteger(info.boxesOnGoalCount, 3) + '/' +
                    formatter.formatInteger(info.boxesCount, 3)
                );
            }

            if (isInteger(info.pushesCount)) {
                this.ui.pushesCount.find('.name').text('Pushes');
                this.ui.pushesCount.find('.value').text(formatter.formatInteger(info.pushesCount, 5));
            }

            if (isInteger(info.movesCount)) {
                this.ui.movesCount.find('.name').text('Moves');
                this.ui.movesCount.find('.value').text(formatter.formatInteger(info.movesCount, 5));
            }
        }
    });

    return NavbarView;
});