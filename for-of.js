
var arr = [ 3, 5, 7 ];
arr.foo = "hello";

//
//for (var i in arr) {
//   console.log(i); // logs "0", "1", "2", "foo"
//}
//
//for (var i of arr) {
//   console.log(i); // logs "3", "5", "7"
//}


function start() {
    for each (let i in arr) {
        document.getElementById('result').appendChild(document.createTextNode("Hello for ... of " + i + " "));
    }
}



    
