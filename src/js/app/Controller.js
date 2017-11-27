import Marionette from 'backbone.marionette';

import AppView from '../views/AppView';
import GameView from '../views/GameView';

const Controller = Marionette.Object.extend({
    initialize(options) {
        const {app} = options;

        this._appView = new AppView({
            app
        });
        this._gameView = new GameView({
            app
        });

        app.showView(this._appView);
    },
    game() {
        this._appView.getRegion('content').show(this._gameView);
    },
    editor() {
        alert('Editor is not implemented yet!');
    }
});

export default Controller;