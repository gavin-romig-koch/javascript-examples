
var Nothing = {
    bind: function (other) {
        return Nothing;
    },
    toString: function() { return "Nothing"; }
}


var Just = function(v) {
    return {
        bind: function (other) {
            return other(v);
        },
        toString: function() { return String(v); }
    }
}


var add = function (mx, my) {
    return mx.bind( function (x) { return my.bind( function (y) { return Just(x+y); }) } );
}
    

console.log(String(  add(Just(2), add(Nothing, Just(10) ) ) ) );
console.log(String(Nothing));



