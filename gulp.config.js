module.exports = function() {
  var client = './src/client/';
  var clientApp = client + 'app/';
  var temp = './.tmp/'
  var server = './src/server';
  var config = {

    //all js to vet
    alljs: [
      './src/**/*.js',
      './*.js'
    ],
    client: client, 
    index: client + 'index.html',
    js: [
      clientApp + '**/*.module.js',
       clientApp + '**/*.js',
      '!' + clientApp + '**/*.spec.js'
    ],
    css: temp + 'styles.css',
    less: client + 'styles/styles.less',
    server: server,
    temp: temp,    
    bower: {
      json: require('./bower.json'),
      directory: './bower_components/',
      ignorePath: '../..'
    },
    defaultPort: 7203,
    nodeServer: './src/server/app.js'
  };
  config.getWiredepDefaultOptions = function() {
    options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };
    return options; 
  };

  return config;
};