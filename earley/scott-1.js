//
// A Javascript implementation of the Earley Parser described in 
//    http://en.wikipedia.org/wiki/Earley_parser (fetched Apr 5, 2014)
//
// 
// Adapted by Daniel Jurafsky and James H. Martin from:
//    Jurafsky, D. (2009). Speech and Language Processing: An Introduction to Natural Language Processing, Computational Linguistics, and Speech Recognition. Pearson Prentice Hall. ISBN 9780131873216.
// 
// 
// function EARLEY-PARSE(words, grammar)
//     ENQUEUE((γ → •S, 0), chart[0])
//     for i ← from 0 to LENGTH(words) do
//         for each state in chart[i] do
//             if INCOMPLETE?(state) then
//                 if NEXT-CAT(state) is a nonterminal then
//                     PREDICTOR
//                 else do
//                     SCANNER(state, i)                    // terminal
//             else do
//                 COMPLETER(state, i)
//         end
//     end
//     return chart
//
//
// Prediction: For every state in S(k) of the form (X → α • Y β, j) (where j is the origin 
// position as above), add (Y → • γ, k) to S(k) for every production in the 
// grammar with Y on the left-hand side (Y → γ). 
//
// procedure PREDICTOR((A → α•B, i), j, grammar)
//     for each (B → γ) in GRAMMAR-RULES-FOR(B, grammar) do
//         ADD-TO-SET((B → •γ, j), chart[ j])
//     end
//
// Scanning: If a is the next symbol in the input stream, for every state in S(k) of 
//   the form (X → α • a β, j), add (X → α a • β, j) to S(k+1).  
//  [The pseudo code here differs from the written comment above, the Javascript below
//   follows the written comment.]
//
// procedure SCANNER((A → α•B, i), j)
//     if B ⊂ PARTS-OF-SPEECH(word[j]) then
//         ADD-TO-SET((B → word[j], i), chart[j + 1])
//     end
//  
//  Completion: For every state in S(k) of the form (X → γ •, j), find states in 
//      S(j) of the form (Y → α • X β, i) and add (Y → α X • β, i) to S(k).
//
// procedure COMPLETER((B → γ•, j), k)
//     for each (A → α•Bβ, i) in chart[j] do
//         ADD-TO-SET((A → αB•β, i), chart[k])
//     end
// 
// 




// Production ( X -> alpha beta )
//    represented as a struct with a 
//        left: a String that must be defined in Grammar.
//        right: an array of Strings, each of which must either be defined in Grammar (a non-terminal), or a single character string (a terminal).
//

// Grammar
//   a dict of String -> { name: String, productions: array of Production with that same Left }
//

// State 
//    production: the production being matched by this state
//    position: position in the right hand side of the production (0 is before the first 
//              item, 1 is between the first and second, 2 ...
//    origin: the position in the input where the matching of this production began

// StateSet 
//    Needs to be both a queue and a set, no State is duplicated, and each State is
//    processed only once.  For now we model it as an array, and whenever we add
//    a state we go through it looking to see if it's added already

var state_to_string = exports.state_to_string = function (state) {
    var s = "{ " + item_to_string(state.production, state.position) + ", " + state.origin + "-" + state.current;
    if (false && state.predecessors) {
        x = false;
        for (each in state.predecessors) {
            if (x) {
                s += ", ";
            } else { 
                s += ", p[ ";
                x = true;
            }
            s += state_to_string(state.predecessors[each]);
        }
        if (x) {
            s += "]";
        }
    }
    if (false && state.reduction) {
        x = false;
        for (each in state.reduction) {
            if (x) {
                s += ", ";
            } else { 
                s += ", r[ ";
                x = true;
            }
            s += state_to_string(state.reduction[each]);
        }
        if (x) {
            s += "]";
        }
    }
    s += " }";
    return s;
}

var print_state = exports.print_state = function (state) {
    console.log(state_to_string(state));
}


function cat_to_string(cat) {
    if ((typeof cat) === "object") {
        return nonTerminal_to_string(cat);
    } else if ((typeof cat) === "number") {
        return "'" + String.fromCharCode(cat) + "'";
    } else {
        return "Unknown cat: " + (typeof cat) + "(" + cat + ")";
    }
}

var production_to_string = exports.production_to_string = function (production) {
    var line = nonTerminal_to_string(production.left) + " <- ";
    for (var j = 0; j < production.right.length; j++) {
        line += cat_to_string(production.right[j]) + " ";
    }
    return line;
}

