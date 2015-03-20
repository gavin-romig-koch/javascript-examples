



function main() {

    var doit = function (g) {
        g();
        g();
    }

    var f = function () {
        console.info("hello world");
    }

    doit(f);
}

main();
