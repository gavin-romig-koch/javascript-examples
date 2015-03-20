
print("hello");

function makeSimpleGenerator(array){
    let nextIndex = 0;
    
    while(nextIndex < array.length){
        yield array[nextIndex++];
    }
}

let gen = makeSimpleGenerator(["a", "b"]);
for each (var x in gen) {
    print(x);
}



