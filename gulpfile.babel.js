'use strict';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import gulp from 'gulp';
import gutil from 'gulp-util';
import watch from 'gulp-watch';
import batch from 'gulp-batch';
import environments from 'gulp-environments';
import runSequence from 'run-sequence';
import clean from 'gulp-clean';
import less from 'gulp-less';
import cleanCss from 'gulp-clean-css';
import sourceMaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
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
    let stream = gulp.src('./src/less/storekeeper.less'),
        l = less({
            relativePaths: true
        });

    l.on('error', function(e) {
        gutil.log(e);
        stream.end();
    });

    if (development) {
        stream = stream.pipe(sourceMaps.init());
    }

    stream = stream.pipe(l).pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
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
    watch([
        'src/js/**/*.js',
        'src/js/**/*.json',
        'src/js/**/*.mustache',
        'src/levels/**/*.json'
    ], batch(function(events, callback) {
        gulp.start('js', callback);
    }));

    watch([
        'src/less/**/*.less'
    ], batch((events, callback) => {
        gulp.start('css', callback);
    }));

    watch([
        'src/fonts/**/*.*'
    ], batch((events, callback) => {
        gulp.start('copy:fonts', callback);
    }));

    watch([
        'src/img/**/*.*'
    ], batch((events, callback) => {
        gulp.start('copy:img', callback);
    }));

    watch([
        'src/levels/**/*.*'
    ], batch((events, callback) => {
        gulp.start('copy:levels', callback);
    }));

    watch([
        'src/favicon/**/*.*'
    ], batch((events, callback) => {
        gulp.start('copy:favicon', callback);
    }));
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