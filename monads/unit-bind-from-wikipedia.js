#!/usr/bin/env seed

// This is the unit-bind formulation of the Writer monad
// unit is often called return

var unit = function(value) { return [value, ''] };

var bind = function(monad, callback) {
    var value  = monad[0],
    log = monad[1],
    result = callback(value);
    return [ result[0], log + result[1] ];
};

var pipeline = function(monad, functions) {
    for (var i = 0, n = functions.length; i < n; i++) {
        monad = bind(monad, functions[i]);
    }
    return monad;
};

var squared = function(x) {
    return [x * x, 'was squared.'];
};
 
var halved = function(x) {
    return [x / 2, 'was halved.'];
};

print(pipeline (unit(4), [squared, halved])); // [8, "was squared.was halved."]

var id = function(x) { return x; }

var map = function(m,f) {
    return bind(m, function(x) { return unit(f(x)); });
}

var join = function(n) {
    return bind(n,id);
}


