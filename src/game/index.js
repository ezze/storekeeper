import $ from 'jquery';

import App from './app/Application';
import appConfig from './app/config';

import '../less/storekeeper.less';

$(function() {
  const app = new App(appConfig);
  app.start();
});
