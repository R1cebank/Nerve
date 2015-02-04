gulp = require 'gulp'
shell = require 'gulp-shell'
watch = require 'gulp-watch'
coffee = require 'gulp-coffee'
uglify = require 'gulp-uglify'
notify = require 'gulp-notify'
plumber = require 'gulp-plumber'
sourcemaps = require 'gulp-sourcemaps'
jshint = require 'gulp-jshint'
stylish =  require 'jshint-stylish'

gulp.task 'watch', ->
  gulp.src 'js/**.coffee'
    .pipe watch 'js/**.coffee', verbose: false, ->
      gulp.start 'build-coffee'
  gulp.src 'test/**.coffee'
    .pipe watch 'test/**.coffee', verbose: false, ->
      gulp.start 'build-test'

gulp.task 'build-test', ->
  gulp.src 'test/**.coffee'
  .pipe plumber()
  .pipe sourcemaps.init()
  .pipe coffee()
  #.pipe uglify()
  .pipe sourcemaps.write()
  .pipe gulp.dest './test'


gulp.task 'lint', ->
  return gulp.src 'js/**.js'
    .pipe jshint()
    .pipe jshint.reporter stylish

gulp.task 'build-coffee', ->
  gulp.src 'js/**.coffee'
  .pipe plumber()
  .pipe sourcemaps.init()
  .pipe coffee()
  #.pipe uglify()
  .pipe sourcemaps.write()
  .pipe gulp.dest './js'
