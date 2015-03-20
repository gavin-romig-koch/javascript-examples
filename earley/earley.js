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
    return "{ " + production_to_string(state.production) + ", " + state.position + ", " + state.origin + " }";
}

var print_state = exports.print_state = function (state) {
    console.log(state_to_string(state));
}


function cat_to_string(cat) {
    if ((typeof cat) === "object") {
        return nonTerminal_to_string(cat);
    } else if ((typeof cat) === "number") {
        return String.fromCharCode(cat);
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
    console.log("newNonTerminal " + leftName + " " + grammar[leftName]);
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


function state_set_contains(state, chart, j) {
    value = false
    console.log("adding to set " + j + ": " + state_to_string(state));
    if (chart[j] === null || chart[j] === undefined) {
        return value;
    }
    for (var i = 0; i < chart[j].length; i++) {
        print_state(chart[j][i]);
        if (chart[j][i].production === state.production &&
            chart[j][i].position === state.position &&
            chart[j][i].origin === state.origin) {
            value = true;
        }
    }
    return value;
}
    

function add_to_state_set(state, chart, j) {
    if (state_set_contains(state, chart, j)) {
        return;
    }
    if (chart[j] === null || chart[j] === undefined) {
        chart[j] = [ state ];
    } else {
        chart[j][chart[j].length] = state;
    }
    print_state(state);
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
        add_to_state_set({ production: state.production,
                           position: state.position + 1,
                           origin: state.origin},
                         chart,
                         j);
    }
};

function scanner(state, j, words, chart) {
    console.log("scanner " + j + " " + state_to_string(state));
    console.log("  does '" + words[j].charCodeAt(0) + "' === '" + state.production.right[state.position] + "'"); 
    console.log("  does '" + words[j] + "' === '" + String.fromCharCode(state.production.right[state.position]) + "'"); 
    if (j < words.length && words[j].charCodeAt(0) === state.production.right[state.position]) {
        console.log("    yes");
        add_to_state_set({ production: state.production,
                           position: state.position + 1,
                           origin: state.origin},
                         chart, j + 1);
    } else {
        console.log("    no");
    }
};

function completer(state, k, grammar, chart) {
    console.log("completer " + k + " " + state_to_string(state));
    for (var y = 0; y < chart[state.origin].length; y += 1) {
        var originState = chart[state.origin][y]; 
        if (state.production.left === originState.production.right[originState.position]) {
            add_to_state_set({ production: originState.production,
                               position: originState.position + 1,
                               origin: originState.origin},
                             chart,
                             k);
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

    if (i === (words.length + 1) && state_set_contains(endState, chart, words.length)) {
        return true;
    } else {
        return false;
    }
};


