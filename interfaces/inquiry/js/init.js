$(document).ready(function() {
  var maze = window.maze || {};

  maze.ACTION_NOTEBOOK = 'NOTEBOOK';
  maze.ACTION_SET_COMM_LEADER = 'CONTRIB';

  maze.ACTION_CONTRIBUTION_BOOKMARK = 'bookmark';
  maze.ACTION_CONTRIBUTION_GET = 'get';
  maze.ACTION_CONTRIBUTION_ADD = 'add';
  maze.ACTION_CONTRIBUTION_EDIT = 'edit';
  maze.ACTION_CONTRIBUTION_REMOVE = 'remove';
  maze.ACTION_CONTRIBUTION_MAKE_PUBLIC = 'make-public';
  maze.ACTION_CONTRIBUTION_ADD_SLIDE = 'add-slide';

  maze.TYPE_CONTRIBUTION_TITLE = 0;
  maze.TYPE_CONTRIBUTION_SLIDE = 1;
  maze.TYPE_CONTRIBUTION_OBJECTION = 2;
  maze.TYPE_CONTRIBUTION_CITATION = 3;

  maze.TYPE_NOTEBOOK_STAR = 'STAR';
  maze.TYPE_NOTEBOOK_ADD = 'ADD';
  maze.TYPE_NOTEBOOK_EDIT = 'EDIT';
  maze.TYPE_NOTEBOOK_DELETE = 'DELETE';

  maze.DELAY_MAX = 800;
  maze.DELAY_BETWEEN_SWIPE = 70;

  maze.STATUS_STARTUP = 'STARTUP';
  maze.STATUS_CALLING = 'CALLING';
  maze.STATUS_READY = 'READY';
  maze.STATUS_BUSY = 'BUSY';


  maze.user = 'anonymous';
  maze.today = Date();
  maze.role = 'guest';
  maze.reference_corpus = 'biblib';
  maze.i18n.lang = "en";

  maze.urls = {
    list_comments: 'documentItems/items',
    get_comments: 'documentItems/items',
    fetch_comments: 'documentItems/items',
    infinite_comments: 'documentItems/items',

    list_documents: 'documentItems/items',
    get_documents: 'documentItems/items',
    fetch_documents: 'documentItems/items',
    infinite_documents: 'documentItems/items',
    save_document: 'documentItems/items',

    list_vocabulary: 'vocabItems/items',
    get_vocabulary: 'vocabItems/items',
    fetch_vocabulary: 'vocabItems/items',
    search_vocabulary: 'vocabItems/items',
    infinite_vocabulary: 'vocabItems/items',
    save_vocabulary: 'vocabItems/items',

    get_book: 'bookItems/items',
    search_book: 'bookItems/items',
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
  

  

  

  maze.columns = {};

  /*
  The hash for the "current" element id
  (e.g. on scroll)
  */
  maze.cursor = {};
  maze.cursor.chapter = false;
  maze.cursor.subheading = false;

  /*
  The hash for timeout sequences
  */
  maze.timer = {};

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

    $("#header").replaceWith(maze.engine.template.header());

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
  };

  // load settings
  $.getJSON('config.json', function(res) {
    maze.settings = res;
    maze.init();
  })

  
  
});