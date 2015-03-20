
parser_module_name = "./use_this_parser"

var parser_module = require(parser_module_name);
var addProduction = parser_module.addProduction;
var print_grammar = parser_module.print_grammar;
var earley_parse = parser_module.earley_parse;


var grammar2 = {};
exports.grammar2 = grammar2;

addProduction(grammar2, "S", ["'1'"]);
addProduction(grammar2, "S", ["'2'"]);

var start = "S";
var words = "2";
console.log("parse of '" + words + "' into '" + start + "': " + earley_parse(words, grammar2, start));