var item_to_string = exports.item_to_string = function (production, position) {
    var line = nonTerminal_to_string(production.left) + " <- ";
    for (var j = 0; j < production.right.length; j++) {
        if (position === j) {
            line += ". ";
        }
        line += cat_to_string(production.right[j]) + " ";
    }
    if (position === j) {
        line += ". ";
    }
    return line;
}

var print_production = exports.print_production = function (production) {
    console.log(production_to_string(production));
}

var nonTerminal_to_string = function (nonTerminal) {
    return nonTerminal.name;
}

var print_grammar = exports.print_grammar = function (grammar) {
    for (nonterminal in grammar) {
        for (var i = 0; i < grammar[nonterminal].productions.length; i++) {
            print_production(grammar[nonterminal].productions[i]);
        }
    }
}

function nullableCat(cat) {
    if ((typeof cat) === "object") {
        return nullableNonTerminal(cat);
    } else if ((typeof cat) === "number") {
        return false;
    } else {
        return "nullableCat: Unknown cat: " + (typeof cat) + "(" + cat + ")";
    }
};

function nullableProduction(production) {
    // a production is nullable if every member (if any) of right hand side is nullable
    //   a terminal is never nullable
    for (var j = 0; j < production.length; j++) {
        if (!nullableCat(production[j])) {
            return false;
        }
    }
    return true;
}


function nullableNonTerminal(nonTerminal) {
    // a nonTerminal is nullable if any of it's productions are nullable
    for (var i = 0; i < nonTerminal.productions.length; i++) {
        if (nullableProduction(nonTerminal.productions[i])) {
            return true;
        }
    }
    return false;
}



function addNonTerminal(grammar, leftName) {
    console.log("addNonTerminal " + leftName + " " + grammar[leftName]);
    if (grammar[leftName] === null || grammar[leftName] === undefined) {
        grammar[leftName] = { 
            name: leftName,
            productions: [ ] 
        };
    }
    console.log("actual " + leftName + " " + grammar[leftName]);
    return grammar[leftName];
}

var addProduction = exports.addProduction = function (grammar, leftName, rightNames) {

    console.log("adding " + leftName + " <- " + rightNames)

    var nonTerminal = addNonTerminal(grammar, leftName);

    for (var i = 0; i < rightNames.length; i++) {
        console.log("rightNames[" + i + "] = " + (typeof rightNames[i]) + " " + rightNames[i])
        if (rightNames[i].length === 3
            && rightNames[i][0] === "'"
            && rightNames[i][2] === "'") {
            console.log("adding character code");
            rightNames[i] = rightNames[i].charCodeAt(1);
        } else {
            console.log("adding nonTerminal");
            rightNames[i] = addNonTerminal(grammar, rightNames[i]);
        }
    }

    each_production: for (var i = 0; i < nonTerminal.productions.length; i++) {
        if (nonTerminal.productions[i].length !== rightNames.length) {
            continue each_production;
        }

        for (var j = 0; j < rightNames.length; j++) {
            if (nonTerminal.productions[i][j] !== rightNames[j]) {
                continue each_production;
            }
        }

        console.log("actual " + production_to_string(nonTerminal.productions[i]));
        return nonTerminal.productions[i];
    }

    var newProduction = { left: nonTerminal, right: rightNames};
    nonTerminal.productions[nonTerminal.productions.length] = newProduction;
    console.log("actual " + production_to_string(newProduction));
    console.log("actual " + production_to_string(nonTerminal.productions[nonTerminal.productions.length-1]));
    return newProduction;
};


//
// what is the index of 'state' in chart[j]
//   -1 if its not in chart[i]
//
function state_set_index(state, chart, j) {
    if (chart[j] === null || chart[j] === undefined) {
        return -1;
    }
    for (var i = 0; i < chart[j].length; i++) {
        if (chart[j][i].production === state.production &&
            chart[j][i].position === state.position &&
            chart[j][i].origin === state.origin) {
            return i;
        }
    }
    return -1;
}



function state_set_contains(state, chart, j) {
    var index = state_set_index(state, chart, j);
    return index !== -1;
}

function add_to_state_set(state, chart, j) {
    var index = state_set_index(state, chart, j);
    state.current = j;
    if (index === -1) {
        if (chart[j] === null || chart[j] === undefined) {
            chart[j] = [ state ];
            index = 0;
        } else {
            index = chart[j].length;
            chart[j][index] = state;
        }
    }
    return chart[j][index];
};



