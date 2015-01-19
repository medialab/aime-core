# AIME Client
# Install

> npm install && bower install

> cp config.default.json config.json

update config.json if needed

## grunt

### testing

> grunt dev/prod

it will simply read the `config.json` file and create `js/config.js` module file containing dev/prod settings

### minification

> grunt mini

will concat, minify, remove console.logs of css/js files into the `/dist` folder

# Access

If the user is not connected to the first platform (with a valid cookie containing `PHPSESSID` session token), he will be redirected to the platform inquiry homepage (aka login page cause not logged in)

# PDFs

The pdf viewer, based on [viewerjs](http://viewerjs.org/), is hosted within the `/client` dir and serve pdfs with relative paths

Final config.json `pdfUrl` will look like: 

`http://aime.medialab.sciences-po.fr/aime-api/client/Viewer.js/#../../../../inquiry_dev/storage?url=` 

... using files served by the first platform on the root `/inquiry_dev`

# Editing content

You can add/edit contributions using the following syntax:

#### Contribution title 


    My pretty contrib


#### Contribution content


    The contrib abstract is the mandatory free text we have at the beginning. It is a paragraph

    My first slide is full of things
    -
    doc: http://adocimage.jpg
    ref: the 1998 ref, Paris

    My second slide doesn't have any doc neither ref

    The third slide has only a doc
    -
    doc: http://vimeo.com/2387567

    -
    ref: empy-fourth-slide's «lonely» reference, 2001, Quarth Press Associated


will be sent as a contribution like


    {
      user: { name:The AIME Team, id:author_52 }
      title: My pretty contrib
      text: The contrib abstract is ...
      slides: [{
        text: -
        ref: -
        document: {
          type: -
          url: -
          html: -
        },
      }]
    }



## License
Based on [angular-seed](https://github.com/angular/angular-seed), which is MIT Licensed
