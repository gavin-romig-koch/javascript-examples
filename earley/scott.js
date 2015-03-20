




function MAKE_ITEM(rule, position, origin, w) {
}


function MAKE_NODE(rule, position, j, i, w, v, V) {
    var s;
    var y;
    if (position === rule.rhs().length()) {
        s = rule.lhs();
    } else {
        s = (rule, position);
    }
    if (position !== rule.rhs().length() && position === 1) {
        y = v;
    } else {
        y = V.add(s,j,i);
        if (w === null) {
            y.add((v));
        } else {
            y.add((w,v));
        }
    }
    return y;
}

ITEM_QUEUE.addMaybe = if ITEM already in queue return false
                      else add to queue, and return it

ITEM_QUEUE.getMaybe = if ITEM already in queue return it
                      else return false

function earley_parser(grammar, as) {
    for (var startRule : grammar.startRules()) {
        if (startRule.rsh().startswithterminal()) {
            Qprime.add(MAKE_ITEM(startRule, 0, 0, null));
        } else {
            E[0].add(MAKE_ITEM(startRule, 0, 0, null));
        }
    }

    for (var i = 0; i <= as.length; i++) {
        var H = emptySet();
        var R = E[i];
        var Q = Qprime;
        Qprime = emptySet();

        while (!R.empty()) {
            var A = R.removeOne();

            // if next element is NonTerminal
            if (A.rule().rhs()[A.position()].isNonTerminal()) {
                var C = A.rule().rhs()[A.position()];
                for (var rule : C.rules()) {
                    if (rule.rhs().startswithterminal()) {
                        Q.add(MAKE_ITEM(rule, 0, i, null));
                    } else {
                        var item = E[i].addMaybe(MAKE_ITEM(rule, 0, i, null));
                        if (item) {
                            R.add(item);
                        }
                    }
                }

                if (H[C]) {
                    var v = H[C];
                    var y = MAKE_NODE(A.rule(), A.position() + 1, A.origin(), i, w, v, V);
                    if (A.rule().rhs()[A.position()+1].isTerminal()) {
                        Q.add(MAKE_ITEM(A.rule(), A.position()+1, A.origin(), y));
                    } else {
                        var item = E[i].addMaybe(MAKE_ITEM(A.rule(), A.position()+1, A.origin(), y));
                        if (item) {
                            R.add(item);
                        }
                    }
                }
            }
            if (A.position() >= A.rhs().length()) {
                var D = A.rule.lhs();
                if (A.w() === null) {
                    if 

                    

            // if item is complete-able (at end of rhs)
            } else if (A.position() === A.rhs().length) {
            }
        }

        var V = emptySet();
        var v = SPPF(as[i+1], i, i + 1);
        while (!Q.empty()) {
            var A = Q.removeOne();
            var y = MAKE_NODE(A.rule(), A.position() + 1, A.origin(), w, v, V);
            if (A.rule().rhs()[A.position() + 2].isTerminal()) {
                Qprime.add(MAKE_ITEM(A.rule(), A.position() + 1, A.origin(), y));
            } else {
                E[i+1].add(MAKE_ITEM(A.rule(), A.position() + 1, A.origin(), y));
            }
        }
    }
    var lastItem = E[n].getMaybe(MAKE_ITEM(StartRule, StartRule.rhs().length, 0));
    if (lastItem) {
        return lastItem.w();
    } else { 
        return false;
    }
}

