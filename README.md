# Storekeeper

[![Build Status](https://travis-ci.org/ezze/storekeeper.svg?branch=master)](https://travis-ci.org/ezze/storekeeper)

This is JavaScript implementation of Sokoban game.

## Building

1. Install [Node.js](https://nodejs.org/) and [NPM](http://npmjs.com/). [NMV](https://github.com/creationix/nvm) is
a preferable way to go.

2. Install [Gulp command line interface](http://gulpjs.com/) and [Webpack](https://webpack.github.io/) globally:

        npm install -g gulp-cli webpack

3. Install development packages from repository's root directory:

        npm install

4. Build the project:

        npm run build

    By default project is built for `development` environment. In order to build for `production` environment run
the following command:

        NODE_ENV=production npm run build
               
## Building for Android

In order to build the game for Android follow these steps:

1. Install [Apache Cordova](https://cordova.apache.org/) globally:

        npm install -g cordova

2. Install [Android SDK](https://developer.android.com/studio/index.html). 
        
3. Add Android platform to Cordova:

        cd ./cordova
        cordova platform add android
        
4. Set up `ANDROID_HOME` path (put these lines at the end of `~/.bashrc` to apply constantly):

        export ANDROID_HOME=/home/ezze/Android/Sdk
        export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

5. Install required versions of SDK, platform tools and build tools:

        android sdk

    or
     
        android list sdk --all
        android sdk -u -a -t <package-no>             

6. Prepare application files in `cordova/www` directory:

        gulp cordova

7. Build APK:

        cd ./cordova
        cordova build android
                       
## Gulp tasks

The following Gulp tasks are available:

- `build` (by default) — builds everything including CSS, JS, fonts, images, levels and favicons in `assets` directory;
- `rebuild` — rebuilds everything in `assets` directory;
- `copy` — copies fonts to `assets/fonts` directory, images to `assets/img` directory, levels to `assets/levels`
directory and favicons to `assets/favicon` directory;
- `css` — compiles [LESS](http://lesscss.org/) in `assets/css` directory;
- `js` — [hints](http://jshint.com/) and builds JavaScript in `assets/js` directory;
- `clean` — removes everything in `assets` directory;
- `dev` — builds everything and watches for changes in source files to rebuild;
- `server` — starts [Webpack Dev Server](https://webpack.github.io/docs/webpack-dev-server.html) at `http://localhost:8080`;
- `test` — test JavaScript code with [Jasmine](http://jasmine.github.io/);
- `cordova` — prepares Cordova application in `cordova/www` directory.

## Contributing

Before making a pull request, please, be sure that your changes are rebased to `dev` branch.

Special thanks to [arkhemlol](https://github.com/arkhemlol) for contributing.