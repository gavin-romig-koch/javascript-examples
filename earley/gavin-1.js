//
// I think there is a problem with some of the psudo code in Scott's paper
// about turning earley into a parser.  This is my attempt to do it myself
// based on hints from having tried to doit according to that paper.
//
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
    if (state === undefined) {
        return "<undefined>";
    } else if (state === null) {
        return "<null>";
    }
    return "{ " + item_to_string(state.production, state.position) + ", " + state.origin + "-" + state.current + " }";
}

var print_state = exports.print_state = function (state) {
    console.log(state_to_string(state));
}

function is_nonTerminal(cat) {
    if ((typeof cat) === "object") {
        return true;
    } else if ((typeof cat) === "number") {
        return false;
    } else {
        console.log("Error: Unknown cat: " + (typeof cat) + "(" + cat + ")");
        exit();
    }
}

function is_terminal(cat) {
    return !is_nonTerminal(cat);
}


function cat_to_string(cat) {
    if (is_nonTerminal(cat)) {
        return nonTerminal_to_string(cat);
    } else {
        return terminal_to_string(cat);
    }
}

function cat_to_id_string(cat) {
    if (is_nonTerminal(cat)) {
        return nonTerminal_to_id_string(cat);
    } else {
        return terminal_to_id_string(cat);
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
    if (is_nonTerminal(nonTerminal)) {
        return nonTerminal.name;
    }
    console.log("nonTerminal to string called on not a nonTerminal" + cat_to_string(nonTerminal));
    exit();
}

var nonTerminal_to_id_string = function (nonTerminal) {
    return nonTerminal_to_string(nonTerminal);
}

var terminal_to_string = function (terminal) {
    if (is_terminal(terminal)) {
        return "'" + String.fromCharCode(terminal) + "'";
    }
    console.log("terminal to string called on not a terminal" + cat_to_string(terminal));
    exit();
}

var terminal_to_id_string = function (terminal) {
    if (is_terminal(terminal)) {
        return "char_" + terminal;
    }
    console.log("terminal to string called on not a terminal" + cat_to_string(terminal));
    exit();
}

var print_grammar = exports.print_grammar = function (grammar) {
    for (nonterminal in grammar) {
        for (var i = 0; i < grammar[nonterminal].productions.length; i++) {
            print_production(grammar[nonterminal].productions[i]);
        }
    }
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



function predictor(state, j, grammar, chart, predicted) {
    //console.log("predictor " + j + " " + state_to_string(state));
    var production_family = state.production.right[state.position];
    // if this non-terminal has not yet been predicted into this state-set
    if (predicted[production_family.name] === null || predicted[production_family.name] === undefined) {
        // mark it as having been predicted, and do the predictions 
        predicted[production_family.name] = [];
        for (var eachProduction = 0; 
             eachProduction < production_family.productions.length;
             eachProduction += 1) {
            add_to_state_set(
                { production: production_family.productions[eachProduction], 
                  position: 0,
                  origin: j }, 
                chart, j);
        }
    } else {
        // if it has already been predicted into this state-set, 
        //    check if it has also been reduced in this state-set
        //    this indicates that this non-terminal is nullable
        //    and should be immediatly stepped over if it is ever
        //    predicted.
        if (predicted[production_family.name].length > 0) { 
            var newState = add_to_state_set({ production: state.production,
                                              position: state.position + 1,
                                              origin: state.origin},
                                            chart, j);
            if (newState["childs"] === null || newState["childs"] === undefined) {
                newState.childs = [];
            }
            if (newState.childs[j] === null || newState.childs[j] === undefined) {
                newState.childs[j] = { predecessors: [], reductions: [] };
            }
            for (var eachReduced in predicted[production_family.name]) {
                // don't put a predecessor on states in position 0 or 1
                if (newState.position > 1) {
                    newState.childs[j].predecessors[newState.childs[j].predecessors.length] = state;
                }
                newState.childs[j].reductions[newState.childs[j].reductions.length] = predicted[production_family.name][eachReduced];
            }
        }
    }
}

function scanner(state, j, words, chart, predicted) {
    // q = state
    // p = newState
    //console.log("scanner " + j + " " + state_to_string(state));
    if (j < words.length && words[j].charCodeAt(0) === state.production.right[state.position]) {
        var newState = add_to_state_set({ production: state.production,
                                          position: state.position + 1,
                                          origin: state.origin },
                                        chart, j + 1);
        if (newState["childs"] === null || newState["childs"] === undefined) {
            newState.childs = [];
        }
        if (newState.childs[j] === null || newState.childs[j] === undefined) {
            newState.childs[j] = { predecessors: [], reductions: [] };
        }
        // don't put a predecessor on states in position 0 or 1
        if (newState.position > 1) {
            newState.childs[j].predecessors[newState.childs[j].predecessors.length] = state;
        }
        //console.log("scanner " + j + " " + state_to_string(newState));
    }
};

function completer(state, k, grammar, chart, predicted) {
    // p = newState
    // q = origState
    // t = state
    //console.log("completer " + k + " " + state_to_string(state));
    for (var y = 0; y < chart[state.origin].length; y += 1) {
        var originState = chart[state.origin][y]; 
        if (state.production.left === originState.production.right[originState.position]) {
            var newState = add_to_state_set({ production: originState.production,
                                              position: originState.position + 1,
                                              origin: originState.origin},
                                            chart, k);
            // if this production was predicted into this state
            // then add this state to the list of predicted and reduced
            if (state.origin === k) {
                predicted[state.production.left.name][predicted[state.production.left.name].length] = state;
            }

            if (newState["childs"] === null || newState["childs"] === undefined) {
                newState.childs = [];
            }
            if (newState.childs[state.origin] === null || newState.childs[state.origin] === undefined) {
                newState.childs[state.origin] = { predecessors: [], reductions: [] };
            }
            // don't put a predecessor on states in position 0 or 1
            if (newState.position > 1) {
                newState.childs[state.origin].predecessors[newState.childs[state.origin].predecessors.length] = originState;
            }
            newState.childs[state.origin].reductions[newState.childs[state.origin].reductions.length] = state;
            //console.log("completer " + k + " " + state_to_string(newState));
        }
    }
};
                         
function is_incomplete(state) {
    return state.position < state.production.right.length;
};

function is_next_cat_nonterminal(state, grammar) {
    return is_nonTerminal(state.production.right[state.position]);
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
        if (!SPPF[j]) SPPF[j] = { "empty" : "''",
                                  "start" : j,
                                  "end" : j,
                                };
    }
    return SPPF[j];
}

function make_SPPF_item(SPPF, production, position, j, i) {
    if (!SPPF || !SPPF[production] || !SPPF[production][position] || !SPPF[production][position][j] || !SPPF[production][position][j][i]) {
        if (!SPPF) SPPF = [];
        if (!SPPF[production]) SPPF[production] = [];
        if (!SPPF[production][position]) SPPF[production][position] = [];
        if (!SPPF[production][position][j]) SPPF[production][position][j] = [];
        if (!SPPF[production][position][j][i]) SPPF[production][position][j][i] = { "production" : production,
                                                                                    "position" : position,
                                                                                    "start" : j,
                                                                                    "end" : i,
                                                                                  };
    }
    return SPPF[production][position][j][i];
}


var SPPFNames = 1;
function SPPF_to_string(u) {
    var result="";
    console.log("entering SPPF_to_string " + u["sppfPrint"]);
    if (u["sppfPrint"] !== undefined) {
        return " :" + u["sppfPrint"];
    } else {
        u["sppfPrint"] = SPPFNames;
        SPPFNames += 1;
    }

    for (var ff in u.families) {
        if (u.families[ff].one) {
            result += " [" + SPPF_to_string(u.families[ff].one) + " ]";
        }
        if (u.families[ff].two) {
            result += " (" + SPPF_to_string(u.families[ff].two) + " )";
        }
        result += ",";
    }

    var name = ":" + u["sppfPrint"];
    if (u["production"]) {
        result += " {" + item_to_string(u.production) + " " + u.start + "-" + u.end + " }" + name;
    } else if (u["empty"]) {
        result += " {" + "<>" + " " + u.start + "-" + u.end + " }" + name;
    } else if (u["terminal"]) {
        result += " {" + terminal_to_string(u.terminal) + " " + u.start + "-" + u.end + " }" + name;
    } else if (u["nonTerminal"]) {
        result += " {" + nonTerminal_to_string(u.nonTerminal) + " " + u.start + "-" + u.end + " }" + name;
    } else {
        console.log("error: missing SPPF type " + name + " ok");
        exit();
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
    p.sppfProcessed = true;
    i = p.current;
    j = p.origin;

    if (p.production.right.length === 0) {
        console.log("empty production");
        var v = make_SPPF_nonTerminal(SPPF, p.production.left, i, i);

        if (p.childs && p.childs.length > 0) {
            console.log("Error, not supposed to be here.");
            exit();
        }

        if (!u.families) {
            u.families = [];
        }
        var found = false;
        if (u.families.length > 0) {
            for (var ii in u.families) {
                if (u.families[ii].one === null
                    && u.families[ii].two === v) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            u.families[u.families.length] = { one: null, two: v }
        }

        var e = make_SPPF_empty(SPPF, j);
        if (!v.families) {
            v.families = [];
        }
        var found = false;
        if (v.families.length > 0) {
            for (var ii in v.families) {
                if (v.families[ii].one === null
                    && v.families[ii].two === e) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            v.families[u.families.length] = { one: null, two: e }
        }

    } else if (p.position === 0) {
        console.log("Error, not supposed to be here.");
        exit();

    } else if (is_terminal(p.production.right[p.position - 1]) && p.position === 1) {
        console.log("terminal at position 0");
        var v = make_SPPF_terminal(SPPF, p.production.right[p.position - 1], i - 1);

        if (p.childs && p.childs.length > 0) {
            for (var cc in p.childs) {
                if (p.childs[cc].predecessors && p.childs[cc].predecessors.length > 0
                    || p.childs[cc].reductions && p.childs[cc].reductions.length > 0) {
                    console.log("Error, a terminal at position 0 has childs");
                    exit();
                }
            }
        }

        if (!u.families) {
            u.families = [];
        }
        var found = false;
        if (u.families.length > 0) {
            for (var ii in u.families) {
                if (u.families[ii].one === null
                   && u.families[ii].two === v) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            u.families[u.families.length] = { one: null, two: v }
        }

    } else if (is_nonTerminal(p.production.right[p.position - 1]) && p.position === 1) {
        console.log("non-terminal at position 0 " + j + "-" + i);
        var v = make_SPPF_nonTerminal(SPPF, p.production.right[p.position - 1], j, i);

        if (!u.families) {
            u.families = [];
        }
        var found = false;
        if (u.families.length > 0) {
            for (var ii in u.families) {
                if (u.families[ii].one === null
                   && u.families[ii].two === v) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            u.families[u.families.length] = { one: null, two: v }
        }

        for (var cc in p.childs) {
            console.log("  " + cc + " " + p.childs[cc].predecessors + ":" + p.childs[cc].reductions) 
        }

        if (p.childs && p.childs.length > 0 && p.childs[j]) {
            if (p.childs[j].predecessors && p.childs[j].predecessors.length > 0) {
                console.log("Error, not supposed to be here.");
                exit();
            }
            if (p.childs[j].reductions && p.childs[j].reductions.length > 0) {
                for (var ii in p.childs[j].reductions) {
                    var q = p.childs[j].reductions[ii];
                    if (!q.sppfProcessed) {
                        build_SPPF(SPPF, v, q);
                    }
                }
            } else {
                console.log("Error, not supposed to be here.");
                exit();
            }
        } else {
            console.log("Error, non-terminal at position 0, missing reductions");
            if (!p.childs) {
                console.log("  no childs");
            } else if (p.childs.length <= 0) {
                console.log("  length of childs is " + p.childs.length);
            } else if (p.childs[j]) {
                console.log("  no childs for label " + j);
                console.log("  only for:");
                for (var cc in p.childs) {
                    console.log("   " + cc + " " + p.childs[cc]);
                }
            }
            exit();
        }

 
    } else if (is_terminal(p.production.right[p.position - 1]) && p.position > 1) {
        console.log("terminal at position > 0 " + state_to_string(p));
        var v = make_SPPF_terminal(SPPF, p.production.right[p.position - 1], i - 1);
        var w = make_SPPF_item(SPPF, p.production, p.position - 1, j, i - 1);

        for (var cc in p.childs) {
            console.log("  " + cc + " " + p.childs[cc].predecessors + ":" + p.childs[cc].reductions) 
        }

        if (p.childs && p.childs.length > 0 && p.childs[i - 1]) {
            if (p.childs[i - 1].reductions && p.childs[i - 1].reductions.length > 0) {
                console.log("Error, not supposed to be here.");
                exit();
            }
            if (p.childs[i - 1].predecessors && p.childs[i - 1].predecessors.length > 0) {
                for (var ii in p.childs[i - 1].predecessors) {
                    var q = p.childs[i - 1].predecessors[ii];
                    if (!q.sppfProcessed) {
                        build_SPPF(SPPF, w, q);
                    }
                }
            } else {
                console.log("Error, not supposed to be here.");
                exit();
            }
        } else {
            console.log("Error, terminal at position > 0, missing predecessors");
            if (!p.childs) {
                console.log("  no childs");
            } else if (p.childs.length <= 0) {
                console.log("  length of childs is " + p.childs.length);
            } else if (!p.childs[i - 1]) {
                console.log("  no childs for label " + i - 1);
                console.log("  only for:");
                for (var cc in p.childs) {
                    console.log("   " + cc + " " + p.childs[cc]);
                }
            }
            exit();
        }

        if (!u.families) {
            u.families = [];
        }
        var found = false;
        if (u.families.length > 0) {
            for (var ii in u.families) {
                if (u.families[ii].one === w
                    && u.families[ii].two === v) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            u.families[u.families.length] = { one: w, two: v }
        }

    } else if (is_nonTerminal(p.production.right[p.position - 1]) && p.position > 1) {
        console.log("non-terminal at position > 0 " + j + "-" + i);

        for (var cc in p.childs) {
            console.log("  " + cc + " " + p.childs[cc].predecessors + ":" + p.childs[cc].reductions) 
        }

        if (p.childs && p.childs.length > 0) {
            for (var l in p.childs) {
                if (p.childs[l].reductions && p.childs[l].reductions.length > 0) {
                    for (var ii in p.childs[l].reductions) {
                        var q = p.childs[l].reductions[ii];
                        var v = make_SPPF_nonTerminal(SPPF, p.production.right[p.position - 1], l, i);
                        if (!q.sppfProcessed) {
                            build_SPPF(SPPF, v, q);
                        }
                        var w = make_SPPF_item(SPPF, p.production, p.position - 1, j, l);
                        if (p.childs[l].predecessors && p.childs[l].predecessors.length > 0) {
                            for (var jj in p.childs[l].predecessors) {
                                var p2 = p.childs[l].predecessors[jj];
                                if (!p2.sppfProcessed) {
                                    build_SPPF(SPPF, w, p2);
                                }
                            }
                        } else {
                            console.log("Error, not supposed to be here.");
                            exit();
                        }

                        if (!u.families) {
                            u.families = [];
                        }
                        var found = false;
                        if (u.families.length > 0) {
                            for (var ii in u.families) {
                                if (u.families[ii].one === w
                                    && u.families[ii].two === v) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            u.families[u.families.length] = { one: w, two: v }
                        }
                    }
                }
            }
        } else {
            console.log("Error, not supposed to be here.");
            exit();
        }
    } else {
        console.log("Error, unknown kind of item");
        print_state(p);
        console.log("typeof(\"\"): " + typeof(""));
        console.log("typeof(''): " + typeof(''));
        console.log("typeof(p - 1): " + typeof(p.production.right[p.position - 1]));
        console.log("position: " + p.position);
        exit();
    }
}

var Names = 1;

function tree_to_array(node) {
    if (node === undefined) {
        return [ " <undefined>" ];
    } else if (node === null) {
        return [ " <null>" ];
    } else if (node === true) {
        return [ " <true>" ];
    } else if (node === false) {
        return [ " <false>" ];
    } else if (typeof(node) !== "object") {
        return [ " <" + node + ">" ];
    }
    var id;
    if (node.position < 0) {
        console.log("Error, node.position less than zero");
        exit();
    } else if (node.position === 0) {
        id = "''";
    } else {
        id = cat_to_string(node.production.right[node.position-1]);
    }

    if (node["treeProcessed"] !== undefined) {
        if (node["treeProcessed"] === true) {
            node["treeProcessed"] = Names;
            Names += 1;
        }
        return [ " " + id + ":" + node["treeProcessed"] ];
    } else {
        node["treeProcessed"] = true;
    }

 

    var childTrees = [];
    if (node.childs && node.childs.length > 0) {
        for (var l in node.childs) {
            var allPredTreesForL = [];
            for (var pp in node.childs[l].predecessors) {
                var predTrees = tree_to_array(node.childs[l].predecessors[pp]);
                for (var ppp in predTrees) {
                    allPredTreesForL[allPredTreesForL.length] = predTrees[ppp];
                }
            }
            var allRedTreesForL = [];
            for (var rr in node.childs[l].reductions) {
                var redTrees = tree_to_array(node.childs[l].reductions[rr]);
                for (var rrr in redTrees) {
                    allRedTreesForL[allRedTreesForL.length] = redTrees[rrr];
                }
            }
            if ((allPredTreesForL && allPredTreesForL.length > 0) 
                || (allRedTreesForL && allRedTreesForL.length > 0)) {
                childTrees[l] = { predecessors: allPredTreesForL, reductions: allRedTreesForL };
            }
        } 
    }

    print_state(node);
    if (node.childs && node.childs.length > 0) {
        var deb = "    X ";
        for (var nn in node.childs) {
            deb += " (";
            for (var pp in node.childs[nn].predecessors) {
                deb += state_to_string(node.childs[nn].predecessors[pp]);
            }
            deb += ",";
            for (var rr in node.childs[nn].reductions) {
                deb += state_to_string(node.childs[nn].reductions[rr]);
            }
            deb += ")";
        }
        console.log(deb);
    } else {
        console.log("    X");
    }

    var id_string = "";
    id_string += " " + id;
    if (node["treeProcessed"] !== true) {
        id_string += "." + node["treeProcessed"];
    }

    // for this node, for each pair of predecessor, reductions
    //   append all the reductions to this nodes id,
    //   then append this string to each predecessor
    //   this nodes results should be the sum of the results from each
    //   of the predecessors
    // if there are preds, then just return one result
    //   containing just the id concatinated with all of the reductions (if any).
    // 

    var result = [];
    if (childTrees && childTrees.length > 0) {
        var no_pred_string = null;
        for (var eachChild in childTrees) {

            var reductions_string = "";
            if (childTrees[eachChild].reductions && childTrees[eachChild].reductions.length > 0) {
                for (var eachRedResult in childTrees[eachChild].reductions) {
                    reductions_string += ' (' + childTrees[eachChild].reductions[eachRedResult] + ' )';
                }
            }

            if (childTrees[eachChild].predecessors && childTrees[eachChild].predecessors.length > 0) {
                for (var eachPredResult in childTrees[eachChild].predecessors) {
                    result[result.length] = childTrees[eachChild].predecessors[eachPredResult] + id_string + reductions_string;
                }
            } else {
                if (no_pred_string) {
                    no_pred_string += reductions_string;
                } else {
                    no_pred_string = reductions_string;
                }
            }
        }
        if (no_pred_string) {
            result[result.length] = id_string + no_pred_string;
        }
    } else {
        result[result.length] = id_string;
    }

     if (result && result.length > 0) {
        for (var eachResult in result) {
            console.log("    " + eachResult + result[eachResult]);
        }
    }

    node["treeProcessed"] = undefined;
    return result;
}

function tree_to_string(node) {
    var result = "";
    var stringArray = tree_to_array(node);
    for (var eachThing in stringArray) {
        result += stringArray[eachThing] + " ;";
    }
    return result;
}

function print_tree(node) {
    console.log("GCC TREE:" + tree_to_string(node));
}


var DotNames = 1;

function node_to_dot_node_string(node) {
    if (node === undefined) {
        console.log("Error, node is <undefined>"); 
        exit();
    } else if (node === null) {
        console.log("Error, node is <null>");
        exit();
    } else if (node === true) {
        console.log("Error, node is <true>");
        exit();
    } else if (node === false) {
        console.log("Error, node is <false>");
        exit();
    } else if (typeof(node) !== "object") {
        console.log("Error, node is <" + node + ">");
        exit();
    }

    if (node["dotNodeProcessed"] !== undefined) {
        return "";
    }
    node["dotNodeProcessed"] = true;

    node["id"] = "node_" + DotNames;
    DotNames += 1;

    var result = "";
    result += "  " + node["id"] + " [label=\"" + state_to_string(node) + "\"]\n";
 
    if (node.childs && node.childs.length > 0) {
        for (var l in node.childs) {
            for (var pp in node.childs[l].predecessors) {
                result += node_to_dot_node_string(node.childs[l].predecessors[pp]);
            }
            for (var rr in node.childs[l].reductions) {
                result += node_to_dot_node_string(node.childs[l].reductions[rr]);
            }
        } 
    }

    return result;
}

function node_to_dot_find_children_predecessors(node) {
    console.log("entering");
    var result = [[]];
    console.log("length -=-- " + result.length);
    result = [];
    console.log("length -==- " + result.length);
    result.push([]);
    console.log("length -==- " + result.length);
    result.push([]);
    console.log("length -==- " + result.length);
    result = [];
    for (var l in node.childs) {
        for (var pp in node.childs[l].predecessors) {
            result.concat(node_to_dot_find_children_predecessors(node.childs[l].predecessors[pp]));
        }
    }
    console.log("length a" + result.length);
    if (result.length === 0) {
        result.push([]);
    }
    console.log("length b" + result.length);
    for (var l in result) {
        result[l].push(node["id"]);
        console.log("length c" + result[l].length);    }
    console.log("length d" + result.length);
    console.log("leaving " + result);
    return result;
}

function node_to_dot_edge_string(node) {
    var result = node_to_dot_find_children_predecessors(node);
    for (var l in node.childs) {
        for (var pp in node.childs[l].reductions) {
            console.error("Not supposed to be reductions");
            result.concat(node_to_dot_find_children_predecessors(node.childs[l].reductions[pp]));
        }
    }
    var ss = "";
    if (result.length === 1 ) {
        for (var b in result[0]) {
            ss += "  " + node["id"] + " -> " + result[0][b] + "\n";
        }
    } else if (result.length > 1) {
        var count = 0;
        for (var a in result) {
            ss += "  " + node["id"] + " -> " + "subnode" + count + "\n";
            for (var b in result) {
                ss += "  " + "subnode" + count + " -> " + result[a][b] + "\n";
            }
            count += 1;
        }
    }
    return ss;
}


function node_to_dot_string(node) {
    var result = "digraph X {\n";
    return result + node_to_dot_node_string(node) + node_to_dot_edge_string(node) + "}\n";
}

function print_node_to_dot(node) {
    console.log("GCC DOT:" + node_to_dotstring(node));
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
        var predicted = [];
        if (chart[i] === undefined || chart[i].length === 0) {
            // this covers the case that the previous state didn't advance 
            //  anything into this state, meaning we failed to parse
            break;
        }

        for (var p = 0; p < chart[i].length; p += 1) {
            var state = chart[i][p];
            //console.log("next state " + state_to_string(state));
            if (is_incomplete(state)) {
                if (is_next_cat_nonterminal(state, grammar)) {
                    predictor(state, i, grammar, chart, predicted);
                } else if (i < words.length) {
                    // if 'i' has reached the 'word' after the last
                    //   we no longer have a 'word' to match
                    scanner(state, i, words, chart, predicted);
                }
            } else {
                completer(state, i, grammar, chart, predicted);
            }
        }
    }

    var index = state_set_index(endState, chart, words.length);
    if (i === (words.length + 1) && index !== -1) {
        var tree = chart[words.length][index];
        console.log("final state: " + state_to_string(tree));
        console.log("final tree: \n" + node_to_dot_string(tree)); 
        return true;
    } else {
        return false;
    }
}
