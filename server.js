const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');

const port = process.env.PORT || 55577;

const app = new Koa();
app.use(serve(path.resolve(__dirname, 'dist')));
app.on('error', error => console.error(error instanceof Error ? error.stack : error));
if (!module.parent) {
  app.listen(port);
}
else {
  module.exports = app;
}
