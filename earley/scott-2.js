

function not_nullable(production) {
    // this is the inverse of production in EE
    //     where EE is the set of all strings of N and T that start with an N, 
    //      together with empty string
    // true if production has at least one symbol on the right hand side
    //    and the first symbol is a terminal
}


scott_parser(grammar, s) {

    (N,T,S,P) = grammar

    n = len(s)
    E[0]..E[n] = emptyset
    R, nextQ, V = emptyset

    for production = each (S ::= a) in P {
        if (not_nullable(production)) {
            add (production, 0, 0, null) to nextQ
        } else {
            add (production, 0, 0, null) to E[0]
        }
    }
           
    for 0 <= i <= n {
        H = emptyset;
        R = E[i];
        Q = nextQ;
        nextQ = emptyset;

        while R not emptyset {
            A = remove element from R;
            if (nonTerminal(A.production.rhs[A.position])) {
                for eachProduction in A.production.rhs[A.position] {
                    if (not_nullable(eachProduction) {
                        add (production, 0, i, null) to Q;
                    } else {
                        if ((eachProduction, 0, i, null) not in E[i]) {
                            add (eachProduction, 0, i, null) to E[i] and R;

                        }
                    }
                }
                if ((C, v) in H) {
                    y = MAKE_NODE(B ::= aC.b, h, i, w, v, V);
                    if (B 
