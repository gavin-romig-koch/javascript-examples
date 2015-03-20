parser_module_name = "./use_this_parser"

var parser_module = require(parser_module_name);
var addProduction = parser_module.addProduction;
var print_grammar = parser_module.print_grammar;
var earley_parse = parser_module.earley_parse;


var grammar = {};
exports.grammar = grammar;

addProduction(grammar, "P", []);
addProduction(grammar, "P", ["S", "';'", "P"]);
addProduction(grammar, "S", ["S", "'+'", "M"]);
addProduction(grammar, "S", ["S", "'-'", "M"]);
addProduction(grammar, "S", ["M"]);
addProduction(grammar, "M", ["M", "'*'", "T"]);
addProduction(grammar, "M", ["M", "'/'", "T"]);
addProduction(grammar, "M", ["T"]);
addProduction(grammar, "T", ["N"]);

addProduction(grammar, "N", ["N","D"]);
addProduction(grammar, "N", ["D"]);

addProduction(grammar, "D", ["'1'"]);
addProduction(grammar, "D", ["'2'"]);
addProduction(grammar, "D", ["'3'"]);
addProduction(grammar, "D", ["'4'"]);
addProduction(grammar, "D", ["'5'"]);
addProduction(grammar, "D", ["'6'"]);
addProduction(grammar, "D", ["'7'"]);
addProduction(grammar, "D", ["'8'"]);
addProduction(grammar, "D", ["'9'"]);
addProduction(grammar, "D", ["'0'"]);

var words = "75/4-3*1000;";
var start = "P";
console.log("parse of '" + words + "' into '" + start + "': " + earley_parse(words, grammar, start));
