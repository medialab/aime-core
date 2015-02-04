(function(window, undefined) {
  var renderer = new marked.Renderer();

  renderer.link = function(href, title, text) {
    //console.log('alskjdlkasjdlkajs dlasj dlkasjdlkaj ld',href, title, text);
    // transform voc_234 in vocab-269
    return '<span class="link vocab" data-id="'+ href.replace('voc_', 'vocab-')+' ">' + text + '</span>';
  };

  window.MarkdownParser = function(text) {
    return marked(text, {
      renderer: renderer
    });
  };
})(window);

