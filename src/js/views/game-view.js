'use strict';

import _ from 'underscore';
import $ from 'jquery';
import Marionette from 'backbone.marionette';

import Game from '../game';
import GameDirection from '../game-direction';

import Direction from '../level/direction';

//import BasicRenderer from '../level/render/basic-renderer';
import InvaderRenderer from '../level/render/invader-renderer';

let GameView = Marionette.ItemView.extend({
    className: 'game',
    template: require('../templates/game.mustache'),
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

        this.listenTo(this._game, 'level:number', levelNumber => {
            app.vent.trigger('game:level:number', levelNumber);
        });

        this.listenTo(this._game, 'level:move:start', stats => {
            app.vent.trigger('game:level:move:start', stats);
        });

        this.listenTo(this._game, 'level:move:end', stats => {
            app.vent.trigger('game:level:move:end', stats);
        });

        this.listenTo(this._game, 'level:completed', () => {
            app.vent.trigger('game:level:completed');
            alert('level completed');
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
            })
        });

        this.initializeListeners();

        this.createCommands();
        this.createReqRes();
        this.enableControls();

        this._app.vent.trigger('game:level:number', this._game.levelSet.levelNumber);
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
            this._app.commands.setHandler('game:' + command, handler);
        });
    },
    executeCommand(command) {
        this._app.commands.execute('game:' + command);
    },
    destroyCommands() {
        _.each([
            'previousLevel',
            'nextLevel',
            'restartLevel'
        ], command => {
            this._app.commands.removeHandler('game:' + command);
        });
    },
    createReqRes() {
        let handlers = {
            levelNumber: () => {
                return this._game.levelSet.levelNumber;
            },
            level: () => {
                return this._game.levelSet.level;
            }
        };

        _.each(handlers, (handler, reqres) => {
            this._app.reqres.setHandler('game:' + reqres, handler);
        });
    },
    destroyReqRes() {
        _.each([
            'levelNumber',
            'level'
        ], reqres => {
            this._app.reqres.removeHandler('game:' + reqres);
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
    onShow() {
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
        /*
         if (!(event.target instanceof HTMLCanvasElement)) {
         return;
         }

         var canvas = event.target;
         var $canvas = $(canvas);

         var originalEvent = event.originalEvent;
         var touch = originalEvent.touches.item(0);

         var touchCanvasX = touch.clientX - $canvas.offset().left;
         var touchCanvasY = touch.clientY - $canvas.offset().top;

         this._direction = GameDirection.byTouchPoint(canvas, touchCanvasX, touchCanvasY);
         */
    },
    onTouchEnd(event) {
        //this._direction = Direction.NONE;
    },
    onDestroy() {
        this.destroyGame();
    }
});

export default GameView;