function predictor(state, j, grammar, chart) {
    console.log("predictor " + j + " " + state_to_string(state));
    var production_family = state.production.right[state.position];
    for (var eachProduction = 0; 
         eachProduction < production_family.productions.length;
         eachProduction += 1) {
        add_to_state_set( { production: production_family.productions[eachProduction], 
                            position: 0,
                            origin: j }, 
                          chart, j);
    }
    if (nullableNonTerminal(production_family)) {
        var newState = add_to_state_set({ production: state.production,
                                          position: state.position + 1,
                                          origin: state.origin},
                                        chart,
                                        j);
        if (newState["reduction"] == null || newState["reduction"] == undefined) {
            newState.reduction = [];
        }
        newState.reduction[state.origin] = state;
        if (state.position != 0) {
            if (newState["predecessor"] == null || newState["predecessor"] == undefined) {
                newState.predecessor = [];
            }
            newState.predecessor[state.origin] = state;
        }
    }
};

function scanner(state, j, words, chart) {
    // q = state
    // p = newState
    if (j < words.length && words[j].charCodeAt(0) === state.production.right[state.position]) {
        var newState = add_to_state_set({ production: state.production,
                                          position: state.position + 1,
                                          origin: state.origin },
                                        chart, j + 1);
        if (state.position != 0) {
            if (newState["predecessor"] == null || newState["predecessor"] == undefined) {
                newState.predecessor = [];
            }
            newState.predecessor[state.origin] = state;
        }
    }
};

function completer(state, k, grammar, chart) {
    // p = newState
    // q = origState
    // t = state
    console.log("completer " + k + " " + state_to_string(state));
    for (var y = 0; y < chart[state.origin].length; y += 1) {
        var originState = chart[state.origin][y]; 
        if (state.production.left === originState.production.right[originState.position]) {
            var newState = add_to_state_set({ production: originState.production,
                                              position: originState.position + 1,
                                              origin: originState.origin},
                                            chart,
                                            k);
            if (newState["reduction"] == null || newState["reduction"] == undefined) {
                newState.reduction = [];
            }
            newState.reduction[state.origin] = state;
            if (originState.position != 0) {
                if (newState["predecessor"] == null || newState["predecessor"] == undefined) {
                    newState.predecessor = [];
                }
                newState.predecessor[state.origin] = originState;
            }
        }
    }
};
                         
function is_incomplete(state) {
    return state.position < state.production.right.length;
};

function is_next_cat_nonterminal(state, grammar) {
    console.log("next cat: '" + cat_to_string(state.production.right[state.position]) + "'");
    return (typeof state.production.right[state.position]) == "object";
};





function make_SPPF_nonTerminal(SPPF, nonTerminal, j, i) {
    if (!SPPF) {
        console.log("Bad SPPF value");
        exit();
    }

    if (!SPPF[nonTerminal.name] || !SPPF[nonTerminal.name][j] || !SPPF[nonTerminal.name][j][i]) {
        if (!SPPF[nonTerminal.name]) SPPF[nonTerminal.name] = [];
        if (!SPPF[nonTerminal.name][j]) SPPF[nonTerminal.name][j] = [];
        if (!SPPF[nonTerminal.name][j][i]) SPPF[nonTerminal.name][j][i] = { "nonTerminal" : nonTerminal,
                                                                  "start" : j,
                                                                  "end" : i,
                                                                };
    }
    return SPPF[nonTerminal.name][j][i];
}

function make_SPPF_terminal(SPPF, terminal, j) {
    if (!SPPF || !SPPF[terminal] || !SPPF[terminal][j]) {
        if (!SPPF) SPPF = [];
        if (!SPPF[terminal]) SPPF[terminal] = [];
        if (!SPPF[terminal][j]) SPPF[terminal][j] = { "terminal" : terminal,
                                                            "start" : j,
                                                            "end" : j + 1,
                                                          };
    }
    return SPPF[terminal][j];
}

function make_SPPF_empty(SPPF, j) {
    if (!SPPF || !SPPF[j]) {
        if (!SPPF) SPPF = [];
        if (!SPPF[j]) SPPF[j] = { "empty" : terminal,
                                  "start" : j,
                                  "end" : j,
                                };
    }
    return SPPF[j];
}

