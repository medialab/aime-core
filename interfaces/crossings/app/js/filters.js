'use strict';

/* Filters */

angular.module('myApp.filters', ['underscore'])
	
	// then use like: 
	// data-mode2="{{ state.hovermodecross | split:'-':1 }}"
	.filter('split', function() {
        return function(input, splitChar, splitIndex) {
            // do some bounds checking here to ensure it has that index
            var sp = input.split(splitChar);
            if(input && splitIndex<sp.length)
                return sp[splitIndex];
            else 
                return input;
        }
    })

    .filter('replace', function() {
        return function(text,char,replacedchar) {
            if(text)
                return text.replace(char,replacedchar);
        }
    })

    .filter('t', ['Api', function(Api) {
        return function(str,lang) {
            if(lang=='fr') {
                var trans = Api.getTranslations();
                if(trans.hasOwnProperty(str))
                    return trans[str].replace("\n","<br/>");
                else
                    return str;
                    //return "-no available tranlation-";
            } else {
                return str.replace("\n","<br/>");
            }
        };
    }])

    .filter('formatdate', function() {
        return function(date) {
            return moment(date).format("DD/MM/YYYY");
        };
    })

    // order cells array by 'order' key, and show/hide choosen based on status (of scenar)

    // 2 ways !

    // 1) hide non choosen cells within ng-repeat template:
    //      ng-repeat="c in cells | orderBy:'-order'"
    //      ng-show="c.choosen || scenar.status=='unpublished'"
    
    // 2) do it with a custom filter to trigger shapeshift at the end
    //      ng-repeat="c in cells | cellsOrderer:scenar.status"

    // .filter('cellsOrderer', ['_', function(_) {
    //     return function(items,status) {
    //         var sorted = items;
    //         if(status=='published') {
    //             sorted = _.filter(sorted, function(e) {
    //                 return e.choosen;
    //             });
    //         }
    //         sorted =  _.sortBy(sorted, function(e) {
    //             //console.log(e.order);
    //             if(e.order==-1) return items.length;
    //             else return e.order;
    //         });
    //         console.log("FILTER DONE ("+status+"). rearranged:");
    //         console.log(_.map(sorted,function(e) {
    //             return e.order;
    //         }));
    //         $(".mosaic").trigger("ss-rearrange");
    //         return sorted;
    //     };
    // }])

    // filter array with elements where field=value
    .filter('with', function() {
        return function(items,field,value) {
            var result = [];
            angular.forEach(items, function(v,k) {
                if(v.hasOwnProperty(field) && v[field]==value) {
                    result.push(v);
                }
            });
            return result;
        };
    })

    .filter('middot', function() {
        return function(str) {
            return str.replace("-","·");
        };
    });

    // .filter('modandcut', function () {
    //     return function (value, wordwise, max, tail) {
    //         if (!value) return '';

    //         max = parseInt(max, 10);
    //         if (!max) return value;
    //         if (value.length <= max) return value;

    //         value = value.substr(0, max);
    //         if (wordwise) {
    //             var lastspace = value.lastIndexOf(' ');
    //             if (lastspace != -1) {
    //                 value = value.substr(0, lastspace);
    //             }
    //         }
    //         return value + (tail || ' …');
    //     };
    // });


    // .filter('cut', function () {
    //     return function (value, wordwise, max, tail) {
    //         if (!value) return '';

    //         max = parseInt(max, 10);
    //         if (!max) return value;
    //         if (value.length <= max) return value;

    //         value = value.substr(0, max);
    //         if (wordwise) {
    //             var lastspace = value.lastIndexOf(' ');
    //             if (lastspace != -1) {
    //                 value = value.substr(0, lastspace);
    //             }
    //         }
    //         return value + (tail || ' …');
    //     };
    // });

    /*
	.filter('interpolate', ['version', function(version) {
    	return function(text) {
      		return String(text).replace(/\%VERSION\%/mg, version);
    	}
    }]);*/


