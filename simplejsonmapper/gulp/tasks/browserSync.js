var browserSync = require('browser-sync');
var gulp        = require('gulp');
var config      = require('../config').browserSync;

gulp.task('browserSync', ['build'], function() {
	// This is for run on Cloud9
    /*browserSync.init({
        proxy: '0.0.0.0:3000',   // rails server
        port: 8080               // cloud9 proxied port to 80
    })*/
    
    browserSync(config);
});
