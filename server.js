#!/usr/bin/env node

/*jshint node:true*/

var appname = 'npi'; // .npirc
var rc = require('rc');
var rcfile = '.' + appname + 'rc';
var program = require('commander');
var http = require('http');
var url = require('url');
var fs = require('fs');
var glob = require('glob');
var connect = require('connect');
var proxyInjector = require('./lib/proxy-injector');
var livereload = require('livereload');
var open = require('open');

program
  .version('0.1.0')
  .usage('[options] <file ...>')
  .option('-u, --target-url [url]', 'The target url to proxy', 'http://jquery.com/')
  .option('-d, --target-dir [path]', 'The path of the target directory to watch', './')
  .option('-e, --exclude [pattern]', 'Global Pattern to exclude', undefined)
  .option('-p, --port <n>', 'The proxy port', myParseInt, '8000')
  .option('-o, --open', 'Open a browser window', false)
  .option('-c, --create-rc', 'Create .npirc file', false)
  .parse(process.argv);

// resolve options args
var targetUrl = program.targetUrl;
if (targetUrl.substring(0, 4) !== "http") {
  targetUrl = 'http://' + targetUrl;
}
targetUrl = url.parse(targetUrl);

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
var globals = glob.sync('./**/*global*', {
  cwd: program.targetDir
});
var fileGlob = ['./**/*', '!./**/*' + program.exclude + '*'];

// usage example:
var a = ['a', 1, 'a', 2, '1'];
var unique = a.filter(onlyUnique); // returns ['a', 1, 2, '1']

var files = glob(fileGlob, {
  cwd: program.targetDir
});

function myParseInt(string, defaultValue) {
  var int = parseInt(string, 10);

  if (typeof int == 'number') {
    return int;
  } else {
    return defaultValue;
  }
}


var config = { // defaults:
  targetUrl: targetUrl,
  targetDir: targetDir, // directory containing scripts and stylesheets for injection
  proxyPort: program.port // local proxy server port
};

// write rc or prompt w/ if already exist
if (program.createRc) {
  var writeConf = function() {
    fs.writeFileSync(rcfile, JSON.stringify(config, 2, ' '));
  };

  if (!fs.existsSync(rcfile)) writeConf();
  else {
    require('colors');
    var prompt = require('readline-sync');
    var diff = require('diff');

    diff.diffJson(
      JSON.parse(fs.readFileSync(rcfile).toString()),
      config
    ).forEach(function(part) {
      // green for additions, red for deletions
      // grey for common parts
      var color = part.added ? 'green' :
        part.removed ? 'red' : 'grey';
      process.stderr.write(part.value[color]);
    });

    console.log();

    if (prompt.question('Overwrite? (y/n) :'.blue)
      .toLowerCase() === 'y') writeConf();
  }
}

// Config options
var options = rc(appname, config);
// note: defaults which are objects will be merged, not replaced
// views: {foo:'bar'}

var proxy = proxyInjector.createProxyServer(options);

var app = connect();
app.use(proxy);

http.createServer(app).listen(options.proxyPort);
console.log("Proxy server listening on port", options.proxyPort);

if (program.open) {
  open('http://localhost:' + options.proxyPort);
}

// Live reload server watching for files in target directory
var livereloadServer = livereload.createServer({
  applyCSSLive: false
}); // default port
livereloadServer.watch(options.targetDir);
