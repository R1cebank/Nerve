module.exports = (gulp, config) ->

  gulp.task 'default', ['server', 'client']

  gulp.task 'server', ['server:scripts', 'server:config']

  gulp.task 'watch', ['server:watch']
