parser_module_name = "./use_this_parser"

var parser_module = require(parser_module_name);
var addProduction = parser_module.addProduction;
var print_grammar = parser_module.print_grammar;
var earley_parse = parser_module.earley_parse;


var grammar = {};
exports.grammar = grammar;

addProduction(grammar, "S", ["S","A"]);
addProduction(grammar, "S", []);
addProduction(grammar, "A", []);

var words = "";
var start = "S";
console.log("parse of '" + words + "' into '" + start + "': " + earley_parse(words, grammar, start));
