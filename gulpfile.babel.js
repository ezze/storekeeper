'use strict';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import gulp from 'gulp';
import gutil from 'gulp-util';

import environments from 'gulp-environments';
import runSequence from 'run-sequence';
import clean from 'gulp-clean';
import less from 'gulp-less';
import cleanCss from 'gulp-clean-css';
import sourceMaps from 'gulp-sourcemaps';
import jasmine from 'gulp-jasmine';

let webpackConfig = Object.create(require('./webpack.config.babel.js').default),
    webpackCompiler = webpack(webpackConfig),
    development = environments.development();

gulp.task('clean', () => {
    return gulp.src('./assets', { read: false }).pipe(clean());
});

gulp.task('copy:fonts', () => {
    return gulp.src('./src/fonts/**/*').pipe(gulp.dest('./assets/fonts'));
});

gulp.task('copy:img', () => {
    return gulp.src('./src/img/**/*').pipe(gulp.dest('./assets/img'));
});

gulp.task('copy:levels', () => {
    return gulp.src('./src/levels/**/*').pipe(gulp.dest('./assets/levels'));
});

gulp.task('copy:favicon', () => {
    return gulp.src('./src/favicon/**/*').pipe(gulp.dest('./assets/favicon'));
});

gulp.task('copy', ['copy:fonts', 'copy:img', 'copy:levels', 'copy:favicon']);

gulp.task('css', () => {
    var stream = gulp.src('./src/less/storekeeper.less');

    if (development) {
        stream = stream.pipe(sourceMaps.init());
    }

    stream = stream.pipe(less({
        relativePaths: true
    }));

    if (development) {
        stream = stream.pipe(sourceMaps.write());
    }
    else {
        stream = stream.pipe(cleanCss());
    }

    return stream.pipe(gulp.dest('./assets/css'));
});

gulp.task('js', (callback) => {
    webpackCompiler.run(function(error, stats) {
        if (error) {
            throw new gutil.PluginError('js', error, {
                showStack: true
            });
        }
        gutil.log('[js]', stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('server', () => {
    new WebpackDevServer(webpackCompiler, {
        publicPath: webpackConfig.output.publicPath,
        compress: true,
        stats: {
            colors: true
        }
    }).listen(8080, 'localhost', function(error) {
        if (error) {
            throw new gutil.PluginError('server', error, {
                showStack: true
            });
        }
        gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });
});

gulp.task('build', ['copy', 'css', 'js']);
gulp.task('rebuild', (callback) => {
    runSequence('clean', 'build', callback);
});

gulp.task('dev', ['build'], () => {
    gulp.watch(['./index.js', './lib/**/*'], ['js']);
});

gulp.task('test', () => {
    gulp.src('./test/**/*.spec.js').pipe(jasmine({
        verbose: true
    }));
});

gulp.task('cordova:clean', () => {
    return gulp.src('./cordova/www', { read: false }).pipe(clean());
});

gulp.task('cordova:copy', ['build'], () => {
    return gulp.src(['./assets/**/*', './index.html'], { base: '.' }).pipe(gulp.dest('./cordova/www'));
});

gulp.task('cordova', (callback) => {
    runSequence('cordova:clean', 'cordova:copy', callback);
});

gulp.task('default', ['build']);