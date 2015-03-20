#!/usr/bin/env seed

// This is the unit-map-join formulation of the Writer monad.
//  unit is often called return
//  map is called fmap in haskel

var unit = function(value) { return [value, ''] };

// takes a function and a monad, returns a monad;
var map = function(f,monad) {
    var value = monad[0];
    var log = monad[1];
    var result = f(value);
    

// (fmap f) m ≡ m >>= (\x -> return (f x))
// join n ≡ n >>= id

//  m >>= g ≡ join ((fmap g) m)

