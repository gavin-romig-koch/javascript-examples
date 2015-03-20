
# node --huge args.node.js foo

process.execArgv.forEach(function(val, index, array) {
    console.log(index + ': ' + val);
});

process.argv.forEach(function(val, index, array) {
    console.log(index + ': ' + val);
});