function make_SPPF_item(SPPF, production, position, j, i) {
    if (!SPPF || !SPPF[production][position] || !SPPF[production][position][j] || !SPPF[production][position][j][i]) {
        if (!SPPF) SPPF = [];
        if (!SPPF[production]) SPPF[production] = [];
        if (!SPPF[production][position]) SPPF[production][position] = [];
        if (!SPPF[production][position][j][i]) SPPF[production][position][j][i] = [];
        if (!SPPF[production][position][j][i]) SPPF[production][position] = [];
        if (!SPPF[production][position]) SPPF[production][position] = [];
        if (!SPPF[production][position][j][i]) SPPF[production][position][j][i] = { "production" : production,
                                                                                    "position" : position,
                                                                                    "start" : j,
                                                                                    "end" : i,
                                                                                  };
    }
    return SPPF[production][position][j][i];
}

function SPPF_to_string(u, indent) {
    var result="";
    if (!indent) {
        indent = "";
    }
    if (u["production"]) {
        result += indent + item_to_string(u.production) + " " + u.start + "-" + u.end + " " + u.one + " " + u.two;
    } else if (u["empty"]) {
        result += indent + "<>" + " " + u.start + "-" + u.end + " " + u.one + " " + u.two;
    } else if (u["terminal"]) {
        result += indent + terminal_to_string(u.terminal) + " " + u.start + "-" + u.end + " " + u.one + " " + u.two;
    } else if (u["nonTerminal"]) {
        result += indent + nonTerminal_to_string(u.nonTerminal) + " " + u.start + "-" + u.end + " " + u.one + " " + u.two;
    }
    if (u.one) {
        result += "\n" + SPPF_to_string(u.one, indent + "  ");
    }
    if (u.two) {
        result += "\n" + SPPF_to_string(u.two, indent + "  ");
    }
    return result;
}

function print_SPPF(u, indent) {
    console.log(SPPF_to_string(u, indent));
}

