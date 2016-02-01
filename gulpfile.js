/*jslint node: true */
'use strict';

var gulp = require('gulp');
var args = require('yargs').argv ;
var browserSync = require('browser-sync');
var config = require('./gulp.config')();
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});
var port = process.env.PORT || config.defaultPort;

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);
gulp.task('vet', function () {
  log('Analyzing source with JSHint and JSCS');
  return gulp
    .src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('styles',['clean-styles'], function() {
  log('Compiling Less --> CSS');
  return gulp
    .src(config.less)
    .pipe($.plumber())
    .pipe($.less())
    
    .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
    .pipe(gulp.dest(config.temp));
});

gulp.task('fonts', ['clean-fonts'], function() {
  log('copying fonts');

  return gulp
    .src(config.fonts)
    .pipe(gulp.dest(config.build + 'fonts'))
});

gulp.task('images', ['clean-images'], function() {
  log('compressing images');
  return gulp
    .src(config.images)
    .pipe($.imagemin({optimizationLevel: 4}))
    .pipe(gulp.dest(config.build + 'images'));
});

gulp.task('clean', function() {
  var delconfig = [].concat(config.build, config.temp );
  log('Cleaning: ' + $.util.colors.blue(delconfig));
  del(delconfig);
});

gulp.task('clean-fonts', function() {
  var files = config.build + 'fonts/**/*.*';
  clean(files);
});

gulp.task('clean-images', function() {
  var files = config.build + 'images/**/*.*';
  clean(files);
});

gulp.task('clean-styles', function() {
  var files = config.temp + '**/*.css';
  clean(files);
});

gulp.task('less-watcher', function() {
  gulp.watch([config.less], function(event) {
    gulp.run('styles');
  });
});

gulp.task('wiredep', function() {
  log('wireup bower css js into the html');
  var options = config.getWiredepDefaultOptions();
  var wiredep = require('wiredep').stream;
  
  return gulp
    .src(config.index)
    .pipe(wiredep(options))
    .pipe(gulp.dest(config.client));
});

gulp.task('inject', function() {
  log('wireup the app centric css & js');
   
  return gulp
    .src(config.index)
    .pipe($.inject(gulp.src(config.js)))
    .pipe($.inject(gulp.src(config.css)))
    .pipe(gulp.dest(config.client));
});

gulp.task('serve-dev', ['inject'], function() {
  var isDev = true;

  var nodeOptions = {
    script: config.nodeServer,
    delayTime: 1,
    env: {
      'PORT': port,
      'NODE_ENV': isDev ? 'dev' : 'build'
    },
    watch: [config.server]
  }
  return $.nodemon(nodeOptions)
    .on('restart', function(ev) {
      log('** nodemon restarted');
      log('files changed on restart:\n' + ev);
      setTimeout(function() {
        browserSync.notify('reloading now ...');
        browserSync.reload({stream: false});
      }, config.browserReloadDelay);
      
    })
    .on('start', function() {
      log('*** nodemon started');
      startBrowserSync();
    })    
    .on('crash', function() {
      log('*** nodemon crashed, bitch!');
    })
    .on('exit', function() {
      log('*** nodemon exited cleanly!')
    });
});

/////
function startBrowserSync() {
  if(args.no-sync || browserSync.active) {
    return;
  }
  log('Starting up browserSync on port ' + port);
  
  var options = {
    proxy: 'localhost:' + port,
    port: 3000,
    files: [config.client + '**/*.*'],
    ghostMode: {
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp-patterns',
    notify: true,
    reloadDelay: 1000
  };


  browserSync(options);
}


function clean(path ) {
  log('Cleaning: ' + $.util.colors.blue(path));
  return del(path);
}

function log(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}