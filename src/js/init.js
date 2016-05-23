'use strict';

import $ from 'jquery';

import Application from './application/application';
import appConfig from './application/application-config';

$(function() {
    var app = new Application(appConfig);
    app.start();
});