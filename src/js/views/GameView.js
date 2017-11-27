import _ from 'underscore';
import $ from 'jquery';
import Marionette from 'backbone.marionette';

import Game from '../Game';
import GameDirection from '../GameDirection';

import Direction from '../level/Direction';

//import BasicRenderer from '../level/render/basic-renderer';
import InvaderRenderer from '../level/render/InvaderRenderer';

import template from '../templates/game.mustache';

let GameView = Marionette.View.extend({
    className: 'game',
    template,
    ui: {
        field: '.game-field'
    },
    initialize(options) {
        this._app = options.app;
        this._game = null;

        _.bindAll(this, 'onKeyDown', 'onKeyUp', 'onTouchStart', 'onTouchEnd');
    },
    initializeListeners() {
        let app = this._app;

        this.listenTo(this._game, 'levelSet:load', (levelSet, source) => {
            this._app.channel.trigger('game:levelSet:load', levelSet, source);
        });

        this.listenTo(this._game, 'level:number', levelNumber => {
            app.channel.trigger('game:level:number', levelNumber);
        });

        this.listenTo(this._game, 'level:move:start', stats => {
            app.channel.trigger('game:level:move:start', stats);
        });

        this.listenTo(this._game, 'level:move:end', stats => {
            app.channel.trigger('game:level:move:end', stats);
        });

        this.listenTo(this._game, 'level:completed', () => {
            app.channel.trigger('game:level:completed');
            let levelNumber = this._game.levelSet.levelNumber;
            alert('Level ' + levelNumber + ' is completed!');
        });
    },
    removeListeners() {
        this.stopListening(this._game);
    },
    createGame() {
        this._game = new Game({
            app: this._app,
            renderer: new InvaderRenderer({
                container: this.ui.field.get(0)
            }),
            levelSet: 'levels/original.json'
        });

        this.initializeListeners();

        this.createCommands();
        this.createReqRes();
        this.enableControls();
    },
    destroyGame() {
        this.removeListeners();

        this.destroyCommands();
        this.destroyReqRes();
        this.disableControls();

        this._game.destroy();
    },
    createCommands() {
        let handlers = {
            browseLevelSet: () => {
                this.browseLevelSet();
            },
            loadLevelSet: source => {
                this._game.loadLevelSet(source);
            },
            previousLevel: () => {
                this._game.goToPreviousLevel();
            },
            nextLevel: () => {
                this._game.goToNextLevel();
            },
            restartLevel: () => {
                this._game.restartLevel();
            }
        };

        _.each(handlers, (handler, command) => {
            this._app.channel.reply('game:' + command, handler);
        });
    },
    executeCommand(command) {
        this._app.channel.execute('game:' + command);
    },
    destroyCommands() {
        _.each([
            'browseLevelSet',
            'loadLevelSet',
            'previousLevel',
            'nextLevel',
            'restartLevel'
        ], command => {
            this._app.channel.stopReplying('game:' + command);
        });
    },
    createReqRes() {
        let handlers = {
            levelSet: () => {
                return this._game.levelSet;
            },
            levelNumber: () => {
                return this._game.levelSet.levelNumber;
            },
            level: () => {
                return this._game.levelSet.level;
            }
        };

        _.each(handlers, (handler, reqres) => {
            this._app.channel.reply('game:' + reqres, handler);
        });
    },
    destroyReqRes() {
        _.each([
            'levelSet',
            'levelNumber',
            'level',
        ], reqres => {
            this._app.channel.stopReplying('game:' + reqres);
        });
    },
    enableControls() {
        $(window).on('keydown', this.onKeyDown);
        $(window).on('keyup', this.onKeyUp);
        $(window).on('touchstart', this.onTouchStart);
        $(window).on('touchend', this.onTouchEnd);

        this._game.direction = Direction.NONE;
    },
    disableControls() {
        this._game.direction = Direction.NONE;

        $(window).off('keydown', this.onKeyDown);
        $(window).off('keyup', this.onKeyUp);
        $(window).off('touchstart', this.onTouchStart);
        $(window).off('touchend', this.onTouchEnd);
    },
    browseLevelSet() {
        let $fileInput = $('<input />').attr('type', 'file').attr('accept', '.json,.sok');
        $fileInput.on('change', event => {
            if (event.target.files.length === 0) {
                return;
            }
            this._game.loadLevelSet(event.target.files[0]);
        });
        $fileInput.trigger('click');
    },
    onDomRefresh() {
        this.createGame();
    },
    onKeyDown(event) {
         if (event.ctrlKey && event.which === 79) {     // Ctrl + O
             event.preventDefault();     // preventing a browser from showing open file dialog
             //this.browseLevelSet();
             return;
         }

        if (event.altKey && event.which === 90) {       // Alt + Z
            this.executeCommand('previousLevel');
            return;
        }

        if (event.altKey && event.which === 88) {       // Alt + X
            this.executeCommand('nextLevel');
            return;
        }

        if (event.ctrlKey && event.altKey && event.which === 82) {      // Ctrl + Alt + R
            this.executeCommand('restartLevel');
            return;
        }

        let direction = GameDirection.byKeyCode(event.which);
        if (direction === Direction.NONE) {
            return;
        }
        this._game.direction = direction;
    },
    onKeyUp(event) {
        let direction = GameDirection.byKeyCode(event.which);
        if (direction === this._game.direction) {
            this._game.direction = Direction.NONE;
        }
    },
    onTouchStart(event) {
         if (!(event.target instanceof HTMLCanvasElement)) {
            return;
         }

         let canvas = event.target,
            $canvas = $(canvas);

         let originalEvent = event.originalEvent,
             touch = originalEvent.touches.item(0);

         let x = touch.clientX - $canvas.offset().left,
             y = touch.clientY - $canvas.offset().top;

         this._game.direction = GameDirection.byTouchPoint(canvas, x, y);
    },
    onTouchEnd(event) {
        this._game.direction = Direction.NONE;
    },
    onDestroy() {
        this.destroyGame();
    }
});

export default GameView;