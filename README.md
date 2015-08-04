# node-proxy-injector

  A script that allows you to proxy a remote server and inject css stylesheets and js scripts into the remote server response. The tool supports live reload.

  Note that this tool is a work in progress!

## Installation

  `npm install -g node-proxy-injector`

## Usage

  `$ npi`

  ProTip: Use `-c` the first time you use the tool on a project to create a re-usable rc file.

## Command line options

  * `-u`, `--target-url` Specify url to proxy. Default currently set to http://jquery.com/ for example purposes
  * `-d`, `--target-dir` Specify directory containing files to inject. Default is `./`
  * `-p`, `--port` Specify port for proxy server to listen on. Default is `8000`.
  * `-o`, `--open` Open a window to localhost:{port}. Default is `false`.
  * `-i`, `--include [regex]` Optional file pattern to include. Default is `.*`.
  * `-e`, `--exclude [regex]` Optional file pattern to exclude. Default is `undefined`.
  * `-a`, `--append-to [selector]` Optional selector to append files to. Default is `body`.
  * `-r`, `--rewrite-path [regex]` 'Regex path to inject scripts on. Default is `^/$`.
  * `-c`, `--create-rc` Creates an RC file in the local dir. Prints + Prompts w/ diff. Default is false.
