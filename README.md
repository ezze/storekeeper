# Storekeeper

[![Build Status](https://travis-ci.org/ezze/storekeeper.svg?branch=dev)](https://travis-ci.org/ezze/storekeeper)

This is JavaScript implementation of Sokoban game.

## Building

1. Install [Node.js](https://nodejs.org/) and [NPM](http://npmjs.com/):

    - Ubuntu:

            sudo apt-get install nodejs npm

2. Install [Gulp command line interface](http://gulpjs.com/) and [Webpack](https://webpack.github.io/) globally:

        npm install -g gulp-cli webpack

3. Install [Bower](http://bower.io/) globally:

        npm install -g bower

4. Install development packages from repository's root directory:

        npm install

5. Install web libraries from repository's root directory:

        bower install

6. Build the project:

        npm run build

    By default project is built for `development` environment. In order to build for `production` environment run
the following command:

        NODE_ENV=production npm run build       
        
## Gulp tasks

The following Gulp tasks are available:

- `build` (by default) — builds everything including CSS, JS and fonts in `assets` directory;
- `copy` — copies fonts to `assets/fonts` directory;
- `css` — compiles [LESS](http://lesscss.org/) in `assets/css` directory;
- `js` — [hints](http://jshint.com/) and builds JavaScript in `assets/js` directory;
- `clean` — removes everything in `assets` directory;
- `dev` — builds everything and watches for changes in JavaScript to rebuild;
- `server` — starts [Webpack Dev Server](https://webpack.github.io/docs/webpack-dev-server.html) at `http://localhost:8080`.

## Contributing

Before making a pull request, please, be sure that your changes are rebased to `dev` branch.

Special thanks to [arkhemlol](https://github.com/arkhemlol) for contributing.
