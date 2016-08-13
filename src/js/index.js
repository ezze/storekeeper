import $ from 'jquery';

import App from './app/app';
import appConfig from './app/app-config';

$(function() {
    var app = new App(appConfig);
    app.start();
});