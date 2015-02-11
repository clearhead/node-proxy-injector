# node-proxy-injector

  A script that allows you to proxy a remote server and inject css stylesheets and js scripts into the remote server response. The tool supports live reload.

  Note that this tool is a work in progress!

## Installation

  `npm install -g clearhead/node-proxy-injector`

## Usage

  `$ npi`

## Command line options

  * `-u`, `--target-url` Specify url to proxy. Default currently set to http://jquery.com/ for example purposes
  * `-d`, `--target-dir` Specify directory containing files to inject. Default currently set to './test' for example purposes
  * `-e`, `--exclude` Specify exclude glob. Default is `undefined`.
  * `-p`, `--port` Specify port for proxy server to listen on. Default is 8000.
  * `-o`, `--open` Open a window to localhost:{port}. Default is false.
  * `-c`, `--create-rc` Creates an RC file in the local dir. Prints + Prompts w/ diff. Default is false.
