$(document).ready(function() {
  var maze = window.maze || {};

  // load settings from var
  maze.settings = CONFIG;
  
  // maze urls
  maze.urls = {
    login: '/login',
    logout: '/logout',
    signup: '/register',
    activate: '/activate/::token',

    get_book: '/book',
    get_vocabulary: '/voc',
    get_vocabulary_item: '/voc/::ids',
    get_documents: '/doc',
    get_documents_item: '/doc/::ids',
    search_book: '/inquiry/search/::query',

    list_comments: 'documentItems/items',
    get_comments: 'documentItems/items',
    fetch_comments: 'documentItems/items',
    infinite_comments: 'documentItems/items',

    list_documents: 'documentItems/items',
    
    fetch_documents: 'documentItems/items',
    infinite_documents: 'documentItems/items',
    save_document: 'documentItems/items',

    list_vocabulary: 'vocabItems/items',
    
    fetch_vocabulary: 'vocabItems/items',
    search_vocabulary: 'vocabItems/items',
    infinite_vocabulary: 'vocabItems/items',
    save_vocabulary: 'vocabItems/items',

    
    // search_book: 'bookItems/items',
    fetch_book: 'bookItems/items',
    save_book: 'bookItems/items',

    
    get_notes_book: 'bookItems/bookmarks',
    get_notes_vocabulary: 'vocabItems/bookmarks',
    get_notes_documents: 'documentItems/bookmarks',
    get_notes_contributions: 'contributionItems/bookmarks',

    get_contribution: 'contributionItems/items',
    manage_contribution: 'contributionItems/manage',

    storage: '/storage'
  };
  
  // enrich maze.urls 
  for(i in maze.urls){
    maze.urls[i] = maze.settings.endpoint + maze.urls[i];
  };

  

  maze.init = function(){

    if( /^#crossings/.test(window.location.hash) ) {
      var crossUrl = window.location.hash.replace("#crossings","");
      var redirectTo = maze.settings.crossings_home + crossUrl;
      console.log("redirects to: ",redirectTo);
      window.location = redirectTo;
    }

    maze.debug = maze.settings.debug || true;
    maze.verbose = maze.settings.debug || true;
    domino.settings('verbose', true);

    $("#header").replaceWith(maze.engine.template.header({
      settings: maze.settings,
      user:{
        username: 'agent smith'
      }
    }));

    $("#terms-popup").appendTo("body");
    $("#legal-popup").appendTo("body");
    $("#soutien-popup").appendTo("body");
    $("#credits-popup").appendTo("body");

    $(".scrollable").slimScroll({
      height: "400px",
      position: "right",
      railVisible: true,
      alwaysVisible: false,
      start: "top"
    });
    /*
    Cheak auth, GET user information, then init();
    maze.user = "'.$user->name.'";
    maze.today = "'.$current_date.'";
    maze.role = '.$role.';
    maze.reference_corpus = "'.Yii::app()->params["biblib_corpus"].'";
    
    */

    // update maze.urls
    maze.urls.get_references = maze.settings.biblib_host;
    maze.urls.get_crossings = maze.settings.crossings_modecrossids_host;

    //
    maze.columns.text = maze.columns[ maze.TEXT ] = $('#column-text .box');
    maze.columns.voc = maze.columns[ maze.VOC ] = $('#column-voc .box');
    maze.columns.doc = maze.columns[ maze.DOC ] = $('#column-doc .box');
    maze.columns.com = maze.columns[ maze.COMM ] = maze.columns.comm = maze.columns.contr = $('#column-comm .box');

    maze.rangy.init();
    maze.domino.init();

    // ask for status
    $.getJSON('http://aime.medialab.sciences-po.fr/tweets-aime.json', function(res) {
      $("#twitter-box .tweets").append(res.splice(0,1).map(function(d) {
        return maze.engine.template.tweet({tweet: d});
      }))
    });
  };



  maze.init();
  
  
});