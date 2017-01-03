var dasm = require("./index");
const result = dasm("aaaa", "-f1", "-ofile.out", "-lfile.lst");
const ROM = result.FS.readFile("file.out");