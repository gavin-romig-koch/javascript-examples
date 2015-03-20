
fs = require("fs");


var inputFD = fs.openSync("/dev/stdin","r");
var buffer = new Buffer(1);
var bytesRead = 0;

bytesRead = fs.readSync(inputFD, buffer, 0, 1, null);
if (bytesRead != 1) {
    console.log("Did not read one charater, read " + bytesRead);
} else {
    console.log("character: " + buffer.toString());
}

bytesRead = fs.readSync(inputFD, buffer, 0, 1, null);
if (bytesRead != 1) {
    console.log("Did not read one charater, read " + bytesRead);
} else {
    console.log("character: " + buffer.toString());
}

bytesRead = fs.readSync(inputFD, buffer, 0, 1, null);
if (bytesRead != 1) {
    console.log("Did not read one charater, read " + bytesRead);
} else {
    console.log("character: " + buffer.toString());
}




