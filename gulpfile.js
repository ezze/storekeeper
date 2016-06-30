'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    environments = require('gulp-environments'),
    development = environments.development(),
    runSequence = require('run-sequence'),
    clean = require('gulp-clean'),
    less = require('gulp-less'),
    cleanCss = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('clean', function() {
    return gulp.src('./assets', { read: false })
        .pipe(clean());
});

gulp.task('copy:fonts', function() {
    return gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./assets/fonts'));
});

gulp.task('copy:img', function() {
    return gulp.src('./src/img/**/*')
        .pipe(gulp.dest('./assets/img'));
});

gulp.task('copy:levels', function() {
    return gulp.src('./src/levels/**/*')
        .pipe(gulp.dest('./assets/levels'));
});

gulp.task('copy:favicon', function() {
    return gulp.src('./src/favicon/**/*')
        .pipe(gulp.dest('./assets/favicon'));
});

gulp.task('copy', ['copy:fonts', 'copy:img', 'copy:levels', 'copy:favicon']);

gulp.task('css', function() {
    var stream = gulp.src('./src/less/storekeeper.less');

    if (development) {
        stream = stream.pipe(sourcemaps.init());
    }

    stream = stream.pipe(less({
        relativePaths: true
    }));

    if (development) {
        stream = stream.pipe(sourcemaps.write());
    }
    else {
        stream = stream.pipe(cleanCss());
    }

    return stream.pipe(gulp.dest('./assets/css'));
});

var webpackConfig = Object.create(require('./webpack.config.js'));

var webpackCompiler = webpack(webpackConfig);

gulp.task('js', function(callback) {
    webpackCompiler.run(function(error, stats) {
        if (error) {
            throw new gutil.PluginError('js', error);
        }
        gutil.log('[js]', stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('server', function() {
    console.log(webpackConfig.output.publicPath);
    new WebpackDevServer(webpackCompiler, {
        publicPath: webpackConfig.output.publicPath,
        compress: true,
        stats: {
            colors: true
        }
    }).listen(8080, 'localhost', function(error) {
        if (error) {
            throw new gutil.PluginError('server', error);
        }
        gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });
});

gulp.task('build', ['copy', 'css', 'js']);
gulp.task('rebuild', function(callback) {
    runSequence('clean', 'build', callback);
});

gulp.task('dev', ['build'], function() {
    gulp.watch(['./index.js', './lib/**/*'], ['js']);
});

gulp.task('cordova:clean', function() {
    return gulp.src('./cordova/www', { read: false })
        .pipe(clean());
});

gulp.task('cordova:copy', ['build'], function() {
    return gulp.src(['./assets/**/*', './index.html'], { base: '.' })
        .pipe(gulp.dest('./cordova/www'));
});

gulp.task('cordova', function(callback) {
    runSequence('cordova:clean', 'cordova:copy', callback);
});

gulp.task('default', ['build']);