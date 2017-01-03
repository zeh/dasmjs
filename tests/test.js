var dasm = require("./../index");
var fs = require("fs");

var src = fs.readFileSync("test.asm", { "encoding": "utf8" });

console.log("Src has length " + src.length);
var result = dasm(src, "-f1", "-otest.out", "-ltest.lst");
console.log("Compiled");
var rom = result.FS.readFile("test.out");
console.log("Rom has length " + rom.length);
