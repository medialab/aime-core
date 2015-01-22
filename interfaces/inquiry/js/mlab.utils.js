;(function() {
  'use strict';
  window.mlab = window.mlab || {};

  /**
   * A useful function to deeply check whether a "namespace" exists yet, and
   * that creates it is not.
   *
   * Use case:
   * *********
   *
   *  > mlab.pkg('a.b.c');
   *  > // Is equivalent to:
   *  > window.a = window.a || {};
   *  > a.b = a.b || {}
   *  > a.b.c = a.b.c || {}
   *
   * @param  {string} str The path of the namespace, with "." to separe the
   *                      different parts of the path.
   * @return {object}     Returns the related object.
   */
  mlab.pkg = function(str) {
    return str.split('.').reduce(function(o, s) {
      o[s] = o[s] || {};
      return o[s];
    }, window);
  };

  /**
   * Indexes an array on a specific key ("id", by default).
   *
   * Use case:
   * *********
   *
   *  > var o = mlab.array.index([
   *  >   {
   *  >     id: '1',
   *  >     content: 'abc'
   *  >   },
   *  >   {
   *  >     id: '2',
   *  >     content: 'def'
   *  >   }
   *  > ]);
   *  > // will return the following object:
   *  > // {
   *  > //   '1': {
   *  > //     id: '1'
   *  > //     content: 'abc'
   *  > //   },
   *  > //   '2': {
   *  > //     id: '2',
   *  > //     content: 'def'
   *  > //   }
   *  > // }
   *
   * @param  {array}   arr The array to index.
   * @param  {?string} key The key that will be used as index. If not
   *                       specified, 'id' is used instead. If null, then the
   *                       full objects is used as key (useful if the array is
   *                       made of strings or numbers).
   * @return {object}      Returns the object index.
   */
  mlab.pkg('mlab.array');
  mlab.array.index = function(arr, key) {
    arr = arr || [];

    return arr.reduce(function(res, v) {
      res[key !== null ? v[key || 'id'] : v] = v;
      return res;
    }, {});
  };

  /**
   * Returns a copy of the original array, but with only unique values, with
   * their last position in the original array.
   *
   * Use case:
   * *********
   *
   *  > var a = mlab.array.unique([0, 1, 1, 2, 3, 1]);
   *  > // will return the following array:
   *  > // [0, 2, 3, 1]
   *
   * @param  {array} arr The original array.
   * @return {array}     Returns the new array.
   */
  mlab.array.unique = function(arr) {
    arr = arr || [];
    var i,
        l = arr.length,
        res = [];

    for (i = 0; i < l; i++)
      if (arr.lastIndexOf(arr[i]) === i)
        res.push(arr[i]);

    return res;
  };

  /**
   * A custom JavaScript date parser, using the custom masks stored in
   * mlab.date.masks.
   *
   * Use cases:
   * **********
   *
   *  > mlab.date('1993-04-30 13:37:00');
   *  > mlab.date('1993-04-30');
   *  > mlab.date('19930430');
   *
   * @param  {string} s The string date to parse.
   * @return {date}     The JavaScript date object.
   */
  mlab.date = function(s) {
    var d,
        match;
    s = s.toString();

    // Try custom masks:
    if (
      mlab.date.masks.some(function(obj){
        match = s.match(obj.regex);
        if (match) {
          d = obj.fn(match);
          return true;
        }

        return false;
      })// ||
      //(d = new Date(s))
    ) {
      if (isNaN(d.valueOf()))
        throw new Error('Unvalid date: ' + s);
      else
        return d;
    } else
      throw new Error('Unrecognized date: ' + s);
  };
  mlab.date.masks = [
    {
      // Example: "1993-04-30 13:37:00"
      regex: /([0-9]+)-([0-9]+)-([0-9]+) ([0-9]+):([0-9]+):([0-9]+)/,
      fn: function(match) {
        return new Date(
          +match[1],
          +match[2]-1,
          +match[3],
          +match[4],
          +match[5],
          +match[6]
        );
      }
    },
    {
      // Example: "1993-04-30"
      regex: /([0-9]+)-([0-9]+)-([0-9]+)/,
      fn: function(match) {
        return new Date(
          +match[1],
          +match[2]-1,
          +match[3]
        );
      }
    },
    {
      // Example: "19930430"
      regex: /([0-9]{4})([0-9]{2})([0-9]{2})/,
      fn: function(match) {
        return new Date(
          +match[1],
          +match[2]-1,
          +match[3]
        );
      }
    }
  ];

  /**
   * Just some useful functions for functional programming:
   */
  mlab.pkg('mlab.fn');
  mlab.fn.id = function(v) { return v; };
  mlab.fn.nil = function() {};
})();
