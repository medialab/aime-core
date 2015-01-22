( function( $, w, undefined ){
	'use strict';
	var maze = w.maze || {};

	maze.ACTION_SEARCH = 'SEARCH';

	maze.search = {};

	maze.search.click = function( event ){
		maze.trigger( maze.events.story.push, new maze.story.Scene({"action": maze.ACTION_SEARCH, "query": $("#field").val()}) );
	}

	maze.search.init = function(){
		maze.on("click", "#button", maze.search.click );
		$("#field").keypress(function (e) {

			if (e.which == 13) {
				maze.search.click();
			
			e.preventDefault();
			return false;
		}
		});
	}

	maze.search.clean = function(){
		maze.controllers.scroll.boxes.text.find(".match").removeClass("match");
		maze.controllers.scroll.boxes.text.find("span.highlight").each(function(){
			var p = this.parentNode;
			p.replaceChild(p.firstChild, p);
			p.normalize();
		});
	}

})( jQuery, window);