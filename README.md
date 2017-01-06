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

### Advanced usage

Advanced options can be passed to the `dasm` call via an options parameter. For example:

```JavaScript
// Create a rom using the typical Atari VCS 4096-byte format
dasm(src, { format: 3 })

// Just create a rom without exporting symbols or lists
dasm(src, { quick: true })

// Pass original command-line parameters
dasm(src, { parameters: "-f3 -p2 -v4 -DVER=5" })
```

These are all the options currently parsed:

* `format`: binary output format. Dictates the size and arrangement of the generated ROM.
  * `1` (default): output includes a 2-byte origin header.
  * `2`: random access segment format. Output is made of chuncks that include a 4-byte origin and length header.
  * `3`: raw format. Just the data, no headers.
* `quick`: boolean. If set to `true`, don't export any symbol and pass list as part of its returned data. Defaults to false.
* (TODO) `parameters`: string. List of switches passed to dasm as if it was being called from the command line.
* (TODO) `include`: key-value object. This is a list of files that should be made available for the source code to `include`. The key contains the filename, and the value, its content.
* (TODO) `machine`: target machine. Similarly to dasm's `-I` switch, this picks a list of (embedded) files to make available to the `include` command.
  * `"atari2600"`: includes dasm's own `atari2600/macro.h` and `atari2600/vcs.h` files.
  * `"channel-f"`: includes dasm's own `channel-f/macro.h` and `channel-f/ves.h` files.

Check [any cloned copy of the dasm documentation on GitHub](https://github.com/search?utf8=%E2%9C%93&q=%22DOCUMENTATION+FOR+DASM%2C+a+high+level+macro+cross+assembler+for%3A%22+extension%3Atxt&type=Code&ref=searchresults) for a list of all command-line switches available, and more information on binary formats.

### Returned object

The object returned by the `dasm` function has more than just a binary ROM. This is what's available:

* `data`: `Uint8Array`. The exported ROM, as a list of integers.
* `output`: `string[]`. All data written by dasm to `stdout`.
* (TODO) `list`: `IList[]`. A list of all parsing passes performed in the source code, and their generated list of lines.
* `listRaw`: `string`. The raw output of the list file (equivalent to the `-L` switch).
* `symbols`: `ISymbol[]`. A parsed list of all symbols (labels and constants) defined by the source code.
* `symbolsRaw`: `string`. The raw output of the symbols file (equivalent to the `-s` switch).

### More information

TypeScript definitions are included with this distribution, so TypeScript projects can use the module and get type checking and completion for all `dasm` calls. Non-TypeScript JavaScript developers using Visual Studio Code will also benefit from auto-completion without any change thanks to VSC's [Automatic Type Acquisition](http://code.visualstudio.com/updates/v1_7#_better-javascript-intellisense).

## Todo

* `machines` option: recompile dasm with ./machine files; parse option
* `includes` option: parse option; write files to FS
* `parameters` option: parse option
* Parse list output in a more concise way
* More examples, including on how to include files
* Fix the incomplete list file exporting
* More tests: all options
* Command-line package? (`dasm-cli`)

Contributions are welcome.

## License

This follows dasm itself and uses the [GNU Public License v2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html).