(function(window, undefined) {
  var renderer = new marked.Renderer();

  renderer.link = function(href, title, text) {
    return '<span class="link vocab" data-id="'+ href.replace('voc_', 'vocab-')+'">' + text + '</span>';
  };

  /**
   * AIME-core Sentence Tokenizer
   * =============================
   *
   * Breaking raw text into sentences without lookbehinds...
   */

  var EXCEPTIONS = [
    'Mr',
    'Mrs',
    'Ms',
    'Mme',
    'Mlle',
    'Jr',
    'Dr',
    'Prof',
    'Sr',
    'Mgr',
    'St',
    'etc'
  ];

  var QUOTES = '«»„‟“”"',
      SIMPLE_QUOTES = '’‘`‛\'';

  var REGEX = new RegExp([
    "([.?!…]+)",
      "([" + QUOTES + "*_]?[*_]?)",
      "[\\s\\r\\n]+",
    "(?=[" + QUOTES + SIMPLE_QUOTES + "]?[A-Z0-9])"
  ].join(''), 'g');

  var QUOTE_REGEX = new RegExp('[' + QUOTES + ']', 'g'),
      PAREN_REGEX = /[(){}\[\]]/g,
      LIST_REGEX = /^[A-Z0-9]\s?[.]\s*$/,
      PITFALL_REGEX = /^[A-Za-z0-9]\s*\)/;

  function tokenize(s, exceptions) {
    var initialTokens = s.replace(REGEX, '$1$2\x1E').split('\x1E'),
        correctTokens = [],
        a,
        i,
        l;

    var exceptionsRegex = '(';

    for (i = 0, a = EXCEPTIONS.concat(exceptions), l = a.length; i < l; i++) {
      exceptionsRegex += a[i] + '\\.';
      if (i !== l - 1)
        exceptionsRegex += '|';
    }

    exceptionsRegex = new RegExp(exceptionsRegex + ')$');

    var memo = '',
        c;

    for (i = 0, l = initialTokens.length; i < l; i++) {
      c = initialTokens[i];

      // Searching for exceptions
      if (i !== l - 1 &&
          ((~c.search(new RegExp(exceptionsRegex))) ||
           (~c.search(LIST_REGEX)) ||
           (!~c.search(PITFALL_REGEX)) &&
           ((((memo + c).match(QUOTE_REGEX) || []).length % 2 !== 0) ||
            (((memo + c).match(PAREN_REGEX) || []).length % 2 !== 0)))) {
        memo += (memo ? ' ' : '') + c;
        continue;
      }

      correctTokens.push(memo + (c && memo ? ' ' : '') + c);
      memo = '';
    }

    return correctTokens;
  }


  window.MarkdownParser = function(text) {
    var sentences = tokenize(text).map(function(d) {
      var docs = d.match(/\{(doc_.*?)\}/)
      if(!docs)
        return d;
      return '<span class="link doc" data-id="'+ docs.pop().replace(/_/g, '-').replace(/,/g,' ')+'">' + d.replace(/\{doc_.*?\}/g,'') + '</span>';
    })


    //console.log('sentence', sentences)
    return marked(sentences.join(' '), {
      renderer: renderer,
      gfm: false
    });
  };
})(window);

