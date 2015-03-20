
fs = require("fs");

var inputFD = fs.openSync("/dev/stdin","r");
var outputFD = fs.openSync("/dev/stdout","w");
var buffer = Buffer(1);

exports.getc = function () {
    var bytesRead = fs.readSync(inputFD, buffer, 0, 1, null);
    if (bytesRead != 1) {
        throw "Tried to read 1 byte, but read " + bytesRead;
    } else {
        return buffer.toString();
    }
}

exports.putc = function (c) {
    fs.writeSync(outputFD, c);
}
    
