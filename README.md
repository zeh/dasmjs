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

Among other features, dasm sports:

* fast assembly
* several binary output formats available
* expressions using [] for parenthesis
* complex pseudo ops, repeat loops, macros, etc

## Technical information

This package uses version 2.20.11 of dasm. It supports the following processor architectures:

* 6502 (and 6507)
* 68705
* 6803
* HD6303 (extension of 6803)
* 68HC11

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

Install:

```shell
npm install dasm --save
```

Import as a module:

```JavaScript
import * as dasm from "dasm"; // ES6
var dasm = require("dasm").default; // ES5
```

Finally, convert code to a binary data ROM. Instead of forcing developers to use a command line-like interface, the function that wraps the emscripten module provides a modern interface to dasm:

```JavaScript
// Read utf-8 assembly source
const src = "...";

// Run with the source
const result = dasm(src);

// Read the output as a binary (Uint8Array array)
const ROM = result.data;
```

TypeScript definitions are included with this distribution, so TypeScript projects can use the module and get type checking and completion for all `dasm` calls. JavaScript developers using Visual Studio Code will also benefit from auto-completion without any change thanks to VSC's [Automatic Type Acquisition](http://code.visualstudio.com/updates/v1_7#_better-javascript-intellisense).

## More information

Please [download dasm](https://sourceforge.net/projects/dasm-dillon/) and check its full documentation for more information and command line switches (or just check [any cloned copy on GitHub](https://github.com/search?utf8=%E2%9C%93&q=%22DOCUMENTATION+FOR+DASM%2C+a+high+level+macro+cross+assembler+for%3A%22+extension%3Atxt&type=Code&ref=searchresults)).

## Todo

* More examples, including on how to include files
* Include machine target files (vcs.h, atari.h, channel f, etc) via a `machine` option
* Allow included files via a `include` option
* Allow command line parameters via a `params` option
* Parse list output in a more concise way
* Command-line package? (`dasm-cli`)

Contributions are welcome.

## License

This follows dasm itself and uses the [GNU Public License v2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html).