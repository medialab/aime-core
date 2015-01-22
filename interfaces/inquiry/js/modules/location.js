;(function(undefined) {
  'use strict'

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Location = function() {
    domino.module.call(this);

    var _lastHash,
        _self = this,
        _dry = {
          scene_action: {
            shortcut: 'a',
            defaultValue: maze.ACTION_STARTUP
          },
          scene_bookmark: {
            shortcut: 'b',
            defaultValue: {}
          },
          scene_column: {
            shortcut: 'c',
            defaultValue: {}
          },
          scene_item: {
            shortcut: 'i',
            defaultValue: {}
          },
          scene_query: {
            shortcut: 'q',
            defaultValue: ''
          },
          /*scene_glossary: {
            shortcut: 'g',
            defaultValue: []
          },*/
          scene_slide: {
            shortcut: 's',
            defaultValue: '0'
          }
        },
        _expand = Object.keys(_dry).reduce(function(res, k) {
          res[_dry[k].shortcut] = k;
          return res;
        }, {});

    // Just a small tool to identify whether
    function isDisplayable(v) {
      switch (domino.struct.get(v)) {
        case 'object':
          return Object.keys(v).length > 0;
        case 'array':
          return v.length > 0;
        default:
          return !!v;
      }
    }

    function encode(o) {
      var k,
          o2 = {};

      o = o || {};
      for (k in o)
        if (isDisplayable(o[k]))
          o2[_dry[k] ? _dry[k].shortcut : k] = o[k];

      return decodeURIComponent($.param(o2));
    }

    function decode(s) {
      var k,
          o = $.deparam.fragment(),
          o2 = {};
      for (k in o)
        o2[_expand[k] || k] = o[k];

      for (k in _dry)
        o2[k] = (k in o2) ? o2[k] : _dry[k].defaultValue;

      return o2;
    }

    function updateHash(controller) {
      var sha = {
        scene_bookmark: controller.get('scene_bookmark'),
        scene_action: controller.get('scene_action'),
        scene_column: controller.get('scene_column'),
        scene_item: controller.get('scene_item'),
        scene_slide: controller.get('scene_slide'),
        scene_query: controller.get('scene_query'),
        //scene_glossary: controller.get('scene_glossary')
      };

      _lastHash = encode(sha);
      window.location.hash = _lastHash;
    }

    function updateScene() {
      // Check that this update is not actually caused by the same Location
      // module:
      if (window.location.hash.substr(1) === _lastHash)
        return;
      
      var hash = decode(window.location.hash.substr(1));
      _self.log('Hash update:', hash);
      _self.dispatchEvent('scene_update', hash);
    }

    this.triggers.events.scene_stored = updateHash;
    this.triggers.events.scene_updated = updateHash;
    this.triggers.events.init = updateScene;

    $(window).on('hashchange', updateScene);
  };
})();
