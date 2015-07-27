#!/usr/bin/env node
/*jshint node:true*/

var appname = 'npi'; // .npirc
var rc = require('rc');
var rcfile = '.' + appname + 'rc';
var program = require('commander');
var http = require('http');
var url = require('url');
var fs = require('fs');
var connect = require('connect');
var proxyInjector = require('./lib/proxy-injector');
var livereload = require('livereload');
var open = require('open');

program
  .version('0.1.0')
  .usage('[options] <file ...>')
  .option('-u, --target-url [url]', 'The target url to proxy', 'http://jquery.com/')
  .option('-d, --target-dir [path]', 'The path of the target directory to watch', './')
  .option('-i, --include [regex]', 'File pattern to include', '.*')
  .option('-e, --exclude [regex]', 'File pattern to exclude', undefined)
  .option('-p, --port <n>', 'The proxy port', myParseInt, '8000')
  .option('-o, --open', 'Open a browser window', false)
  .option('-a, --append-to [selector]', 'Selector to append files to', 'body')
  .option('-r, --rewrite-path [regex]', 'Regex path to inject scripts on', '^/$')
  .option('-c, --create-rc', 'Create .npirc file', false)
  .parse(process.argv);

// resolve options args
var targetUrl = program.targetUrl;
if (targetUrl.substring(0, 4) !== "http") {
  targetUrl = 'http://' + targetUrl;
}
targetUrl = url.parse(targetUrl);

var targetDir = program.targetDir;

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
  include: program.include,
  exclude: program.exclude,
  appendTo: program.appendTo,
  rewritePath: program.rewritePath,
  targetDir: targetDir, // directory containing scripts and stylesheets for injection
  proxyPort: program.port // local proxy server port
};

// write rc or prompt w/ if already exist
if (program.createRc) {
  var writeConf = function () {
    fs.writeFileSync(rcfile, JSON.stringify(config, 2, ' '));
    fs.writeFileSync('.gitignore', '.gitignore\r\n.npirc', 'utf8');
  };

  if ( ! fs.existsSync(rcfile) ) writeConf();
  else {
    require('colors');
    var prompt = require('readline-sync');
    var diff = require('diff');

    diff.diffJson(
      JSON.parse(fs.readFileSync(rcfile).toString()),
      config
    ).forEach(function(part){
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
