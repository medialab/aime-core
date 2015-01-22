/*
	Rangy selection library wrapper
	http://rangy.googlecode.com/svn/trunk/demos/highlighter.html
	https://code.google.com/p/rangy/
*/
( function( $, w, undefined ){ var maze = w.maze || {}; maze.rangy = {};

	maze.rangy.highlighter = false;

	maze.rangy.init = function(){ maze.log("[maze.rangy.init]");
		rangy.init();
		maze.rangy.highlighter = rangy.createHighlighter();
		
		maze.rangy.highlighter.addClassApplier(rangy.createCssClassApplier("highlight", {
			ignoreWhiteSpace: true,
			tagNames: ["span", "a"]
		}));

		maze.rangy.highlighter.addClassApplier(rangy.createCssClassApplier("note", {
			ignoreWhiteSpace: true,
			elementTagName: "span",
			elementProperties: {
				href: "#",
				onclick: function() {
					/*var highlight = highlighter.getHighlightForElement(this);
					if (window.confirm("Delete this note (ID " + highlight.id + ")?")) {
						highlighter.removeHighlights( [highlight] );
					}
					return false;*/
				}
			}
		}));

	}

	maze.rangy.note ={};

	maze.rangy.note.highlight = function() {
		maze.rangy.highlighter.highlightSelection("note");
	}


})( jQuery, window);