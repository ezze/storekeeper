'use strict';

var gulp = require('gulp'),
    webpack = require('webpack-stream'),
    environments = require('gulp-environments'),
    development = environments.development(),
    clean = require('gulp-clean'),
    less = require('gulp-less'),
    cleanCss = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('clean', function() {
    return gulp.src('./assets/*', { read: false })
        .pipe(clean());
});

gulp.task('copy', function() {
    return gulp.src('./src/fonts/*')
        .pipe(gulp.dest('./assets/fonts'));
});

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

gulp.task('js', function() {
    var config = require('./webpack.config.js');
    return gulp.src('./src/init.js')
        .pipe(webpack(config))
        .pipe(gulp.dest('assets/js'));
});

gulp.task('build', ['copy', 'css', 'js']);

gulp.task('default', ['build']);