import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import Router from './Router';

const Application = Marionette.Application.extend({
    region: '#application',
    onBeforeStart() {
        this.channel = new Radio.Channel();

        new Router({
            app: this
        });
    },
    onStart() {
        Backbone.history.start();
    }
});

export default Application;
