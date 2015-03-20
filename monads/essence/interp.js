

var Term = {
    interp = None,
};

var Value = {
    showval = None,
};


function Var(name) {
    return { supertype = "Term",
             type = "VAR",
             interp = function(env) { 
                 if (name in env)
                     return env[name].unitM(); 
                 else 
                     return Wrong().unitM();
             }
           };
}

function Con(i) {
    return { supertype = "Term",
             type = "CON",
             interp = function(env) {
                 return Num(i).unitM();
             }
           };
}

function Add(term1,term2) {
    return { supertype = "Term",
             type = "Add",
             interp = function(env) {
                 return term1.interp(env).bindM( function (f) { 
                     return term2.interp(env).bindM( function (a) {
                         return f.apply(a);
                     })
                 })
             };
           }
}


function Lam(name,term) {
    return { supertype = "Term",
             type = "Lam",
           };
}

function App(term1,term2) {
    return { supertype = "Term",
             type = "App",
           };
}


function Wrong() {
    return { supertype = "Value",
             type = "Wrong",
             showval = function () { return "<wrong>"; }
             add = function(other) { return Wrong(); }
             apply = function(other) { return Wrong(); }
           };
}

function Num(i) {
    return { supertype = "Value",
             type = "Num",
             showval = function () { return i; }
             add = function(other) { return Num(i + other.i).unitM(); }
             apply = function(other) { return Wrong().unitM(); }
           };
}

function Fun(k) {
    return { supertype = "Value",
             type = "Fun",
             showval = function () { return "<function>"; }
             add = function(other) { return Wrong().unitM(); }
             apply = function(other) { return k(other); }
           };
}

