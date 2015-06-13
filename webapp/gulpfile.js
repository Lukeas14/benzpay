var gulp = require('gulp'),
	less = require('gulp-less'),
	concat = require('gulp-concat'),
	config = {
		buildDir: './public',
		lessMainFile: './style.less',
		lessPaths: [
			'./public',
			//'./bower_components/bootstrap/less'
		],
		lessFiles: './style.less',
		jsFiles: [
			'./node_modules/angular/angular.js',
			'./node_modules/angular-route/angular-route.js',
			'./node_modules/moment/moment.js',
			'./js/app.js'
		]
	};

gulp.task('css', function(){
	return gulp.src(config.lessMainFile)
		.pipe(less({
			paths: config.lessPaths
		}))
		.pipe(gulp.dest(config.buildDir));
});

gulp.task('js', function(){
	return gulp.src(config.jsFiles)
		.pipe(concat('script.js'))
		.pipe(gulp.dest(config.buildDir))
});

gulp.task('watch', function(){
	gulp.watch(config.jsFiles, ['js']);
	gulp.watch(config.lessFiles, ['css']);
});

gulp.task('default', ['css', 'js', 'watch']);//, 'js', 'watch']);
