#!/bin/env coffee

IO = require('IO')


run = (x) -> IO.runIO(x)
putc = (c) -> IO.putcIO(c)
bind = (a,k) -> IO.bindIO(a,k)

IO.runIO(IO.putcIO('G'));
IO.runIO(IO.putcIO('a'));
IO.runIO(IO.putcIO('v'));
run bind(putc('G'), () -> bind(putc('n'), () -> putc '\n'))

hello = (name) -> console.log("Hello " + name);
bye = -> console.log("Goodby world");





