# The dasm macro assembler (for JavaScript)

This is an [emscripten](https://github.com/kripken/emscripten)-compiled version of the [dasm macro assembler](http://dasm-dillon.sourceforge.net/).

The dasm macro assembler transforms assembly code into 6502-compatible executable binary code. Since this is a JavaScript port of dasm, it allows that compilation process from JavaScript programs; more especifically, it can be used to create Atari VCS 2600 and Fairchild Channel F ROMs from a string containing dasm-compatible assembly source code.

In other words, it turns something like this:

```assembly
; Pick the correct processor type
        processor 6502
; Basic includes
        include "vcs.h"
        include "macro.h"
; Start address
        org $f000
; Actual instructions
start   SEI
        CLD
        LDX  #$FF
        TXS
        LDA  #$00
        ...
```

...into its equivalent byte code:

```assembly
f000 78
f001 d8
f002 a2 ff
f004 9a
f005 a9 00
...
```

## Technical information

This package uses version 2.20.11 of dasm. It supports the following processor architectures:

* 6502 (and 6507)
* 68705
* 6803
* HD6303 (extension of 6803)
* 68HC11

Among other features, dasm supports:

* fast assembly
* several binary output formats available
* expressions using [] for parenthesis
* complex pseudo ops, repeat loops, macros, etc

This specific port was built on Linux (err, Windows 10 bash) from the dasm source using the following commands:

```shell
emmake make
mv src/dasm src/dasm.bc
emcc src/dasm.bc -o dasm.js
```

The following changes were manually applied to the exported `dasmj.js` file:

1. Wrapped the code with a function, so that could export it as a module
2. Returned the created module as the result of a function call
3. Exposed its internal file system through a `FS` variable

## Usage

```JavaScript
import * as dasm from "dasm";

// Read utf-8 assembly source
const src = "...";

// Run with any number of parameters
const result = dasm(src, "-f1", "-ofile.out", "-lfile.lst", ...);

// Read the output as a binary (int array)
const ROM = result.FS.readFile("file.out");
```

## More information

Please [download dasm](https://sourceforge.net/projects/dasm-dillon/) and check its full documentation for more information and command line switches.

Check the [emscripten FileSystem](https://kripken.github.io/emscripten-site/docs/api_reference/Filesystem-API.html) to learn about `FS` and how to use it.

## Todo

* More examples, including on how to include files
* Expose the module initialization options
* TypeScript definitions
* Real tests with CI
* Command-line package (`dasm-cli`)

Contributions are welcome.

## License

This follows dasm itself and uses the [GNU Public License v2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html).