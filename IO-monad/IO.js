//#!/bin/env node

simpleio = require('../simpleio');

// The IO<a> type, the IO monad, is implemented as a function
// which takes a copy of the whole WORLD, modifies it as necessary,
// and returns a new copy of the whole WORLD.
//
// Of course the whole world won't fit in a variable, so we use a pointer.
// And to allow update in place we must insure that there is only one
// copy of this pointer.  We must insure that it is never dup'ed, so that
// the order of changes to it are strictly ordered.


World = {
    "isWorld" : function () { 
        if (this != World) {
            console.trace();
            throw "World is not World: " + this;
        }
        return this;
    }
}

function checknotworld(a) {
    if (a == World) {
        console.trace();
        throw "World Found where NOT WANTED: " + a;
    }
    return a;
}


function IORes(a,w) {
    return { 'a': a, 'w' : w.isWorld() };
}
exports.IORes = IORes;

function unitIO(a) {
    checknotworld(a);
    return function (w) {
        return IORes(a,w.isWorld()); 
    }
}
exports.unitIO = unitIO;

function bindIO(m, k) {
    checknotworld(m);
    checknotworld(k);
    return function (w) {
        var tmp = m(w.isWorld());
        return k(tmp.a)(tmp.w.isWorld());
    }
}
exports.bindIO = bindIO;

composeIO = exports.composeIO = function(a,b) {
    checknotworld(a);
    checknotworld(b);
    return function(w) {
        var tmp = a(w.isWorld());
        return b(tmp.w.isWorld());
    }
}

putcIO = exports.putcIO = function (a) {
    checknotworld(a);
    return function(w) {
        simpleio.putc(a);
        return IORes(null, w.isWorld());
    }
}

getcIO = exports.getcIO = function (w) {
    return IORes(simpleio.getc(),w.isWorld());
}

runIO = exports.runIO = function (x) { 
    checknotworld(x);
    return x(World);
}

try {
run = runIO
getc = getcIO
putc = putcIO
bind = bindIO
unit = unitIO
compose = composeIO

xxIO = compose(
putc('G'),    bind(
getc,         function (v) { return compose(
putc('a'),    compose(
putc('v'),    compose(
putc(v),      compose(
putc('n'),    bind(
putc('\n'),   unit
)))))}))

run(xxIO);

} catch (err) {
    console.log(err);
}


