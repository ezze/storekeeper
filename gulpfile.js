'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    environments = require('gulp-environments'),
    development = environments.development(),
    clean = require('gulp-clean'),
    less = require('gulp-less'),
    cleanCss = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('clean', function() {
    return gulp.src('./assets/**/*', { read: false })
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

gulp.task('copy', ['copy:fonts', 'copy:img', 'copy:levels']);

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

var webpackConfig = Object.create(require('./webpack.config.js')),
    webpackCompiler = webpack(webpackConfig);

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
        publicPath: '/' + webpackConfig.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(8080, 'localhost', function(error) {
        if (error) {
            throw new gutil.PluginError('server', error);
        }
        gutil.log('[server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });
});

gulp.task('build', ['copy', 'css', 'js']);

gulp.task('dev', ['build'], function() {
    gulp.watch(['src/js/**/*'], ['js']);
});

gulp.task('default', ['build']);