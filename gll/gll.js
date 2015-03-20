



def add(L, u, i, w) {
    for (var eachIndex = 0; eachIndex < length(U[i]); eachIndex += 1) {
        if (U[i].L == L && U[i].u == u && U[i].w == w) {
            return;
        }
    }
    U[length(U[i])] = { "L" : L, "u" : u, "w" : w };
    R[length(R)] = { "L" : L, "u" : u, "w" : w, "i" : i };
}


def pop(u, i, z) {
    if (u != u0) {
        let ( L , k ) be the label of u
        P[length(P)] = { "u": u, "z": z };
        for (var eachEdgeIndex = 0; eachEdgeIndex < length(u.edges); eachEdgeIndex += 1) {
            y = getNodeP(L, w, z);
            add(L, v, i, y)
        }
    }
}

def create(L, u, i, w) {
    v = GSS(L, i)   // if there is not already a GSS node labelled ( L , i ) create one
    if (!(w in v.edge)) {
        v.edge[w] = u;
        for (var index = 0; index < length(P); index += 1) {
            v = P[index].u;
            z = P[index].z;
            h = rightExtent(z);
            y = getNodeP(L, w, z);
            add(L, u, h, y)
        }
    }
    return v;
}

def test(y, A, alpha) {
    if (inFirstOf(y,alpha) || (inFirstOf(null, alpha) && inFollowOf(y, A))) {
        return true;
    } else {
        return false;
}

def getNodeT(x, i) {
    if (x == null) {
        h = i;
    } else {
        h = i + 1;
    }
    return SPPF(x, i, h); // if there is no SPPF node labelled ( x , i , h ) create one
}

def symbolNullable(p) {  // p is a terminal or non-terminal, is it Nullable
}

def itemNullable(i) { // i is an item, is the rest of the production nullable
}



def getNodeP(item, w, z) {
    if (!symbolNullable(item.production[item.position-1]) && (item.position < length(item.production))) {
        return z;
    } else {
        if (item.position == length(item.production)) {
            t = item.production.rhs;
        } else {
            t = item;
        }
        // suppose that z has label (q,k,i)
        if (w != $) {
            // suppose that w has lable (s,j,k)
            y = SPPF(t, w.j, z.i);
            if (y does not have a chiled labled (X ::= alpha . beta, k)) {
                // create on with left child w and right child z
            } 
        } else {
            y = SPPF(t, z.k, z.i);
            if (y does not have a chiled labled (X ::= alpha . beta, k)) {
                // create on with child z
            } 
        }
        return y;
    }
}

        



def codeItem(production, position) {
    if (isTerminal(production.right[position]) {
        if (I[ci] != production.right[position]) goto L0;
        cr = getNodeT(production.right[position], ci);
        ci = ci + 1;
        cn = getNodeP(item(production, position+1), cn, cr);
    } else if (isNonTerminal(production.right[position]) {
        if (!test(I[ci], production)) goto L0;
        cu = create(Rxi, cu, ci, cn);
        goto LX;
        Rxi: continue; 
    } else {
        error("invalid right hand element");
    }
}    




def function parseProduction(production) {

    // A ::= e
    if (length(production.right) == 0) {
        cr = getNodeT(e, ci);
        cn = getNodeP(item(production, 0), cn, cr);
        (cu, ci, cn) = pop();
        goto L0;

    } else if (length(production.right) == 1
               && isTerminal(production.right[0])) {
        cr = getNodeT(production.right[0], ci);
        ci = ci + 1;
        cn = getNodeP(item(production, 1), cn, cr);
        (cu, ci, cn) = pop();
        goto L0;

    } else if (length(production.right) >= 2
               && isTerminal(production.right[0])) {
        cr = getNodeT(production.right[0], ci);
        ci = ci + 1;
        for (var i = 1; i < length(production.right); i++) {
            if (isTerminal(production.right[i]) {
                if (I[ci] != production.right[i]) goto L0;
                cr = getNodeT(production.right[i], ci);
                ci = ci + 1;
                cn = getNodeP(item(production, i+1), cn, cr);
            } else if (isNonTerminal(production.right[i]) {
                if (!test(I[ci], production)) goto L0;
                cu = create(Rxi, cu, ci, cn);
                goto LX;
                Rxi: continue; 
            } else {
                error("invalid right hand element");
            }
        }

