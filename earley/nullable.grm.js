parser_module_name = "./use_this_parser"

var parser_module = require(parser_module_name);
var addProduction = parser_module.addProduction;
var print_grammar = parser_module.print_grammar;
var earley_parse = parser_module.earley_parse;


var grammar = {};
exports.grammar = grammar;

addProduction(grammar, "S", ["A","B","A","B"]);
addProduction(grammar, "A", ["'a'"]);
addProduction(grammar, "A", ["E"]);
addProduction(grammar, "E", []);
addProduction(grammar, "B", ["'a'"]);
addProduction(grammar, "B", ["E"]);

var words = "a";
var start = "S";
console.log("parse of '" + words + "' into '" + start + "': " + earley_parse(words, grammar, start));

