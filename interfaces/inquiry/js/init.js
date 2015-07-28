$(document).ready(function() {
  var maze = window.maze || {};

  // load settings from var
  maze.settings = CONFIG;

  // maze urls
  maze.urls = {
    session: '/session',
    login: '/login',
    logout: '/logout',
    signup: '/register',
    activate: '/activate/::token',
    lang: '/lang/::lang',

    get_book: '/book',
    get_vocabulary: '/voc',
    get_vocabulary_item: '/voc/::ids',
    get_documents: '/doc',
    get_documents_item: '/doc/::ids',

    search_book: '/book/search/::query',
    search_vocabulary: '/voc/search/::query',
    search_documents: '/doc/search/::query',

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
    //search_vocabulary: 'vocabItems/items',
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

    maze.debug = !!maze.settings.debug;
    maze.verbose = !!maze.settings.debug;

    if (maze.debug)
      domino.settings('verbose', true);

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

    maze.domino.init();


  };



  maze.init();


});
