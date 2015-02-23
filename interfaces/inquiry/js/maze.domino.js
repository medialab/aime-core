;(function(window, jQuery, domino, undefined) {
  'use strict';

  window.maze = window.maze || {};
  maze.domino ={};

  // Domino global settings:
  domino.settings({
    shortcutPrefix: '::',
    displayTime: true,
    strict: true,
    clone: false
  });

  // error handling helper for domino services
  // 401 (launch event connect to)
  maze.domino.errorHandler = function(message, xhr, params) {
    console.log('maze.domino.errorHandler', message, params, xhr.status);
    switch(xhr.status) {
      case 401:
        maze.domino.controller.update('authorization', maze.AUTHORIZATION_REQUIRED);
        break;
      case 403:
        maze.domino.controller.update('authorization', maze.AUTHORIZATION_FAILED);
        break;
      default:
        maze.toast('connection error', {sticky:true, cleanup:true}); 
        break;
    }
  }

  maze.domino.parseQueryString = function(s) {
    var data = {};

    s.split('&').forEach(function(item) {
      var pair = item.split('=');
      data[decodeURIComponent(pair[0])] =
        pair[1] ? decodeURIComponent(pair[1]) : true;
    });

    return data;
  };
  

  maze.domino.factory = function(fn){
    return function(options) {
      var self = this,  // TODO check SCOPE
          settings = options || {},
          closure = function(){
            fn.call(self, settings, function() {
              if( settings.callback )
                settings.callback.apply(this, settings.args );
            });
          };

      if( settings.delay ){
        setTimeout( closure, settings.delay );
      } else {
        closure();
      }
    }
  };


  // Adding custom structures:
  if (!domino.struct.isValid('maze.status'))
    domino.struct.add({
      id: 'maze.status',
      struct: function(v) {
        return !!~[
          maze.STATUS_STARTUP,
          maze.STATUS_CALLING,
          maze.STATUS_READY,
          maze.STATUS_BUSY
        ].indexOf(v);
      }
    });

  if (!domino.struct.isValid('maze.authorization'))
    domino.struct.add({
      id: 'maze.authorization',
      struct: function(v) {
        return !!~[
          maze.AUTHORIZATION_UNKNOWN,
          maze.AUTHORIZATION_REQUIRED,
          maze.AUTHORIZATION_AUTHORIZED,
          maze.AUTHORIZATION_FAILED,
          maze.AUTHORIZATION_SIGNUP,
        ].indexOf(v);
      }
    });

  if (!domino.struct.isValid('maze.scene_action'))
    domino.struct.add({
      id: 'maze.scene_action',
      struct: function(v) {
        return !!~[
          maze.ACTION_STARTUP,
          maze.ACTION_SEARCH,
          maze.ACTION_SET_TEXT_LEADER,
          maze.ACTION_SET_VOC_LEADER,
          maze.ACTION_SET_DOC_LEADER,
          maze.ACTION_SET_COMM_LEADER,
          maze.ACTION_NOTEBOOK,
          maze.ACTION_ACTIVATE_ACCOUNT
        ].indexOf(v);
      }
    });

  if (!domino.struct.isValid('maze.column'))
    domino.struct.add({
      id: 'maze.column',
      struct: function(v) {
        return !!~[
          maze.TEXT,
          maze.VOC,
          maze.DOC,
          maze.COMM
        ].indexOf(v);
      }
    });

  if (!domino.struct.isValid('maze.contribution_action'))
    domino.struct.add({
      id: 'maze.contribution_action',
      struct: function(v) {
        return !!~[

          maze.ACTION_CONTRIBUTION_BOOKMARK,
          maze.ACTION_CONTRIBUTION_GET,
          maze.ACTION_CONTRIBUTION_ADD,
          maze.ACTION_CONTRIBUTION_EDIT,
          maze.ACTION_CONTRIBUTION_REMOVE,
          maze.ACTION_CONTRIBUTION_MAKE_PUBLIC,
          maze.ACTION_CONTRIBUTION_ADD_SLIDE
        ].indexOf(v);
      }
    });

  if (!domino.struct.isValid('maze.contribution_type'))
    domino.struct.add({
      id: 'maze.contribution_type',
      struct: function(v) {
        return !!~[
          maze.TYPE_CONTRIBUTION_TITLE,
          maze.TYPE_CONTRIBUTION_SLIDE,
          maze.TYPE_CONTRIBUTION_OBJECTION,
          maze.TYPE_CONTRIBUTION_CITATION
        ].indexOf(v);
      }
    });

  maze.domino.init = function(){
    maze.domino.controller = new domino({
      name: 'maze',
      properties: [
        /**
         * API RELATED PROPERTIES
         * **********************
         */
        {
          id: 'authorization',
          description: 'The authorization level: LIMBO, AUTHORIZED, UNAUTHORIZED, SIGNING_UP',
          dispatch: 'authorization__updated',
          type: 'maze.authorization',
          value: maze.AUTHORIZATION_UNKNOWN
        },

        {
          id: 'user',
          description: 'The authentified user, with all the fields we need. Check "More" domino module.',
          dispatch: 'user__updated',
          type: 'object',
          value: {}
        },
        {
          id: 'lang',
          description: 'The favourite language, set by each requests. Check "More" domino module. when changed, it should refresh the ui',
          dispatch: 'lang__updated',
          type: 'string',
          value: 'en'
        },
        /**
         * DATA RELATED PROPERTIES
         * ***********************
         */
        // crossings:
        {
          id: 'data_crossings',
          description: 'contains the crossing information to connect with the aime2. To be loaded at the very beginning',
          type: {
            ids: ['string'],
            items: ['object']
          },
          value: {
            ids:[],
            items: []
          }
        },
        // Books:
        {
          id: 'data_bookContents',
          description: 'An hash containing the chapters contents, indexed by their IDs.',
          dispatch: 'data_book_updated',
          type: 'object',
          value: {}
        },
        {
          id: 'data_bookIdsArray',
          description: 'The array of the IDs of the chapters.',
          dispatch: 'data_book_updated',
          type: [ 'number' ],
          value: []
        },

        // search book (do not delete bookids array... :)
        {
          id: 'data_search_bookIdsArray',
          description: 'The array of the IDs of the chapters matching current scene_query',
          dispatch: 'data_bookIdsMatches_updated',
          type: [ 'number' ],
          value: []
        },

        // Vocabulary:
        {
          id: 'data_vocContents',
          description: 'An hash containing the terms descriptions, indexed by their IDs.',
          dispatch: 'data_voc_updated',
          type: 'object',
          value: {}
        },
        {
          id: 'data_vocIdsArray',
          description: 'The array of the IDs of the terms.',
          dispatch: 'data_voc_updated',
          type: [ 'number' ],
          value: []
        },

        // Documents:
        {
          id: 'data_docContents',
          description: 'An hash containing the documents and references descriptions, indexed by their IDs.',
          dispatch: [ 'data_doc_updated', 'fill_references' ],
          type: 'object',
          value: {}
        },
        {
          id: 'data_docIdsArray',
          description: 'The array of the IDs of the documents and descriptions.',
          dispatch: 'data_doc_updated',
          type: [ 'number' ],
          value: []
        },

        // Contributions:
        {
          id: 'data_contContents',
          description: 'An hash containing the documents and references descriptions, indexed by their IDs.',
          dispatch: 'data_cont_updated',
          type: 'object',
          value: {}
        },
        {
          id: 'data_contIdsArray',
          description: 'The array of the IDs of the documents and descriptions.',
          type: ['string'],
          value: []
        },

        // Miscellaneous:
        {
          id: 'data_statuses',
          description: 'The loading statuses of the different data.',
          dispatch: 'data_statuses_updated',
          type: {
            book: 'maze.status',
            documents: 'maze.status',
            vocabulary: 'maze.status'
          },
          value: {
            book: 'STARTUP',
            documents: 'STARTUP',
            vocabulary: 'STARTUP'
          }
        },

        /*
          Sticky properties
          ---
          Cfr. Sticky modules in misc.js

        */
        {
          id: 'sticky_chapter',
          description: 'The properties of the sticky chapter',
          value:{

            offset: -500,
            height: 0
          },
          type:{
            id: '?string',
            scroll_id: '?number',
            number: '?string', // the chapter number, html middot !
            title: '?string',
            classes: '?string',
            offset:'number',
            shadow:'?number',
            height:'number'
          }
        },
        {
          id: 'sticky_subheading',
          description: 'The properties of the sticky subheading',
          value:{
            offset:-500,
            height:0
          },
          type:{
            id: '?string',
            title: '?string',
            classes: '?string',
            offset:'?number',
            shadow_offset:'?number',
            height:'number'
          }
        },
        {
          id: 'sticky_term',
          description: 'The properties of the sticky term',
          value:{
            offset: -500,
            height: 0,
            shadow: 0
          },
          type:{
            id: '?string',
            title: '?string',
            classes: '?string',
            offset:'number',
            shadow:'?number',
            height:'?number'
          }
        },
        {
          id: 'sticky_document',
          description: 'The properties of the sticky document',
          value:{
            offset: -500,
            height: 0,
            shadow: 0
          },
          type:{
            id: '?string',
            title: '?string',
            classes: '?string',
            offset:'number',
            shadow:'number',
            height:'number'
          }
        },
        {
          id: 'sticky_contribution',
          description: 'The properties of the sticky contribution',
          value:{
            offset: -500,
            height: 0,
            shadow: 0
          },
          type:{
            id: '?string',
            title: '?string',
            classes: '?string',
            offset:'number',
            shadow:'number',
            height:'number'
          }
        },
        {
          id: 'sticky_vocabulary_height',
          description: 'The height of the sticky term title',
          value:0,
          type:'number'
        },
        {
          id: 'sticky_document_height',
          description: 'The height of the sticky document title',
          value:0,
          type:'number'
        },
        {
          id: 'sticky_contribution_height',
          description: 'The height of the sticky contribution title',
          value:0,
          type:'number'
        },
        /**
         * SCENE RELATED PROPERTIES
         * ************************
         * Note: the layout actually change only when scene action is updated.
         * Any other changement make only local changements.
         */
        {
          id:'scene_action',
          description: 'The action to be performed that influences column disposition and behaviours',
          dispatch: ['scene_action_updated', 'scene_updated'],
          value: maze.ACTION_STARTUP,
          type:'maze.scene_action'
        },
        {
          id:'scene_column',
          description: 'Describes which column is the leader, and which is the slave.',
          triggers: 'update_scene_column',
          dispatch: ['scene_column_updated', 'scene_stored'],
          type: {
            leading: '?maze.column',
            slave: '?maze.column'
          },
          value:{}
        },
        {
          id:'scene_bookmark',
          description: 'Describes the text being currently read.',
          dispatch: ['scene_bookmark_updated', 'scene_stored'],
          type: {
            chapter: '?string',
            subheading: '?string', // #33333 jquery selector
            paragraph: '?string'
          },
          value:{}
        },
        { id:'scene_item',
          description: 'The leader object in the leader column.',
          dispatch: ['scene_item_updated', 'scene_stored'],
          type: {
            id: '?string', // complete css selector for the given column
            column: '?maze.column'
          },
          value:{}
        },
        { id:'scene_page',
          description: 'The current page - column text, inside the input text field.',
          dispatch: ['scene_page_updated', 'scene_stored'],
          type: '?number',
          value:0
        },
        { id:'scene_query',
          description: 'The query as written inside the "search" input text field',
          dispatch: ['scene_query_updated', 'scene_updated'],
          type: '?string',
          value:''
        },
        {
          id:'scene_glossary',
          description: 'Describes which column is the leader, and which is the slave.',
          triggers: 'update_scene_glossary',
          dispatch: ['scene_glossary_updated', 'scene_stored'],
          type: ['string'],
          value:[]
        },
        { id:'scene_slide',
          description: 'The selected document slide. Document should be described by the scene_item',
          dispatch: ['scene_slide_updated', 'scene_stored'],
          type: '?string',
          value:'0'
        },
        /*
          Text Selection events
        */
        {
          id:'active_selection',
          description: 'the selection object',
          triggers: 'update_active_selection',
          dispatch: ['active_selection_updated' ],
          value: {},
          type:{
            content: '?string',
            id: '?string',
            column: '?maze.column',
            top: '?number',
            left: '?number',
            width: '?number',
            height: '?number'
          }
        },
        /*
          MISC
        */
        {
          id:'ui_lock',
          description: 'lock / unlock the pointer events on the interface',
          value: false,
          type:'boolean'
        },
        {
          id:'ui_lock_selection',
          description: 'lock / unlock the selection events on the interface',
          dispatch: ['ui_lock_selection_updated'],
          value: false,
          type:'boolean'
        },
        {
          id:'scroll_lock',
          description: 'lock / unlock the infinite scrollings',
          value: false,
          type:'boolean'
        },
        {
          id:'is_editing',
          description: 'Tell the whole system that user is editing',
          dispatch: ['is_editing_updated'],
          type: 'boolean',
          value:false
        },
        /*
          infinite flags for each column.
          TEXT does not manifest an infinite behaviour!!
          Cfr scrolling on column Module.

          maze.VOC,
          maze.DOC,
          maze.COMM
        */
        {
          id: 'infinite_voc',
          description: '',
          dispatch:['infinite_voc_updated'],
          value: maze.STATUS_READY,
          type:'maze.status'
        },
        {
          id: 'infinite_doc',
          description: '',
          dispatch:['infinite_doc_updated'],
          value: maze.STATUS_READY,
          type:'maze.status'
        }

      ],
      shortcuts: [
        /**
         * DATA RELATED SHORTCUTS
         * **********************
         */
        {
          id: 'data_isReady',
          description: 'Returns true if docs, books and vocs are ready, false else.',
          method: function() {
            var data_docIdsArray = this.get('data_docIdsArray');

            return data_docIdsArray.documents === 'READY' &&
                   data_docIdsArray.vocabulary === 'READY' &&
                   data_docIdsArray.book === 'READY';
          }
        }
      ],
      hacks: [
        /**
         * SESSION HACKS
         * ******************
         */
        {
          triggers: 'session__initialize',
          description: 'call session service to get the current user if any and the current language',
          method: function() {
            this.request('session');
          }
        },

        {
          triggers: 'session__initialized',
          description: 'call session service to get the current user if any and the current language',
          method: function() { //check location search. IS IT THE LAST HANDLER?
            var activation = maze.domino.parseQueryString(location.search.split('?').pop());
            
            if(activation.token && activation.activate)
              maze.domino.controller.dispatchEvent('user__activate', activation);
            else
              maze.domino.controller.dispatchEvent(['resize', 'scene__initialize']);
            
          }
        },
        /**
         * LOGIN HACKS
         * ******************
         */
        {
          triggers: 'auth_success',
          description: 'Close the login panel and start over'
        },
        {
          triggers: 'auth_failed',
          description: 'show login and the error message'
        },
        {
          triggers: 'auth_require',
          description: 'Ask the server for validation',
          method: function(res) {
            console.log(res.data);
            this.request('login', {data: res.data});
          }
        },
        {
          triggers: 'lang_change',
          description: 'change language at session level',
          method: function(e) {
            console.log('change language', this.get('lang'), e.data);
            
            if(this.get('lang') != e.data.lang) {
              this.request('lang',{
                shortcuts: {
                  lang: e.data.lang
                }
              })
            };
          }
        },
        {
          triggers: 'signup_require',
          description: 'open signup process',
          method: function() {
            this.update('authorization', maze.AUTHORIZATION_SIGNUP);
          }
        },
        {
          triggers: 'signup_dismiss',
          description: 'close signup process and go back to login',
          method: function() {
            this.update('authorization', maze.AUTHORIZATION_REQUIRED);
          }
        },
        {
          triggers: 'signup_register',
          description: 'send signup data',
          method: function(res) {
            this.request('signup', {data: res.data});
          }
        },
        {
          triggers: 'data_book_updated',
          description: 'Initialize stuff when book is loaded.',
          method: function() {
            this.dispatchEvent('init');
          }
        },
        /**
         * DATA RELATED HACKS
         * ******************
         */
        {
          triggers: 'data_cleanStatuses',
          description: 'Cleaning every flags, statuses, etc...',
          method: function() {
            if (this.get('ui_lock'))
              return;

            this.update('data_statuses', {
              book: 'STARTUP',
              vocabulary: 'STARTUP',
              documents: 'STARTUP'
            });
          }
        },
        {
          triggers: 'data_updateStatus',
          description: 'Update one specific status.',
          method: function(e) {
            if (this.get('ui_lock'))
              return;

            var data_statuses = this.get('data_statuses');
            data_statuses[e.data.column] = e.data.status;
            this.update('data_statuses', data_statuses);
          }
        },
        {
          triggers: 'data_update',
          description: 'hack:data_update checks the difference from the already loaded list of ids and the brand new one. ',
          method: function(e) {
            var namespace = e.data.namespace,
                stored_ids = this.get('data_' + namespace + 'IdsArray'),
                ids = maze.fn.unique(e.data.ids),
                contents = {},
                data = {};

            for(var i in ids){
              contents[ids[i]] = e.data.contents[ids[i]];
            };

            data['data_' + namespace + 'IdsArray'] = ids;
            data['data_' + namespace + 'Contents'] = contents;

            //if( !maze.fn.equals(stored_ids, e.data.ids ) ){
              this.update(data);
           // } else {
            //  this.log( 'skip updating data_' + namespace + 'idsArray ... already filled');
            //}
          }
        },
        /*
          Sticky hacks
          ---
          Cfr. Sticky modules in misc.js

        */
        {
          triggers: 'sticky_show',
          description: 'show sticky and prepare it to be filled'
        },
        {
          triggers: 'sticky_hide',
          description: 'hide every sticky present in every column'
        },
        {
          triggers: 'sticky_chapter_update',
          description: '',
          method:function(e){
            this.update('sticky_chapter',e.data);
          }
        },
        {
          triggers: 'sticky_chapter_adjust',
          description: '',
          method:function(e){
            var sticky_chapter = this.get('sticky_chapter');
            this.update('sticky_chapter',$.extend(sticky_chapter, e.data));
          }
        },
        {
          triggers: 'sticky_subheading_update',
          description: '',
          method:function(e){
            this.update('sticky_subheading',e.data);
          }
        },
        {
          triggers: 'sticky_subheading_adjust',
          description: '',
          method:function(e){
            var sticky_subheading = this.get('sticky_subheading');
            this.update('sticky_subheading',$.extend(sticky_subheading, e.data));
          }
        },
        {
          triggers: 'sticky_term_update',
          description: '',
          method:function(e){
            this.update('sticky_term',e.data);
          }
        },
        {
          triggers: 'sticky_term_adjust'
        },
        {
          triggers: 'sticky_document_update',
          description: '',
          method:function(e){
            this.update('sticky_document',e.data);
          }
        },
        {
          triggers: 'sticky_document_adjust'
        },
        {
          triggers: 'sticky_contribution_update',
          description: 'update title and offset for the first in row contribution',
          method:function(e){
            this.update('sticky_contribution',e.data);
          }
        },
        {
          triggers: 'sticky_contribution_adjust'
        },
        /*

          Sliders hacks
          =============
        */
        {
          triggers: 'slider_init',
          description: 'Initialize slider. Requires event.data.selector to get the DOM item, and event.data.type to differentiate between Document, contribution and editor'
        },
        {
          triggers: 'slider_enable',
          description: 'enable slider listener for the current target!'
        },
        {
          triggers: 'slider_disable',
          description: 'disable slider listeners for the current target!'
        },
        {
          triggers: 'slider_show',
          description: 'enable slider listener for the current target!'
        },
        {
          triggers: 'slider_hide',
          description: 'disable slider listeners for the current target!'
        },
        {
          triggers: 'slider_to',
          description: 'ask to force goingto'
        },
        {
          triggers: 'execute_slider_to',
          description: 'actually force goingto'
        },
        {
          triggers: 'slider_add_slide',
          description: 'add a slide for the slider!'
        },
        {
          triggers: 'slider_leave_target',
          description: 'disable slider if event.data.id is the id of the slider target'
        },
        {
          triggers: 'publish_contribution',
          description: 'publish the contribution',
          method: function(event) {
            this.request('manage_contribution.publish', {
              id: event.data.id || this.die('missing parameter "id"'),
              callback: event.data.callback
            });
          }
        },
        {
          triggers: 'unpublish_contribution',
          description: 'unpublish the contribution',
          method: function(event) {
            this.request('manage_contribution.unpublish', {
              id: event.data.id || this.die('missing parameter "id"'),
              callback: event.data.callback
            });
          }
        },
        {
          triggers: 'makepublic_contribution',
          description: 'makepublic the contribution',
          method: function(event) {
            this.request('manage_contribution.makepublic', {
              id: event.data.id || this.die('missing parameter "id"'),
              callback: event.data.callback
            });
          }
        },
        {
          triggers: 'makemoderated_contribution',
          description: 'makemoderated the contribution',
          method: function(event) {
            this.request('manage_contribution.makemoderated', {
              id: event.data.id || this.die('missing parameter "id"'),
              callback: event.data.callback
            });
          }
        },
        {
          triggers: 'add_contribution_slide',
          description: 'add a slide for the slider (this time through the API)!',
          method: function(event) {
            this.request('manage_contribution.add-slide', {
              id: event.data.id || this.die('missing parameter "id"'),
              callback: event.data.callback
            });
          }
        },
        {
          triggers: 'remove_contribution_slide',
          description: 'deletes a slide from a contribution.',
          method: function(event) {
            this.request('manage_contribution.remove-slide', {
              id: event.data.id || this.die('missing parameter "id"'),
              callback: event.data.callback
            });
          }
        },
        {
          triggers: 'update_contribution_slide',
          description: 'edit a slide from a contribution.',
          method: function(event) {
            this.request('manage_contribution.edit-slide', {
              id: event.data.id,
              ref: event.data.ref,
              ref_url: event.data.ref_url,
              content: event.data.content,
              callback: event.data.callback
            });
          }
        },
        {
          triggers: 'slider_remove_slide',
          description: 'remove the slide at (event.data.index) for the current slider'
        },
        /**
         * SCENE RELATED HACKS
         * *******************
         */
        {
          triggers: 'scene__initialize',
          description: 'load the very book and the corossings, then allow people to discover aime paltform...',
          method: function(e) {
            
            var services = [
              {
                service: 'get_crossings'
              },
              {
                service: 'get_book'
              }
            ];


            console.log('%c@scene__initialize', 'color: green');

            this.request(services, {
                success: function() {
                  console.log('%c@scene__initialize successfully', 'background-color: green');
                }
            });

            // maze.domino.controller.request('get_crossings', {});
    // maze.domino.controller.request('get_book');
          }
        },
        {
          triggers: 'user__activate',
          description: 'if there is a activation rquest via GET param, this method deals with the accoiunt activation',
          method: function(e) {
            this.request('activate', {
              shortcuts:{
                token: e.data.token
              }
            })
          }
        },
        {
          triggers: 'scene_update',
          description: 'modify the scene properties',
          method: function(e) {
            this.log('scene update, ui lock status', this.get('ui_lock'))
            if (this.get('ui_lock'))
              return;

            var id,
                update = {
                  scene_bookmark: e.data.scene_bookmark,
                  scene_action: e.data.scene_action,
                  scene_column: e.data.scene_column,
                  scene_query: e.data.scene_query,
                  scene_item: e.data.scene_item,
                  scene_slide: e.data.scene_slide,
                  scene_glossary: e.data.scene_glossary
                },
                services = [];

            for (var k in update)
              if (update[k] === undefined)
                delete update[k];

            if (!Object.keys(update).length)
              return;

            // If the voc item has to be loaded:
            if (
              (update.scene_action || this.get('scene_action')) === maze.ACTION_SET_VOC_LEADER &&
              (id = ((update.scene_item || {}).id || this.get('scene_item').id || '#vocab-').substr(7)) &&
              !this.get('data_vocContents')[id]
            ) {
              services.push({
                service: 'get_vocabulary_item',
                shortcuts: {
                  ids: ['voc_' + id]
                }
              });

            // If the doc item has to be loaded:
            } else if (
              (update.scene_action || this.get('scene_action')) === maze.ACTION_SET_DOC_LEADER &&
              (id = ((update.scene_item || {}).id || this.get('scene_item').id || '#doc-').substr(5)) &&
              !this.get('data_docContents')[id]
            ) {
              this.log('Trying to open a doc that is not loaded yet. Currently dealing with it...');
              services.push({
                service: 'get_documents',
                ids: [id]
              });

            // Else, we can update the stuff:
            } else if (
              (update.scene_action || this.get('scene_action')) === maze.ACTION_SET_COMM_LEADER &&
              (id = ((update.scene_item || {}).id || this.get('scene_item').id || '#comm-').substr(6)) &&
              !this.get('data_contContents')[id]
            ) {
              this.log('Trying to open contribution',id,' that is not loaded yet. Currently dealing with it...');
              services.push({
                service: 'get_contributions',
                ids: [id]
              });
            }

            if( services.length ){
              this.log('scene_update: services to be called', services );
              this.request(services, {
                success: function() {
                  maze.domino.controller.update(update);
                }
              });
            } else {
              this.log('scene_update: proceed to update', update );
              this.update(update);
            }
          }
        },
        {
          triggers: 'scene_store',
          description:'modify the scene properties without triggering the scene_update event - and the ajax call related',
          method:function(e){
            var scene = {
              scene_bookmark: e.data.scene_bookmark,
              scene_item: e.data.scene_item,
              scene_slide: e.data.scene_slide,
              scene_query: e.data.scene_query,
              scene_page: e.data.scene_page,
              scene_glossary: e.data.scene_glossary
            };
            for (var k in scene)
              if (scene[k] === undefined)
                delete scene[k];
            if (Object.keys(scene).length)
              this.update(scene);

          }
        },
        {
          triggers: 'scene_updated' // Ccfr. Layout module
        },
        {
          triggers: 'columnify',
          description: 'trigger the columnify function with the current properties of the scene, cfr Layout Module'
        },
        {
          triggers: 'omissify',
          description: 'trigger the omissis function. The event.data must contain a "items" with a jquery collection'
        },
        {
          triggers: 'unomissify',
          description: 'trigger the undo-omissis function. Remove every omissis everywhere'
        },
        /*

          Notebook
          ---

          Cfr. misc.js Rangy module
        */
        {
          triggers: 'notebook_discard',
          description:'<hack:notebook_discard> closes the notebook tooltip, undoes selection and destroys the editor. Modules: Notebook, Rangy and Editor',
          method: function() {
            var scene_column = this.get('scene_column');

            maze.log('hack: notebook_discard, leading column:', scene_column.leading);

            if(scene_column.leading == maze.TEXT)
              this.dispatchEvent('text_extract_inlinks');
            else
              this.dispatchEvent('extract_inlinks');

          }
        },
        {
          triggers: 'notebook_choose',
          description:'<hack: notebook_choose> opens the notebook tooltip'
        },
        {
          triggers: 'editor_init',
          description:'open/create the editor',
          method: function(event) {
            var scene = this.get('scene_column');

            if (scene.slave !== maze.COMM) {
              scene.slave = maze.COMM;
              this.update('scene_column', scene);
              this.dispatchEvent('columnify');
            }

            this.dispatchEvent('open_editor', {
              contribution: (event.data || {}).contribution || {}
            });
          }
        },

        /*

          On Scroll / Sticky  information events
          ---
        */
        {
          triggers: 'scrolling_text',
          description:'handle scroll event on TEXT column : update sticky chapter and subheading and extract visible inlinks'
        },
        {
          triggers: 'text_scrollto'
        },
        {
          triggers: 'scrolling_voc',
          description:'handle scroll on VOC column'
        },
        {
          triggers: 'scrolling_doc',
          description:'handle scroll on DOC column'
        },
        {
          triggers: 'scrolling_cont',
          description:'handle scroll on CONT/COMM column'
        },
        /*
          Text match for cvocabulary links, document and comments
          ---
          the _clean function clean up previous matches
        */
        {
          triggers:'text_match_highlight',
          description:'add ".match" css classes to <span class="link" .. /> elements matching the event.data.selector '
        },
        {
          triggers:'text_match_clear',
          description:'remove all ".match" css classes in <span class="link"> elements'
        },
        {
          triggers:'doc_move_to',
          description:'goto slide in the leader document'
        },
        {
          triggers:'setup_text_as_leader',
          description:'Prepare TEXT column to handle scene_update action SET_TEXT_LEADER.'
        },
        {
          triggers:'setup_text_as_slave',
          description:'Prepare TEXT column to handle scene_update when TEXT is in slave mode (switch display matches)'
        },
        {
          triggers:'setup_voc_as_leader',
          description:'Prepare voc column to handle scene_update action SET_VOC_LEADER. Change all previoius ".match" css classes in <span class="link"> elements'
        },
        {
          triggers:'setup_doc_as_leader',
          description:'Prepare doc column to handle scene_update action SET_DOC_LEADER.'
        },
        {
          triggers:'setup_voc_as_slave',
          description:'Prepare voc column to handle scene_update action when VOC is in slave mode (switch display matches)'
        },

        /*

          Inlinks
          -------

          Extraction and loading of intext links from HTML elements like
          <span class="link vocab " data-id="vocab-468">E.M.E</span>

        */
        {
          triggers: 'extract_inlinks',
          description:'<hack:extract_inlinks> Cfr. module Layout'
        },
        {
          triggers: 'text_extract_inlinks',
          description:''
        },
        {
          triggers: 'fill_inlinks',
          description:'<hack: fill_inlinks> call various services',
          method:function(e){
            var a,
                services = [],
                clearables = {
                  'vocab':true,
                  'doc':true,
                  'star':true
                },
                item = this.get('scene_item');

            maze.log('hack: fill_inlinks, to be loaded:', e.data)

            for( var type in e.data ){

              if( e.data[type].length){
                a = e.data[type];
                delete clearables[type];
                if( type == "vocab" ) {
                  if (item && item.id && this.get('scene_column').leading === maze.VOC)
                    a.push(item.id.substr(7));


                  services.push({
                    service: 'get_vocabulary_item',
                    shortcuts:{
                      ids: maze.fn.arrayUnique( a.map(function(d) {
                        return 'voc_' + d
                      })).join()
                    }
                  });
                } else if( type == "doc" ) {
                  if (item && item.id && this.get('scene_column').leading === maze.DOC)
                    a.push(item.id.substr(5));

                  services.push({
                    service: 'get_documents_item',
                    shortcuts:{
                      ids: a.map(function(d) {
                        return 'doc_' + d
                      }).join()
                    }
                  });
                } else if( type == "star" ) {
                  //if (item && item.id && this.get('scene_column').leading === maze.DOC)
                  //  a.push(item.id.substr(4));

                  // services.push({
                  //   service: 'get_contributions',
                  //   ids: a
                  // });
                }
              }
            }

            if (services.length)
              this.request(services, {
                success: function() {
                  var scene_column = maze.domino.controller.get('scene_column')

                  maze.log('hack: fill_inlinks success, current slave:', scene_column.slave );

                  maze.domino.controller.dispatchEvent('clear', clearables);
                  maze.domino.controller.dispatchEvent('unlock');
                }
              });
            else
              this.dispatchEvent('unlock');
          }
        },
        {
          triggers: 'fill_references',
          description: 'triggered right after data_doc_updated, it examines the document array and search for global bibliographic items',
          method:function( event ){
            if( event.data.ref_ids ){
              this.request('get_references', { params:[ maze.settings.biblib_corpus, event.data.ref_ids, "mla", "html" ]});
              return;
            }

            if( this.get('scene_action') == maze.ACTION_STARTUP )
              return; // TODO check that return here is not dangerous.

            var docs = this.get('data_docContents'),
                ref_ids = [];

            // collect ref ids
            for(var i in docs){
              ref_ids = ref_ids.concat( docs[i].references );
            }
            ref_ids.length &&
              this.request('get_references', { params:[maze.settings.biblib_corpus, ref_ids, "mla", "html" ]});

          }
        },
        {
          triggers: 'build_references',
          description:'cfr columnDoc module'
        },
        /*

          Contribution Section
          every action has a specific save method.
        */
        {
          triggers: 'refill_paragraph',
          description: '<hack:refill_paragraph> params: Event.data.column and event.data.paragraph'
        },
        /*{
          triggers: 'rebuild_paragraph',
          description: 'Replace a HTML paragraph. Cfr Layout module'
        },*/
        {
          triggers:'save_bookmark',
          description: 'save a paragraph (bookmark action)',
          method:function(event){
            var selection = this.get('active_selection');
            this.request('manage_contribution.add-bookmark', {
              selection: selection,
              editor_init: event.data.editor_init
            });
          }
        },
        {
          triggers: 'delete_contribution',
          description: 'hack:delete_contribution removes a contribution. See manage_contribution.remove-contribution service',
          method: function(event) {
            var id = (event.data || {}).id ||
              this.die('"undefined" contribution id.');

            this.request('manage_contribution.remove-contribution', {
              id: id,
              column: (event.data || {}).column
            });
          }
        },
        {
          triggers: 'edit_contribution',
          description: 'deploy the contribution edition panel.',
          method: function(event) {
            var col = this.get('scene_column'),
                id = (event.data || {}).id ||
                  this.die('"undefined" contribution id.');

            if ((event.data || {}).scene_column)
              this.update('scene_column', {
                slave: event.data.scene_column.slave || col.slave,
                leading: event.data.scene_column.leading || col.leading
              });

            // Load the contribution:
            this.request('get_contributions', {
              open_editor: true,
              ids: [id]
            });
          }
        },
        {
          triggers: 'update_contribution',
          description: 'update a contribution. See manage_contribution.edit-objection service',
          method: function(event) {
            var id = (event.data || {}).id ||
              this.die('"undefined" current bookmark id.');

            this.request('manage_contribution.edit-objection', {
              stop_editing: event.data.stop_editing,
              objection: event.data.objection,
              callback: event.data.callback,
              content: event.data.content,
              id: id
            });
          }
        },
        {
          triggers: 'open_editor',
          method: function(event) {
            this.update('is_editing', true);
            this.dispatchEvent('clear', {
              cont: true
            });
            this.dispatchEvent('open_editor_2', event.data);
          }
        },
        {
          triggers: 'open_editor_2',
          method: function(event) {

            this.dispatchEvent('open_editor_3', event.data);
          }
        },
        {
          triggers: 'open_editor_3',
          method: function(event) {
            this.dispatchEvent('open_editor_execute', event.data);
          }
        },
        /*

          Lock/Unlock
          -----------

          Lock or unlock the UI
          Cfr. property ui_lock

        */
        {
          triggers: 'lock',
          method: function() {
            this.update('ui_lock', true);
          }
        },
        {
          triggers: 'unlock',
          method: function() {
            this.update('ui_lock', false);
          }
        },
        {
          triggers: 'lock_selection',
          method: function() {
            this.update('ui_lock_selection', true);
          }
        },
        {
          triggers: 'unlock_selection',
          method: function() {
            this.update('ui_lock_selection', false);
          }
        },
        {
          triggers: 'lockScroll',
          method: function() {
            this.update('scroll_lock', true);
          }
        },
        {
          triggers: 'unlockScroll',
          method: function() {
            this.update('scroll_lock', false);
          }
        },
        {
          triggers:'init_book',
          method:function() {
            // body...
            this.log( this.get('data_bookContents') );
          }
        },
        {
          triggers: 'loadLinks',
          method: function(e) {
            var services = [];

            // Voc:
            if (e.data.voc)
              services.push({
                service: 'get_voc',
                voc: e.data.voc
              });

            // Doc:
            if (e.data.doc)
              services.push({
                service: 'get_doc',
                doc: e.data.doc
              });

            // Comm:
            if (e.data.comm)
              services.push({
                service: 'get_comm',
                comm: e.data.comm
              });

            if (services.length)
              this.request(services, {
                success: function() {
                  maze.domino.controller.dispatchEvent('lock').dispatchEvent('linksLoaded');
                }
              });
          }
        },
        {
          triggers: 'fill_startup', // startup, search and notebook
          method: function(e) {
            var services = [
              {
                service: 'get_vocabulary',
                limit: 20
              },
              {
                service: 'get_documents',
                limit: 20
              }

            ];

            // override just for testing purposes
            //maze.domino.controller.dispatchEvent('unlock scrolling_text sticky_show');
            maze.domino.controller.request(services, {
              success: function() {
                maze.domino.controller.dispatchEvent('unlock scrolling_text sticky_show');
              }
            });
          }
        },
        {
          triggers: 'fill_search', // search ONLY
          method: function(e) {
            console.log('%c query ', 'background-color: gold', e.data.query)

            this.request('search_book', {
              shortcuts:{
                query: e.data.query
              }
            });
          }
        },
        {
          triggers: 'fill_notebook', // notebook TODO
          method: function(e) {
            var services = [
              {
                service: 'get_notes_book',
                query: e.data.query
              },
              {
                service: 'get_notes_vocabulary',
                query: e.data.query
              },
              {
                service: 'get_notes_documents',
                query: e.data.query
              },
              {
                service: 'get_notes_contributions',
                query: e.data.query
              }
            ];

            this.request(services, {
              success: function() {

                maze.domino.controller.dispatchEvent('unlock');
                maze.domino.controller.dispatchEvent('scrolling_text sticky_show');

              }
            });

          }
        },
        {
          triggers: 'clear',
          method: function(e) {
            this.log('clear :', e.data);
            for (var k in e.data)
              if (e.data[k])
                switch (k) {
                  case 'voc':
                  case 'vocab':
                    this.update({
                      data_vocContents: {},
                      data_vocIdsArray: []
                    });
                    break;
                  case 'doc':
                    this.update({
                      data_docContents: {},
                      data_docIdsArray: []
                    });
                    break;
                  case 'cont':
                  case 'star':
                    this.update({
                      data_contContents: {},
                      data_contIdsArray: []
                    });
                    break;
                  default:
                    this.die('oops, unrecognized key:', k);
                }
          }
        },
        {
          triggers: 'resize' // hook for window.resize
        },
        {
          triggers: 'resized' // Cfr. Resizor module
        },
        /**
         * INFINITE SCROLLINGS:
         * ********************
         */
        {
          triggers: 'infinite_scroll',
          method: function(e) {
            // Check lock
            //if (this.get('scroll_lock'))
            //  return;

            // Check action
            if (this.get('scene_action') !== maze.ACTION_STARTUP)
              return;

            switch (e.data.column) {
              case 'voc':
                this.request('get_vocabulary', {
                  limit: 10,
                  events: 'unlockScroll',
                  offset: this.get('data_vocIdsArray').length
                });

                break;
              case 'doc':
                this.request('get_documents', {
                  limit: 10,
                  events: 'unlockScroll',
                  offset: this.get('data_docIdsArray').length
                });
                break;
              default:
                this.warn('Oops, the wrong column has been called...');
                return;
            }

           // this.dispatchEvent('lockScroll', true);
          }
        }

      ],

      /*
        How to test services:
        var d = domino.instances('maze');
        d.request('service_name',{offset:10, limit:20, query:'query search'})

        or 

        maze.domino.controller.request('login', {data: {email: '***@**.**', password: '******'}})
      */
      services: [
        { id: 'login',
          type: 'POST',
          dataType: 'json',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          url: maze.urls.login,
          success: function(data, params) {
            if(data.status="ok") {
              this.update('authorization', maze.AUTHORIZATION_AUTHORIZED);
              this.update('user', data.result);
            }
            console.log('%c login success ', 'background: green; color: white');
            // reload user... header module
          },
          error: maze.domino.errorHandler
        },
        { id: 'logout',
          type: 'POST',
          dataType: 'json',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          url: maze.urls.logout,
          success: function(data, params) {
            console.log('%c logout success ', 'background: green; color: white');
            if(data.status != "ok")
              console.log('logout error during logout');
            // logout anyway
            this.update('authorization', maze.AUTHORIZATION_REQUIRED);
            location.href = '/';
          },
          error: maze.domino.errorHandler
        },
        {
          id: 'signup',
          type: 'POST',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          url: maze.urls.signup,
          success: function(data, params) {
            console.log(arguments)
            maze.toast(maze.i18n.translate('thank_you_and_check_your_email'), {
              stayTime: 10000
            });
          },
          error: function() {
            // start over the signup
            console.log(arguments)
          }
        },
        {
          id: 'activate',
          type: 'POST',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          url: maze.urls.activate,
          success: function(data, params) {
            if(data.user) {
              location.search ='';
              //this.dispatchEvent(['resize', 'scene__initialize']);
            }
          },
          error: function(message, xhr, params) {
            console.log('activate user failed with ', message, xhr.status);
          }
        },
        {
          id: 'lang',
          type: 'POST',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          url: maze.urls.lang,
          success: function(data, params) {
            location.reload();
            //console.log('language', data)
          },
          error: function(message, xhr, params) {
            console.log('activate user failed with ', message, xhr.status);
          }
        },
        {
          id: 'session',
          type: 'GET',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          url: maze.urls.session,
          success: function(data, params) { // launch init here
            this.update('lang', data.result.lang);
            maze.i18n.lang = data.result.lang;

            if(data.result.user) {
              this.update('user', data.result.user); // this is the user
            }
            this.dispatchEvent('session__initialized');
          },
          error: function(message, xhr, params) {
            console.log('This request cannot fail! activate user failed with ', message, xhr.status);
          }
        },
        { id: 'get_book',
          type: 'GET',
          dataType: 'json',
          url: maze.urls.get_book, //'/aime/js/display/items.json',// @todo replace with maze.urls.get_book,
          description: 'The service that deals with chapters, subheadings and paragraphs given as hiearachical trees. IdsArray store chapter objects',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          data: function(params) {
            var p = params || {},
                data = {};

            if (p.ids)
              data.ids = p.ids;

            if (p.limit)
              data.limit = p.limit;

            if (p.offset)
              data.offset = p.offset;

            if (p.query)
              data.query = p.query;

            return data;

          },
          error: maze.domino.errorHandler,
          success: function(data, params) {
            var p = params || {},
                result = maze.engine.parser.book(data),
                idsArray = [],
                contents = {};

              
            //data.result.chapters.shift();

            if (+p.offset > 0) {
              idsArray = this.get('data_bookIdsArray');
              contents = this.get('data_bookContents');
            }

            data.result.forEach(function(o) {
              idsArray.push(o.id);
              contents[o.id] = o;
            });

            this.update({
              data_bookIdsArray: idsArray,
              data_bookContents: contents
            });
          }
        },
        { id: 'search_book',
          type: 'GET',
          dataType: 'json',
          url: maze.urls.search_book,
          description: 'The service that search for matching chapter. Note that both a query param must be present!! THis will NOT modify IdsArray for chapter',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          success: function(data, params) {
            this.update('data_search_bookIdsArray', data.result.book);

            setTimeout(function(){
              maze.domino.controller.dispatchEvent('text_matches_highlight', {ids: data.result.book});

              if( maze.domino.controller.get('data_search_bookIdsArray').length +
                  maze.domino.controller.get('data_vocIdsArray').length +
                  maze.domino.controller.get('data_contIdsArray').length +
                  maze.domino.controller.get('data_docIdsArray').length == 0 ){
                    maze.toast( maze.i18n.translate('no results found' ),{stayTime:3000} );
                    maze.domino.controller.log( 'no results found' );
                  }
              maze.domino.controller.dispatchEvent('unlock scrolling_text sticky_show');
            }, 100);  

          }
        },
        { id: 'get_vocabulary_item',
          type: 'GET',
          dataType: 'json',
          url: maze.urls.get_vocabulary_item,
          description: 'The service that deals with SPECIFIED vocabulary items, via ids shortcut.',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          error: maze.domino.errorHandler,
          success: function(data, params) {
            var p = params || {},
                result = data.result,//maze.engine.parser.vocabulary(data, this.get('data_crossings')),
                idsArray = [],
                contents = {};
            // even if no results update the data (aka empty search results !)
            //if (result.terms.length) {
              if (+p.offset > 0) {
                idsArray = this.get('data_vocIdsArray');
                contents = this.get('data_vocContents');
              }

              result.forEach(function(o) {
                idsArray.push(o.slug_id);
                contents[o.slug_id] = o;
              });

              this.update({
                data_vocIdsArray: idsArray,
                data_vocContents: contents
              });

              this.update('infinite_voc', maze.STATUS_READY );

              // pierre added that to do as the following 'get_documents'
              // pierre didn't know why the 2 calls were differents
              // pierre wanted to solve bug of voc-data-not-empty after an empty results search !
              this.dispatchEvent('data_update',{
                namespace: 'voc',
                ids: idsArray,
                contents: contents
              });

              // HACK: Just added this to avoid success overriding...
              if (p.callback)
                setTimeout(p.callback, 0);
          }

        },
        { id: 'get_vocabulary',
          type: 'GET',
          dataType: 'json',
          url: maze.urls.get_vocabulary,
          description: 'The service that deals with vocabulary.',
          before: function(params, xhr) {
            xhr.withCredentials = true;
            // INFINIT SCROLLING needed
            // var p = params || {};

            // if (+p.offset > this.get('data_vocIdsArray').length + 1)
            //   return false;

            // this.update('infinite_voc', maze.STATUS_BUSY );
          },
          data: function(params) {
            var p = params || {},
                data = {
                  
                };

            if (p.ids)
              data.ids = p.ids;

            if (p.limit)
              data.limit = p.limit;

            if (p.query)
              data.query = p.query;

            if (p.offset)
              data.offset = p.offset;

            return data;

          },
          success: function(data, params) {
            
            var p = params || {},
                result = data.result,//maze.engine.parser.vocabulary(data, this.get('data_crossings')),
                idsArray = [],
                contents = {};
            // even if no results update the data (aka empty search results !)
            //if (result.terms.length) {
              if (+p.offset > 0) {
                idsArray = this.get('data_vocIdsArray');
                contents = this.get('data_vocContents');
              }

              result.forEach(function(o) {
                idsArray.push(o.slug_id);
                contents[o.slug_id] = o;
              });

              this.update({
                data_vocIdsArray: idsArray,
                data_vocContents: contents
              });

              this.update('infinite_voc', maze.STATUS_READY );

              // pierre added that to do as the following 'get_documents'
              // pierre didn't know why the 2 calls were differents
              // pierre wanted to solve bug of voc-data-not-empty after an empty results search !
              this.dispatchEvent('data_update',{
                namespace: 'voc',
                ids: idsArray,
                contents: contents
              });

              // HACK: Just added this to avoid success overriding...
              if (p.callback)
                setTimeout(p.callback, 0);
            //}
          },
          error: maze.domino.errorHandler,
        },
        { id: 'get_documents_item',
          type: 'GET',
          dataType: 'json',
          url: maze.urls.get_documents_item,
          description: 'The service that deals with SPECIFIED vocabulary items, via ids shortcut.',
          before: function(params, xhr) {
            xhr.withCredentials = true;
          },
          error: maze.domino.errorHandler,
          success: function(data, params) {
            var p = params || {},
                result = data.result,
                idsArray = [],
                contents = {};

            if (+p.offset > 0) {
              idsArray = this.get('data_docIdsArray');
              contents = this.get('data_docContents');
            }

            result.forEach(function(o) {
              idsArray.push(o.slug_id);
              contents[o.slug_id] = o;
            });
            this.update('infinite_doc', maze.STATUS_READY );
            this.dispatchEvent('data_update',{
              namespace: 'doc',
              ids: idsArray,
              contents: contents
            });
            // HACK: Just added this to avoid success overriding...
            if (p.callback)
              setTimeout(p.callback, 0);
          }
        },
        { id: 'get_documents',
          type: 'GET',
          dataType: 'json',
          url: maze.urls.get_documents,
          description: 'The service that deals with every kind of documents',
          before: function(params, xhr) {
            xhr.withCredentials = true;
            // INFINIT SCROLLING needed
            
            // var p = params || {};

            // if (+p.offset > this.get('data_docIdsArray').length + 1)
            //   return false;

            // this.update('infinite_doc', maze.STATUS_BUSY );
          },
          data: function(params) {
            var p = params || {},
                data = {};

            if (p.ids)
              data.ids = p.ids;

            if (p.limit)
              data.limit = p.limit;

            if (p.offset)
              data.offset = p.offset;

            if (p.query)
              data.query = p.query;

            return data;

          },
          success: function(data, params) {
            var p = params || {},
                result = data.result,
                idsArray = [],
                contents = {};

            /*
              Transform document children in two subgroups
              in order to fit the document template
            */
            result = result.map(function(d) {
              if(!d.children.length)
                return d;

              d.references = []; // search for biblib references to prefetch     

              for(var i in d.children)
                for(var j in d.children[i].children)
                  if(d.children[i].children[j].type == 'reference'){
                    d.references.push(''+d.children[i].children[j].biblib_id);
                  }
                    

              // get the first slide as "document preview"
              d.preview = d.children.shift();

              return d;
            });

            this.update('infinite_doc', maze.STATUS_READY );

            if (+p.offset > 0) {
              idsArray = this.get('data_docIdsArray');
              contents = this.get('data_docContents');
            }

            result.forEach(function(o) {
              idsArray.push(o.slug_id);
              contents[o.slug_id] = o;
            });

            this.dispatchEvent('data_update',{
              namespace: 'doc',
              ids: idsArray,
              contents: contents
            });
          }
        },
        { id: 'get_contributions',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.get_contribution,
          description: 'The service that deals with personal contribution.',
          before: function(params) {
            var p = params || {};

            if (+p.offset > 0 && !this.get('data_contIdsArray').length)
              return false;
          },
          data: function(params) {
            var p = params || {},
                data = {
                  
                };

            if (p.id)
              data.id = [p.id];
            else if (p.ids)
              data.ids = p.ids;

            if (p.limit)
              data.limit = p.limit;

            if (p.offset)
              data.offset = p.offset;

            if (p.query)
              data.query = p.query;

            return data;
          },
          success: function(data, params) {
            var p = params || {},
                result = maze.engine.parser.contributions(data),
                idsArray = [],
                contents = {};

            // Check callbacks:
            if (params.open_editor)
              this.dispatchEvent('open_editor', {
                contribution: result.contributions[0],
                id: (result.contributions[0] || {}).id || data[0][0].id
              });
            else {
              if (+p.offset > 0) {
                idsArray = this.get('data_contIdsArray');
                contents = this.get('data_contContents');
              }

              result.contributions.forEach(function(o) {
                idsArray.push(o.id);
                contents[o.id] = o;
              });

              this.update({
                data_contIdsArray: idsArray,
                data_contContents: contents
              });
            }
          }
        },
        { id: 'get_references',
          url: maze.urls.get_references,
          type: maze.rpc.type,
          error: maze.rpc.error,
          expect: maze.rpc.expect,
          contentType: maze.rpc.contentType,
          async: true,
          data: function( input ) {
            return maze.rpc.buildData('citation_by_rec_ids', input.params);
          },
          success: function(data, params) {
            this.dispatchEvent('build_references', {
              references: data.result
            });

          }
        },
        { id: 'manage_contribution.add-bookmark',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var p = params || {},
                selection = p.selection || {},
                data = {
                  action: 'add-bookmark',
                  ref_id: selection.id.replace(/[^\d]/g,''),
                  ref_content: Base64.encode(selection.content),
                  
                };

            if( selection.column == maze.TEXT )
              data.ref_type = 'book'
            else if( selection.column == maze.VOC )
              data.ref_type = 'vocabulary'
            else if( selection.column == maze.DOC )
              data.ref_type = 'document'
            else
              data.ref_type = 'contributions'

            return data;
          }, success: function(data, params) {
            if( data.status && data.status=="error" ){
              maze.error( data );
              maze.toast('problem occurred while saving the paragraph')
              return;
            }

            var source,
                parsedParagraph,
                contrib,
                p = params || {};

            source = data.item[0];
            parsedParagraph = maze.engine.helpers.paragraph(source);
            contrib = maze.engine.helpers.contributions(source);

            switch (this.get('scene_column').leading) {
              case maze.TEXT:
                var bookContents,
                    subheading;

                // Update the paragraph in properties:
                bookContents = this.get('data_bookContents');
                bookContents[source.chapter].subheadings.some(function(o) {
                  if (o.id == source.subhead) {
                    subheading = o;
                    return true;
                  } else
                    return false;
                });

                subheading.paragraphs = subheading.paragraphs.map(function(o) {
                  if (o.id == source.id)
                    return parsedParagraph;
                  else
                    return o;
                });

                this.update('data_bookContents', bookContents);

                break;
              case maze.VOC:
                var k,
                    j,
                    doBreak,
                    vocContents;

                // Update the paragraph in properties:
                vocContents = this.get('data_vocContents');

                for (k in vocContents) {
                  for (j in vocContents[k].paragraphs) {
                    if (vocContents[k].paragraphs[j].id === parsedParagraph.id)
                      vocContents[k].paragraphs[j] = parsedParagraph;
                      doBreak = true;
                      break;
                  }

                  if (doBreak)
                    break;
                }

                this.update('data_vocContents', vocContents);

                break;
              case maze.DOC:
                var k,
                    j,
                    doBreak,
                    docContents;

                // Update the paragraph in properties:
                docContents = this.get('data_docContents');

                for (k in docContents) {
                  for (j in docContents[k].paragraphs) {
                    if (docContents[k].paragraphs[j].id === parsedParagraph.id)
                      docContents[k].paragraphs[j] = parsedParagraph;
                      doBreak = true;
                      break;
                  }

                  if (doBreak)
                    break;
                }

                this.update('data_docContents', docContents);

                break;
            }

            // Dispatch related events:
            this.dispatchEvent('refill_paragraph', {
              column: (p.selection || {}).column,
              paragraph: parsedParagraph,
              contributions: contrib
            });

            if (p.editor_init)
              this.dispatchEvent('editor_init', {
                contribution: {
                  id: Math.max.apply(null, data.item[0].bookmarks.map(function(a) {
                    return +a[4];
                  }))
                }
              });
            else
              this.dispatchEvent('notebook_discard');
          }
        },
        { id: 'manage_contribution.edit-objection',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var p = params || {},
                id = p.id ||
                  this.die('"undefined" contribution id'),
                data = {
                  
                  action: 'edit-objection',
                  objection: Base64.encode(p.objection),
                  content: Base64.encode(p.content),
                  id: id
                };

            return data;
          }, success: function(data, params) {
            if( data.status && data.status=="error" ){
              maze.error( data );
              maze.toast('problem occurred while saving the paragraph')
              return;
            }

            var p = params || {},
                scene_column = this.get('scene_column'),
                contents,
                ids,
                contribution;

            contents = this.get('data_contContents');
            ids = this.get('data_contIdsArray');
            contribution = maze.engine.parser.contributions([data]).contributions.pop(); // it takes an array of contribution(s) object

            if(ids.indexOf() == -1)
              ids.push(contribution.id);

            contents[contribution.id] = contribution; // automatically reassign the edited contribution

            if (p.stop_editing)
              this.update('is_editing', false);

            this.update({
              data_contContents: contents,
              data_contIdsArray: ids
            });

            this.dispatchEvent('clear', {
              cont: true
            });
            if(scene_column.leading == maze.TEXT)
              this.dispatchEvent('text_extract_inlinks');
            else
              this.dispatchEvent('extract_inlinks');

            if (p.callback)
              p.callback(contribution);
          }
        },
        { id: 'manage_contribution.remove-contribution',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var data = {
                  action:'remove',
                  id: params.id,
                  
                };

            if (!('id' in params))
              this.die('Bookmark ID is missing.');

            return data;
          },
          success: function(data, params) {
            if (data.status && data.status == 'error') {
              maze.error( data );
              maze.toast('problem occurred while removing the contribution')
              return;
            }

            var source,
                parsedParagraph,
                contrib,
                bookContents,
                subheading,
                contContents,
                contIds,
                slave,
                actions,
                items,
                p = params || {},
                column = p.column;

            // Delete the contribution from the properties:
            contContents = this.get('data_contContents');
            delete contContents[p.id];

            contIds = this.get('data_contIdsArray').filter(function(id) {
              return +id !== +p.id;
            });

            this.update({
              data_contContents: contContents,
              data_contIdsArray: contIds
            });

            // Update the paragraph:
            source = data.item[0];

            parsedParagraph = maze.engine.helpers.paragraph(source);
            contrib = maze.engine.helpers.contributions(source);

            switch (this.get('scene_column').leading) {
              case maze.TEXT:
                var bookContents,
                    subheading;

                // Update the paragraph in properties:
                bookContents = this.get('data_bookContents');
                bookContents[source.chapter].subheadings.some(function(o) {
                  if (o.id == source.subhead) {
                    subheading = o;
                    return true;
                  } else
                    return false;
                });

                subheading.paragraphs = subheading.paragraphs.map(function(o) {
                  if (o.id == source.id)
                    return parsedParagraph;
                  else
                    return o;
                });

                this.update('data_bookContents', bookContents);

                break;
              case maze.VOC:
                var k,
                    j,
                    doBreak,
                    vocContents;

                // Update the paragraph in properties:
                vocContents = this.get('data_vocContents');

                for (k in vocContents) {
                  for (j in vocContents[k].paragraphs) {
                    if (vocContents[k].paragraphs[j].id === parsedParagraph.id)
                      vocContents[k].paragraphs[j] = parsedParagraph;
                      doBreak = true;
                      break;
                  }

                  if (doBreak)
                    break;
                }

                this.update('data_vocContents', vocContents);

                break;
              case maze.DOC:
                var k,
                    j,
                    doBreak,
                    docContents;

                // Update the paragraph in properties:
                docContents = this.get('data_docContents');

                for (k in docContents) {
                  for (j in docContents[k].paragraphs) {
                    if (docContents[k].paragraphs[j].id === parsedParagraph.id)
                      docContents[k].paragraphs[j] = parsedParagraph;
                      doBreak = true;
                      break;
                  }

                  if (doBreak)
                    break;
                }

                this.update('data_docContents', docContents);

                break;
              case maze.COMM:
                var scene_bookmark = this.get('scene_bookmark');

                slave = this.get('scene_column').slave;

                actions = {};
                actions[maze.TEXT] = maze.ACTION_SET_TEXT_LEADER;
                actions[maze.VOC] = maze.ACTION_SET_VOC_LEADER;
                actions[maze.DOC] = maze.ACTION_SET_DOC_LEADER;

                items = {};
                items[maze.VOC] = '#vocab-' + this.get('data_vocIdsArray')[0];
                items[maze.DOC] = '#doc-' + this.get('data_docIdsArray')[0];
                // check scene_bookmark

                console.log(parsedParagraph);
                // IF DELETING contrib when COMM in leader without scene_bookmark
                if(slave == maze.TEXT){
                  var paragraph = $("#"+parsedParagraph.id),
                      subheading = paragraph.closest('.subtitle'),
                      chapter =  subheading.closest('.chapter');

                  scene_bookmark = {
                    chapter: '#' + chapter.attr("id"),
                    subheading: '#' + subheading.attr("id"),
                    paragraph: '#' + parsedParagraph.id
                  };
                };

                this.dispatchEvent('scene_update', {
                  scene_action: actions[slave],
                  scene_column: {
                    leading: slave,
                    slave: maze.COMM
                  },
                  scene_bookmark: scene_bookmark,
                  scene_item: {
                    id: items[slave],
                    column: slave
                  }
                });

                column = this.get('scene_column').slave;

                break;
            }

            // Dispatch events
            this.dispatchEvent('notebook_discard');
            this.dispatchEvent('refill_paragraph', {
              column: column,
              paragraph: parsedParagraph,
              contributions: contrib
            });
          }
        },
        { id: 'manage_contribution.publish',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var p = params || {},
                data = {
                  action: 'publish',
                  
                  id: p.id || this.die('missing parameter "id"')
                };

            return data;
          },
          success: function(data, params) {
            if (data.status && data.status == 'error') {
              maze.error(data);
              maze.toast('problem occurred while publishing the contribution');
              return;
            }

            var p = params || {},
                contribution = maze.engine.parser.contributions([data.contribution]).contributions.pop();

            if (p.callback)
              p.callback(contribution);
          }
        },
        { id: 'manage_contribution.unpublish',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var p = params || {},
                data = {
                  action: 'unpublish',
                  
                  id: p.id || this.die('missing parameter "id"')
                };

            return data;
          },
          success: function(data, params) {
            if (data.status && data.status == 'error') {
              maze.error(data);
              maze.toast('problem occurred while unpublishing the contribution');
              return;
            }

            var p = params || {},
                contribution = maze.engine.parser.contributions([data.contribution]).contributions.pop();

            if (p.callback)
              p.callback(contribution);
          }
        },
        { id: 'manage_contribution.makepublic',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var p = params || {},
                data = {
                  action: 'makepublic',
                  
                  id: p.id || this.die('missing parameter "id"')
                };

            return data;
          },
          success: function(data, params) {
            if (data.status && data.status == 'error') {
              maze.error(data);
              maze.toast('problem occurred while making the contribution public');
              return;
            }

            var p = params || {},
                contribution = maze.engine.parser.contributions([data.contribution]).contributions.pop();

            if (p.callback)
              p.callback(contribution);
          }
        },
        { id: 'manage_contribution.makemoderated',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var p = params || {},
                data = {
                  action: 'makemoderated',
                  
                  id: p.id || this.die('missing parameter "id"')
                };

            return data;
          },
          success: function(data, params) {
            if (data.status && data.status == 'error') {
              maze.error(data);
              maze.toast('problem occurred while making the contribution moderated');
              return;
            }

            var p = params || {},
                contribution = maze.engine.parser.contributions([data.contribution]).contributions.pop();

            if (p.callback)
              p.callback(contribution);
          }
        },
        { id: 'manage_contribution.add-slide',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var p = params || {},
                data = {
                  action: 'add-slide',
                  
                  id: p.id || this.die('missing parameter "id"')
                };

            return data;
          },
          success: function(data, params) {
            if (data.status && data.status == 'error') {
              maze.error(data);
              maze.toast('problem occurred while adding the slide');
              return;
            }

            var p = params || {},
                contribution = maze.engine.parser.contributions([data.contribution]).contributions.pop();

            if (p.callback)
              p.callback(contribution);
          }
        },
        { id: 'manage_contribution.edit-slide',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var p = params || {};

            // last minute validation ? no more
            //if ((p.ref_url && !p.ref) || (!p.ref_url && p.ref))
            //  this.die('"ref" and "ref_url" or neither of them. Only one is not valid.')

            var data = {
              action: 'edit-slide',
              
              id: p.id || this.die('missing parameter "id"'),
              content: Base64.encode(p.content || ""), //this.die('missing parameter "content"')),
              ref_url: p.ref_url || "",
              ref: p.ref || ""
            };

            return data;
          }, success: function(data, params) {
            if (data.status && data.status == 'error') {
              // Check if the URL is not valid:
              if (((data.error || {}).action || '').match(/the media sent is not valid/)) {
                maze.toast('please enter a valid media URL');

              // If not, we do not know what it is:
              } else {
                maze.error(data);
                maze.toast('problem occurred while editing the slide');
                return;
              }
            } else {
              var p = params || {},
                  contribution = maze.engine.parser.contributions([data.contribution]).contributions.pop();

              if (p.callback)
                p.callback(contribution);
            }
          }
        },
        { id: 'manage_contribution.remove-slide',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.manage_contribution,
          data: function(params) {
            var p = params || {},
                data = {
                  action: 'remove-slide',
                  
                  id: p.id || this.die('missing parameter "id"')
                };

            return data;
          },
          success: function(data, params) {
            if (data.status && data.status == 'error') {
              maze.error(data);
              maze.toast('problem occurred while editing the slide');
              return;
            }

            var p = params || {},
                contribution = maze.engine.parser.contributions([data.contribution]).contributions.pop();

            if (p.callback)
              p.callback(contribution);
          }
        },
        { id: 'get_notes_book',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.get_notes_book,
          description: 'The service that search for user saved paragraphs.',
          data: function(params) {
            var p = params || {},
                data = {
                  
                };

            return data;
          }, success: function(data, params) {
            maze.domino.controller.dispatchEvent('text_matches_highlight', data);
          }
        },
        { id: 'get_notes_vocabulary',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.get_notes_vocabulary,
          description: 'The service that search for user saved paragraphs in vocab.',

          data: function(params) {
            var p = params || {},
                data = {
                  
                };

            return data;
          }, success: function(data, params) {
            var p = params || {},
                result = maze.engine.parser.vocabulary(data, this.get('data_crossings')),
                idsArray = [],
                contents = {};

            if (result.terms.length) {
              if (+p.offset > 0) {
                idsArray = this.get('data_vocIdsArray');
                contents = this.get('data_vocContents');
              }

              result.terms.forEach(function(o) {
                idsArray.push(o.id);
                contents[o.id] = o;
              });

              this.update({
                data_vocIdsArray: idsArray,
                data_vocContents: contents
              });

              // HACK: Just added this to avoid success overriding...
              if (p.callback)
                setTimeout(p.callback, 0);

            }

          }
        },
        { id: 'get_notes_documents',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.get_notes_documents,
          description: 'The service that search for user saved paragraphs in docs.',

          data: function(params) {
            var p = params || {},
                data = {
                  
                };

            return data;
          }, success: function(data, params) {
            var p = params || {},
                result = maze.engine.parser.documents(data),
                idsArray = [],
                contents = {};

            if (result.documents.length) {
              if (+p.offset > 0) {
                idsArray = this.get('data_docIdsArray');
                contents = this.get('data_docContents');
              }

              result.documents.forEach(function(o) {
                idsArray.push(o.id);
                contents[o.id] = o;
              });

              this.update({
                data_docIdsArray: idsArray,
                data_docContents: contents
              });

              // HACK: Just added this to avoid success overriding...
              if (p.callback)
                setTimeout(p.callback, 0);

            }

          }
        },
        { id: 'get_notes_contributions',
          type: 'POST',
          dataType: 'json',
          url: maze.urls.get_notes_contributions,
          description: 'The service that search for user saved contributions.',

          data: function(params) {
            var p = params || {},
              // here we will ask to only get 'notebook' contribs, aka those bookmarked
                data = {
                  
                };

            return data;
          }, success: function(data, params) {
            var p = params || {},
                result = maze.engine.parser.contributions(data),
                idsArray = [],
                contents = {};

            if (result.contributions.length) {
              if (+p.offset > 0) {
                idsArray = this.get('data_contIdsArray');
                contents = this.get('data_contContents');
              }

              result.contributions.forEach(function(o) {
                idsArray.push(o.id);
                contents[o.id] = o;
              });

              this.update({
                data_contIdsArray: idsArray,
                data_contContents: contents
              });

              // HACK: Just added this to avoid success overriding...
              if (p.callback)
                setTimeout(p.callback, 0);

            }

          }
        },
        {
          id: 'get_crossings',
          type: 'GET',
          url: maze.urls.get_crossings,
          description: 'load the list of the VOCs having crossings',
          data: function(params) {
            var p = params || {},
                data = {
                  
                  lang: maze.i18n.lang
                };

            return data;
          },
          success: function(data, params) {
            console.log('%c (Service)','background-color: gold', 'get_crossing success');
            this.update({
              data_crossings: {
                ids: data.map(function(d) { return d.id }),
                items: data
              }
            });
            if (params.callback)
                setTimeout(params.callback, 0);
          },
          error: function(data, params) {
            console.log('%c (Service)','background-color: crimson; color: white', 'get_crossing failed...');
          }
        }
      ]
    });

    /*

        instantiate Domino modules
        ---
    */
    maze.domino.controller.addModule( maze.domino.modules.More,null, {id:'more'});
    maze.domino.controller.addModule( maze.domino.modules.Login,null, {id:'login'});
    maze.domino.controller.addModule( maze.domino.modules.SignUp,null, {id:'signup'});
    maze.domino.controller.addModule( maze.domino.modules.StickyText,null, {id:'sticky_text'});
    maze.domino.controller.addModule( maze.domino.modules.Location, null, {id:'location'});
    maze.domino.controller.addModule( maze.domino.modules.Resizor, null, {id:'resizor'});
    maze.domino.controller.addModule( maze.domino.modules.Scroll, null, {id:'scroll'});
    maze.domino.controller.addModule( maze.domino.modules.Search, null, {id:'search'});
    maze.domino.controller.addModule( maze.domino.modules.Page, null, {id:'page'});
    maze.domino.controller.addModule( maze.domino.modules.Rangy,null, {id:'rangy'});
    
    maze.domino.controller.addModule( maze.domino.modules.Slider,null, {id:'slider'});

    maze.domino.controller.addModule( maze.domino.modules.Editor,null, {id:'editor'});
    maze.domino.controller.addModule( maze.domino.modules.Notebook,null, {id:'notebook'});

    maze.domino.controller.addModule( maze.domino.modules.Layout, [ maze.domino.controller ], {id:'layout'});


    /*

        Start!
        ---
    */
    maze.engine.init();

    maze.domino.controller.dispatchEvent('session__initialize');


   

  };

})(window, jQuery, domino);
