# The dasm macro assembler (for JavaScript)

This is an [emscripten](https://github.com/kripken/emscripten)-compiled version of the [dasm macro assembler](http://dasm-dillon.sourceforge.net/). It was created so 6502 assembkly code could be compiled from JavaScript code. More especifically, it can be used to create Atari VCS 2600 and Fairchild Channel F roms from its macro assembly source code.

## Technical information

This package uses version 2.20.11 of dasm.

It was built on Linux (err, Windows 10 bash) from the dasm source using the following commands:

```shell
emmake make
mv src/dasm src/dasm.bc
emcc src/dasm.bc -o dasm.js
```

The following changes were manually applied to the exported file:

1. Wrapped the code with a function that could export it as a module
2. Exported the created module as the result of a function call
3. Exposed its internal file system through a `FS` variable

## Usage

```JavaScript
import * as dasm from "dasm";

// Read utf-8 assembly source
const src = "...";

// Run with any number of parameters
const result = dasm(src, "-f1", "-ofile.out", "-lfile.lst", ...);

// Read the output as a binarty (int array)
const ROM = result.FS.readFile("file.out");
```

## More information

Please [download dasm](https://sourceforge.net/projects/dasm-dillon/) to check its command line documentation.

Check the [emscripten FileSystem](https://kripken.github.io/emscripten-site/docs/api_reference/Filesystem-API.html) to learn about `FS`.

## Todo

* More examples, including on how to include files
* Expose the module initialization options
* TypeScript definitions

Constributions are welcome.

## License

This follows dasm itself and uses the [GNU Public License v 2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html).