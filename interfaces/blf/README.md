blf - BibLib front-end
======================


## Development version

How to run it:

  - Get **reference_manager** working (see the related [README](../README.md))
  - Go to the `blf` folder
  - Start a HTTP server: `python -m SimpleHTTPServer 4000`
  - Go to the application: `http://localhost:4000`


## Production version

How to build the production version:

 - Install [Node.js](http://nodejs.org/), [NPM](https://npmjs.org/) and [Grunt](http://gruntjs.com/installing-grunt)
 - Use `npm install` to install development dependencies
 - Use `grunt` to bundle a JavaScript file containing the whole sources (blf code, dependencies, templates)

How to run the production version:

  - Get **reference_manager** working (see the related [README](../README.md))
  - Go to the `blf` folder
  - Start a HTTP server: `python -m SimpleHTTPServer 4000`
  - Go to the application: `http://localhost:4000/index.min.html`

To see how to instanciate and customize **blf**, check `example.html`.

If you want to use **blf** inside another application, here are the files you need to copy (after having built with `grunt`):

  - `build/blf.min.js`
  - `build/style.min.css`
  - `locales/*`
