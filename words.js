

var current = [];

function add(word) {
    current[current.length] = word;
}

function reduce(lst) {
    



var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line',  function(chunk) {
    var re = / *([A-Za-z0-9]+)/;
    var ss = String(chunk);

    for (var found = String(ss).match(re); found != null; found = String(ss).match(re)) {
            ss = ss.substr(found[0].length);
            add(found[1]);
            console.log(found);
        }
    console.log(current);
    current = reduce(current);
    });