var build_SPPF = exports.build_SPPF = function (SPPF, u, p) {
    // u is an existing SPPF node to be expanded based upon p
    // p is a decorated earley state

    console.log("entering build");
    p.processed = true;
    i = p.current;
    j = p.origin;

    if (p.production.right.length === 0) {
        v = make_SPPF_nonTerminal(SPPF, p.production.left, i, i);
        if (u.one) {
            if (u.one !== v) {
                console.log("Error, not supposed to be here.");
                exit();
            }
        } else {
            u.one = v;
        }

        if (u.two) {
            console.log("Error, not supposed to be here.");
            exit();
        }

        if (v.one) {
            if (v.one !== make_SPPF_empty(SPPF, i)) {
                console.log("Error, not supposed to be here.");
                exit();
            }
        } else {
            v.one = make_SPPF_empty(SPPF, i);
        }

        if (v.two) {
            console.log("Error, not supposed to be here.");
            exit();
        }

        if (p.predecessors) {
            console.log("Error, not supposed to be here.");
            exit();
        }

        if (p.reductions) {
            console.log("Error, not supposed to be here.");
            exit();
        }

    } else if (p.position === 0) {
        console.log("Error, not supposed to be here.");
        exit();

    } else if (typeof(p.production.right[p.position - 1]) === typeof("") && p.position === 1) {
        console.log("terminal at position 0");
        v = make_SPPF_terminal(SPPF, p.production.right[p.position - 1], i - 1);
        if (u.one) {
            if (u.one !== v) {
                console.log("Error, not supposed to be here.");
                exit();
            }
        } else {
            u.one = v;
        }

        if (u.two) {
            console.log("Error, not supposed to be here.");
            exit();
        }
        if (p.predecessors) {
            console.log("Error, not supposed to be here.");
            exit();
        }

        if (p.reductions) {
            console.log("Error, not supposed to be here.");
            exit();
        }

    } else if (typeof(p.production.right[p.position - 1]) === typeof({}) && p.position === 1) {
        console.log("non-terminal at position 0");
        console.log("u: " + SPPF_to_string(u, ""));
        console.log("v: " + nonTerminal_to_string(p.production.right[p.position - 1]));
        v = make_SPPF_nonTerminal(SPPF, p.production.right[p.position - 1], j, i);
        if (v === u) {
            console.log("This seems wrong");
            exit();
            }
        if (u.one) {
            if (u.one !== v) {
                console.log("Error, not supposed to be here.");
                exit();
            }
        } else {
            u.one = v;
        }
        
        if (u.two) {
            console.log("Error, not supposed to be here.");
            exit();
        }

        if (p.reduction) {
            for (l in p.reduction) {
                if (l === j) {
                    var q = p.reduction[j];
                    if (!q.processed) {
                        build_SPPF(SPPF, v, q);
                    }
                }
            }
        }
        
        if (p.predecessors) {
            console.log("Error, not supposed to be here.");
            exit();
        }
 
    } else if (typeof(p.production.right[p.position - 1]) === typeof("") && p.position > 1) {
        console.log("terminal at position > 0");
        v = make_SPPF_terminal(SPPF, p.production.right[p.position - 1], i - 1);
        w = make_SPPF_item(SPPF, p.production, p.position - 1, j, i - 1);
        if (p.predecessors) {
            for (l in p.predecessors) {
                if (l === i-1) {
                    var q = p.predecessors[l];
                    if (!q.processed) {
                        build_SPPF(SPPF, w,q);
                    }
                }
            }
        }
        
        if (p.reductions) {
            console.log("Error, not supposed to be here.");
            exit();
        }

        if (u.one) {
            if (u.one !== w) {
                console.log("Error, not supposed to be here.");
                exit();
            }
        } else {
            u.one = w;
        }

        if (u.two) {
            if (u.two !== v) {
                console.log("Error, not supposed to be here.");
                exit();
            }
        } else {
            u.two = v;
        }

    } else if (typeof(p.production.right[p.position - 1]) === typeof({}) && p.position > 1) {
        console.log("non-terminal at position > 0");
        if (p.reductions) {
            for (l in p.reductions) {
                q = p.reductions[l];
                v = make_SPPF_nonTerminal(SPPF, p.production.right[p.position - 1], l, i);
                if (!q.processed) {
                    build_SPPF(SPPF, v,q);
                }
                w = make_SPPF_item(SPPF, p.production, p.position - 1, j, l);
                if (p.predecessors) {
                    for (l in p.predecessors) {
                        var q = p.predecessors[l];
                        if (!q.processed) {
                            build_SPPF(SPPF, w,q);
                        }
                    }
                }
                if (u.one) {
                    if (u.one !== w) {
                        console.log("Error, not supposed to be here.");
                        exit();
                    }
                } else {
                    u.one = w;
                }
                
                if (u.two) {
                    if (u.two !== v) {
                        console.log("Error, not supposed to be here.");
                        exit();
                    }
                } else {
                    u.two = v;
                }
            }
        }

    } else {
        console.log("Error, not supposed to be here.");
        exit();
    }
}

        



var earley_parse = exports.earley_parse = function (words, grammar, start) {
    var startProduction = addProduction(grammar, "_", [ start ]);
    var startState = { production: startProduction,
                       position: 0,
                       origin: 0 
                     };
    var endState = { production: startProduction, 
                     position: 1,
                     origin: 0
                   };
    var chart = []; // an array of StateSets by positions in words
    var SPPF = [];

    add_to_state_set(startState, chart, 0);

    console.log("---Run--");
    // i points between words, 0 is before the first word, words.length is after last word
    //   thats why we use <=
    for (var i = 0; i <= words.length; i += 1) {
        if (chart[i] == undefined || chart[i].length == 0) {
            // this covers the case that the previous state didn't advance 
            //  anything into this state, meaning we failed to parse
            break;
        }

        for (var p = 0; p < chart[i].length; p += 1) {
            var state = chart[i][p];
            console.log("next state " + state_to_string(state));
            if (is_incomplete(state)) {
                if (is_next_cat_nonterminal(state, grammar)) {
                    predictor(state, i, grammar, chart);
                } else if (i < words.length) {
                    // if 'i' has reached the 'word' after the last
                    //   we no longer have a 'word' to match
                    scanner(state, i, words, chart);
                }
            } else {
                completer(state, i, grammar, chart);
            }
        }
    }

    var index = state_set_index(endState, chart, words.length);
    if (i === (words.length + 1) && index !== -1) {
        var tree = chart[words.length][index];

        u = make_SPPF_nonTerminal(SPPF, tree.production.left, 0, words.length);
        console.log("about to print");
        print_SPPF(u);
        console.log("about to build");
        build_SPPF(SPPF, u, tree);
        console.log("about to print");
        print_SPPF(u);

        return true;
    } else {
        return false;
    }
};


