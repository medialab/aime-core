;(function(undefined) {
  'use strict'

  mlab.pkg('maze.domino.modules');
  maze.domino.modules.Slider = function() {
    domino.module.call(this);

    var _mod = this,
        sliders = {} // key: selector and value: actual item


    var SliderItem = function(options){
      var _self = this;

      this.settings = {
        slides: [],//slides to be dinamically adedd at startup via add_slide func
        selector: '',
        type: '',
        slide: 0 // initial slide
      };

      this.cursor = 0;
      this.howmany = 0;

      this.target;
      this.title;
      this.nav;
      this.navcur;
      this.wrapper;
      this.left;
      this.right;

      this.is_enabled = false;


      this.init = function(options){
        $.extend(_self.settings, options);
        maze.log('(Slider) SliderItem.init:', _self.settings);
        
        _self.target  = $(_self.settings.selector);


        _self.nav     = _self.target.find('.slides-nav');
        _self.navcur  = _self.nav.find('.cursor');
        _self.wrapper = _self.target.find('.slides-wrapper[data-length]');
        _self.title   = _self.target.find('.subtitle');

        _self.left = _self.nav.find('.left');
        _self.right = _self.nav.find('.right');

        _self.howmany  = _self.wrapper.find(".slide").length; 
        _self.cursor  = _self.wrapper.attr('data-current-index') || _self.settings.slide; // initial slide

        if(_self.settings.slides.length)
          for(var i = 0, l = _self.settings.slides.length; i < l; i++)
            _self.add_slide({
              template: maze.engine.template.slide(_self.settings.slides[i]),
              slideTo: false
            });


        if(_self.howmany > 0){
          maze.log('(Slider) SliderItem.init, length:', _self.howmany);
          _self.enable();
          _self.adjust();
        };
      };


      this.adjust = function() { maze.log('(Slider) SliderItem.adjust, length:',_self.howmany);
          
        var placeholders = [];

        for(var i=0; i<_self.howmany; i++) {
          placeholders.push('<div class="placeholder" style="width:' + (100/_self.howmany) + '%;left:' + (i/_self.howmany * 100) + '%" data-index="' + i + '"><div class="inner"></div></div>' );
        };

        _self.nav.find('.placeholders').empty().append(placeholders.join(''));
        _self.navcur.css({
          width: (100/_self.howmany) + '%'
        });

        if(_self.howmany > 1){
          _self.show();
          _self.wrapper.addClass('with-navigation');
        } else {
          _self.hide();
          _self.wrapper.removeClass('with-navigation');
        };
      };


      this.moveto = function(index) {
        if(!_self.is_enabled){
          maze.log('(Slider) SliderItem.moveto, unable to moveto! received:',index,'- is enabled:',_self.is_enabled);
          return;
        }
          
        var cursor = index < 0? 0: index > _self.howmany-1? _self.howmany-1: index, // normalize curor
            distance = Math.abs(cursor - _self.cursor),
            slide = _self.wrapper.find('.slide[data-index=' + cursor +']'),
            slide_height = slide.length? slide.height() + 30: 0;

        maze.log('(Slider) SliderItem.moveto, received:',index,'- cursor:', cursor, '- n.slides:', _self.howmany);

        _self.cursor = cursor;
        _self.wrapper.attr('data-current-index', _self.cursor);

        if(_self.cursor == 0)
          maze.move.fadeout(_self.left);
        else
          maze.move.fadein(_self.left);

        if(_self.cursor == _self.howmany-1)
          maze.move.fadeout(_self.right);
        else
          maze.move.fadein(_self.right);

        

        slide_height > 0 &&
          _self.wrapper.closest('.slides-box').stop().animate({
            height: slide_height
          }, {
            easing: maze.move.easing,
            duration:500,
            queue:false
          });

        _self.wrapper.animate({
          left: (-_self.cursor * 100) + '%'
        },{
          easing: maze.move.easing,
          duration: 550,
          queue: false
        });
      
        _self.navcur.animate({
          left: (_self.cursor/_self.howmany * 100) + '%'
        },{
          easing: maze.move.easing,
          duration: 550,
          queue: false
        });

        _self.onscroll();
      }; // endof moveto


      this.prev = function() {
        _mod.dispatchEvent('slider_to',{
          selector: _self.settings.selector,
          index: +_self.cursor -1
        });
      } // endof prev


      this.next = function() {
        _mod.dispatchEvent('slider_to',{
          selector: _self.settings.selector,
          index: +_self.cursor +1
        });
      }; // endof next


      this.onscroll = function(event) {
        var diff = _self.wrapper.offset().top - _self.title[0].scrollHeight - 100,
          offset = diff < 0? -diff: 0;
      
        offset != _self.previous_offset && _self.nav.css({ top: offset });
        _self.previous_offset = offset;
      }; // endof onscroll


      this.check = function() {
        maze.log('(Slider) SliderItem.check, is_enabled:', _self.is_enabled);
        _self.nav.css({ top: 0 });
        if(_self.is_enabled)
          return;
      }


      this.enable = function() {
        maze.log('(Slider) SliderItem.enable:', _self.is_enabled? 'already enabled, skipping ...': 'enabling ...');
        if(_self.is_enabled)
          return;
        _self.is_enabled = true;

        $(window).on('keyup', _self.onkeyup);

        _self.left.on('click', _self.prev);
        _self.right.on('click', _self.next);
        _self.target.closest(".wrapper").scroll(_self.onscroll);
      }; // endof enable


      this.hide = function() { maze.log('(Slider) SliderItem.hide, length:',_self.howmany);
        _self.onscroll();
        _self.nav.animate({
          opacity: 0
        }, {
          easing:maze.move.easing,
          duration:230,
          queue:false
        });
      }; // endof hide


      this.show = function() { maze.log('(Slider) SliderItem.show, length:',_self.howmany);
        _self.onscroll();
        _self.nav.animate({
          opacity: 1
        }, {
          easing:maze.move.easing,
          duration:230,
          queue:false
        });
      }; // endof show


      this.add_slide = function(options) {
        var slide = $(options.template)
          .attr('data-index', _self.howmany )
          .css('left',( _self.howmany*100 ) + '%');

         maze.log('(Slider) SliderItem.add_slide, selector:', options.selector);
        _self.howmany++;

        _self.wrapper
          .append(slide)
          .attr('data-length', _self.howmany);
        
        _self.adjust();
        _self.enable();
        _self.show();

        if(options.slideTo)
          _self.moveto(_self.howmany -1);
      }; // endof add _slide


      this.remove_slide = function(options) {
        var slide = options.index? _self.wrapper.find('.slide[data-index=' + options.index + ']'): options.slide; // either an index or a physical jquery object slide

        slide.length && maze.move.fadeout(slide, {
          callback: function(){
            slide.remove();
            _self.howmany--;

            _self.wrapper.find('.slide').each(function(i,e){
              $(this)
                .css('left', ( i *100 ) + '%' )
                .attr('data-index', i);
            });

            _self.adjust();
            _self.moveto(Math.min(_self.cursor, _self.howmany -1));
          }
        });
      }; // endof remove_slide


      this.init(options);
    };


    this.triggers.events.slider_init = function(controller, event) {
      var name = event.data.selector;

      maze.log('(Slider) @slider_init, selector:', name);
      if(sliders[name])
        delete sliders[name];
      
      sliders[name] = new SliderItem(event.data);
    };


    this.triggers.events.execute_slider_to = function(controller, event) {
      maze.log('(Slider) @execute_slider_to, selector:', event.data.selector);
      
      sliders[event.data.selector] &&
        sliders[event.data.selector].moveto(event.data.index);
    };


    this.triggers.events.slider_add_slide =function(controller, event) {
      maze.log('(Slider) @slider_add_slide, selector:', event.data.selector);
      
      sliders[event.data.selector] &&
        sliders[event.data.selector].add_slide(event.data);
    };

    /*
      Remove a slider giver an event.data.slide (cfr slider_to event)
      and re-assign the index to sliders
      It requires event.data.index integer slide index
    */
    this.triggers.events.slider_remove_slide = function(controller, event) {
      maze.log('(Slider) @slider_remove_slide, selector:', event.data.selector);
      
      sliders[event.data.selector] &&
        sliders[event.data.selector].remove_slide(event.data);
    };
  };

})();
