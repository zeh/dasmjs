rm dasm.js
rm src/dasm.bc
make clean
emmake make
mv src/dasm src/dasm.bc
emcc src/dasm.bc -s FORCE_FILESYSTEM=1 -o dasm.js
