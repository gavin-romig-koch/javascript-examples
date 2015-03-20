
fs = require("fs");

var inputFD = fs.openSync("test.txt","r");
var bufferH = new Buffer(1);

fs.read(inputFD, bufferH, 0, 1, null, function(err, bytesRead, buffer) {
    if (err) throw err;
    if (bytesRead != 1) {
        console.log("Did not read one charater, read " + bytesRead);
    } else {
        console.log("character: " + buffer.toString());
        console.log("characterH: " + bufferH.toString());
    }
});

fs.read(inputFD, bufferH, 0, 1, null, function(err, bytesRead, buffer) {
    if (err) throw err;
    if (bytesRead != 1) {
        console.log("Did not read one charater, read " + bytesRead);
    } else {
        console.log("character: " + buffer.toString());
        console.log("characterH: " + bufferH.toString());
    }
});

fs.read(inputFD, bufferH, 0, 1, null, function(err, bytesRead, buffer) {
    if (err) throw err;
    if (bytesRead != 1) {
        console.log("Did not read one charater, read " + bytesRead);
    } else {
        console.log("character: " + buffer.toString());
        console.log("characterH: " + bufferH.toString());
    }
});




