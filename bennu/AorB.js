var parse = require('bennu').parse;
var text = require('bennu').text;


var aOrB = parse.either(
    text.character('a'),
    text.character('b'));

//console.log(parse.run(aOrB, 'j')); // 'b'

// Modified example from 'parse.either'
var p = parse.either(
    parse.attempt(parse.next(
        text.character('a'),
        text.character('b'))),
    parse.next(
        text.character('a'),
        text.character('c')));

console.log(parse.run(p, 'ab')); // b
console.log(parse.run(p, 'ac')); // c
//console.log(parse.run(p, 'z')); // Error! MultipleError 
