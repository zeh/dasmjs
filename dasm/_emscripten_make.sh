echo
echo Compiling dasm with emscripten
echo This requires the emsdk installed in /usr/bin/emsdk
echo

cd src
source /usr/bin/emsdk/emsdk_env.sh
emcc --version

echo
echo ============
echo REMOVING OLD
echo ============
echo

rm dasm.js
rm src/dasm.bc

echo
echo ========
echo CLEANING
echo ========
echo

make clean

echo
echo =========
echo COMPILING
echo =========
echo

emmake make

echo
echo ==========
echo GENERATING
echo ==========
echo

mv src/dasm src/dasm.bc
emcc src/dasm.bc \
	-O3 \
	--memory-init-file 0 \
	-g1 \
	-s FORCE_FILESYSTEM=1 \
	--pre-js ../prejs.txt \
	--post-js ../postjs.txt \
	--embed-file machines \
	-o dasm.js
mv dasm.js ..

echo
echo =================
echo CLEANING UP AGAIN
echo =================
echo

make clean
rm src/dasm.bc

echo
echo ====
echo DONE
echo ====
echo

echo
echo Library dasm generated as dasm.js \(hopefully\).
echo

cd ..