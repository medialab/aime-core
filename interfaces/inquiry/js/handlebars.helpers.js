    Handlebars.registerHelper("log", function(something) {
      console.log(">>>>",something);
    });

    Handlebars.registerHelper('chapter_number', function( number ) {
      return new Handlebars.SafeString(number || '&middot;');
    });

    Handlebars.registerHelper('paragraph_number', function( number ) {
      return +number + 1;
    });

    Handlebars.registerHelper('basename', function( text ) {
      if( typeof text == "undefined" )
        return '';
      return text.split('.').shift()
    });

    Handlebars.registerHelper('storage_url', function(url) {
      return CONFIG.endpoint + '/resources/pdfs/' + url;
    })

    Handlebars.registerHelper('slides_navigation', function( length ) {
      return (length > 1) ? 'block' : 'none';
    });

    /**
      Multiply and divide helpers, cfr. https://github.com/elving/swag/blob/master/lib/swag.js helpers collection
    */
    Handlebars.registerHelper('multiply', function(value, multiplier) {
      return value * multiplier;
    });

    Handlebars.registerHelper('if_eq', function (context, options) {
      if (context === options.hash.compare) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('if_gt', function (context, options) {
      if (context > options.hash.compare) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('divide', function(value, divisor) {
      return value / divisor;
    });

    Handlebars.registerHelper('slide_width', function( length ) {
      return 100 / parseInt( length ) ;
    });
    Handlebars.registerHelper('cell_width', function( length ) {
      return 100/(length+7);
    });

    /*
      FOrmat a timestamp to a wellparsed date
    */
    Handlebars.registerHelper("date", function(timestamp) {
      return new Date(timestamp * 1000).toString('yyyy/MM/dd')
    });

    /*
      Handle date format YYYYMMDD
    */
    Handlebars.registerHelper("date_lite", function(date) {
      return date.replace(/(\d{4})(\d{2})(\d{2})/, function(m, p1, p2, p3) {
        return [p1, p2, p3].join(' / ');
      })
    });

    /*
      correct the iframe woith with width = 100%
      using a dummy regexp replace
    */
    Handlebars.registerHelper('t', function( text ) {
      if( typeof text == "undefined" )
        return '';
      return maze.i18n.translate( text );
    });

    /*
      correct the iframe woith with width = 100%
      using a dummy regexp replace
    */
    Handlebars.registerHelper('iframize', function( text ) {
      if( typeof text == "undefined" )
        return '';
      return text
        .replace(/width="\d+"/,'width="100%"')
        .replace(/height="\d+"/,'height="420"')
        .replace('<img', '<img style="max-width:100%"')
    });
    /**
      Example for brackets and uppercase
      NASA [REF] [ATT·DC] [1977]
      E.g
      "La littérature est immense, en commençant par le Derrida commentant Husserl jusqu’au livre capital de Netz sur la géométrie grecque {Netz, 2003 #187}, l’anthropologie de Jack Goody dont la {Goody, 1979 #194} a eu une grande influence, sans oublier l’excellent {Dagognet, 1973 #476} {Dagognet, 1974 #477}.".replace(/{([^#]*)#(\d+)[^}]}/g,function(a,title,id){
          return '<span class="link doc" data-id="ref-'+ id.replace(/\s/,'') +'">' + title.replace(/\s$/,'') + '</span>';
      });
      T
    */
    Handlebars.registerHelper('decorate_lite', function(text) {
      if(typeof text == "undefined")
        return '';
      return text
        .replace(/\[[^\]]*\]/g,function(s){
          return "<span class='modes'>" + s.replace(/[^\w\[·\.\-\]]/g,'').replace(/[·\.\-]/g,'&middot;') + "</span>"
        }).replace(/[A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ][A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ]+/g,function(s){
          return "<span class='smallcaps'>" + s + "</span>"
        });
    });
    /**
      Example for brackets and uppercase
      NASA [REF] [ATT·DC] [1977]
      E.g
      "La littérature est immense, en commençant par le Derrida commentant Husserl jusqu’au livre capital de Netz sur la géométrie grecque {Netz, 2003 #187}, l’anthropologie de Jack Goody dont la {Goody, 1979 #194} a eu une grande influence, sans oublier l’excellent {Dagognet, 1973 #476} {Dagognet, 1974 #477}.".replace(/{([^#]*)#(\d+)[^}]}/g,function(a,title,id){
          return '<span class="link doc" data-id="ref-'+ id.replace(/\s/,'') +'">' + title.replace(/\s$/,'') + '</span>';
      });
      T
    */
    Handlebars.registerHelper('decorate', function( text ) {
      if( typeof text == "undefined" )
        return '';
      return MarkdownParser(text)
        .replace(/\[[^\]]*\]/g,function(s){
          return "<span class='modes'>" + s.replace(/[^\w\[·\.\-\]]/g,'').replace(/[·\.\-]/g,'&middot;') + "</span>"
        }).replace(/[A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ][A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ]+/g,function(s){
          return "<span class='smallcaps'>" + s + "</span>"
        });
      // return window['Hypher']['languages']['fr'].hyphenateText(text)
      return text
        .replace(/{([^#]*)#(\d+)}/g,function(a,title,id){
          return "<span class='link doc' data-id='ref-" + id.replace(/\s/,'') + "'>" + title.replace(/\s$/,'') + "</span>";
        })
        .replace(/\[[^\]]*\]/g,function(s){
          return "<span class='modes'>" + s.replace(/[^\w\[·\.\-\]]/g,'').replace(/[·\.\-]/g,'&middot;') + "</span>"
        }).replace(/[A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ][A-ZÀÁÂÈÉÊÌÍÎÏÇÒÓÔŒÙÚÛ]+/g,function(s){
          return "<span class='smallcaps'>" + s + "</span>"
        })

      // return text.replace(/(\s+([;:]))/g,function( a,b ){return "&nbsp;PPPPPPPP" + a.replace(/\s/,'')});
    });

    /**
      Parse content slices according to splitpoints given.
      Note: use only in case of overlapping in decorate functions!!
    */
    Handlebars.registerHelper('parse', function( slices ) {

      var out = [];
      for( var i in slices){
        if( !slices[i].types.length ) { out.push( Handlebars.helpers.decorate( slices[i].content ) ); continue; }
        var types = [],
            data_ids = [],
            is_link = true;

        for( var j in slices[i].types ){
          if( slices[i].types[j].disable ){
            is_link = false;

          }
          types.push( slices[i].types[j].type )
          data_ids.push( slices[i].types[j].type + '-' +slices[i].types[j].id );
        }
        if( is_link )
          out.push(
            '<span class="link ' + types.join(" ") +' " data-id="' + data_ids.join(" ") + ' ">'+ Handlebars.helpers.decorate( slices[i].content ) +'</span>'
          );
        else
          out.push(
            '<span class="' + types.join(" ") +'">'+ Handlebars.helpers.decorate( slices[i].content ) +'</span>'
          );

      }



      // put your modification onto the whole content hrer
      out =  out.join('').replace(/{([^#]*)#(\d+)}/g,function(a,title,id){
          return "<span class='link doc' data-id='ref-" + id.replace(/\s/,'') + "'>" + title.replace(/\s$/,'') + "</span>";
        })
      return out;
      //return window['Hypher']['languages']['fr'].hyphenateText(out)

    });

    Handlebars.registerHelper('hyphen', function( text ) {
      return window['Hypher']['languages']['fr'].hyphenateText( text )
    });

    Handlebars.registerHelper('draw_modes', function( text ) {
//      return text.replace( /\[[^\]]+\]/g, function(s){return "<span class='modes'>" + s + "</span>"});
      return text.replace( /\[[\D]+\]/g, function(s){return "<span class='modes'>" + s + "</span>"});

    });

    Handlebars.registerHelper("foreach",function(arr,options) {
      if(options.inverse && !arr.length)
      return options.inverse(this);

      return arr.map(function(item,index) {
        item.$index = index;
        item.$width = 100/arr.length;
        item.$left = index * item.$width;
        item.$first = index === 0;
        item.$last  = index === arr.length-1;
        return options.fn(item);
      }).join('');
    });

    Handlebars.registerHelper('read_more', function() {
      return maze.i18n.lang == 'fr' ? '[en savoir plus]' : '[read more]';

    });

    Handlebars.registerHelper('CONFIG', function(key) {
      return CONFIG[key];
    });

    Handlebars.registerHelper('isBookmarked', function(id, resType) {
      var b = maze.domino.controller.get('bookmarks');
      if(resType) return b[id] ? 'fa-star' : 'fa-star-o'
      else return b[id];
    });
