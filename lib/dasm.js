// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var exports = module.exports = {};

exports.DASM = function(Module) {
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    assert(ret % 2 === 0);
    table.push(func);
    for (var i = 0; i < 2-1; i++) table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;


// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 1093784;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });

var _stdout;
var _stdout=_stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;



























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































/* memory initializer */ allocate([0,0,0,0,1,0,0,0,224,42,0,0,1,0,0,0,1,0,0,0,192,42,0,0,2,0,0,0,1,0,0,0,128,28,0,0,3,0,0,0,1,0,0,0,224,23,0,0,4,0,0,0,1,0,0,0,216,19,0,0,5,0,0,0,1,0,0,0,96,17,0,0,6,0,0,0,1,0,0,0,104,14,0,0,7,0,0,0,1,0,0,0,112,11,0,0,8,0,0,0,1,0,0,0,240,7,0,0,9,0,0,0,1,0,0,0,152,4,0,0,10,0,0,0,0,0,0,0,160,42,0,0,11,0,0,0,1,0,0,0,104,40,0,0,12,0,0,0,1,0,0,0,56,38,0,0,13,0,0,0,0,0,0,0,136,35,0,0,14,0,0,0,1,0,0,0,136,32,0,0,15,0,0,0,0,0,0,0,184,30,0,0,16,0,0,0,1,0,0,0,224,29,0,0,17,0,0,0,0,0,0,0,136,29,0,0,18,0,0,0,0,0,0,0,56,29,0,0,19,0,0,0,1,0,0,0,208,28,0,0,20,0,0,0,1,0,0,0,96,28,0,0,21,0,0,0,1,0,0,0,16,28,0,0,22,0,0,0,1,0,0,0,160,27,0,0,23,0,0,0,1,0,0,0,56,27,0,0,24,0,0,0,1,0,0,0,136,26,0,0,25,0,0,0,0,0,0,0,24,26,0,0,26,0,0,0,1,0,0,0,168,25,0,0,27,0,0,0,1,0,0,0,64,25,0,0,28,0,0,0,1,0,0,0,208,24,0,0,29,0,0,0,1,0,0,0,88,24,0,0,30,0,0,0,1,0,0,0,192,23,0,0,31,0,0,0,1,0,0,0,104,23,0,0,32,0,0,0,1,0,0,0,8,23,0,0,33,0,0,0,1,0,0,0,168,22,0,0,34,0,0,0,1,0,0,0,32,22,0,0,255,255,255,255,1,0,0,0,176,21,0,0,10,0,0,0,0,0,0,0,68,65,83,77,32,50,46,50,48,46,49,49,32,50,48,49,52,48,51,48,52,0,0,0,112,115,104,120,0,0,0,0,105,110,115,0,0,0,0,0,79,70,70,0,0,0,0,0,112,115,104,98,0,0,0,0,105,110,120,0,0,0,0,0,97,115,100,0,0,0,0,0,79,78,0,0,0,0,0,0,112,115,104,97,0,0,0,0,100,101,115,0,0,0,0,0,68,101,98,117,103,32,116,114,97,99,101,32,37,115,10,0,97,110,100,98,0,0,0,0,111,114,97,98,0,0,0,0,100,101,120,0,0,0,0,0,73,110,118,97,108,105,100,32,115,111,114,116,105,110,103,32,109,111,100,101,32,102,111,114,32,45,84,32,111,112,116,105,111,110,44,32,109,117,115,116,32,98,101,32,48,32,111,114,32,49,0,0,0,0,0,0,98,99,99,0,0,0,0,0,111,114,97,97,0,0,0,0,99,112,120,0,0,0,0,0,98,101,113,0,0,0,0,0,73,110,118,97,108,105,100,32,101,114,114,111,114,32,102,111,114,109,97,116,32,102,111,114,32,45,69,44,32,109,117,115,116,32,98,101,32,48,44,32,49,44,32,50,0,0,0,0,110,111,112,0,0,0,0,0,97,115,114,98,0,0,0,0,82,101,112,111,114,116,32,98,117,103,115,32,116,111,32,100,97,115,109,45,100,105,108,108,111,110,45,100,105,115,99,117,115,115,64,108,105,115,116,115,46,115,102,46,110,101,116,32,112,108,101,97,115,101,33,0,98,105,116,97,0,0,0,0,110,101,103,0,0,0,0,0,97,115,114,97,0,0,0,0,100,111,111,112,32,64,32,37,100,32,117,110,97,114,121,10,0,0,0,0,0,0,0,0,45,69,35,32,32,32,32,32,32,101,114,114,111,114,32,102,111,114,109,97,116,32,40,100,101,102,97,117,108,116,32,48,32,61,32,77,83,44,32,49,32,61,32,68,105,108,108,111,110,44,32,50,32,61,32,71,78,85,41,0,0,0,0,0,110,101,103,98,0,0,0,0,108,111,110,103,0,0,0,0,97,115,114,0,0,0,0,0,45,84,35,32,32,32,32,32,32,115,121,109,98,111,108,32,116,97,98,108,101,32,115,111,114,116,105,110,103,32,40,100,101,102,97,117,108,116,32,48,32,61,32,97,108,112,104,97,98,101,116,105,99,97,108,44,32,49,32,61,32,97,100,100,114,101,115,115,47,118,97,108,117,101,41,0,0,0,0,0,110,101,103,97,0,0,0,0,80,67,58,32,37,48,52,108,120,32,32,77,78,69,77,79,78,73,67,58,32,37,115,32,32,97,100,100,114,109,111,100,101,58,32,37,100,32,32,0,108,115,108,100,0,0,0,0,45,80,35,32,32,32,32,32,32,109,97,120,105,109,117,109,32,110,117,109,98,101,114,32,111,102,32,112,97,115,115,101,115,44,32,119,105,116,104,32,102,101,119,101,114,32,99,104,101,99,107,115,0,0,0,0,109,117,108,0,0,0,0,0,108,115,108,98,0,0,0,0,45,112,35,32,32,32,32,32,32,109,97,120,105,109,117,109,32,110,117,109,98,101,114,32,111,102,32,112,97,115,115,101,115,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,77,110,101,109,111,110,105,99,32,39,37,115,39,46,0,0,108,115,114,100,0,0,0,0,108,115,108,97,0,0,0,0,45,73,100,105,114,32,32,32,32,115,101,97,114,99,104,32,100,105,114,101,99,116,111,114,121,32,102,111,114,32,73,78,67,76,85,68,69,32,97,110,100,32,73,78,67,66,73,78,0,0,0,0,0,0,0,0,108,115,114,0,0,0,0,0,97,115,108,100,0,0,0,0,97,115,0,0,0,0,0,0,45,77,115,121,109,98,111,108,61,101,120,112,114,101,115,115,105,111,110,32,32,32,100,101,102,105,110,101,32,115,121,109,98,111,108,32,117,115,105,110,103,32,69,81,77,32,40,115,97,109,101,32,97,115,32,45,68,41,0,0,0,0,0,0,108,115,114,98,0,0,0,0,116,120,97,0,0,0,0,0,97,115,108,98,0,0,0,0,45,68,115,121,109,98,111,108,61,101,120,112,114,101,115,115,105,111,110,32,32,32,100,101,102,105,110,101,32,115,121,109,98,111,108,44,32,115,101,116,32,116,111,32,101,120,112,114,101,115,115,105,111,110,0,0,97,110,100,97,0,0,0,0,108,115,114,97,0,0,0,0,116,115,116,120,0,0,0,0,97,115,108,97,0,0,0,0,45,68,115,121,109,98,111,108,32,32,32,32,32,32,32,32,32,32,32,32,32,32,100,101,102,105,110,101,32,115,121,109,98,111,108,44,32,115,101,116,32,116,111,32,48,0,0,0,97,115,114,120,0,0,0,0,108,115,108,100,0,0,0,0,116,115,116,97,0,0,0,0,108,115,108,0,0,0,0,0,98,99,115,0,0,0,0,0,45,100,32,32,32,32,32,32,32,100,101,98,117,103,32,109,111,100,101,32,40,102,111,114,32,100,101,118,101,108,111,112,101,114,115,41,0,0,0,0,37,100,0,0,0,0,0,0,108,115,108,0,0,0,0,0,116,115,116,0,0,0,0,0,97,115,108,0,0,0,0,0,45,118,35,32,32,32,32,32,32,118,101,114,98,111,115,101,110,101,115,115,32,48,45,52,32,40,100,101,102,97,117,108,116,32,48,41,0,0,0,0,119,0,0,0,0,0,0,0,97,110,100,98,0,0,0,0,108,115,108,98,0,0,0,0,116,97,120,0,0,0,0,0,119,97,105,0,0,0,0,0,100,111,111,112,0,0,0,0,45,115,110,97,109,101,32,32,32,115,121,109,98,111,108,32,100,117,109,112,32,102,105,108,101,32,110,97,109,101,32,40,101,108,115,101,32,110,111,110,101,32,103,101,110,101,114,97,116,101,100,41,0,0,0,0,113,108,0,0,0,0,0,0,108,115,108,97,0,0,0,0,115,119,105,0,0,0,0,0,119,111,114,100,0,0,0,0,115,119,105,0,0,0,0,0,45,76,110,97,109,101,32,32,32,108,105,115,116,32,102,105,108,101,44,32,99,111,110,116,97,105,110,105,110,103,32,97,108,108,32,112,97,115,115,101,115,0,0,0,0,0,0,0,113,117,0,0,0,0,0,0,108,100,121,0,0,0,0,0,115,117,98,0,0,0,0,0,102,56,0,0,0,0,0,0,114,101,115,0,0,0,0,0,114,116,115,0,0,0,0,0,45,108,110,97,109,101,32,32,32,108,105,115,116,32,102,105,108,101,32,110,97,109,101,32,40,101,108,115,101,32,110,111,110,101,32,103,101,110,101,114,97,116,101,100,41,0,0,0,113,0,0,0,0,0,0,0,108,100,120,0,0,0,0,0,115,116,120,0,0,0,0,0,114,116,105,0,0,0,0,0,45,111,110,97,109,101,32,32,32,111,117,116,112,117,116,32,102,105,108,101,32,110,97,109,101,32,40,101,108,115,101,32,97,46,111,117,116,41,0,0,68,105,118,105,115,105,111,110,32,98,121,32,122,101,114,111,46,0,0,0,0,0,0,0,112,0,0,0,0,0,0,0,108,100,115,0,0,0,0,0,115,116,97,0,0,0,0,0,114,111,114,98,0,0,0,0,45,102,35,32,32,32,32,32,32,111,117,116,112,117,116,32,102,111,114,109,97,116,32,49,45,51,32,40,100,101,102,97,117,108,116,32,49,41,0,0,112,99,49,0,0,0,0,0,108,100,100,0,0,0,0,0,115,101,105,0,0,0,0,0,114,111,114,97,0,0,0,0,97,109,100,0,0,0,0,0,85,115,97,103,101,58,32,100,97,115,109,32,115,111,117,114,99,101,102,105,108,101,32,91,111,112,116,105,111,110,115,93,0,0,0,0,0,0,0,0,112,48,0,0,0,0,0,0,108,100,97,98,0,0,0,0,115,101,99,0,0,0,0,0,114,111,114,0,0,0,0,0,84,104,101,114,101,32,105,115,32,65,66,83,79,76,85,84,69,76,89,32,78,79,32,87,65,82,82,65,78,84,89,44,32,116,111,32,116,104,101,32,101,120,116,101,110,116,32,112,101,114,109,105,116,116,101,100,32,98,121,32,108,97,119,46,0,0,0,0,0,0,0,0,112,99,48,0,0,0,0,0,97,100,100,100,0,0,0,0,108,100,97,97,0,0,0,0,115,98,99,0,0,0,0,0,114,111,108,98,0,0,0,0,68,65,83,77,32,105,115,32,102,114,101,101,32,115,111,102,116,119,97,114,101,58,32,121,111,117,32,97,114,101,32,102,114,101,101,32,116,111,32,99,104,97,110,103,101,32,97,110,100,32,114,101,100,105,115,116,114,105,98,117,116,101,32,105,116,46,0,0,0,0,0,0,107,108,0,0,0,0,0,0,97,115,114,97,0,0,0,0,106,115,114,0,0,0,0,0,114,116,115,0,0,0,0,0,114,111,108,97,0,0,0,0,98,99,99,0,0,0,0,0,76,105,99,101,110,115,101,32,71,80,76,118,50,43,58,32,71,78,85,32,71,80,76,32,118,101,114,115,105,111,110,32,50,32,111,114,32,108,97,116,101,114,32,40,115,101,101,32,102,105,108,101,32,67,79,80,89,73,78,71,41,46,0,0,107,117,0,0,0,0,0,0,106,109,112,0,0,0,0,0,114,116,105,0,0,0,0,0,116,121,97,0,0,0,0,0,114,111,108,0,0,0,0,0,67,111,112,121,114,105,103,104,116,32,40,99,41,32,49,57,56,56,45,50,48,48,56,32,98,121,32,118,97,114,105,111,117,115,32,97,117,116,104,111,114,115,32,40,115,101,101,32,102,105,108,101,32,65,85,84,72,79,82,83,41,46,0,0,107,0,0,0,0,0,0,0,97,110,100,97,0,0,0,0,105,110,121,0,0,0,0,0,114,115,112,0,0,0,0,0,116,120,115,0,0,0,0,0,112,117,108,98,0,0,0,0,101,118,97,108,116,111,112,32,64,40,65,44,79,41,32,37,100,32,37,100,10,0,0,0,45,45,45,32,69,110,100,32,111,102,32,83,121,109,98,111,108,32,76,105,115,116,46,10,0,0,0,0,0,0,0,0,105,115,0,0,0,0,0,0,105,110,120,0,0,0,0,0,114,111,114,120,0,0,0,0,116,120,97,0,0,0,0,0,98,121,116,101,0,0,0,0,112,117,108,97,0,0,0,0,32,34,37,115,34,0,0,0,104,0,0,0,0,0,0,0,105,110,115,0,0,0,0,0,114,111,114,97,0,0,0,0,70,56,0,0,0,0,0,0,116,115,120,0,0,0,0,0,112,117,108,120,0,0,0,0,37,45,50,52,115,32,37,45,49,50,115,0,0,0,0,0,100,99,0,0,0,0,0,0,105,110,99,0,0,0,0,0,114,111,114,0,0,0,0,0,116,97,121,0,0,0,0,0,112,115,104,120,0,0,0,0,32,40,115,111,114,116,101,100,32,98,121,32,115,121,109,98,111,108,41,10,0,0,0,0,85,110,98,97,108,97,110,99,101,100,32,66,114,97,99,101,115,32,91,93,46,0,0,0,100,99,48,0,0,0,0,0,105,110,99,98,0,0,0,0,114,111,108,120,0,0,0,0,116,97,120,0,0,0,0,0,112,115,104,98,0,0,0,0,32,40,115,111,114,116,101,100,32,98,121,32,97,100,100,114,101,115,115,41,10,0,0,0,97,0,0,0,0,0,0,0,105,110,99,97,0,0,0,0,114,111,108,97,0,0,0,0,115,116,121,0,0,0,0,0,112,115,104,97,0,0,0,0,97,109,0,0,0,0,0,0,37,45,50,52,115,32,37,115,10,0,0,0,0,0,0,0,104,108,0,0,0,0,0,0,105,100,105,118,0,0,0,0,114,111,108,0,0,0,0,0,115,116,120,0,0,0,0,0,111,114,97,98,0,0,0,0,32,40,117,110,115,111,114,116,101,100,32,45,32,110,111,116,32,101,110,111,117,103,104,32,109,101,109,111,114,121,32,116,111,32,115,111,114,116,33,41,10,0,0,0,0,0,0,0,97,98,97,0,0,0,0,0,104,117,0,0,0,0,0,0,97,100,100,98,0,0,0,0,102,100,105,118,0,0,0,0,111,114,97,0,0,0,0,0,115,116,97,0,0,0,0,0,111,114,97,97,0,0,0,0,45,45,45,32,83,121,109,98,111,108,32,76,105,115,116,0,106,0,0,0,0,0,0,0,97,115,114,0,0,0,0,0,101,111,114,98,0,0,0,0,110,111,112,0,0,0,0,0,115,114,101,0,0,0,0,0,110,111,112,0,0,0,0,0,97,115,114,0,0,0,0,0,87,97,114,110,105,110,103,58,32,85,110,97,98,108,101,32,116,111,32,111,112,101,110,32,83,121,109,98,111,108,32,68,117,109,112,32,102,105,108,101,32,39,37,115,39,10,0,0,40,105,115,41,45,0,0,0,101,111,114,97,0,0,0,0,110,101,103,120,0,0,0,0,115,108,111,0,0,0,0,0,109,117,108,0,0,0,0,0,119,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,97,100,100,100,0,0,0,0,100,101,121,0,0,0,0,0,110,101,103,97,0,0,0,0,115,104,121,0,0,0,0,0,108,100,100,0,0,0,0,0,83,84,82,73,78,71,58,32,37,115,10,0,0,0,0,0,70,97,116,97,108,32,97,115,115,101,109,98,108,121,32,101,114,114,111,114,58,32,37,115,10,0,0,0,0,0,0,0,40,105,115,41,43,0,0,0,100,101,120,0,0,0,0,0,110,101,103,0,0,0,0,0,115,104,120,0,0,0,0,0,100,99,0,0,0,0,0,0,108,100,97,98,0,0,0,0,115,111,102,116,119,97,114,101,32,101,114,114,111,114,0,0,105,0,0,0,0,0,0,0,100,101,115,0,0,0,0,0,108,115,114,120,0,0,0,0,54,56,104,99,49,49,0,0,115,104,115,0,0,0,0,0,108,100,97,97,0,0,0,0,117,110,97,98,108,101,32,116,111,32,109,97,108,108,111,99,0,0,0,0,0,0,0,0,40,105,115,41,0,0,0,0,100,101,99,0,0,0,0,0,108,115,114,97,0,0,0,0,115,104,97,0,0,0,0,0,106,115,114,0,0,0,0,0,65,98,111,114,116,105,110,103,32,97,115,115,101,109,98,108,121,10,0,0,0,0,0,0,69,120,112,114,101,115,115,105,111,110,32,116,97,98,108,101,32,111,118,101,114,102,108,111,119,46,0,0,0,0,0,0,115,0,0,0,0,0,0,0,100,101,99,98,0,0,0,0,108,115,114,0,0,0,0,0,115,101,105,0,0,0,0,0,106,109,112,0,0,0,0,0,37,115,10,0,0,0,0,0,32,0,0,0,0,0,0,0,100,101,99,97,0,0,0,0,108,115,108,120,0,0,0,0,115,101,100,0,0,0,0,0,105,110,99,98,0,0,0,0,97,105,0,0,0,0,0,0,10,0,0,0,0,0,0,0,97,100,99,0,0,0,0,0,120,115,0,0,0,0,0,0,100,97,97,0,0,0,0,0,108,115,108,97,0,0,0,0,115,101,99,0,0,0,0,0,105,110,99,97,0,0,0,0,73,110,118,97,108,105,100,32,101,114,114,111,114,32,102,111,114,109,97,116,44,32,105,110,116,101,114,110,97,108,32,101,114,114,111,114,33,0,0,0,120,109,0,0,0,0,0,0,97,100,100,97,0,0,0,0,99,112,121,0,0,0,0,0,108,115,108,0,0,0,0,0,115,98,120,0,0,0,0,0,105,110,99,0,0,0,0,0,37,115,58,37,108,117,58,32,101,114,114,111,114,58,32,0,120,105,0,0,0,0,0,0,97,115,108,120,0,0,0,0,99,112,120,0,0,0,0,0,108,100,120,0,0,0,0,0,115,98,99,0,0,0,0,0,101,111,114,98,0,0,0,0,97,115,108,0,0,0,0,0,108,105,110,101,32,37,55,108,100,32,37,45,49,48,115,32,0,0,0,0,0,0,0,0,120,100,99,0,0,0,0,0,99,112,100,0,0,0,0,0,108,100,97,0,0,0,0,0,115,97,120,0,0,0,0,0,101,111,114,97,0,0,0,0,37,115,32,40,37,108,117,41,58,32,101,114,114,111,114,58,32,0,0,0,0,0,0,0,115,116,0,0,0,0,0,0,97,100,100,98,0,0,0,0,99,111,109,0,0,0,0,0,106,115,114,0,0,0,0,0,114,116,115,0,0,0,0,0,100,101,99,98,0,0,0,0,37,108,100,0,0,0,0,0,66,97,100,32,101,114,114,111,114,32,69,82,82,79,82,33,0,0,0,0,0,0,0,0,115,114,0,0,0,0,0,0,99,111,109,98,0,0,0,0,106,109,112,0,0,0,0,0,114,116,105,0,0,0,0,0,101,114,114,0,0,0,0,0,100,101,99,97,0,0,0,0,87,97,114,110,105,110,103,58,32,85,110,97,98,108,101,32,116,111,32,111,112,101,110,32,39,37,115,39,10,0,0,0,115,108,0,0,0,0,0,0,99,111,109,97,0,0,0,0,105,110,120,0,0,0,0,0,54,56,72,67,49,49,0,0,114,114,97,0,0,0,0,0,100,101,99,0,0,0,0,0,45,45,45,45,45,45,45,32,70,73,76,69,32,37,115,32,76,69,86,69,76,32,37,100,32,80,65,83,83,32,37,100,10,0,0,0,0,0,0,0,112,111,112,0,0,0,0,0,99,109,112,98,0,0,0,0,105,110,99,120,0,0,0,0,114,111,114,0,0,0,0,0,100,97,97,0,0,0,0,0,97,100,99,0,0,0,0,0,37,46,42,115,32,73,110,99,108,117,100,105,110,103,32,102,105,108,101,32,34,37,115,34,10,0,0,0,0,0,0,0,83,121,110,116,97,120,32,69,114,114,111,114,32,39,37,115,39,46,0,0,0,0,0,0,112,107,0,0,0,0,0,0,99,109,112,97,0,0,0,0,105,110,99,97,0,0,0,0,114,111,108,0,0,0,0,0,110,101,103,98,0,0,0,0,114,0,0,0,0,0,0,0,112,105,0,0,0,0,0,0,99,108,118,0,0,0,0,0,105,110,99,0,0,0,0,0,114,108,97,0,0,0,0,0,110,101,103,97,0,0,0,0,97,100,99,0,0,0,0,0,37,48,56,108,120,32,37,115,10,0,0,0,0,0,0,0,111,117,116,115,0,0,0,0,99,108,114,0,0,0,0,0,101,111,114,0,0,0,0,0,112,108,112,0,0,0,0,0,110,101,103,0,0,0,0,0,111,117,116,0,0,0,0,0,97,100,99,98,0,0,0,0,99,108,114,98,0,0,0,0,100,101,120,0,0,0,0,0,112,108,97,0,0,0,0,0,99,111,109,98,0,0,0,0,41,0,0,0,0,0,0,0,111,109,0,0,0,0,0,0,97,115,108,97,0,0,0,0,99,108,114,97,0,0,0,0,100,101,99,120,0,0,0,0,112,104,112,0,0,0,0,0,99,111,109,97,0,0,0,0,97,114,114,0,0,0,0,0,83,0,0,0,0,0,0,0,111,105,0,0,0,0,0,0,99,108,105,0,0,0,0,0,100,101,99,97,0,0,0,0,112,104,97,0,0,0,0,0,99,111,109,0,0,0,0,0,82,0,0,0,0,0,0,0,110,115,0,0,0,0,0,0,97,100,100,97,0,0,0,0,99,108,99,0,0,0,0,0,100,101,99,0,0,0,0,0,111,114,97,0,0,0,0,0,99,98,97,0,0,0,0,0,39,93,39,32,101,114,114,111,114,44,32,110,111,32,97,114,103,32,111,110,32,115,116,97,99,107,0,0,0,0,0,0,32,0,0,0,0,0,0,0,110,111,112,0,0,0,0,0,99,98,97,0,0,0,0,0,99,112,120,0,0,0,0,0,110,111,112,0,0,0,0,0,104,101,120,0,0,0,0,0,99,109,112,98,0,0,0,0,40,0,0,0,0,0,0,0,110,109,0,0,0,0,0,0,98,118,115,0,0,0,0,0,99,111,109,120,0,0,0,0,54,56,55,48,53,0,0,0,108,120,97,0,0,0,0,0,99,109,112,97,0,0,0,0,101,113,109,32,0,0,0,0,110,105,0,0,0,0,0,0,98,118,99,0,0,0,0,0,99,111,109,97,0,0,0,0,108,115,114,0,0,0,0,0,99,108,114,98,0,0,0,0,115,101,103,109,101,110,116,58,32,37,115,32,37,115,32,32,118,115,32,99,117,114,114,101,110,116,32,111,114,103,58,32,37,48,52,108,120,10,0,0,32,32,32,32,0,0,0,0,84,111,111,32,109,97,110,121,32,112,97,115,115,101,115,32,40,37,115,41,46,0,0,0,108,114,0,0,0,0,0,0,98,115,114,0,0,0,0,0,99,111,109,0,0,0,0,0,108,100,121,0,0,0,0,0,99,108,114,97,0,0,0,0,85,110,104,97,110,100,108,101,100,32,105,110,116,101,114,110,97,108,32,102,111,114,109,97,116,32,115,112,101,99,105,102,105,101,114,0,0,0,0,0,115,116,114,32,0,0,0,0,108,110,107,0,0,0,0,0,98,115,101,116,0,0,0,0,99,109,112,0,0,0,0,0,108,100,120,0,0,0,0,0,99,108,114,0,0,0,0,0,110,111,32,114,101,112,101,97,116,0,0,0,0,0,0,0,100,100,0,0,0,0,0,0,32,32,32,32,32,0,0,0,108,109,0,0,0,0,0,0,98,114,115,101,116,0,0,0,99,108,114,120,0,0,0,0,108,100,97,0,0,0,0,0,116,112,97,0,0,0,0,0,105,110,99,100,105,114,0,0,116,111,111,32,109,97,110,121,32,101,110,100,105,102,39,115,0,0,0,0,0,0,0,0,63,63,63,63,32,0,0,0,108,105,115,117,0,0,0,0,97,98,97,0,0,0,0,0,97,100,99,97,0,0,0,0,98,114,110,0,0,0,0,0,99,108,114,97,0,0,0,0,108,97,120,0,0,0,0,0,116,97,112,0,0,0,0,0,105,110,99,98,105,110,0,0,110,111,116,32,119,105,116,104,105,110,32,97,32,109,97,99,114,111,0,0,0,0,0,0,37,48,52,108,120,32,0,0,108,105,115,108,0,0,0,0,97,115,108,0,0,0,0,0,98,114,99,108,114,0,0,0,99,108,114,0,0,0,0,0,108,97,115,0,0,0,0,0,115,101,118,0,0,0,0,0,112,114,111,99,101,115,115,111,114,0,0,0,0,0,0,0,105,110,102,105,110,105,116,101,32,109,97,99,114,111,32,114,101,99,117,114,115,105,111,110,0,0,0,0,0,0,0,0,37,108,100,37,46,42,115,0,97,110,101,0,0,0,0,0,68,111,104,33,32,73,110,116,101,114,110,97,108,32,101,110,100,45,111,102,45,116,97,98,108,101,32,109,97,114,107,101,114,44,32,114,101,112,111,114,116,32,116,104,101,32,98,117,103,33,0,0,0,0,0,0,108,105,115,0,0,0,0,0,98,114,97,0,0,0,0,0,99,108,105,0,0,0,0,0,106,115,114,0,0,0,0,0,115,101,105,0,0,0,0,0,101,99,104,111,0,0,0,0,10,0,0,0,0,0,0,0,73,108,108,101,103,97,108,32,99,111,109,98,105,110,97,116,105,111,110,32,111,102,32,111,112,101,114,97,110,100,115,32,39,37,115,39,0,0,0,0,108,105,0,0,0,0,0,0,97,100,99,98,0,0,0,0,98,112,108,0,0,0,0,0,99,108,99,0,0,0,0,0,37,115,32,37,115,0,0,0,106,109,112,0,0,0,0,0,115,101,99,0,0,0,0,0,37,115,0,0,0,0,0,0,99,104,97,114,32,39,37,99,39,10,0,0,0,0,0,0,114,101,112,101,110,100,0,0,32,0,0,0,0,0,0,0,86,97,108,117,101,32,105,110,32,39,37,115,39,32,109,117,115,116,32,98,101,32,60,36,49,48,48,48,48,46,0,0,106,109,112,0,0,0,0,0,98,110,101,0,0,0,0,0,98,115,114,0,0,0,0,0,105,115,98,0,0,0,0,0,115,101,103,0,0,0,0,0,99,108,118,0,0,0,0,0,114,101,112,101,97,116,0,0,32,37,115,0,0,0,0,0,86,97,108,117,101,32,105,110,32,39,37,115,39,32,109,117,115,116,32,98,101,32,60,36,102,46,0,0,0,0,0,0,105,110,115,0,0,0,0,0,98,109,105,0,0,0,0,0,98,115,101,116,0,0,0,0,104,100,54,51,48,51,0,0,105,110,121,0,0,0,0,0,99,108,105,0,0,0,0,0,101,105,102,0,0,0,0,0,36,37,108,120,0,0,0,0,86,97,108,117,101,32,105,110,32,39,37,115,39,32,109,117,115,116,32,98,101,32,60,36,56,46,0,0,0,0,0,0,105,110,99,0,0,0,0,0,98,108,116,0,0,0,0,0,98,114,115,101,116,0,0,0,105,110,120,0,0,0,0,0,99,108,99,0,0,0,0,0,101,110,100,105,102,0,0,0,37,115,0,0,0,0,0,0,86,97,108,117,101,32,105,110,32,39,37,115,39,32,109,117,115,116,32,98,101,32,60,36,49,48,46,0,0,0,0,0,83,111,117,114,99,101,32,105,115,32,110,111,116,32,114,101,115,111,108,118,97,98,108,101,46,0,0,0,0,0,0,0,105,110,0,0,0,0,0,0,98,108,115,0,0,0,0,0,98,114,99,108,114,0,0,0,105,110,99,0,0,0,0,0,98,115,114,0,0,0,0,0,101,108,115,101,0,0,0,0,111,108,100,32,118,97,108,117,101,58,32,36,37,48,52,108,120,32,32,110,101,119,32,118,97,108,117,101,58,32,36,37,48,52,108,120,10,0,0,0,86,97,108,117,101,32,105,110,32,39,37,115,39,32,109,117,115,116,32,98,101,32,49,32,111,114,32,52,46,0,0,0,101,105,0,0,0,0,0,0,98,108,111,0,0,0,0,0,98,114,110,0,0,0,0,0,101,111,114,0,0,0,0,0,98,112,108,0,0,0,0,0,105,102,0,0,0,0,0,0,109,117,115,116,32,115,112,101,99,105,102,121,32,69,81,77,32,108,97,98,101,108,32,102,111,114,32,68,86,0,0,0,100,119,0,0,0,0,0,0,66,97,100,32,111,117,116,112,117,116,32,102,111,114,109,97,116,32,115,112,101,99,105,102,105,101,100,46,0,0,0,0,100,115,0,0,0,0,0,0,98,108,101,0,0,0,0,0,98,114,97,0,0,0,0,0,100,101,121,0,0,0,0,0,98,118,115,0,0,0,0,0,105,102,110,99,111,110,115,116,0,0,0,0,0,0,0,0,69,81,77,32,108,97,98,101,108,32,110,111,116,32,102,111,117,110,100,0,0,0,0,0,79,110,108,121,32,111,110,101,32,112,114,111,99,101,115,115,111,114,32,116,121,112,101,32,109,97,121,32,98,101,32,115,101,108,101,99,116,101,100,46,0,0,0,0,0,0,0,0,100,105,0,0,0,0,0,0,97,98,121,0,0,0,0,0,98,105,116,98,0,0,0,0,98,112,108,0,0,0,0,0,100,101,120,0,0,0,0,0,98,118,99,0,0,0,0,0,105,102,99,111,110,115,116,0,66,97,100,32,101,114,114,111,114,32,118,97,108,117,101,32,40,105,110,116,101,114,110,97,108,32,101,114,114,111,114,41,46,0,0,0,0,0,0,0,100,99,105,0,0,0,0,0,97,110,100,0,0,0,0,0,98,105,116,97,0,0,0,0,98,110,101,0,0,0,0,0,100,101,99,0,0,0,0,0,98,110,101,0,0,0,0,0,109,101,120,105,116,0,0,0,120,46,120,0,0,0,0,0,97,110,100,0,0,0,0,0,82,69,80,69,65,84,32,112,97,114,97,109,101,116,101,114,32,60,32,48,32,40,105,103,110,111,114,101,100,41,46,0,99,111,109,0,0,0,0,0,98,104,115,0,0,0,0,0,98,109,115,0,0,0,0,0,100,99,112,0,0,0,0,0,98,109,105,0,0,0,0,0,101,110,100,109,0,0,0,0,40,77,117,115,116,32,98,101,32,97,32,118,97,108,105,100,32,104,101,120,32,100,105,103,105,116,41,10,0,0,0,0,80,114,111,99,101,115,115,111,114,32,39,37,115,39,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,0,0,0,99,109,0,0,0,0,0,0,97,100,99,97,0,0,0,0,98,104,105,0,0,0,0,0,98,109,105,0,0,0,0,0,114,101,100,111,32,49,51,58,32,39,37,115,39,32,37,48,52,120,32,37,48,52,120,10,0,0,0,0,0,0,0,0,99,112,121,0,0,0,0,0,97,46,111,117,116,0,0,0,98,108,116,0,0,0,0,0,116,111,111,32,109,97,110,121,32,111,112,115,0,0,0,0,109,97,99,0,0,0,0,0,40,77,117,115,116,32,98,101,32,97,32,118,97,108,105,100,32,104,101,120,32,100,105,103,105,116,41,0,0,0,0,0,86,97,108,117,101,32,85,110,100,101,102,105,110,101,100,46,0,0,0,0,0,0,0,0,99,108,114,0,0,0,0,0,98,103,116,0,0,0,0,0,98,109,99,0,0,0,0,0,99,112,120,0,0,0,0,0,105,110,99,108,117,100,101,0,98,108,115,0,0,0,0,0,115,101,116,0,0,0,0,0,66,97,100,32,72,101,120,32,68,105,103,105,116,32,37,99,0,0,0,0,0,0,0,0,76,97,98,101,108,32,109,105,115,109,97,116,99,104,46,46,46,10,32,45,45,62,32,37,115,0,0,0,0,0,0,0,99,105,0,0,0,0,0,0,98,103,101,0,0,0,0,0,98,108,115,0,0,0,0,0,72,68,54,51,48,51,0,0,99,109,112,0,0,0,0,0,98,108,101,0,0,0,0,0,101,113,109,0,0,0,0,0,117,110,97,98,108,101,32,116,111,32,111,112,101,110,32,37,115,10,0,0,0,0,0,0,78,111,116,32,101,110,111,117,103,104,32,97,114,103,117,109,101,110,116,115,46,0,0,0,98,122,0,0,0,0,0,0,98,101,113,0,0,0,0,0,98,108,111,0,0,0,0,0,99,108,118,0,0,0,0,0,98,104,105,0,0,0,0,0,61,0,0,0,0,0,0,0,114,98,0,0,0,0,0,0,73,108,108,101,103,97,108,32,98,105,116,32,115,112,101,99,105,102,105,99,97,116,105,111,110,46,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,111,112,101,110,32,102,105,108,101,46,0,0,0,0,98,116,0,0,0,0,0,0,98,99,115,0,0,0,0,0,98,105,116,0,0,0,0,0,99,108,105,0,0,0,0,0,98,103,116,0,0,0,0,0,101,113,117,0,0,0,0,0,79,70,70,0,0,0,0,0,86,97,108,117,101,32,105,110,32,39,37,115,39,32,109,117,115,116,32,98,101,32,60,36,49,48,48,46,0,0,0,0,98,114,55,0,0,0,0,0,98,99,108,114,0,0,0,0,98,105,108,0,0,0,0,0,99,108,100,0,0,0,0,0,98,103,101,0,0,0,0,0,115,117,98,114,111,117,116,105,110,101,0,0,0,0,0,0,111,102,102,0,0,0,0,0,100,98,0,0,0,0,0,0,69,81,85,58,32,86,97,108,117,101,32,109,105,115,109,97,116,99,104,46,0,0,0,0,98,114,0,0,0,0,0,0,98,99,99,0,0,0,0,0,98,105,104,0,0,0,0,0,99,108,99,0,0,0,0,0,98,101,113,0,0,0,0,0,97,108,105,103,110,0,0,0,76,79,67,65,76,79,78,0,79,114,105,103,105,110,32,82,101,118,101,114,115,101,45,105,110,100,101,120,101,100,46,0,98,112,0,0,0,0,0,0,97,98,120,0,0,0,0,0,97,115,114,0,0,0,0,0,98,104,115,0,0,0,0,0,98,118,115,0,0,0,0,0,98,108,111,0,0,0,0,0,114,101,110,100,0,0,0,0,108,111,99,97,108,111,110,0,69,82,82,32,112,115,101,117,100,111,45,111,112,32,101,110,99,111,117,110,116,101,114,101,100,46,0,0,0,0,0,0,98,110,122,0,0,0,0,0,97,100,100,0,0,0,0,0,97,115,114,98,0,0,0,0,98,104,105,0,0,0,0,0,98,118,99,0,0,0,0,0,54,53,48,50,0,0,0,0,9,59,37,115,0,0,0,0,98,99,115,0,0,0,0,0,115,116,97,99,107,97,114,103,58,32,109,97,120,97,114,103,115,32,115,116,97,99,107,101,100,0,0,0,0,0,0,0,37,99,37,45,49,48,115,32,37,115,37,115,37,115,9,37,115,10,0,0,0,0,0,0,114,111,114,103,0,0,0,0,37,48,50,120,32,0,0,0,76,79,67,65,76,79,70,70,0,0,0,0,0,0,0,0,37,55,108,100,32,37,99,37,115,0,0,0,0,0,0,0,97,110,99,0,0,0,0,0,46,0,0,0,0,0,0,0,66,114,97,110,99,104,32,111,117,116,32,111,102,32,114,97,110,103,101,32,40,37,115,32,98,121,116,101,115,41,46,0,102,97,105,108,117,114,101,32,51,0,0,0,0,0,0,0,98,110,111,0,0,0,0,0,102,97,105,108,117,114,101,50,0,0,0,0,0,0,0,0,102,97,105,108,117,114,101,49,0,0,0,0,0,0,0,0,97,115,114,97,0,0,0,0,115,116,114,32,37,56,108,100,32,98,117,102,32,37,56,108,100,32,40,97,100,100,47,115,116,114,108,101,110,40,115,116,114,41,41,58,32,37,100,32,37,108,100,10,0,0,0,0,98,104,99,115,0,0,0,0,98,114,107,0,0,0,0,0,115,116,114,108,105,115,116,58,32,39,37,115,39,32,37,122,117,10,0,0,0,0,0,0,120,103,100,121,0,0,0,0,97,100,100,47,115,116,114,58,32,37,100,32,39,37,115,39,10,0,0,0,0,0,0,0,98,104,115,0,0,0,0,0,120,103,100,120,0,0,0,0,115,116,97,99,107,97,114,103,32,37,108,100,32,40,64,37,100,41,10,0,0,0,0,0,101,110,100,32,98,114,97,99,101,32,114,101,113,117,105,114,101,100,0,0,0,0,0,0,119,97,105,0,0,0,0,0,111,114,103,0,0,0,0,0,109,97,99,114,111,32,116,97,105,108,58,32,39,37,115,39,10,0,0,0,0,0,0,0,116,121,115,0,0,0,0,0,108,111,99,97,108,111,102,102,0,0,0,0,0,0,0,0,32,45,32,66,114,97,110,99,104,32,119,97,115,32,111,117,116,32,111,102,32,114,97,110,103,101,46,10,0,0,0,0,116,120,115,0,0,0,0,0,32,45,32,76,97,98,101,108,32,118,97,108,117,101,32,105,115,32,100,105,102,102,101,114,101,110,116,32,102,114,111,109,32,116,104,97,116,32,111,102,32,116,104,101,32,112,114,101,118,105,111,117,115,32,112,97,115,115,32,40,112,104,97,115,101,32,101,114,114,111,114,41,46,10,0,0,0,0,0,0,73,108,108,101,103,97,108,32,99,104,97,114,97,99,116,101,114,32,39,37,115,39,46,0,116,115,121,0,0,0,0,0,32,45,32,76,97,98,101,108,32,100,101,102,105,110,101,100,32,97,102,116,101,114,32,105,116,32,104,97,115,32,98,101,101,110,32,114,101,102,101,114,101,110,99,101,100,32,40,102,111,114,119,97,114,100,32,114,101,102,101,114,101,110,99,101,41,46,10,0,0,0,0,0,116,115,120,0,0,0,0,0,98,110,99,0,0,0,0,0,32,45,32,82,69,80,69,65,84,58,32,69,120,112,114,101,115,115,105,111,110,32,110,111,116,32,114,101,115,111,108,118,101,100,46,10,0,0,0,0,116,115,116,0,0,0,0,0,32,45,32,73,70,58,32,69,120,112,114,101,115,115,105,111,110,32,110,111,116,32,114,101,115,111,108,118,101,100,46,10,0,0,0,0,0,0,0,0,97,98,120,0,0,0,0,0,97,115,108,100,0,0,0,0,116,115,116,98,0,0,0,0,32,45,32,69,81,85,58,32,86,97,108,117,101,32,109,105,115,109,97,116,99,104,32,102,114,111,109,32,112,114,101,118,105,111,117,115,32,112,97,115,115,32,40,112,104,97,115,101,32,101,114,114,111,114,41,46,10,0,0,0,0,0,0,0,98,104,99,99,0,0,0,0,116,115,116,97,0,0,0,0,37,108,100,36,37,46,42,115,0,0,0,0,0,0,0,0,98,112,108,0,0,0,0,0,32,45,32,69,81,85,58,32,69,120,112,114,101,115,115,105,111,110,32,110,111,116,32,114,101,115,111,108,118,101,100,46,10,0,0,0,0,0,0,0,116,112,97,0,0,0,0,0,32,45,32,65,76,73,71,78,58,32,78,111,114,109,97,108,32,111,114,105,103,105,110,32,110,111,116,32,107,110,111,119,110,9,40,105,102,32,105,110,32,79,82,71,32,97,116,32,116,104,101,32,116,105,109,101,41,46,10,0,0,0,0,0,98,99,99,0,0,0,0,0,116,101,115,116,0,0,0,0,99,104,97,114,32,61,32,39,37,99,39,32,99,111,100,101,32,37,100,10,0,0,0,0,46,0,0,0,0,0,0,0,32,45,32,65,76,73,71,78,58,32,82,101,108,111,99,97,116,97,98,108,101,32,111,114,105,103,105,110,32,110,111,116,32,107,110,111,119,110,32,40,105,102,32,105,110,32,82,79,82,71,32,97,116,32,116,104,101,32,116,105,109,101,41,46,10,0,0,0,0,0,0,0,116,98,97,0,0,0,0,0,116,114,97,99,101,0,0,0,32,45,32,69,120,112,114,101,115,115,105,111,110,32,105,110,32,97,110,32,65,76,73,71,78,32,110,111,116,32,114,101,115,111,108,118,101,100,46,10,0,0,0,0,0,0,0,0,116,97,112,0,0,0,0,0,37,108,100,0,0,0,0,0,32,45,32,69,120,112,114,101,115,115,105,111,110,32,105,110,32,97,32,68,83,32,110,111,116,32,114,101,115,111,108,118,101,100,46,10,0,0,0,0,116,97,98,0,0,0,0,0,32,45,32,69,120,112,114,101,115,115,105,111,110,32,105,110,32,97,32,68,86,32,110,111,116,32,114,101,115,111,108,118,101,100,32,40,99,111,117,108,100,32,98,101,32,105,110,32,68,86,39,115,32,69,81,77,32,115,121,109,98,111,108,41,46,10,0,0,0,0,0,0,80,114,101,109,97,116,117,114,101,32,69,79,70,46,0,0,115,119,105,0,0,0,0,0,120,103,100,120,0,0,0,0,32,45,32,69,120,112,114,101,115,115,105,111,110,32,105,110,32,97,32,68,86,32,110,111,116,32,114,101,115,111,108,118,101,100,32,40,112,114,111,98,97,98,108,121,32,105,110,32,68,86,39,115,32,69,81,77,32,115,121,109,98,111,108,41,46,10,0,0,0,0,0,0,115,117,98,100,0,0,0,0,116,105,109,0,0,0,0,0,98,109,0,0,0,0,0,0,32,45,32,69,120,112,114,101,115,115,105,111,110,32,105,110,32,97,32,68,67,32,110,111,116,32,114,101,115,111,108,118,101,100,46,10,0,0,0,0,115,117,98,98,0,0,0,0,101,105,109,0,0,0,0,0,32,45,32,79,98,115,99,117,114,101,32,114,101,97,115,111,110,32,45,32,116,111,32,98,101,32,100,111,99,117,109,101,110,116,101,100,32,58,41,10,0,0,0,0,0,0,0,0,97,115,108,0,0,0,0,0,115,117,98,97,0,0,0,0,111,105,109,0,0,0,0,0,32,45,32,69,120,112,114,101,115,115,105,111,110,32,105,110,32,109,110,101,109,111,110,105,99,32,110,111,116,32,114,101,115,111,108,118,101,100,46,10,0,0,0,0,0,0,0,0,98,101,113,0,0,0,0,0,115,116,121,0,0,0,0,0,97,105,109,0,0,0,0,0,98,110,101,0,0,0,0,0,37,100,32,101,118,101,110,116,115,32,114,101,113,117,105,114,105,110,103,32,97,110,111,116,104,101,114,32,97,115,115,101,109,98,108,101,114,32,112,97,115,115,46,10,0,0,0,0,115,116,120,0,0,0,0,0,115,108,112,0,0,0,0,0,108,105,115,116,0,0,0,0,37,100,32,114,101,102,101,114,101,110,99,101,115,32,116,111,32,117,110,107,110,111,119,110,32,115,121,109,98,111,108,115,46,10,0,0,0,0,0,0,98,114,110,0,0,0,0,0,115,116,115,0,0,0,0,0,116,120,115,0,0,0,0,0,99,104,97,114,32,61,32,39,37,99,39,32,37,100,32,40,45,49,58,32,37,100,41,10,0,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,0,0,115,116,111,112,0,0,0,0,101,110,100,0,0,0,0,0,116,115,120,0,0,0,0,0,32,32,32,0,0,0,0,0,115,116,100,0,0,0,0,0,102,105,110,97,108,32,97,100,100,114,109,111,100,101,32,61,32,37,100,10,0,0,0,0,116,115,116,98,0,0,0,0,91,117,93,0,0,0,0,0,115,116,97,98,0,0,0,0,116,115,116,97,0,0,0,0,70,73,78,65,76,32,82,80,67,0,0,0,0,0,0,0,78,111,116,32,101,110,111,117,103,104,32,97,114,103,115,32,112,97,115,115,101,100,32,116,111,32,77,97,99,114,111,46,0,0,0,0,0,0,0,0,115,116,97,97,0,0,0,0,116,115,116,0,0,0,0,0,70,73,78,65,76,32,80,67,0,0,0,0,0,0,0,0,115,101,118,0,0,0,0,0,116,98,97,0,0,0,0,0,98,102,0,0,0,0,0,0,73,78,73,84,32,82,80,67,0,0,0,0,0,0,0,0,115,101,105,0,0,0,0,0,116,97,98,0,0,0,0,0,73,78,73,84,32,80,67,0,97,115,108,98,0,0,0,0,115,101,99,0,0,0,0,0,115,98,99,98,0,0,0,0,83,69,71,77,69,78,84,32,78,65,77,69,0,0,0,0,98,99,115,0,0,0,0,0,115,98,99,98,0,0,0,0,54,56,48,51,0,0,0,0,115,98,99,97,0,0,0,0,98,109,105,0,0,0,0,0,10,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,0,0,0,0,115,98,99,97,0,0,0,0,115,98,97,0,0,0,0,0,37,45,50,52,115,32,37,45,51,115,32,37,45,56,115,32,37,45,56,115,32,37,45,56,115,32,37,45,56,115,10,0,0,0,0,0,0,0,0,0,98,114,97,0,0,0,0,0,115,98,97,0,0,0,0,0,115,117,98,100,0,0,0,0,100,111,111,112,58,32,116,111,111,32,109,97,110,121,32,111,112,101,114,97,116,111,114,115,0,0,0,0,0,0,0,0,45,45,45,32,37,100,32,85,110,114,101,115,111,108,118,101,100,32,83,121,109,98,111,108,37,99,10,10,0,0,0,0,114,116,115,0,0,0,0,0,100,118,0,0,0,0,0,0,115,117,98,98], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([45,45,45,32,85,110,114,101,115,111,108,118,101,100,32,83,121,109,98,111,108,32,76,105,115,116,10,0,0,0,0,0,114,116,105,0,0,0,0,0,37,115,32,37,115,0,0,0,115,117,98,97,0,0,0,0,67,111,109,112,108,101,116,101,46,10,0,0,0,0,0,0,114,111,114,0,0,0,0,0,115,116,120,0,0,0,0,0,37,100,0,0,0,0,0,0,73,108,108,101,103,97,108,32,102,111,114,99,101,100,32,65,100,100,114,101,115,115,105,110,103,32,109,111,100,101,32,111,110,32,39,37,115,39,46,0,114,111,114,98,0,0,0,0,115,116,115,0,0,0,0,0,85,110,114,101,99,111,118,101,114,97,98,108,101,32,101,114,114,111,114,40,115,41,32,105,110,32,112,97,115,115,44,32,97,98,111,114,116,105,110,103,32,97,115,115,101,109,98,108,121,33,10,0,0,0,0,0,114,111,114,97,0,0,0,0,115,116,100,0,0,0,0,0,98,99,0,0,0,0,0,0,45,45,45,45,45,45,45,32,70,73,76,69,32,37,115,10,0,0,0,0,0,0,0,0,114,111,108,0,0,0,0,0,115,116,97,98,0,0,0,0,97,0,0,0,0,0,0,0,97,115,108,97,0,0,0,0,114,111,108,98,0,0,0,0,115,116,97,97,0,0,0,0,87,97,114,110,105,110,103,58,32,85,110,97,98,108,101,32,116,111,32,91,114,101,93,111,112,101,110,32,39,37,115,39,10,0,0,0,0,0,0,0,98,99,108,114,0,0,0,0,114,111,108,97,0,0,0,0,108,115,114,100,0,0,0,0,98,105,116,0,0,0,0,0,119,98,0,0,0,0,0,0,112,117,108,121,0,0,0,0,108,115,114,98,0,0,0,0,83,84,65,82,84,32,79,70,32,80,65,83,83,58,32,37,100,10,0,0,0,0,0,0,98,105,116,98,0,0,0,0,112,117,108,120,0,0,0,0,108,115,114,97,0,0,0,0,100,111,111,112,32,64,32,37,100,10,0,0,0,0,0,0,73,78,73,84,73,65,76,32,67,79,68,69,32,83,69,71,77,69,78,84,0,0,0,0,112,117,108,98,0,0,0,0,100,115,0,0,0,0,0,0,108,115,114,0,0,0,0,0,45,111,32,83,119,105,116,99,104,32,114,101,113,117,105,114,101,115,32,102,105,108,101,32,110,97,109,101,46,0,0,0,112,117,108,97,0,0,0,0,109,110,101,109,97,115,107,58,32,37,48,56,108,120,32,97,100,114,109,111,100,101,58,32,37,100,32,32,67,118,116,91,97,109,93,58,32,37,100,10,0,0,0,0,0,0,0,0,108,100,115,0,0,0,0,0,73,108,108,101,103,97,108,32,102,111,114,109,97,116,32,115,112,101,99,105,102,105,99,97,116,105,111,110,0,0,0,0,112,115,104,121,0,0,0,0,108,100,120,0,0,0,0,0,48,0,0,0,0,0,0,0,73,108,108,101,103,97,108,32,65,100,100,114,101,115,115,105,110,103,32,109,111,100,101,32,39,37,115,39,46,0,0,0,67,104,101,99,107,32,99,111,109,109,97,110,100,45,108,105,110,101,32,102,111,114,109,97,116,46,0,0,0,0,0,0,79,75,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,24,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,58,0,0,0,112,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,130,0,0,0,232,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,0,0,0,48,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,136,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,0,192,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,0,216,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,0,8,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,0,144,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,248,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,0,248,39,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,208,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,118,0,0,0,200,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,44,0,0,0,216,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,120,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,0,0,0,208,29,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,122,0,0,0,120,29,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,138,0,0,0,24,29,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,0,0,0,192,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,0,0,0,80,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,240,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,114,0,0,0,128,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,98,0,0,0,16,27,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,134,0,0,0,96,26,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,160,25,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,24,25,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,160,24,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,110,0,0,0,40,24,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,176,23,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,88,23,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,248,22,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,152,22,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,0,0,0,16,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,126,0,0,0,112,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,24,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,0,0,0,184,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,37,0,0,0,0,0,0,1,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,36,0,0,0,0,0,0,24,0,0,0,113,0,0,0,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,128,36,0,0,0,0,0,0,24,0,0,0,114,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,36,0,0,0,0,0,0,24,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,35,0,0,0,0,0,0,24,0,0,0,123,0,0,0,107,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,35,0,0,0,0,0,0,1,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,104,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,0,48,29,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,0,200,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,0,128,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,17,0,0,0,0,0,0,1,0,0,0,142,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,224,14,0,0,0,0,0,0,1,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,11,0,0,0,0,0,0,1,0,0,0,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,8,0,0,0,0,0,0,1,0,0,0,137,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,8,5,0,0,0,0,0,0,1,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,0,2,0,0,0,0,0,0,1,0,0,0,208,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,232,40,0,0,0,0,0,0,1,0,0,0,130,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,144,38,0,0,0,0,0,0,1,0,0,0,144,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,0,36,0,0,0,0,0,0,1,0,0,0,145,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,248,32,0,0,0,0,0,0,1,0,0,0,146,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,232,30,0,0,0,0,0,0,1,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,0,30,0,0,0,0,0,0,1,0,0,0,148,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,160,29,0,0,0,0,0,0,1,0,0,0,129,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,80,29,0,0,0,0,0,0,1,0,0,0,144,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,240,28,0,0,0,0,0,0,1,0,0,0,143,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,152,28,0,0,0,0,0,0,1,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,0,0,0,40,28,0,0,0,0,0,0,1,0,0,0,132,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,192,27,0,0,0,0,0,0,1,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,27,0,0,0,0,0,0,1,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,26,0,0,0,0,0,0,1,0,0,0,141,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,26,0,0,0,0,0,0,1,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,0,0,0,208,25,0,0,0,0,0,0,1,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,25,0,0,0,0,0,0,1,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,240,24,0,0,0,0,0,0,1,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,24,0,0,0,0,0,0,1,0,0,0,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,24,0,0,0,0,0,0,1,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,23,0,0,0,0,0,0,1,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,40,23,0,0,0,0,0,0,1,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,0,0,0,200,22,0,0,0,0,0,0,1,0,0,0,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,72,22,0,0,0,0,0,0,1,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,92,0,0,0,232,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,54,0,0,0,64,21,0,0,0,0,0,0,1,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,54,0,0,0,224,20,0,0,0,0,0,0,1,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,20,0,0,0,0,0,0,1,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,20,0,0,0,0,0,0,1,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,94,0,0,0,240,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,128,19,0,0,0,0,0,0,1,0,0,0,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,19,0,0,0,0,0,0,1,0,0,0,138,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,19,0,0,0,0,0,0,1,0,0,0,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,184,18,0,0,0,0,0,0,1,0,0,0,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,136,18,0,0,0,0,0,0,1,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,18,0,0,0,0,0,0,1,0,0,0,139], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10240);
/* memory initializer */ allocate([4,0,0,0,16,18,0,0,0,0,0,0,1,0,0,0,39,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,232,17,0,0,0,0,0,0,1,0,0,0,176,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,0,0,0,168,17,0,0,0,0,0,0,1,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,17,0,0,0,0,0,0,1,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,17,0,0,0,0,0,0,1,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,86,0,0,0,184,16,0,0,0,0,0,0,1,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,86,0,0,0,104,16,0,0,0,0,0,0,1,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,16,0,0,0,0,0,0,1,0,0,0,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,15,0,0,0,0,0,0,1,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,136,15,0,0,0,0,0,0,1,0,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,15,0,0,0,0,0,0,1,0,0,0,140,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,248,14,0,0,0,0,0,0,1,0,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,12,0,0,0,0,0,0,1,0,0,0,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,29,0,0,0,0,0,0,1,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,25,0,0,0,0,0,0,1,0,0,0,58,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,20,0,0,0,0,0,0,122,0,0,0,137,0,0,0,153,0,0,0,169,0,0,0,169,24,0,0,185,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,18,0,0,0,0,0,0,122,0,0,0,201,0,0,0,217,0,0,0,233,0,0,0,233,24,0,0,249,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,15,0,0,0,0,0,0,122,0,0,0,139,0,0,0,155,0,0,0,171,0,0,0,171,24,0,0,187,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,12,0,0,0,0,0,0,122,0,0,0,203,0,0,0,219,0,0,0,235,0,0,0,235,24,0,0,251,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,9,0,0,0,0,0,0,124,0,0,0,195,0,0,0,211,0,0,0,227,0,0,0,227,24,0,0,243,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,5,0,0,0,0,0,0,122,0,0,0,132,0,0,0,148,0,0,0,164,0,0,0,164,24,0,0,180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,2,0,0,0,0,0,0,122,0,0,0,196,0,0,0,212,0,0,0,228,0,0,0,228,24,0,0,244,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,41,0,0,0,0,0,0,1,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,38,0,0,0,0,0,0,1,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,36,0,0,0,0,0,0,112,0,0,0,104,0,0,0,104,24,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,33,0,0,0,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,31,0,0,0,0,0,0,1,0,0,0,71,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,30,0,0,0,0,0,0,1,0,0,0,87,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,29,0,0,0,0,0,0,112,0,0,0,103,0,0,0,103,24,0,0,119,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,29,0,0,0,0,0,0,0,2,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,28,0,0,16,0,0,0,56,0,0,0,21,0,0,0,29,0,0,0,29,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,28,0,0,0,0,0,0,0,2,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,28,0,0,0,0,0,0,0,2,0,0,39,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,27,0,0,0,0,0,0,0,2,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,27,0,0,0,0,0,0,0,2,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,26,0,0,0,0,0,0,0,2,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,64,26,0,0,0,0,0,0,0,2,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,25,0,0,0,0,0,0,122,0,0,0,133,0,0,0,149,0,0,0,165,0,0,0,165,24,0,0,181,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,128,25,0,0,0,0,0,0,122,0,0,0,197,0,0,0,213,0,0,0,229,0,0,0,229,24,0,0,245,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,24,0,0,0,0,0,0,0,2,0,0,47,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,128,24,0,0,0,0,0,0,0,2,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,24,0,0,0,0,0,0,0,2,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,23,0,0,0,0,0,0,0,2,0,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,23,0,0,0,0,0,0,0,2,0,0,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,22,0,0,0,0,0,0,0,2,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,22,0,0,0,0,0,0,0,2,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,21,0,0,0,0,0,0,0,2,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,21,0,0,48,0,0,0,56,0,0,0,19,0,0,0,31,0,0,0,31,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,20,0,0,0,0,0,0,0,2,0,0,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,20,0,0,48,0,0,0,56,0,0,0,18,0,0,0,30,0,0,0,30,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,20,0,0,16,0,0,0,56,0,0,0,20,0,0,0,28,0,0,0,28,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,19,0,0,0,0,0,0,0,2,0,0,141,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,19,0,0,0,0,0,0,0,2,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,19,0,0,0,0,0,0,0,2,0,0,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,19,0,0,0,0,0,0,1,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,18,0,0,0,0,0,0,1,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,18,0,0,0,0,0,0,1,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,18,0,0,0,0,0,0,1,0,0,0,79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,18,0,0,0,0,0,0,1,0,0,0,95,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,17,0,0,0,0,0,0,112,0,0,0,111,0,0,0,111,24,0,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,17,0,0,0,0,0,0,1,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,128,17,0,0,0,0,0,0,122,0,0,0,129,0,0,0,145,0,0,0,161,0,0,0,161,24,0,0,177,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,17,0,0,0,0,0,0,122,0,0,0,193,0,0,0,209,0,0,0,225,0,0,0,225,24,0,0,241,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,16,0,0,0,0,0,0,1,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,16,0,0,0,0,0,0,1,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,16,0,0,0,0,0,0,112,0,0,0,99,0,0,0,99,24,0,0,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,15,0,0,0,0,0,0,124,0,0,0,131,26,0,0,147,26,0,0,163,26,0,0,163,205,0,0,179,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,15,0,0,0,0,0,0,124,0,0,0,140,0,0,0,156,0,0,0,172,0,0,0,172,205,0,0,188,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,15,0,0,0,0,0,0,124,0,0,0,140,24,0,0,156,24,0,0,172,26,0,0,172,24,0,0,188,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,15,0,0,0,0,0,0,1,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,14,0,0,0,0,0,0,1,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,14,0,0,0,0,0,0,1,0,0,0,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,14,0,0,0,0,0,0,112,0,0,0,106,0,0,0,106,24,0,0,122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,232,13,0,0,0,0,0,0,1,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,13,0,0,0,0,0,0,1,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,13,0,0,0,0,0,0,1,0,0,0,9,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,13,0,0,0,0,0,0,122,0,0,0,136,0,0,0,152,0,0,0,168,0,0,0,168,24,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,12,0,0,0,0,0,0,122,0,0,0,200,0,0,0,216,0,0,0,232,0,0,0,232,24,0,0,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,12,0,0,0,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,12,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,11,0,0,0,0,0,0,1,0,0,0,76,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,11,0,0,0,0,0,0,1,0,0,0,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,11,0,0,0,0,0,0,112,0,0,0,108,0,0,0,108,24,0,0,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,10,0,0,0,0,0,0,1,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,10,0,0,0,0,0,0,1,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,10,0,0,0,0,0,0,1,0,0,0,8,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,9,0,0,0,0,0,0,112,0,0,0,110,0,0,0,110,24,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,9,0,0,0,0,0,0,120,0,0,0,157,0,0,0,173,0,0,0,173,24,0,0,189,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,9,0,0,0,0,0,0,122,0,0,0,134,0,0,0,150,0,0,0,166,0,0,0,166,24,0,0,182,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,8,0,0,0,0,0,0,122,0,0,0,198,0,0,0,214,0,0,0,230,0,0,0,230,24,0,0,246,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,8,0,0,0,0,0,0,124,0,0,0,204,0,0,0,220,0,0,0,236,0,0,0,236,24,0,0,252,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,8,0,0,0,0,0,0,124,0,0,0,142,0,0,0,158,0,0,0,174,0,0,0,174,24,0,0,190,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,7,0,0,0,0,0,0,124,0,0,0,206,0,0,0,222,0,0,0,238,0,0,0,238,205,0,0,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,7,0,0,0,0,0,0,124,0,0,0,206,24,0,0,222,24,0,0,238,26,0,0,238,24,0,0,254,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,6,0,0,0,0,0,0,1,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,6,0,0,0,0,0,0,1,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,6,0,0,0,0,0,0,112,0,0,0,104,0,0,0,104,24,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,5,0,0,0,0,0,0,1,0,0,0,5], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+20532);
/* memory initializer */ allocate([12,0,0,0,168,5,0,0,0,0,0,0,1,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,5,0,0,0,0,0,0,1,0,0,0,84,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,4,0,0,0,0,0,0,112,0,0,0,100,0,0,0,100,24,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,4,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,4,0,0,0,0,0,0,1,0,0,0,61,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,3,0,0,0,0,0,0,1,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,3,0,0,0,0,0,0,1,0,0,0,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,3,0,0,0,0,0,0,112,0,0,0,96,0,0,0,96,24,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,2,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,2,0,0,0,0,0,0,122,0,0,0,138,0,0,0,154,0,0,0,170,0,0,0,170,24,0,0,186,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,2,0,0,0,0,0,0,122,0,0,0,202,0,0,0,218,0,0,0,234,0,0,0,234,24,0,0,250,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,2,0,0,0,0,0,0,1,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,1,0,0,0,0,0,0,1,0,0,0,55,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,1,0,0,0,0,0,0,1,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,42,0,0,0,0,0,0,1,0,0,0,60,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,42,0,0,0,0,0,0,1,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,41,0,0,0,0,0,0,1,0,0,0,51,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,41,0,0,0,0,0,0,1,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,41,0,0,0,0,0,0,1,0,0,0,56,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,41,0,0,0,0,0,0,1,0,0,0,73,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,41,0,0,0,0,0,0,1,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,41,0,0,0,0,0,0,112,0,0,0,105,0,0,0,105,24,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,40,0,0,0,0,0,0,1,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,40,0,0,0,0,0,0,1,0,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,40,0,0,0,0,0,0,112,0,0,0,102,0,0,0,102,24,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,40,0,0,0,0,0,0,1,0,0,0,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,39,0,0,0,0,0,0,1,0,0,0,57,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,39,0,0,0,0,0,0,1,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,39,0,0,0,0,0,0,122,0,0,0,130,0,0,0,146,0,0,0,162,0,0,0,162,24,0,0,178,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,38,0,0,0,0,0,0,122,0,0,0,194,0,0,0,210,0,0,0,226,0,0,0,226,24,0,0,242,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,38,0,0,0,0,0,0,1,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,38,0,0,0,0,0,0,1,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,128,38,0,0,0,0,0,0,1,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,38,0,0,0,0,0,0,120,0,0,0,151,0,0,0,167,0,0,0,167,24,0,0,183,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,38,0,0,0,0,0,0,120,0,0,0,215,0,0,0,231,0,0,0,231,24,0,0,247,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,232,37,0,0,0,0,0,0,120,0,0,0,221,0,0,0,237,0,0,0,237,24,0,0,253,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,37,0,0,0,0,0,0,1,0,0,0,207,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,37,0,0,0,0,0,0,120,0,0,0,159,0,0,0,175,0,0,0,175,24,0,0,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,37,0,0,0,0,0,0,120,0,0,0,223,0,0,0,239,0,0,0,239,205,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,36,0,0,0,0,0,0,120,0,0,0,223,24,0,0,239,26,0,0,239,24,0,0,255,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,36,0,0,0,0,0,0,122,0,0,0,128,0,0,0,144,0,0,0,160,0,0,0,160,24,0,0,176,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,36,0,0,0,0,0,0,122,0,0,0,192,0,0,0,208,0,0,0,224,0,0,0,224,24,0,0,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,35,0,0,0,0,0,0,124,0,0,0,131,0,0,0,147,0,0,0,163,0,0,0,163,24,0,0,179,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,35,0,0,0,0,0,0,1,0,0,0,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,35,0,0,0,0,0,0,1,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,35,0,0,0,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,34,0,0,0,0,0,0,1,0,0,0,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,34,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,34,0,0,0,0,0,0,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,33,0,0,0,0,0,0,1,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,33,0,0,0,0,0,0,1,0,0,0,93,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,33,0,0,0,0,0,0,112,0,0,0,109,0,0,0,109,24,0,0,125,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,32,0,0,0,0,0,0,1,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,32,0,0,0,0,0,0,1,0,0,0,48,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,32,0,0,0,0,0,0,1,0,0,0,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,31,0,0,0,0,0,0,1,0,0,0,53,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,31,0,0,0,0,0,0,1,0,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,31,0,0,0,0,0,0,1,0,0,0,143,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,31,0,0,0,0,0,0,1,0,0,0,143,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,14,0,0,0,0,0,0,218,32,0,0,169,0,0,0,185,0,0,0,233,0,0,0,201,0,0,0,217,0,0,0,249,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,30,0,0,0,0,0,0,218,32,0,0,171,0,0,0,187,0,0,0,235,0,0,0,203,0,0,0,219,0,0,0,251,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,25,0,0,0,0,0,0,218,32,0,0,164,0,0,0,180,0,0,0,228,0,0,0,196,0,0,0,212,0,0,0,244,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,21,0,0,0,0,0,0,25,32,0,0,72,0,0,0,56,0,0,0,104,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,18,0,0,0,0,0,0,1,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,15,0,0,0,0,0,0,1,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,12,0,0,0,0,0,0,25,32,0,0,71,0,0,0,55,0,0,0,103,0,0,0,119,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,128,9,0,0,0,0,0,0,1,0,0,0,71,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,5,0,0,0,0,0,0,1,0,0,0,87,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,128,2,0,0,0,0,0,0,0,2,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,41,0,0,64,0,0,0,0,128,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,232,38,0,0,0,0,0,0,0,2,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,36,0,0,0,0,0,0,0,2,0,0,39,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,33,0,0,0,0,0,0,0,2,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,31,0,0,0,0,0,0,0,2,0,0,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,30,0,0,0,0,0,0,0,2,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,29,0,0,0,0,0,0,0,2,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,29,0,0,0,0,0,0,0,2,0,0,47,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,29,0,0,0,0,0,0,0,2,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,28,0,0,0,0,0,0,218,32,0,0,165,0,0,0,181,0,0,0,229,0,0,0,197,0,0,0,213,0,0,0,245,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,28,0,0,0,0,0,0,0,2,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,27,0,0,0,0,0,0,0,2,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,27,0,0,0,0,0,0,0,2,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,26,0,0,0,0,0,0,0,2,0,0,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,26,0,0,0,0,0,0,0,2,0,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,232,25,0,0,0,0,0,0,0,2,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,25,0,0,0,0,0,0,0,2,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,25,0,0,0,0,0,0,0,2,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,24,0,0,0,0,0,0,0,2,0,0,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,24,0,0,96,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,23,0,0,96,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,23,0,0,64,0,0,0,0,128,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,22,0,0,0,0,0,0,0,2,0,0,173,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,22,0,0,0,0,0,0,1,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,21,0,0,0,0,0,0,1,0,0,0,154,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,21,0,0,0,0,0,0,25,32,0,0,79,0,0,0,63,0,0,0,111,0,0,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,21,0,0,0,0,0,0,1,0,0,0,79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,20,0,0,0,0,0,0,1,0,0,0,95,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,20,0,0,0,0,0,0,218,32,0,0,161,0,0,0,177,0,0,0,225,0,0,0,193,0,0,0,209,0,0,0,241], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+30828);
/* memory initializer */ allocate([12,0,0,0,0,20,0,0,0,0,0,0,25,32,0,0,67,0,0,0,51,0,0,0,99,0,0,0,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,19,0,0,0,0,0,0,1,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,19,0,0,0,0,0,0,1,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,19,0,0,0,0,0,0,218,32,0,0,163,0,0,0,179,0,0,0,227,0,0,0,195,0,0,0,211,0,0,0,243,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,18,0,0,0,0,0,0,25,32,0,0,74,0,0,0,58,0,0,0,106,0,0,0,122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,18,0,0,0,0,0,0,1,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,18,0,0,0,0,0,0,1,0,0,0,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,18,0,0,0,0,0,0,1,0,0,0,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,17,0,0,0,0,0,0,218,32,0,0,168,0,0,0,184,0,0,0,232,0,0,0,200,0,0,0,216,0,0,0,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,17,0,0,0,0,0,0,25,32,0,0,76,0,0,0,60,0,0,0,108,0,0,0,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,17,0,0,0,0,0,0,1,0,0,0,76,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,17,0,0,0,0,0,0,1,0,0,0,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,16,0,0,0,0,0,0,1,0,0,0,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,16,0,0,0,0,0,0,216,32,0,0,188,0,0,0,236,0,0,0,204,0,0,0,220,0,0,0,252,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,16,0,0,0,0,0,0,216,32,0,0,189,0,0,0,237,0,0,0,205,0,0,0,221,0,0,0,253,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,232,15,0,0,0,0,0,0,218,32,0,0,166,0,0,0,182,0,0,0,230,0,0,0,198,0,0,0,214,0,0,0,246,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,15,0,0,0,0,0,0,218,32,0,0,174,0,0,0,190,0,0,0,238,0,0,0,206,0,0,0,222,0,0,0,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,15,0,0,0,0,0,0,25,32,0,0,72,0,0,0,56,0,0,0,104,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,15,0,0,0,0,0,0,1,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,14,0,0,0,0,0,0,1,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,14,0,0,0,0,0,0,25,32,0,0,68,0,0,0,52,0,0,0,100,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,14,0,0,0,0,0,0,1,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,13,0,0,0,0,0,0,1,0,0,0,84,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,13,0,0,0,0,0,0,25,32,0,0,64,0,0,0,48,0,0,0,96,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,13,0,0,0,0,0,0,1,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,13,0,0,0,0,0,0,1,0,0,0,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,12,0,0,0,0,0,0,1,0,0,0,157,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,128,12,0,0,0,0,0,0,218,32,0,0,170,0,0,0,186,0,0,0,234,0,0,0,202,0,0,0,218,0,0,0,250,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,12,0,0,0,0,0,0,25,32,0,0,73,0,0,0,57,0,0,0,105,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,11,0,0,0,0,0,0,1,0,0,0,73,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,11,0,0,0,0,0,0,1,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,64,11,0,0,0,0,0,0,25,32,0,0,70,0,0,0,54,0,0,0,102,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,11,0,0,0,0,0,0,1,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,10,0,0,0,0,0,0,1,0,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,10,0,0,0,0,0,0,1,0,0,0,156,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,9,0,0,0,0,0,0,1,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,9,0,0,0,0,0,0,1,0,0,0,129,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,9,0,0,0,0,0,0,218,32,0,0,162,0,0,0,178,0,0,0,226,0,0,0,194,0,0,0,210,0,0,0,242,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,8,0,0,0,0,0,0,1,0,0,0,153,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,8,0,0,0,0,0,0,1,0,0,0,155,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,8,0,0,0,0,0,0,216,32,0,0,183,0,0,0,231,0,0,0,199,0,0,0,215,0,0,0,247,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,7,0,0,0,0,0,0,216,32,0,0,191,0,0,0,239,0,0,0,207,0,0,0,223,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,7,0,0,0,0,0,0,218,32,0,0,160,0,0,0,176,0,0,0,224,0,0,0,192,0,0,0,208,0,0,0,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,7,0,0,0,0,0,0,1,0,0,0,131,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,6,0,0,0,0,0,0,1,0,0,0,151,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,6,0,0,0,0,0,0,25,32,0,0,77,0,0,0,61,0,0,0,109,0,0,0,125,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,6,0,0,0,0,0,0,1,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,5,0,0,0,0,0,0,1,0,0,0,93,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,5,0,0,0,0,0,0,1,0,0,0,159,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,232,20,0,0,0,0,0,0,1,0,0,0,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,33,0,0,0,0,0,0,1,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,26,0,0,0,0,0,0,90,0,0,0,137,0,0,0,153,0,0,0,169,0,0,0,185,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,22,0,0,0,0,0,0,90,0,0,0,201,0,0,0,217,0,0,0,233,0,0,0,249,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,18,0,0,0,0,0,0,90,0,0,0,139,0,0,0,155,0,0,0,171,0,0,0,187,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,16,0,0,0,0,0,0,90,0,0,0,203,0,0,0,219,0,0,0,235,0,0,0,251,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,13,0,0,0,0,0,0,92,0,0,0,195,0,0,0,211,0,0,0,227,0,0,0,243,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,10,0,0,0,0,0,0,90,0,0,0,132,0,0,0,148,0,0,0,164,0,0,0,180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,6,0,0,0,0,0,0,90,0,0,0,196,0,0,0,212,0,0,0,228,0,0,0,244,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,3,0,0,0,0,0,0,90,0,0,0,133,0,0,0,149,0,0,0,165,0,0,0,181,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,41,0,0,0,0,0,0,90,0,0,0,197,0,0,0,213,0,0,0,229,0,0,0,245,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,39,0,0,0,0,0,0,0,2,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,37,0,0,0,0,0,0,0,2,0,0,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,34,0,0,0,0,0,0,0,2,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,31,0,0,0,0,0,0,0,2,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,30,0,0,0,0,0,0,0,2,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,29,0,0,0,0,0,0,0,2,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,29,0,0,0,0,0,0,0,2,0,0,39,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,29,0,0,0,0,0,0,0,2,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,28,0,0,0,0,0,0,0,2,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,28,0,0,0,0,0,0,0,2,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,232,27,0,0,0,0,0,0,0,2,0,0,47,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,27,0,0,0,0,0,0,0,2,0,0,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,26,0,0,0,0,0,0,0,2,0,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,26,0,0,0,0,0,0,0,2,0,0,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,25,0,0,0,0,0,0,0,2,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,25,0,0,0,0,0,0,0,2,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,25,0,0,0,0,0,0,0,2,0,0,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,24,0,0,0,0,0,0,0,2,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,24,0,0,0,0,0,0,0,2,0,0,141,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,23,0,0,0,0,0,0,1,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,23,0,0,0,0,0,0,1,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,22,0,0,0,0,0,0,1,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,22,0,0,0,0,0,0,1,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,22,0,0,0,0,0,0,1,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,21,0,0,0,0,0,0,1,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,21,0,0,0,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,20,0,0,0,0,0,0,1,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,20,0,0,0,0,0,0,80,0,0,0,111,0,0,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,20,0,0,0,0,0,0,1,0,0,0,79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,19,0,0,0,0,0,0,1,0,0,0,95,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,19,0,0,0,0,0,0,90,0,0,0,129,0,0,0,145,0,0,0,161,0,0,0,177,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,19,0,0,0,0,0,0,90,0,0,0,193,0,0,0,209,0,0,0,225,0,0,0,241,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,18,0,0,0,0,0,0,1,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,18,0,0,0,0,0,0,80,0,0,0,99,0,0,0,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,18,0,0,0,0,0,0,1,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,18,0,0,0,0,0,0,1,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,18,0,0,0,0,0,0,80,0,0,0,96,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,17,0,0,0,0,0,0,1,0,0,0,64], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+41124);
/* memory initializer */ allocate([12,0,0,0,152,17,0,0,0,0,0,0,1,0,0,0,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,17,0,0,0,0,0,0,1,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,16,0,0,0,0,0,0,80,0,0,0,106,0,0,0,122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,16,0,0,0,0,0,0,1,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,64,16,0,0,0,0,0,0,1,0,0,0,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,15,0,0,0,0,0,0,90,0,0,0,136,0,0,0,152,0,0,0,168,0,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,15,0,0,0,0,0,0,90,0,0,0,200,0,0,0,216,0,0,0,232,0,0,0,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,15,0,0,0,0,0,0,80,0,0,0,108,0,0,0,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,15,0,0,0,0,0,0,1,0,0,0,76,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,14,0,0,0,0,0,0,1,0,0,0,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,14,0,0,0,0,0,0,80,0,0,0,110,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,14,0,0,0,0,0,0,88,0,0,0,157,0,0,0,173,0,0,0,189,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,14,0,0,0,0,0,0,90,0,0,0,134,0,0,0,150,0,0,0,166,0,0,0,182,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,13,0,0,0,0,0,0,90,0,0,0,198,0,0,0,214,0,0,0,230,0,0,0,246,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,13,0,0,0,0,0,0,92,0,0,0,204,0,0,0,220,0,0,0,236,0,0,0,252,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,13,0,0,0,0,0,0,1,0,0,0,61,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,12,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,12,0,0,0,0,0,0,90,0,0,0,138,0,0,0,154,0,0,0,170,0,0,0,186,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,12,0,0,0,0,0,0,90,0,0,0,202,0,0,0,218,0,0,0,234,0,0,0,250,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,232,11,0,0,0,0,0,0,1,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,11,0,0,0,0,0,0,1,0,0,0,55,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,11,0,0,0,0,0,0,1,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,11,0,0,0,0,0,0,1,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,10,0,0,0,0,0,0,1,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,10,0,0,0,0,0,0,1,0,0,0,51,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,10,0,0,0,0,0,0,80,0,0,0,105,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,9,0,0,0,0,0,0,1,0,0,0,73,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,9,0,0,0,0,0,0,1,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,8,0,0,0,0,0,0,80,0,0,0,102,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,8,0,0,0,0,0,0,1,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,8,0,0,0,0,0,0,1,0,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,7,0,0,0,0,0,0,1,0,0,0,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,7,0,0,0,0,0,0,1,0,0,0,57,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,7,0,0,0,0,0,0,1,0,0,0,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,6,0,0,0,0,0,0,1,0,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,6,0,0,0,0,0,0,80,0,0,0,104,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,6,0,0,0,0,0,0,80,0,0,0,104,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,5,0,0,0,0,0,0,1,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,5,0,0,0,0,0,0,1,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,5,0,0,0,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,4,0,0,0,0,0,0,1,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,4,0,0,0,0,0,0,1,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,4,0,0,0,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,3,0,0,0,0,0,0,80,0,0,0,103,0,0,0,119,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,3,0,0,0,0,0,0,1,0,0,0,71,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,2,0,0,0,0,0,0,1,0,0,0,87,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,2,0,0,0,0,0,0,92,0,0,0,140,0,0,0,156,0,0,0,172,0,0,0,188,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,64,2,0,0,0,0,0,0,1,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,2,0,0,0,0,0,0,1,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,248,1,0,0,0,0,0,0,1,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,1,0,0,0,0,0,0,1,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,42,0,0,0,0,0,0,92,0,0,0,206,0,0,0,222,0,0,0,238,0,0,0,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,42,0,0,0,0,0,0,92,0,0,0,142,0,0,0,158,0,0,0,174,0,0,0,190,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,42,0,0,0,0,0,0,80,0,0,0,100,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,41,0,0,0,0,0,0,1,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,41,0,0,0,0,0,0,1,0,0,0,84,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,41,0,0,0,0,0,0,1,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,41,0,0,0,0,0,0,88,0,0,0,151,0,0,0,167,0,0,0,183,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,41,0,0,0,0,0,0,88,0,0,0,215,0,0,0,231,0,0,0,247,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,40,0,0,0,0,0,0,88,0,0,0,221,0,0,0,237,0,0,0,253,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,40,0,0,0,0,0,0,88,0,0,0,159,0,0,0,175,0,0,0,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,40,0,0,0,0,0,0,88,0,0,0,223,0,0,0,239,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,40,0,0,0,0,0,0,90,0,0,0,128,0,0,0,144,0,0,0,160,0,0,0,176,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,40,0,0,0,0,0,0,90,0,0,0,192,0,0,0,208,0,0,0,224,0,0,0,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,39,0,0,0,0,0,0,92,0,0,0,131,0,0,0,147,0,0,0,163,0,0,0,179,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,39,0,0,0,0,0,0,1,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,39,0,0,0,0,0,0,90,0,0,0,130,0,0,0,146,0,0,0,162,0,0,0,178,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,38,0,0,0,0,0,0,90,0,0,0,194,0,0,0,210,0,0,0,226,0,0,0,242,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,38,0,0,0,0,0,0,1,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,38,0,0,0,0,0,0,1,0,0,0,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,38,0,0,0,0,0,0,80,0,0,0,109,0,0,0,125,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,38,0,0,0,0,0,0,1,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,38,0,0,0,0,0,0,1,0,0,0,93,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,37,0,0,0,0,0,0,1,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,88,37,0,0,0,0,0,0,1,0,0,0,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,17,0,0,0,0,0,0,218,13,0,0,105,0,0,0,101,0,0,0,117,0,0,0,109,0,0,0,125,0,0,0,121,0,0,0,97,0,0,0,113,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,30,0,0,0,0,0,0,2,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,26,0,0,0,0,0,0,218,13,0,0,41,0,0,0,37,0,0,0,53,0,0,0,45,0,0,0,61,0,0,0,57,0,0,0,33,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,21,0,0,0,0,0,0,2,0,0,0,139,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,18,0,0,0,0,0,0,2,0,0,0,107,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,15,0,0,0,0,0,0,217,0,0,0,10,0,0,0,6,0,0,0,22,0,0,0,14,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,12,0,0,0,0,0,0,2,0,0,0,75,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,9,0,0,0,0,0,0,0,2,0,0,144,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,6,0,0,0,0,0,0,0,2,0,0,176,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,2,0,0,0,0,0,0,0,2,0,0,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,120,41,0,0,0,0,0,0,72,0,0,0,36,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,39,0,0,0,0,0,0,0,2,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,36,0,0,0,0,0,0,0,2,0,0,208,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,33,0,0,0,0,0,0,0,2,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,31,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,30,0,0,0,0,0,0,0,2,0,0,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,29,0,0,0,0,0,0,0,2,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,29,0,0,0,0,0,0,1,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,29,0,0,0,0,0,0,1,0,0,0,216,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,176,28,0,0,0,0,0,0,1,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,64,28,0,0,0,0,0,0,1,0,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,27,0,0,0,0,0,0,218,13,0,0,201,0,0,0,197,0,0,0,213,0,0,0,205,0,0,0,221,0,0,0,217,0,0,0,193,0,0,0,209,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,27,0,0,0,0,0,0,74,0,0,0,224,0,0,0,228,0,0,0,236], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+51420);
/* memory initializer */ allocate([12,0,0,0,232,26,0,0,0,0,0,0,74,0,0,0,192,0,0,0,196,0,0,0,204,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,80,26,0,0,0,0,0,0,216,13,0,0,199,0,0,0,215,0,0,0,207,0,0,0,223,0,0,0,219,0,0,0,195,0,0,0,211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,25,0,0,0,0,0,0,216,0,0,0,198,0,0,0,214,0,0,0,206,0,0,0,222,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,25,0,0,0,0,0,0,1,0,0,0,202,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,25,0,0,0,0,0,0,1,0,0,0,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,24,0,0,0,0,0,0,218,13,0,0,73,0,0,0,69,0,0,0,85,0,0,0,77,0,0,0,93,0,0,0,89,0,0,0,65,0,0,0,81,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,24,24,0,0,0,0,0,0,216,0,0,0,230,0,0,0,246,0,0,0,238,0,0,0,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,23,0,0,0,0,0,0,1,0,0,0,232,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,23,0,0,0,0,0,0,1,0,0,0,200,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,22,0,0,0,0,0,0,216,13,0,0,231,0,0,0,247,0,0,0,239,0,0,0,255,0,0,0,251,0,0,0,227,0,0,0,243,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,22,0,0,0,0,0,0,64,16,0,0,76,0,0,0,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,22,0,0,0,0,0,0,64,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,21,0,0,0,0,0,0,0,1,0,0,187,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,21,0,0,0,0,0,0,104,13,0,0,167,0,0,0,183,0,0,0,175,0,0,0,191,0,0,0,163,0,0,0,179,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,20,0,0,0,0,0,0,218,13,0,0,169,0,0,0,165,0,0,0,181,0,0,0,173,0,0,0,189,0,0,0,185,0,0,0,161,0,0,0,177,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,20,0,0,0,0,0,0,106,1,0,0,162,0,0,0,166,0,0,0,182,0,0,0,174,0,0,0,190,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,8,20,0,0,0,0,0,0,218,0,0,0,160,0,0,0,164,0,0,0,180,0,0,0,172,0,0,0,188,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,152,19,0,0,0,0,0,0,217,0,0,0,74,0,0,0,70,0,0,0,86,0,0,0,78,0,0,0,94,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,19,0,0,0,0,0,0,2,0,0,0,171,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,19,0,0,0,0,0,0,219,0,0,0,234,0,0,0,128,0,0,0,4,0,0,0,20,0,0,0,12,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,18,0,0,0,0,0,0,218,13,0,0,9,0,0,0,5,0,0,0,21,0,0,0,13,0,0,0,29,0,0,0,25,0,0,0,1,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,18,0,0,0,0,0,0,1,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,18,0,0,0,0,0,0,1,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,48,18,0,0,0,0,0,0,1,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,18,0,0,0,0,0,0,1,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,192,17,0,0,0,0,0,0,216,13,0,0,39,0,0,0,55,0,0,0,47,0,0,0,63,0,0,0,59,0,0,0,35,0,0,0,51,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,144,17,0,0,0,0,0,0,217,0,0,0,42,0,0,0,38,0,0,0,54,0,0,0,46,0,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,17,0,0,0,0,0,0,217,0,0,0,106,0,0,0,102,0,0,0,118,0,0,0,110,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,216,16,0,0,0,0,0,0,216,13,0,0,103,0,0,0,119,0,0,0,111,0,0,0,127,0,0,0,123,0,0,0,99,0,0,0,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,128,16,0,0,0,0,0,0,1,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,56,16,0,0,0,0,0,0,1,0,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,240,15,0,0,0,0,0,0,104,4,0,0,135,0,0,0,151,0,0,0,143,0,0,0,131,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,168,15,0,0,0,0,0,0,218,13,0,0,233,0,0,0,229,0,0,0,245,0,0,0,237,0,0,0,253,0,0,0,249,0,0,0,225,0,0,0,241,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,104,15,0,0,0,0,0,0,2,0,0,0,203,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,15,0,0,0,0,0,0,1,0,0,0,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,14,0,0,0,0,0,0,1,0,0,0,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,14,0,0,0,0,0,0,1,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,64,14,0,0,0,0,0,0,0,9,0,0,159,0,0,0,147,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,14,0,0,0,0,0,0,0,1,0,0,155,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,184,13,0,0,0,0,0,0,0,1,0,0,158,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,96,13,0,0,0,0,0,0,128,0,0,0,156,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,40,13,0,0,0,0,0,0,216,13,0,0,7,0,0,0,23,0,0,0,15,0,0,0,31,0,0,0,27,0,0,0,3,0,0,0,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,200,12,0,0,0,0,0,0,216,13,0,0,71,0,0,0,87,0,0,0,79,0,0,0,95,0,0,0,91,0,0,0,67,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,136,12,0,0,0,0,0,0,216,13,0,0,133,0,0,0,149,0,0,0,141,0,0,0,157,0,0,0,153,0,0,0,129,0,0,0,145,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,32,12,0,0,0,0,0,0,104,0,0,0,134,0,0,0,150,0,0,0,142,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,224,11,0,0,0,0,0,0,88,0,0,0,132,0,0,0,148,0,0,0,140,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,160,11,0,0,0,0,0,0,1,0,0,0,170,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,72,11,0,0,0,0,0,0,1,0,0,0,168,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,16,11,0,0,0,0,0,0,1,0,0,0,186,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,208,10,0,0,0,0,0,0,1,0,0,0,138,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,112,10,0,0,0,0,0,0,1,0,0,0,154,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,10,0,0,0,0,0,0,1,0,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,240,26,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+61716);
function runPostSets() {


}

var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}



  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }function _strcat(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      var pdestEnd = 0;
      pdestEnd = (pdest + (_strlen(pdest)|0))|0;
      do {
        HEAP8[((pdestEnd+i)|0)]=HEAP8[((psrc+i)|0)];
        i = (i+1)|0;
      } while (HEAP8[(((psrc)+(i-1))|0)]);
      return pdest|0;
    }


  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
      return (ptr-num)|0;
    }var _llvm_memset_p0i8_i32=_memset;




  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block

        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }

      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }

          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }

          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision === -1) {
            precision = 6; // Standard default.
            precisionSet = false;
          }

          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];

          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }

              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }

              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }

              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }

              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);

                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }

                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }

                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');

                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();

                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }

              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }

              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();

              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }





  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};

  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};


  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }

  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};

  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};

  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};

  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);

          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);

            var src = populate ? remote : local;
            var dst = populate ? local : remote;

            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;

        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }

        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }

        if (!total) {
          // early out
          return callback(null);
        }

        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };

        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);

        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];

          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 438);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }

        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];

          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};

        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };

        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));

        while (check.length) {
          var path = check.pop();
          var stat, node;

          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }

          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));

            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }

        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};

        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);

          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };

          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }

            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};

  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }

          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }

          stream.position = position;
          return position;
        }}};

  var _stdin=allocate(1, "i32*", ALLOC_STATIC);

  var _stdout=allocate(1, "i32*", ALLOC_STATIC);

  var _stderr=allocate(1, "i32*", ALLOC_STATIC);

  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };

        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }

        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);

        // start at the root
        var current = FS.root;
        var current_path = '/';

        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }

          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);

          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }

          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);

              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;

              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }

        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;


        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };

          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;

          FS.FSNode.prototype = {};

          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }

        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };

        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);

        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops

        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }

        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');

        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');

        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();

        FS.nameTable = new Array(4096);

        FS.root = FS.createNode(null, '/', 16384 | 511, 0);
        FS.mount(MEMFS, {}, '/');

        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;

        FS.ensureErrnoError();

        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];

        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes

              if (!hasByteServing) chunkSize = datalength;

              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");

                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);

                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }

                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });

              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }

          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });

          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }

        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};



  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }

        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };

        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;

        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });

        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;

        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;

          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }

          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }


          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };

          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);

          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }

          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;

          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };

          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer


            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }

            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };

          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }

          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;

          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }

          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }

          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }

          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }

          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }

          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }

          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;

          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });

          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);

              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;

              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }

          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);

          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }

          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }

          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }

          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }

          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);

              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }

          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };


          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }

          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }

  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }


      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }

  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }


  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }


  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }

  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP8[(((pdest+i)|0)|0)]=HEAP8[(((psrc+i)|0)|0)];
        i = (i+1)|0;
      } while (HEAP8[(((psrc)+(i-1))|0)]);
      return pdest|0;
    }






  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }

  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }


      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }function _fgets(s, n, stream) {
      // char *fgets(char *restrict s, int n, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgets.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return 0;
      if (streamObj.error || streamObj.eof) return 0;
      var byte_;
      for (var i = 0; i < n - 1 && byte_ != 10; i++) {
        byte_ = _fgetc(stream);
        if (byte_ == -1) {
          if (streamObj.error || (streamObj.eof && i == 0)) return 0;
          else if (streamObj.eof) break;
        }
        HEAP8[(((s)+(i))|0)]=byte_;
      }
      HEAP8[(((s)+(i))|0)]=0;
      return s;
    }



  function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }


  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;



  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }


  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }

  function _qsort(base, num, size, cmp) {
      if (num == 0 || size == 0) return;
      // forward calls to the JavaScript sort method
      // first, sort the items logically
      var keys = [];
      for (var i = 0; i < num; i++) keys.push(i);
      keys.sort(function(a, b) {
        return FUNCTION_TABLE[cmp](base+a*size, base+b*size);
      });
      // apply the sort
      var temp = _malloc(num*size);
      _memcpy(temp, base, num*size);
      for (var i = 0; i < num; i++) {
        if (keys[i] == i) continue; // already in place
        _memcpy(base+i*size, temp+keys[i]*size, size);
      }
      _free(temp);
    }




  function _tolower(chr) {
      chr = chr|0;
      if ((chr|0) < 65) return chr|0;
      if ((chr|0) > 90) return chr|0;
      return (chr - 65 + 97)|0;
    }function _strncasecmp(px, py, n) {
      px = px|0; py = py|0; n = n|0;
      var i = 0, x = 0, y = 0;
      while ((i>>>0) < (n>>>0)) {
        x = _tolower(HEAP8[(((px)+(i))|0)])|0;
        y = _tolower(HEAP8[(((py)+(i))|0)])|0;
        if (((x|0) == (y|0)) & ((x|0) == 0)) return 0;
        if ((x|0) == 0) return -1;
        if ((y|0) == 0) return 1;
        if ((x|0) == (y|0)) {
          i = (i + 1)|0;
          continue;
        } else {
          return ((x>>>0) > (y>>>0) ? 1 : -1)|0;
        }
      }
      return 0;
    }function _strcasecmp(px, py) {
      px = px|0; py = py|0;
      return _strncasecmp(px, py, -1)|0;
    }



  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;

      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }

      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;

      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }

      // Apply sign.
      ret *= multiplier;

      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }

      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }

      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }

      if (bits == 64) {
        return tempRet0 = (tempDouble=ret,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0),ret>>>0;
      }

      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }


  function _memmove(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
        // Unlikely case: Copy backwards in a safe manner
        ret = dest;
        src = (src + num)|0;
        dest = (dest + num)|0;
        while ((num|0) > 0) {
          dest = (dest - 1)|0;
          src = (src - 1)|0;
          num = (num - 1)|0;
          HEAP8[(dest)]=HEAP8[(src)];
        }
        dest = ret;
      } else {
        _memcpy(dest, src, num) | 0;
      }
      return dest | 0;
    }var _llvm_memmove_p0i8_p0i8_i32=_memmove;




  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStream(stream);
      stream.eof = false;
      return 0;
    }

  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStream(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }


  var _putc=_fputc;

  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }

  function _memcmp(p1, p2, num) {
      p1 = p1|0; p2 = p2|0; num = num|0;
      var i = 0, v1 = 0, v2 = 0;
      while ((i|0) < (num|0)) {
        v1 = HEAPU8[(((p1)+(i))|0)];
        v2 = HEAPU8[(((p2)+(i))|0)];
        if ((v1|0) != (v2|0)) return ((v1|0) > (v2|0) ? 1 : -1)|0;
        i = (i+1)|0;
      }
      return 0;
    }


  function _abort() {
      Module['abort']();
    }

  function ___errno_location() {
      return ___errno_state;
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }






  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers

        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;

        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }

        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).

        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);

        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);

        // Canvas event setup

        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);

        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }

        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);

        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };

            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }


            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";

          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;

        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }

        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }

        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }

          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;

          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }

          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);

          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");



var FUNCTION_TABLE = [0,0,_v_ifnconst,0,_v_byteop,0,_v_list,0,_v_bf_bt,0,_v_incbin,0,_v_mnemonic,0,_op_noteq,0,_op_smaller,0,_v_ins_outs,0,_op_xor,0,_v_endif,0,_op_andand,0,_v_err,0,_v_incdir,0,_v_end,0,_v_ifconst,0,_v_sreg_op,0,_op_smallereq,0,_op_shiftright,0,_op_mult,0,_op_eqeq,0,_v_org,0,_op_takemsb,0,_op_oror,0,_CompareAddress,0,_op_question,0,_v_lisu_lisl,0,_op_takelsb,0,_v_include,0,_op_shiftleft,0,_v_if,0,_v_mexit,0,_op_greatereq,0,_op_div,0,_v_rorg,0,_v_rend,0,_op_or,0,_op_greater,0,_op_and,0,_v_ds,0,_op_negate,0,_v_repeat,0,_v_sl_sr,0,_op_mod,0,_v_execmac,0,_v_lis,0,_v_lr,0,_v_equ,0,_v_macro,0,_v_eqm,0,_v_dc,0,_v_wordop,0,_op_sub,0,_op_add,0,_v_else,0,_v_hex,0,_v_set,0,_op_invert,0,_v_trace,0,_CompareAlpha,0,_v_align,0,_op_not,0,_v_processor,0,_v_repend,0,_v_seg,0,_v_branch,0,_v_endm,0,_v_echo,0,_v_subroutine,0];

// EMSCRIPTEN_START_FUNCS

function _addmsg($message){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$message;
 var $2=$1;
 var $3=_strcat(70616,$2);
 STACKTOP=sp;return;
}


function _sftos($val,$flags){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $ptr;
 $1=$val;
 $2=$flags;
 var $3=HEAP8[(67400)];
 var $4=(($3<<24)>>24);
 var $5=($4|0)!=0;
 var $6=($5?67408:67927);
 $ptr=$6;
 _memset(67408, 0, 1038)|0;
 var $7=HEAP8[(67400)];
 var $8=(($7<<24)>>24);
 var $9=(((1)-($8))|0);
 var $10=(($9)&255);
 HEAP8[(67400)]=$10;
 var $11=$ptr;
 var $12=$1;
 var $13=_sprintf($11,5432,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$12,tempVarArgs)); STACKTOP=tempVarArgs;
 var $14=$2;
 var $15=$14&1;
 var $16=($15|0)!=0;
 if($16){label=2;break;}else{label=3;break;}
 case 2:
 var $18=$ptr;
 var $19=_strcat($18,5336);
 label=4;break;
 case 3:
 var $21=$ptr;
 var $22=_strcat($21,5256);
 label=4;break;
 case 4:
 var $24=$2;
 var $25=$24&8;
 var $26=($25|0)!=0;
 if($26){label=5;break;}else{label=6;break;}
 case 5:
 var $28=$ptr;
 var $29=_strcat($28,5184);
 label=7;break;
 case 6:
 var $31=$ptr;
 var $32=_strcat($31,5072);
 label=7;break;
 case 7:
 var $34=$2;
 var $35=$34&32;
 var $36=($35|0)!=0;
 if($36){label=8;break;}else{label=9;break;}
 case 8:
 var $38=$ptr;
 var $39=_strcat($38,4984);
 label=10;break;
 case 9:
 var $41=$ptr;
 var $42=_strcat($41,5072);
 label=10;break;
 case 10:
 var $44=$2;
 var $45=$44&80;
 var $46=($45|0)!=0;
 if($46){label=11;break;}else{label=12;break;}
 case 11:
 var $48=$ptr;
 var $49=_strcat($48,4928);
 label=13;break;
 case 12:
 var $51=$ptr;
 var $52=_strcat($51,4872);
 label=13;break;
 case 13:
 var $54=$2;
 var $55=$54&64;
 var $56=($55|0)!=0;
 if($56){label=14;break;}else{label=15;break;}
 case 14:
 var $58=$ptr;
 var $59=_strcat($58,4784);
 label=16;break;
 case 15:
 var $61=$ptr;
 var $62=_strcat($61,4872);
 label=16;break;
 case 16:
 var $64=$2;
 var $65=$64&16;
 var $66=($65|0)!=0;
 if($66){label=17;break;}else{label=18;break;}
 case 17:
 var $68=$ptr;
 var $69=_strcat($68,4736);
 label=19;break;
 case 18:
 var $71=$ptr;
 var $72=_strcat($71,4872);
 label=19;break;
 case 19:
 var $74=$2;
 var $75=$74&80;
 var $76=($75|0)!=0;
 if($76){label=20;break;}else{label=21;break;}
 case 20:
 var $78=$ptr;
 var $79=_strcat($78,4672);
 label=22;break;
 case 21:
 var $81=$ptr;
 var $82=_strcat($81,4872);
 label=22;break;
 case 22:
 var $84=$ptr;
 STACKTOP=sp;return $84;
  default: assert(0, "bad label: " + label);
 }

}


function _clearsegs(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $seg;
 var $1=HEAP32[((1082680)>>2)];
 $seg=$1;
 label=2;break;
 case 2:
 var $3=$seg;
 var $4=($3|0)!=0;
 if($4){label=3;break;}else{label=5;break;}
 case 3:
 var $6=$seg;
 var $7=(($6+8)|0);
 var $8=HEAP8[($7)];
 var $9=($8&255);
 var $10=$9&16;
 var $11=$10|1;
 var $12=(($11)&255);
 var $13=$seg;
 var $14=(($13+8)|0);
 HEAP8[($14)]=$12;
 var $15=$seg;
 var $16=(($15+29)|0);
 HEAP8[($16)]=1;
 var $17=$seg;
 var $18=(($17+28)|0);
 HEAP8[($18)]=1;
 var $19=$seg;
 var $20=(($19+9)|0);
 HEAP8[($20)]=1;
 label=4;break;
 case 4:
 var $22=$seg;
 var $23=(($22)|0);
 var $24=HEAP32[(($23)>>2)];
 $seg=$24;
 label=2;break;
 case 5:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _clearrefs(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $sym;
 var $i;
 $i=0;
 label=2;break;
 case 2:
 var $2=$i;
 var $3=(($2<<16)>>16);
 var $4=($3|0)<1024;
 if($4){label=3;break;}else{label=9;break;}
 case 3:
 var $6=$i;
 var $7=(($6<<16)>>16);
 var $8=((1082704+($7<<2))|0);
 var $9=((((HEAPU8[($8)])|(HEAPU8[((($8)+(1))|0)]<<8)|(HEAPU8[((($8)+(2))|0)]<<16)|(HEAPU8[((($8)+(3))|0)]<<24))|0));
 $sym=$9;
 label=4;break;
 case 4:
 var $11=$sym;
 var $12=($11|0)!=0;
 if($12){label=5;break;}else{label=7;break;}
 case 5:
 var $14=$sym;
 var $15=(($14+12)|0);
 var $16=HEAP8[($15)];
 var $17=($16&255);
 var $18=$17&-5;
 var $19=(($18)&255);
 HEAP8[($15)]=$19;
 label=6;break;
 case 6:
 var $21=$sym;
 var $22=(($21)|0);
 var $23=HEAP32[(($22)>>2)];
 $sym=$23;
 label=4;break;
 case 7:
 label=8;break;
 case 8:
 var $26=$i;
 var $27=((($26)+(1))&65535);
 $i=$27;
 label=2;break;
 case 9:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _panic($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$str;
 var $2=$1;
 var $3=_puts($2);
 _exit(1);
 throw "Reached an unreachable!";
 STACKTOP=sp;return;
}


function _findext($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 $1=$str;
 HEAP32[((1087136)>>2)]=-1;
 HEAP32[((1091640)>>2)]=0;
 var $2=$1;
 var $3=(($2)|0);
 var $4=HEAP8[($3)];
 var $5=(($4<<24)>>24);
 var $6=($5|0)==46;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 label=31;break;
 case 3:
 label=4;break;
 case 4:
 var $10=$1;
 var $11=HEAP8[($10)];
 var $12=(($11<<24)>>24);
 var $13=($12|0)!=0;
 if($13){label=5;break;}else{var $20=0;label=6;break;}
 case 5:
 var $15=$1;
 var $16=HEAP8[($15)];
 var $17=(($16<<24)>>24);
 var $18=($17|0)!=46;
 var $20=$18;label=6;break;
 case 6:
 var $20;
 if($20){label=7;break;}else{label=8;break;}
 case 7:
 var $22=$1;
 var $23=(($22+1)|0);
 $1=$23;
 label=4;break;
 case 8:
 var $25=$1;
 var $26=HEAP8[($25)];
 var $27=(($26<<24)>>24)!=0;
 if($27){label=9;break;}else{label=31;break;}
 case 9:
 var $29=$1;
 HEAP8[($29)]=0;
 var $30=$1;
 var $31=(($30+1)|0);
 $1=$31;
 var $32=$1;
 HEAP32[((1091640)>>2)]=$32;
 var $33=$1;
 var $34=(($33)|0);
 var $35=HEAP8[($34)];
 var $36=(($35<<24)>>24);
 var $37=$36|32;
 switch(($37|0)){case 48:case 105:{ label=10;break;}case 100:case 98:case 122:{ label=15;break;}case 101:case 119:case 97:{ label=22;break;}case 108:{ label=27;break;}case 114:{ label=28;break;}case 117:{ label=29;break;}default:{label=30;break;}}break;
 case 10:
 HEAP32[((1087136)>>2)]=0;
 var $39=$1;
 var $40=(($39+1)|0);
 var $41=HEAP8[($40)];
 var $42=(($41<<24)>>24);
 var $43=$42|32;
 if(($43|0)==120){ label=11;break;}else if(($43|0)==121){ label=12;break;}else if(($43|0)==110){ label=13;break;}else{label=14;break;}
 case 11:
 HEAP32[((1087136)>>2)]=13;
 label=14;break;
 case 12:
 HEAP32[((1087136)>>2)]=14;
 label=14;break;
 case 13:
 HEAP32[((1087136)>>2)]=12;
 label=14;break;
 case 14:
 label=31;break;
 case 15:
 var $49=$1;
 var $50=(($49+1)|0);
 var $51=HEAP8[($50)];
 var $52=(($51<<24)>>24);
 var $53=$52|32;
 if(($53|0)==120){ label=16;break;}else if(($53|0)==121){ label=17;break;}else if(($53|0)==105){ label=18;break;}else if(($53|0)==98){ label=19;break;}else{label=20;break;}
 case 16:
 HEAP32[((1087136)>>2)]=4;
 label=21;break;
 case 17:
 HEAP32[((1087136)>>2)]=5;
 label=21;break;
 case 18:
 HEAP32[((1087136)>>2)]=15;
 label=21;break;
 case 19:
 HEAP32[((1087136)>>2)]=16;
 label=21;break;
 case 20:
 HEAP32[((1087136)>>2)]=3;
 label=21;break;
 case 21:
 label=31;break;
 case 22:
 var $61=$1;
 var $62=(($61+1)|0);
 var $63=HEAP8[($62)];
 var $64=(($63<<24)>>24);
 var $65=$64|32;
 if(($65|0)==120){ label=23;break;}else if(($65|0)==121){ label=24;break;}else{label=25;break;}
 case 23:
 HEAP32[((1087136)>>2)]=7;
 label=26;break;
 case 24:
 HEAP32[((1087136)>>2)]=8;
 label=26;break;
 case 25:
 HEAP32[((1087136)>>2)]=6;
 label=26;break;
 case 26:
 label=31;break;
 case 27:
 HEAP32[((1087136)>>2)]=19;
 label=31;break;
 case 28:
 HEAP32[((1087136)>>2)]=9;
 label=31;break;
 case 29:
 HEAP32[((1087136)>>2)]=20;
 label=31;break;
 case 30:
 label=31;break;
 case 31:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _rmnode($base,$bytes){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $node;
 $1=$base;
 $2=$bytes;
 var $3=$1;
 var $4=HEAP32[(($3)>>2)];
 $node=$4;
 var $5=($4|0)!=0;
 if($5){label=2;break;}else{label=3;break;}
 case 2:
 var $7=$node;
 var $8=$7;
 var $9=HEAP32[(($8)>>2)];
 var $10=$1;
 HEAP32[(($10)>>2)]=$9;
 var $11=$node;
 _free($11);
 label=3;break;
 case 3:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _parse($buf){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $i;
 var $j;
 var $mne;
 $1=$buf;
 $mne=0;
 $i=0;
 $j=1;
 label=2;break;
 case 2:
 var $3=$i;
 var $4=$1;
 var $5=(($4+$3)|0);
 var $6=HEAP8[($5)];
 var $7=(($6<<24)>>24);
 var $8=($7|0)==32;
 if($8){label=3;break;}else{label=4;break;}
 case 3:
 var $10=$i;
 var $11=((($10)+(1))|0);
 $i=$11;
 label=2;break;
 case 4:
 var $13=$i;
 var $14=$1;
 var $15=(($14+$13)|0);
 var $16=HEAP8[($15)];
 var $17=(($16<<24)>>24);
 var $18=($17|0)==94;
 if($18){label=5;break;}else{label=9;break;}
 case 5:
 var $20=$i;
 var $21=((($20)+(1))|0);
 $i=$21;
 label=6;break;
 case 6:
 var $23=$i;
 var $24=$1;
 var $25=(($24+$23)|0);
 var $26=HEAP8[($25)];
 var $27=(($26<<24)>>24);
 var $28=($27|0)==32;
 if($28){label=7;break;}else{label=8;break;}
 case 7:
 var $30=$i;
 var $31=((($30)+(1))|0);
 $i=$31;
 label=6;break;
 case 8:
 label=13;break;
 case 9:
 var $34=$i;
 var $35=$1;
 var $36=(($35+$34)|0);
 var $37=HEAP8[($36)];
 var $38=(($37<<24)>>24);
 var $39=($38|0)==35;
 if($39){label=10;break;}else{label=11;break;}
 case 10:
 var $41=$i;
 var $42=$1;
 var $43=(($42+$41)|0);
 HEAP8[($43)]=32;
 label=12;break;
 case 11:
 $i=0;
 label=12;break;
 case 12:
 label=13;break;
 case 13:
 var $47=$j;
 var $48=((1091664+$47)|0);
 tempBigInt=$48;HEAP8[(1092176)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092177)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092178)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092179)]=tempBigInt&0xff;
 label=14;break;
 case 14:
 var $50=$i;
 var $51=$1;
 var $52=(($51+$50)|0);
 var $53=HEAP8[($52)];
 var $54=(($53<<24)>>24);
 var $55=($54|0)!=0;
 if($55){label=15;break;}else{var $64=0;label=16;break;}
 case 15:
 var $57=$i;
 var $58=$1;
 var $59=(($58+$57)|0);
 var $60=HEAP8[($59)];
 var $61=(($60<<24)>>24);
 var $62=($61|0)!=32;
 var $64=$62;label=16;break;
 case 16:
 var $64;
 if($64){label=17;break;}else{label=22;break;}
 case 17:
 var $66=$i;
 var $67=$1;
 var $68=(($67+$66)|0);
 var $69=HEAP8[($68)];
 var $70=(($69<<24)>>24);
 var $71=($70|0)==58;
 if($71){label=18;break;}else{label=19;break;}
 case 18:
 var $73=$i;
 var $74=((($73)+(1))|0);
 $i=$74;
 label=22;break;
 case 19:
 var $76=$i;
 var $77=$1;
 var $78=(($77+$76)|0);
 var $79=HEAP8[($78)];
 var $80=($79&255);
 var $81=($80|0)==128;
 if($81){label=20;break;}else{label=21;break;}
 case 20:
 var $83=$i;
 var $84=$1;
 var $85=(($84+$83)|0);
 HEAP8[($85)]=32;
 label=21;break;
 case 21:
 var $87=$i;
 var $88=((($87)+(1))|0);
 $i=$88;
 var $89=$1;
 var $90=(($89+$87)|0);
 var $91=HEAP8[($90)];
 var $92=$j;
 var $93=((($92)+(1))|0);
 $j=$93;
 var $94=((1091664+$92)|0);
 HEAP8[($94)]=$91;
 label=14;break;
 case 22:
 var $96=$j;
 var $97=((($96)+(1))|0);
 $j=$97;
 var $98=((1091664+$96)|0);
 HEAP8[($98)]=0;
 label=23;break;
 case 23:
 var $100=$i;
 var $101=$1;
 var $102=(($101+$100)|0);
 var $103=HEAP8[($102)];
 var $104=(($103<<24)>>24);
 var $105=($104|0)==32;
 if($105){label=24;break;}else{label=25;break;}
 case 24:
 var $107=$i;
 var $108=((($107)+(1))|0);
 $i=$108;
 label=23;break;
 case 25:
 var $110=$j;
 var $111=((1091664+$110)|0);
 tempBigInt=$111;HEAP8[(1092180)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092181)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092182)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092183)]=tempBigInt&0xff;
 label=26;break;
 case 26:
 var $113=$i;
 var $114=$1;
 var $115=(($114+$113)|0);
 var $116=HEAP8[($115)];
 var $117=(($116<<24)>>24);
 var $118=($117|0)!=0;
 if($118){label=27;break;}else{var $127=0;label=28;break;}
 case 27:
 var $120=$i;
 var $121=$1;
 var $122=(($121+$120)|0);
 var $123=HEAP8[($122)];
 var $124=(($123<<24)>>24);
 var $125=($124|0)!=32;
 var $127=$125;label=28;break;
 case 28:
 var $127;
 if($127){label=29;break;}else{label=32;break;}
 case 29:
 var $129=$i;
 var $130=$1;
 var $131=(($130+$129)|0);
 var $132=HEAP8[($131)];
 var $133=($132&255);
 var $134=($133|0)==128;
 if($134){label=30;break;}else{label=31;break;}
 case 30:
 var $136=$i;
 var $137=$1;
 var $138=(($137+$136)|0);
 HEAP8[($138)]=32;
 label=31;break;
 case 31:
 var $140=$i;
 var $141=((($140)+(1))|0);
 $i=$141;
 var $142=$1;
 var $143=(($142+$140)|0);
 var $144=HEAP8[($143)];
 var $145=$j;
 var $146=((($145)+(1))|0);
 $j=$146;
 var $147=((1091664+$145)|0);
 HEAP8[($147)]=$144;
 label=26;break;
 case 32:
 var $149=$j;
 var $150=((($149)+(1))|0);
 $j=$150;
 var $151=((1091664+$149)|0);
 HEAP8[($151)]=0;
 var $152=((((HEAPU8[(1092180)])|(HEAPU8[(1092181)]<<8)|(HEAPU8[(1092182)]<<16)|(HEAPU8[(1092183)]<<24))|0));
 _findext($152);
 var $153=((((HEAPU8[(1092180)])|(HEAPU8[(1092181)]<<8)|(HEAPU8[(1092182)]<<16)|(HEAPU8[(1092183)]<<24))|0));
 var $154=_findmne($153);
 $mne=$154;
 label=33;break;
 case 33:
 var $156=$i;
 var $157=$1;
 var $158=(($157+$156)|0);
 var $159=HEAP8[($158)];
 var $160=(($159<<24)>>24);
 var $161=($160|0)==32;
 if($161){label=34;break;}else{label=35;break;}
 case 34:
 var $163=$i;
 var $164=((($163)+(1))|0);
 $i=$164;
 label=33;break;
 case 35:
 var $166=$j;
 var $167=((1091664+$166)|0);
 tempBigInt=$167;HEAP8[(1092184)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092185)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092186)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092187)]=tempBigInt&0xff;
 label=36;break;
 case 36:
 var $169=$i;
 var $170=$1;
 var $171=(($170+$169)|0);
 var $172=HEAP8[($171)];
 var $173=(($172<<24)>>24)!=0;
 if($173){label=37;break;}else{label=45;break;}
 case 37:
 var $175=$i;
 var $176=$1;
 var $177=(($176+$175)|0);
 var $178=HEAP8[($177)];
 var $179=(($178<<24)>>24);
 var $180=($179|0)==32;
 if($180){label=38;break;}else{label=42;break;}
 case 38:
 label=39;break;
 case 39:
 var $183=$i;
 var $184=((($183)+(1))|0);
 var $185=$1;
 var $186=(($185+$184)|0);
 var $187=HEAP8[($186)];
 var $188=(($187<<24)>>24);
 var $189=($188|0)==32;
 if($189){label=40;break;}else{label=41;break;}
 case 40:
 var $191=$i;
 var $192=((($191)+(1))|0);
 $i=$192;
 label=39;break;
 case 41:
 label=42;break;
 case 42:
 var $195=$i;
 var $196=$1;
 var $197=(($196+$195)|0);
 var $198=HEAP8[($197)];
 var $199=($198&255);
 var $200=($199|0)==128;
 if($200){label=43;break;}else{label=44;break;}
 case 43:
 var $202=$i;
 var $203=$1;
 var $204=(($203+$202)|0);
 HEAP8[($204)]=32;
 label=44;break;
 case 44:
 var $206=$i;
 var $207=((($206)+(1))|0);
 $i=$207;
 var $208=$1;
 var $209=(($208+$206)|0);
 var $210=HEAP8[($209)];
 var $211=$j;
 var $212=((($211)+(1))|0);
 $j=$212;
 var $213=((1091664+$211)|0);
 HEAP8[($213)]=$210;
 label=36;break;
 case 45:
 var $215=$j;
 var $216=((1091664+$215)|0);
 HEAP8[($216)]=0;
 var $217=$mne;
 STACKTOP=sp;return $217;
  default: assert(0, "bad label: " + label);
 }

}


function _findmne($str){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+64)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $i;
 var $c;
 var $mne;
 var $buf=sp;
 $1=$str;
 var $2=$1;
 var $3=(($2)|0);
 var $4=HEAP8[($3)];
 var $5=(($4<<24)>>24);
 var $6=($5|0)==46;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=$1;
 var $9=(($8+1)|0);
 $1=$9;
 label=3;break;
 case 3:
 $i=0;
 label=4;break;
 case 4:
 var $12=$i;
 var $13=$1;
 var $14=(($13+$12)|0);
 var $15=HEAP8[($14)];
 $c=$15;
 var $16=(($15<<24)>>24)!=0;
 if($16){label=5;break;}else{label=10;break;}
 case 5:
 var $18=$c;
 var $19=(($18<<24)>>24);
 var $20=($19|0)>=65;
 if($20){label=6;break;}else{label=8;break;}
 case 6:
 var $22=$c;
 var $23=(($22<<24)>>24);
 var $24=($23|0)<=90;
 if($24){label=7;break;}else{label=8;break;}
 case 7:
 var $26=$c;
 var $27=(($26<<24)>>24);
 var $28=((($27)+(32))|0);
 var $29=(($28)&255);
 $c=$29;
 label=8;break;
 case 8:
 var $31=$c;
 var $32=$i;
 var $33=(($buf+$32)|0);
 HEAP8[($33)]=$31;
 label=9;break;
 case 9:
 var $35=$i;
 var $36=((($35)+(1))|0);
 $i=$36;
 label=4;break;
 case 10:
 var $38=$i;
 var $39=(($buf+$38)|0);
 HEAP8[($39)]=0;
 var $40=(($buf)|0);
 var $41=_hash1($40);
 var $42=((1087152+($41<<2))|0);
 var $43=((((HEAPU8[($42)])|(HEAPU8[((($42)+(1))|0)]<<8)|(HEAPU8[((($42)+(2))|0)]<<16)|(HEAPU8[((($42)+(3))|0)]<<24))|0));
 $mne=$43;
 label=11;break;
 case 11:
 var $45=$mne;
 var $46=($45|0)!=0;
 if($46){label=12;break;}else{label=16;break;}
 case 12:
 var $48=(($buf)|0);
 var $49=$mne;
 var $50=(($49+8)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=_strcmp($48,$51);
 var $53=($52|0)==0;
 if($53){label=13;break;}else{label=14;break;}
 case 13:
 label=16;break;
 case 14:
 label=15;break;
 case 15:
 var $57=$mne;
 var $58=(($57)|0);
 var $59=HEAP32[(($58)>>2)];
 $mne=$59;
 label=11;break;
 case 16:
 var $61=$mne;
 STACKTOP=sp;return $61;
  default: assert(0, "bad label: " + label);
 }

}


function _hash1($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $result;
 $1=$str;
 $result=0;
 label=2;break;
 case 2:
 var $3=$1;
 var $4=HEAP8[($3)];
 var $5=(($4<<24)>>24)!=0;
 if($5){label=3;break;}else{label=4;break;}
 case 3:
 var $7=$result;
 var $8=$7<<2;
 var $9=$1;
 var $10=(($9+1)|0);
 $1=$10;
 var $11=HEAP8[($9)];
 var $12=(($11<<24)>>24);
 var $13=$8^$12;
 $result=$13;
 label=2;break;
 case 4:
 var $15=$result;
 var $16=$15&1023;
 STACKTOP=sp;return $16;
  default: assert(0, "bad label: " + label);
 }

}


function _v_macro($str,$dummy){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+1032)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $base=sp;
 var $defined;
 var $slp;
 var $sl;
 var $mac;
 var $mne;
 var $i;
 var $buf=(sp)+(8);
 var $skipit;
 var $comment;
 $1=$str;
 $2=$dummy;
 $defined=0;
 var $3=HEAP32[((1091296)>>2)];
 var $4=(($3+9)|0);
 var $5=HEAP8[($4)];
 var $6=($5&255);
 var $7=($6|0)!=0;
 if($7){label=2;break;}else{var $15=0;label=3;break;}
 case 2:
 var $9=HEAP32[((1091296)>>2)];
 var $10=(($9+10)|0);
 var $11=HEAP8[($10)];
 var $12=($11&255);
 var $13=($12|0)!=0;
 var $15=$13;label=3;break;
 case 3:
 var $15;
 var $16=$15^1;
 var $17=($16&1);
 $skipit=$17;
 var $18=$1;
 var $19=_strlower($18);
 var $20=$skipit;
 var $21=($20|0)!=0;
 if($21){label=4;break;}else{label=5;break;}
 case 4:
 $defined=1;
 label=9;break;
 case 5:
 var $24=$1;
 var $25=_findmne($24);
 var $26=($25|0)!=0;
 var $27=($26&1);
 $defined=$27;
 var $28=HEAP32[((1091600)>>2)];
 var $29=($28|0)!=0;
 if($29){label=6;break;}else{label=8;break;}
 case 6:
 var $31=HEAP8[(67232)];
 var $32=(($31<<24)>>24);
 var $33=($32|0)!=0;
 if($33){label=7;break;}else{label=8;break;}
 case 7:
 _outlistfile(1082184);
 label=8;break;
 case 8:
 label=9;break;
 case 9:
 var $37=$defined;
 var $38=($37|0)!=0;
 if($38){label=11;break;}else{label=10;break;}
 case 10:
 HEAP32[(($base)>>2)]=0;
 $slp=$base;
 var $40=_permalloc(20);
 var $41=$40;
 $mac=$41;
 var $42=$1;
 var $43=_hash1($42);
 $i=$43;
 var $44=$i;
 var $45=((1087152+($44<<2))|0);
 var $46=((((HEAPU8[($45)])|(HEAPU8[((($45)+(1))|0)]<<8)|(HEAPU8[((($45)+(2))|0)]<<16)|(HEAPU8[((($45)+(3))|0)]<<24))|0));
 var $47=$46;
 var $48=$mac;
 var $49=(($48)|0);
 HEAP32[(($49)>>2)]=$47;
 var $50=$mac;
 var $51=(($50+4)|0);
 HEAP32[(($51)>>2)]=(90);
 var $52=$1;
 var $53=_strlen($52);
 var $54=((($53)+(1))|0);
 var $55=_permalloc($54);
 var $56=$1;
 var $57=_strcpy($55,$56);
 var $58=$mac;
 var $59=(($58+8)|0);
 HEAP32[(($59)>>2)]=$57;
 var $60=$mac;
 var $61=(($60+12)|0);
 HEAP8[($61)]=8;
 var $62=$mac;
 var $63=$62;
 var $64=$i;
 var $65=((1087152+($64<<2))|0);
 tempBigInt=$63;HEAP8[($65)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($65)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($65)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($65)+(3))|0)]=tempBigInt&0xff;
 label=11;break;
 case 11:
 label=12;break;
 case 12:
 var $68=(($buf)|0);
 var $69=HEAP32[((68472)>>2)];
 var $70=(($69+8)|0);
 var $71=HEAP32[(($70)>>2)];
 var $72=_fgets($68,1024,$71);
 var $73=($72|0)!=0;
 if($73){label=13;break;}else{label=29;break;}
 case 13:
 var $75=HEAP8[(1082664)];
 var $76=(($75)&1);
 if($76){label=14;break;}else{label=15;break;}
 case 14:
 var $78=HEAP32[((68472)>>2)];
 var $79=$78;
 var $80=(($buf)|0);
 var $81=_printf(4568,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$79,HEAP32[(((tempVarArgs)+(8))>>2)]=$80,tempVarArgs)); STACKTOP=tempVarArgs;
 label=15;break;
 case 15:
 var $83=HEAP32[((68472)>>2)];
 var $84=(($83+12)|0);
 var $85=HEAP32[(($84)>>2)];
 var $86=((($85)+(1))|0);
 HEAP32[(($84)>>2)]=$86;
 var $87=(($buf)|0);
 var $88=_cleanup($87,1);
 $comment=$88;
 var $89=(($buf)|0);
 var $90=_parse($89);
 $mne=$90;
 var $91=((((HEAPU8[(1092180)])|(HEAPU8[(1092181)]<<8)|(HEAPU8[(1092182)]<<16)|(HEAPU8[(1092183)]<<24))|0));
 var $92=(($91)|0);
 var $93=HEAP8[($92)];
 var $94=(($93<<24)>>24)!=0;
 if($94){label=16;break;}else{label=22;break;}
 case 16:
 var $96=$mne;
 var $97=($96|0)!=0;
 if($97){label=17;break;}else{label=21;break;}
 case 17:
 var $99=$mne;
 var $100=(($99+12)|0);
 var $101=HEAP8[($100)];
 var $102=($101&255);
 var $103=$102&128;
 var $104=($103|0)!=0;
 if($104){label=18;break;}else{label=21;break;}
 case 18:
 var $106=$defined;
 var $107=($106|0)!=0;
 if($107){label=20;break;}else{label=19;break;}
 case 19:
 var $109=HEAP32[(($base)>>2)];
 var $110=$mac;
 var $111=(($110+16)|0);
 HEAP32[(($111)>>2)]=$109;
 label=20;break;
 case 20:
 label=30;break;
 case 21:
 label=22;break;
 case 22:
 var $115=$skipit;
 var $116=($115|0)!=0;
 if($116){label=26;break;}else{label=23;break;}
 case 23:
 var $118=HEAP32[((1091600)>>2)];
 var $119=($118|0)!=0;
 if($119){label=24;break;}else{label=26;break;}
 case 24:
 var $121=HEAP8[(67232)];
 var $122=(($121<<24)>>24);
 var $123=($122|0)!=0;
 if($123){label=25;break;}else{label=26;break;}
 case 25:
 var $125=$comment;
 _outlistfile($125);
 label=26;break;
 case 26:
 var $127=$defined;
 var $128=($127|0)!=0;
 if($128){label=28;break;}else{label=27;break;}
 case 27:
 var $130=(($buf)|0);
 var $131=_strlen($130);
 var $132=((($131)+(5))|0);
 var $133=_permalloc($132);
 var $134=$133;
 $sl=$134;
 var $135=$sl;
 var $136=(($135+4)|0);
 var $137=(($136)|0);
 var $138=(($buf)|0);
 var $139=_strcpy($137,$138);
 var $140=$sl;
 var $141=$slp;
 HEAP32[(($141)>>2)]=$140;
 var $142=$sl;
 var $143=(($142)|0);
 $slp=$143;
 label=28;break;
 case 28:
 label=12;break;
 case 29:
 var $146=_asmerr(13,1,0);
 label=30;break;
 case 30:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _strlower($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $c;
 var $ptr;
 $1=$str;
 var $2=$1;
 $ptr=$2;
 label=2;break;
 case 2:
 var $4=$ptr;
 var $5=HEAP8[($4)];
 $c=$5;
 var $6=(($5<<24)>>24)!=0;
 if($6){label=3;break;}else{label=8;break;}
 case 3:
 var $8=$c;
 var $9=(($8<<24)>>24);
 var $10=($9|0)>=65;
 if($10){label=4;break;}else{label=6;break;}
 case 4:
 var $12=$c;
 var $13=(($12<<24)>>24);
 var $14=($13|0)<=90;
 if($14){label=5;break;}else{label=6;break;}
 case 5:
 var $16=$c;
 var $17=(($16<<24)>>24);
 var $18=$17|32;
 var $19=(($18)&255);
 var $20=$ptr;
 HEAP8[($20)]=$19;
 label=6;break;
 case 6:
 label=7;break;
 case 7:
 var $23=$ptr;
 var $24=(($23+1)|0);
 $ptr=$24;
 label=2;break;
 case 8:
 var $26=$1;
 STACKTOP=sp;return $26;
  default: assert(0, "bad label: " + label);
 }

}


function _outlistfile($comment){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $xtrue;
 var $c;
 var $ptr;
 var $dot;
 var $i;
 var $j;
 $1=$comment;
 var $2=HEAP32[((68472)>>2)];
 var $3=(($2+16)|0);
 var $4=HEAP8[($3)];
 var $5=($4&255);
 var $6=$5&2;
 var $7=($6|0)!=0;
 if($7){label=2;break;}else{label=3;break;}
 case 2:
 label=24;break;
 case 3:
 var $10=HEAP32[((1091296)>>2)];
 var $11=(($10+9)|0);
 var $12=HEAP8[($11)];
 var $13=($12&255);
 var $14=($13|0)!=0;
 if($14){label=4;break;}else{var $22=0;label=5;break;}
 case 4:
 var $16=HEAP32[((1091296)>>2)];
 var $17=(($16+10)|0);
 var $18=HEAP8[($17)];
 var $19=($18&255);
 var $20=($19|0)!=0;
 var $22=$20;label=5;break;
 case 5:
 var $22;
 var $23=($22?32:45);
 var $24=(($23)&255);
 $xtrue=$24;
 var $25=HEAP32[((1086856)>>2)];
 var $26=$25&16;
 var $27=($26|0)!=0;
 var $28=($27?85:32);
 var $29=(($28)&255);
 $c=$29;
 var $30=HEAP32[((1091640)>>2)];
 $ptr=$30;
 $dot=1082184;
 var $31=$ptr;
 var $32=($31|0)!=0;
 if($32){label=6;break;}else{label=7;break;}
 case 6:
 $dot=7856;
 label=8;break;
 case 7:
 $ptr=1082184;
 label=8;break;
 case 8:
 var $36=HEAP32[((68472)>>2)];
 var $37=(($36+12)|0);
 var $38=HEAP32[(($37)>>2)];
 var $39=$c;
 var $40=(($39<<24)>>24);
 var $41=HEAP32[((1086848)>>2)];
 var $42=HEAP32[((1086856)>>2)];
 var $43=$42&7;
 var $44=_sftos($41,$43);
 var $45=_sprintf(69536,7832,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$38,HEAP32[(((tempVarArgs)+(8))>>2)]=$40,HEAP32[(((tempVarArgs)+(16))>>2)]=$44,tempVarArgs)); STACKTOP=tempVarArgs;
 var $46=_strlen(69536);
 $j=$46;
 $i=0;
 label=9;break;
 case 9:
 var $48=$i;
 var $49=HEAP32[((1091304)>>2)];
 var $50=($48|0)<($49|0);
 if($50){label=10;break;}else{var $55=0;label=11;break;}
 case 10:
 var $52=$i;
 var $53=($52|0)<4;
 var $55=$53;label=11;break;
 case 11:
 var $55;
 if($55){label=12;break;}else{label=14;break;}
 case 12:
 var $57=$j;
 var $58=((69536+$57)|0);
 var $59=$i;
 var $60=((1091312+$59)|0);
 var $61=HEAP8[($60)];
 var $62=($61&255);
 var $63=_sprintf($58,7808,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$62,tempVarArgs)); STACKTOP=tempVarArgs;
 label=13;break;
 case 13:
 var $65=$i;
 var $66=((($65)+(1))|0);
 $i=$66;
 var $67=$j;
 var $68=((($67)+(3))|0);
 $j=$68;
 label=9;break;
 case 14:
 var $70=$i;
 var $71=HEAP32[((1091304)>>2)];
 var $72=($70|0)<($71|0);
 if($72){label=15;break;}else{label=17;break;}
 case 15:
 var $74=$i;
 var $75=($74|0)==4;
 if($75){label=16;break;}else{label=17;break;}
 case 16:
 $xtrue=42;
 label=17;break;
 case 17:
 label=18;break;
 case 18:
 var $79=$i;
 var $80=($79|0)<4;
 if($80){label=19;break;}else{label=21;break;}
 case 19:
 var $82=$j;
 var $83=((($82)+(2))|0);
 var $84=((69536+$83)|0);
 HEAP8[($84)]=32;
 var $85=$j;
 var $86=((($85)+(1))|0);
 var $87=((69536+$86)|0);
 HEAP8[($87)]=32;
 var $88=$j;
 var $89=((69536+$88)|0);
 HEAP8[($89)]=32;
 var $90=$j;
 var $91=((($90)+(3))|0);
 $j=$91;
 label=20;break;
 case 20:
 var $93=$i;
 var $94=((($93)+(1))|0);
 $i=$94;
 label=18;break;
 case 21:
 var $96=$j;
 var $97=((69536+$96)|0);
 var $98=((($97)-(1))|0);
 var $99=$xtrue;
 var $100=(($99<<24)>>24);
 var $101=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $102=((((HEAPU8[(1092180)])|(HEAPU8[(1092181)]<<8)|(HEAPU8[(1092182)]<<16)|(HEAPU8[(1092183)]<<24))|0));
 var $103=$dot;
 var $104=$ptr;
 var $105=((((HEAPU8[(1092184)])|(HEAPU8[(1092185)]<<8)|(HEAPU8[(1092186)]<<16)|(HEAPU8[(1092187)]<<24))|0));
 var $106=_sprintf($98,7776,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$100,HEAP32[(((tempVarArgs)+(8))>>2)]=$101,HEAP32[(((tempVarArgs)+(16))>>2)]=$102,HEAP32[(((tempVarArgs)+(24))>>2)]=$103,HEAP32[(((tempVarArgs)+(32))>>2)]=$104,HEAP32[(((tempVarArgs)+(40))>>2)]=$105,tempVarArgs)); STACKTOP=tempVarArgs;
 var $107=$1;
 var $108=(($107)|0);
 var $109=HEAP8[($108)];
 var $110=(($109<<24)>>24)!=0;
 if($110){label=22;break;}else{label=23;break;}
 case 22:
 var $112=_strlen(69536);
 var $113=((($112)-(1))|0);
 $j=$113;
 var $114=$j;
 var $115=((69536+$114)|0);
 var $116=$1;
 var $117=_sprintf($115,7728,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$116,tempVarArgs)); STACKTOP=tempVarArgs;
 label=23;break;
 case 23:
 var $119=_tabit(69536,68480);
 var $120=HEAP32[((1091632)>>2)];
 var $121=_fwrite(68480,$119,1,$120);
 HEAP32[((1091304)>>2)]=0;
 HEAP32[((1091640)>>2)]=0;
 label=24;break;
 case 24:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _permalloc($bytes){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $ptr;
 $1=$bytes;
 var $2=$1;
 var $3=((($2)+(4))|0);
 var $4=((($3)-(1))|0);
 var $5=$4&-4;
 $1=$5;
 var $6=$1;
 var $7=HEAP32[((68448)>>2)];
 var $8=($6|0)>($7|0);
 if($8){label=2;break;}else{label=7;break;}
 case 2:
 var $10=_malloc(16384);
 HEAP32[((68456)>>2)]=$10;
 var $11=($10|0)==0;
 if($11){label=3;break;}else{label=4;break;}
 case 3:
 _panic(3600);
 label=4;break;
 case 4:
 var $14=HEAP32[((68456)>>2)];
 _memset($14, 0, 16384)|0;
 HEAP32[((68448)>>2)]=16384;
 var $15=$1;
 var $16=HEAP32[((68448)>>2)];
 var $17=($15|0)>($16|0);
 if($17){label=5;break;}else{label=6;break;}
 case 5:
 _panic(3536);
 label=6;break;
 case 6:
 label=7;break;
 case 7:
 var $21=HEAP32[((68456)>>2)];
 $ptr=$21;
 var $22=$1;
 var $23=HEAP32[((68456)>>2)];
 var $24=(($23+$22)|0);
 HEAP32[((68456)>>2)]=$24;
 var $25=$1;
 var $26=HEAP32[((68448)>>2)];
 var $27=((($26)-($25))|0);
 HEAP32[((68448)>>2)]=$27;
 var $28=$ptr;
 STACKTOP=sp;return $28;
  default: assert(0, "bad label: " + label);
 }

}


function _cleanup($buf,$bDisable){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $str;
 var $strlist;
 var $arg;
 var $add;
 var $comment;
 $1=$buf;
 var $3=($bDisable&1);
 $2=$3;
 $comment=1082184;
 var $4=$1;
 $str=$4;
 label=2;break;
 case 2:
 var $6=$str;
 var $7=HEAP8[($6)];
 var $8=(($7<<24)>>24)!=0;
 if($8){label=3;break;}else{label=61;break;}
 case 3:
 var $10=$str;
 var $11=HEAP8[($10)];
 var $12=(($11<<24)>>24);
 switch(($12|0)){case 34:{ label=15;break;}case 123:{ label=25;break;}case 59:{ label=4;break;}case 13:case 10:{ label=5;break;}case 9:{ label=6;break;}case 39:{ label=7;break;}default:{label=59;break;}}break;
 case 4:
 var $14=$str;
 var $15=(($14+1)|0);
 $comment=$15;
 label=5;break;
 case 5:
 label=62;break;
 case 6:
 var $18=$str;
 HEAP8[($18)]=32;
 label=59;break;
 case 7:
 var $20=$str;
 var $21=(($20+1)|0);
 $str=$21;
 var $22=$str;
 var $23=HEAP8[($22)];
 var $24=(($23<<24)>>24);
 var $25=($24|0)==9;
 if($25){label=8;break;}else{label=9;break;}
 case 8:
 var $27=$str;
 HEAP8[($27)]=32;
 label=9;break;
 case 9:
 var $29=$str;
 var $30=HEAP8[($29)];
 var $31=(($30<<24)>>24);
 var $32=($31|0)==10;
 if($32){label=11;break;}else{label=10;break;}
 case 10:
 var $34=$str;
 var $35=HEAP8[($34)];
 var $36=(($35<<24)>>24);
 var $37=($36|0)==0;
 if($37){label=11;break;}else{label=12;break;}
 case 11:
 var $39=$str;
 var $40=(($39)|0);
 HEAP8[($40)]=32;
 var $41=$str;
 var $42=(($41+1)|0);
 HEAP8[($42)]=0;
 label=12;break;
 case 12:
 var $44=$str;
 var $45=(($44)|0);
 var $46=HEAP8[($45)];
 var $47=(($46<<24)>>24);
 var $48=($47|0)==32;
 if($48){label=13;break;}else{label=14;break;}
 case 13:
 var $50=$str;
 var $51=(($50)|0);
 HEAP8[($51)]=-128;
 label=14;break;
 case 14:
 label=59;break;
 case 15:
 var $54=$str;
 var $55=(($54+1)|0);
 $str=$55;
 label=16;break;
 case 16:
 var $57=$str;
 var $58=HEAP8[($57)];
 var $59=(($58<<24)>>24);
 var $60=($59|0)!=0;
 if($60){label=17;break;}else{var $67=0;label=18;break;}
 case 17:
 var $62=$str;
 var $63=HEAP8[($62)];
 var $64=(($63<<24)>>24);
 var $65=($64|0)!=34;
 var $67=$65;label=18;break;
 case 18:
 var $67;
 if($67){label=19;break;}else{label=22;break;}
 case 19:
 var $69=$str;
 var $70=HEAP8[($69)];
 var $71=(($70<<24)>>24);
 var $72=($71|0)==32;
 if($72){label=20;break;}else{label=21;break;}
 case 20:
 var $74=$str;
 HEAP8[($74)]=-128;
 label=21;break;
 case 21:
 var $76=$str;
 var $77=(($76+1)|0);
 $str=$77;
 label=16;break;
 case 22:
 var $79=$str;
 var $80=HEAP8[($79)];
 var $81=(($80<<24)>>24);
 var $82=($81|0)!=34;
 if($82){label=23;break;}else{label=24;break;}
 case 23:
 var $84=$1;
 var $85=_asmerr(5,0,$84);
 var $86=$str;
 var $87=((($86)-(1))|0);
 $str=$87;
 label=24;break;
 case 24:
 label=59;break;
 case 25:
 var $90=$2;
 var $91=(($90)&1);
 if($91){label=26;break;}else{label=27;break;}
 case 26:
 label=59;break;
 case 27:
 var $94=HEAP8[(1082664)];
 var $95=(($94)&1);
 if($95){label=28;break;}else{label=29;break;}
 case 28:
 var $97=$str;
 var $98=_printf(8160,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$97,tempVarArgs)); STACKTOP=tempVarArgs;
 label=29;break;
 case 29:
 var $100=$str;
 var $101=(($100+1)|0);
 var $102=_strtol($101,0,10);
 $arg=$102;
 $add=0;
 label=30;break;
 case 30:
 var $104=$str;
 var $105=HEAP8[($104)];
 var $106=(($105<<24)>>24);
 var $107=($106|0)!=0;
 if($107){label=31;break;}else{var $114=0;label=32;break;}
 case 31:
 var $109=$str;
 var $110=HEAP8[($109)];
 var $111=(($110<<24)>>24);
 var $112=($111|0)!=125;
 var $114=$112;label=32;break;
 case 32:
 var $114;
 if($114){label=33;break;}else{label=35;break;}
 case 33:
 var $116=$add;
 var $117=((($116)-(1))|0);
 $add=$117;
 label=34;break;
 case 34:
 var $119=$str;
 var $120=(($119+1)|0);
 $str=$120;
 label=30;break;
 case 35:
 var $122=$str;
 var $123=HEAP8[($122)];
 var $124=(($123<<24)>>24);
 var $125=($124|0)!=125;
 if($125){label=36;break;}else{label=37;break;}
 case 36:
 var $127=_puts(8120);
 var $128=$str;
 var $129=((($128)-(1))|0);
 $str=$129;
 label=59;break;
 case 37:
 var $131=$add;
 var $132=((($131)-(1))|0);
 $add=$132;
 var $133=$str;
 var $134=(($133+1)|0);
 $str=$134;
 var $135=HEAP8[(1082664)];
 var $136=(($135)&1);
 if($136){label=38;break;}else{label=39;break;}
 case 38:
 var $138=$add;
 var $139=$str;
 var $140=_printf(8056,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$138,HEAP32[(((tempVarArgs)+(8))>>2)]=$139,tempVarArgs)); STACKTOP=tempVarArgs;
 label=39;break;
 case 39:
 var $142=HEAP32[((68472)>>2)];
 var $143=(($142+20)|0);
 var $144=HEAP32[(($143)>>2)];
 $strlist=$144;
 label=40;break;
 case 40:
 var $146=$arg;
 var $147=($146|0)!=0;
 if($147){label=41;break;}else{var $152=0;label=42;break;}
 case 41:
 var $149=$strlist;
 var $150=($149|0)!=0;
 var $152=$150;label=42;break;
 case 42:
 var $152;
 if($152){label=43;break;}else{label=44;break;}
 case 43:
 var $154=$arg;
 var $155=((($154)-(1))|0);
 $arg=$155;
 var $156=$strlist;
 var $157=(($156)|0);
 var $158=HEAP32[(($157)>>2)];
 $strlist=$158;
 label=40;break;
 case 44:
 var $160=$strlist;
 var $161=($160|0)!=0;
 if($161){label=45;break;}else{label=57;break;}
 case 45:
 var $163=$strlist;
 var $164=(($163+4)|0);
 var $165=(($164)|0);
 var $166=_strlen($165);
 var $167=$add;
 var $168=((($167)+($166))|0);
 $add=$168;
 var $169=HEAP8[(1082664)];
 var $170=(($169)&1);
 if($170){label=46;break;}else{label=47;break;}
 case 46:
 var $172=$strlist;
 var $173=(($172+4)|0);
 var $174=(($173)|0);
 var $175=$strlist;
 var $176=(($175+4)|0);
 var $177=(($176)|0);
 var $178=_strlen($177);
 var $179=_printf(8024,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$174,HEAP32[(((tempVarArgs)+(8))>>2)]=$178,tempVarArgs)); STACKTOP=tempVarArgs;
 label=47;break;
 case 47:
 var $181=$str;
 var $182=$add;
 var $183=(($181+$182)|0);
 var $184=$str;
 var $185=_strlen($184);
 var $186=(($183+$185)|0);
 var $187=(($186+1)|0);
 var $188=$1;
 var $189=(($188+1024)|0);
 var $190=($187>>>0)>($189>>>0);
 if($190){label=48;break;}else{label=51;break;}
 case 48:
 var $192=HEAP8[(1082664)];
 var $193=(($192)&1);
 if($193){label=49;break;}else{label=50;break;}
 case 49:
 var $195=$str;
 var $196=$195;
 var $197=$1;
 var $198=$197;
 var $199=$add;
 var $200=$str;
 var $201=_strlen($200);
 var $202=_printf(7960,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$196,HEAP32[(((tempVarArgs)+(8))>>2)]=$198,HEAP32[(((tempVarArgs)+(16))>>2)]=$199,HEAP32[(((tempVarArgs)+(24))>>2)]=$201,tempVarArgs)); STACKTOP=tempVarArgs;
 label=50;break;
 case 50:
 _panic(7936);
 label=51;break;
 case 51:
 var $205=$str;
 var $206=$add;
 var $207=(($205+$206)|0);
 var $208=$str;
 var $209=$str;
 var $210=_strlen($209);
 var $211=((($210)+(1))|0);
 _memmove($207,$208,$211,1,0);
 var $212=$add;
 var $213=$str;
 var $214=(($213+$212)|0);
 $str=$214;
 var $215=$str;
 var $216=$strlist;
 var $217=(($216+4)|0);
 var $218=(($217)|0);
 var $219=_strlen($218);
 var $220=(((-$219))|0);
 var $221=(($215+$220)|0);
 var $222=$1;
 var $223=($221>>>0)<($222>>>0);
 if($223){label=52;break;}else{label=53;break;}
 case 52:
 _panic(7920);
 label=53;break;
 case 53:
 var $226=$str;
 var $227=$strlist;
 var $228=(($227+4)|0);
 var $229=(($228)|0);
 var $230=_strlen($229);
 var $231=(((-$230))|0);
 var $232=(($226+$231)|0);
 var $233=$strlist;
 var $234=(($233+4)|0);
 var $235=$234;
 var $236=$strlist;
 var $237=(($236+4)|0);
 var $238=(($237)|0);
 var $239=_strlen($238);
 _memmove($232,$235,$239,1,0);
 var $240=$strlist;
 var $241=(($240+4)|0);
 var $242=(($241)|0);
 var $243=_strlen($242);
 var $244=$str;
 var $245=(((-$243))|0);
 var $246=(($244+$245)|0);
 $str=$246;
 var $247=$str;
 var $248=$1;
 var $249=($247>>>0)<($248>>>0);
 if($249){label=55;break;}else{label=54;break;}
 case 54:
 var $251=$str;
 var $252=$1;
 var $253=(($252+1024)|0);
 var $254=($251>>>0)>=($253>>>0);
 if($254){label=55;break;}else{label=56;break;}
 case 55:
 _panic(7896);
 label=56;break;
 case 56:
 var $257=$str;
 var $258=((($257)-(1))|0);
 $str=$258;
 label=58;break;
 case 57:
 var $260=_asmerr(12,0,0);
 label=62;break;
 case 58:
 label=59;break;
 case 59:
 label=60;break;
 case 60:
 var $264=$str;
 var $265=(($264+1)|0);
 $str=$265;
 label=2;break;
 case 61:
 label=62;break;
 case 62:
 label=63;break;
 case 63:
 var $269=$str;
 var $270=$1;
 var $271=($269|0)!=($270|0);
 if($271){label=64;break;}else{var $279=0;label=65;break;}
 case 64:
 var $273=$str;
 var $274=((($273)-(1))|0);
 var $275=HEAP8[($274)];
 var $276=(($275<<24)>>24);
 var $277=($276|0)==32;
 var $279=$277;label=65;break;
 case 65:
 var $279;
 if($279){label=66;break;}else{label=67;break;}
 case 66:
 var $281=$str;
 var $282=((($281)-(1))|0);
 $str=$282;
 label=63;break;
 case 67:
 var $284=$str;
 HEAP8[($284)]=0;
 var $285=$comment;
 STACKTOP=sp;return $285;
  default: assert(0, "bad label: " + label);
 }

}


function _asmerr($err,$bAbort,$sText){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $4;
 var $str;
 var $pincfile;
 var $error_file;
 $2=$err;
 var $5=($bAbort&1);
 $3=$5;
 $4=$sText;
 $error_file=0;
 var $6=$2;
 var $7=($6>>>0)>=36;
 if($7){label=3;break;}else{label=2;break;}
 case 2:
 var $9=$2;
 var $10=($9|0)<0;
 if($10){label=3;break;}else{label=4;break;}
 case 3:
 var $12=_asmerr(26,1,4176);
 $1=$12;
 label=36;break;
 case 4:
 var $14=$2;
 var $15=((8+((($14)*(12))&-1))|0);
 var $16=(($15+4)|0);
 var $17=HEAP8[($16)];
 var $18=(($17)&1);
 if($18){label=5;break;}else{label=6;break;}
 case 5:
 HEAP8[(1082176)]=1;
 label=6;break;
 case 6:
 var $21=HEAP32[((68472)>>2)];
 $pincfile=$21;
 label=7;break;
 case 7:
 var $23=$pincfile;
 var $24=(($23+16)|0);
 var $25=HEAP8[($24)];
 var $26=($25&255);
 var $27=$26&1;
 var $28=($27|0)!=0;
 if($28){label=8;break;}else{label=10;break;}
 case 8:
 label=9;break;
 case 9:
 var $31=$pincfile;
 var $32=(($31)|0);
 var $33=HEAP32[(($32)>>2)];
 $pincfile=$33;
 label=7;break;
 case 10:
 var $35=$2;
 var $36=((8+((($35)*(12))&-1))|0);
 var $37=(($36+8)|0);
 var $38=HEAP32[(($37)>>2)];
 $str=$38;
 var $39=HEAP32[((1091600)>>2)];
 var $40=($39|0)!=0;
 if($40){label=11;break;}else{label=12;break;}
 case 11:
 var $42=HEAP32[((1091632)>>2)];
 var $46=$42;label=13;break;
 case 12:
 var $44=HEAP32[((_stdout)>>2)];
 var $46=$44;label=13;break;
 case 13:
 var $46;
 $error_file=$46;
 var $47=HEAP32[((1091608)>>2)];
 if(($47|0)==0){ label=14;break;}else if(($47|0)==1){ label=17;break;}else if(($47|0)==2){ label=20;break;}else{label=23;break;}
 case 14:
 var $49=$error_file;
 var $50=HEAP32[((_stdout)>>2)];
 var $51=($49|0)!=($50|0);
 if($51){label=15;break;}else{label=16;break;}
 case 15:
 var $53=$error_file;
 var $54=$pincfile;
 var $55=(($54+4)|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=$pincfile;
 var $58=(($57+12)|0);
 var $59=HEAP32[(($58)>>2)];
 var $60=_fprintf($53,4096,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$56,HEAP32[(((tempVarArgs)+(8))>>2)]=$59,tempVarArgs)); STACKTOP=tempVarArgs;
 label=16;break;
 case 16:
 var $62=$pincfile;
 var $63=(($62+4)|0);
 var $64=HEAP32[(($63)>>2)];
 var $65=$pincfile;
 var $66=(($65+12)|0);
 var $67=HEAP32[(($66)>>2)];
 var $68=_sprintf(1081664,4096,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$64,HEAP32[(((tempVarArgs)+(8))>>2)]=$67,tempVarArgs)); STACKTOP=tempVarArgs;
 label=24;break;
 case 17:
 var $70=$error_file;
 var $71=HEAP32[((_stdout)>>2)];
 var $72=($70|0)!=($71|0);
 if($72){label=18;break;}else{label=19;break;}
 case 18:
 var $74=$error_file;
 var $75=$pincfile;
 var $76=(($75+12)|0);
 var $77=HEAP32[(($76)>>2)];
 var $78=$pincfile;
 var $79=(($78+4)|0);
 var $80=HEAP32[(($79)>>2)];
 var $81=_fprintf($74,4032,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$77,HEAP32[(((tempVarArgs)+(8))>>2)]=$80,tempVarArgs)); STACKTOP=tempVarArgs;
 label=19;break;
 case 19:
 var $83=$pincfile;
 var $84=(($83+12)|0);
 var $85=HEAP32[(($84)>>2)];
 var $86=$pincfile;
 var $87=(($86+4)|0);
 var $88=HEAP32[(($87)>>2)];
 var $89=_sprintf(1081664,4032,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$85,HEAP32[(((tempVarArgs)+(8))>>2)]=$88,tempVarArgs)); STACKTOP=tempVarArgs;
 label=24;break;
 case 20:
 var $91=$error_file;
 var $92=HEAP32[((_stdout)>>2)];
 var $93=($91|0)!=($92|0);
 if($93){label=21;break;}else{label=22;break;}
 case 21:
 var $95=$error_file;
 var $96=$pincfile;
 var $97=(($96+4)|0);
 var $98=HEAP32[(($97)>>2)];
 var $99=$pincfile;
 var $100=(($99+12)|0);
 var $101=HEAP32[(($100)>>2)];
 var $102=_fprintf($95,3960,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$98,HEAP32[(((tempVarArgs)+(8))>>2)]=$101,tempVarArgs)); STACKTOP=tempVarArgs;
 label=22;break;
 case 22:
 var $104=$pincfile;
 var $105=(($104+4)|0);
 var $106=HEAP32[(($105)>>2)];
 var $107=$pincfile;
 var $108=(($107+12)|0);
 var $109=HEAP32[(($108)>>2)];
 var $110=_sprintf(1081664,3960,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$106,HEAP32[(((tempVarArgs)+(8))>>2)]=$109,tempVarArgs)); STACKTOP=tempVarArgs;
 label=24;break;
 case 23:
 _panic(3872);
 label=24;break;
 case 24:
 var $113=$error_file;
 var $114=HEAP32[((_stdout)>>2)];
 var $115=($113|0)!=($114|0);
 if($115){label=25;break;}else{label=29;break;}
 case 25:
 var $117=$error_file;
 var $118=$str;
 var $119=$4;
 var $120=($119|0)!=0;
 if($120){label=26;break;}else{label=27;break;}
 case 26:
 var $122=$4;
 var $125=$122;label=28;break;
 case 27:
 var $125=1082184;label=28;break;
 case 28:
 var $125;
 var $126=_fprintf($117,$118,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$125,tempVarArgs)); STACKTOP=tempVarArgs;
 var $127=$error_file;
 var $128=_fprintf($127,3816,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=29;break;
 case 29:
 var $130=$str;
 var $131=$4;
 var $132=($131|0)!=0;
 if($132){label=30;break;}else{label=31;break;}
 case 30:
 var $134=$4;
 var $137=$134;label=32;break;
 case 31:
 var $137=1082184;label=32;break;
 case 32:
 var $137;
 var $138=_sprintf(1081160,$130,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$137,tempVarArgs)); STACKTOP=tempVarArgs;
 var $139=_sprintf(1080656,3816,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $140=_strcat(80656,1081664);
 var $141=_strcat(80656,1081160);
 var $142=_strcat(80656,1080656);
 var $143=$3;
 var $144=(($143)&1);
 if($144){label=33;break;}else{label=34;break;}
 case 33:
 HEAP8[(70616)]=32;
 var $146=_printf(3760,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=70616,tempVarArgs)); STACKTOP=tempVarArgs;
 var $147=$error_file;
 var $148=_fprintf($147,3664,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $149=_printf(3760,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=80656,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 case 34:
 label=35;break;
 case 35:
 var $152=$2;
 $1=$152;
 label=36;break;
 case 36:
 var $154=$1;
 STACKTOP=sp;return $154;
  default: assert(0, "bad label: " + label);
 }

}


function _addhashtable($mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+88)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $i;
 var $j;
 var $opcode=sp;
 $1=$mne;
 label=2;break;
 case 2:
 var $3=$1;
 var $4=(($3+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=($5|0)!=0;
 if($6){label=3;break;}else{label=11;break;}
 case 3:
 var $8=$opcode;
 var $9=$1;
 var $10=(($9+20)|0);
 var $11=$10;
 assert(84 % 1 === 0);(_memcpy($8, $11, 84)|0);
 $j=0;
 $i=0;
 label=4;break;
 case 4:
 var $13=$i;
 var $14=($13|0)<21;
 if($14){label=5;break;}else{label=9;break;}
 case 5:
 var $16=$i;
 var $17=$1;
 var $18=(($17+20)|0);
 var $19=(($18+($16<<2))|0);
 HEAP32[(($19)>>2)]=0;
 var $20=$1;
 var $21=(($20+16)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=$i;
 var $24=1<<$23;
 var $25=$22&$24;
 var $26=($25|0)!=0;
 if($26){label=6;break;}else{label=7;break;}
 case 6:
 var $28=$j;
 var $29=((($28)+(1))|0);
 $j=$29;
 var $30=(($opcode+($28<<2))|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=$i;
 var $33=$1;
 var $34=(($33+20)|0);
 var $35=(($34+($32<<2))|0);
 HEAP32[(($35)>>2)]=$31;
 label=7;break;
 case 7:
 label=8;break;
 case 8:
 var $38=$i;
 var $39=((($38)+(1))|0);
 $i=$39;
 label=4;break;
 case 9:
 var $41=$1;
 var $42=(($41+8)|0);
 var $43=HEAP32[(($42)>>2)];
 var $44=_hash1($43);
 $i=$44;
 var $45=$i;
 var $46=((1087152+($45<<2))|0);
 var $47=((((HEAPU8[($46)])|(HEAPU8[((($46)+(1))|0)]<<8)|(HEAPU8[((($46)+(2))|0)]<<16)|(HEAPU8[((($46)+(3))|0)]<<24))|0));
 var $48=$1;
 var $49=(($48)|0);
 HEAP32[(($49)>>2)]=$47;
 var $50=$1;
 var $51=$i;
 var $52=((1087152+($51<<2))|0);
 tempBigInt=$50;HEAP8[($52)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($52)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($52)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($52)+(3))|0)]=tempBigInt&0xff;
 label=10;break;
 case 10:
 var $54=$1;
 var $55=(($54+104)|0);
 $1=$55;
 label=2;break;
 case 11:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _pushinclude($str){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $inf;
 var $fi;
 $1=$str;
 var $2=$1;
 var $3=_pfopen($2,4512);
 $fi=$3;
 var $4=($3|0)!=0;
 if($4){label=2;break;}else{label=8;break;}
 case 2:
 var $6=HEAP8[(1091576)];
 var $7=($6&255);
 var $8=($7|0)>1;
 if($8){label=3;break;}else{label=5;break;}
 case 3:
 var $10=HEAP8[(1091576)];
 var $11=($10&255);
 var $12=($11|0)!=5;
 if($12){label=4;break;}else{label=5;break;}
 case 4:
 var $14=HEAP8[(1091288)];
 var $15=(($14<<24)>>24);
 var $16=($15<<2);
 var $17=$1;
 var $18=_printf(4416,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$16,HEAP32[(((tempVarArgs)+(8))>>2)]=1082184,HEAP32[(((tempVarArgs)+(16))>>2)]=$17,tempVarArgs)); STACKTOP=tempVarArgs;
 label=5;break;
 case 5:
 var $20=HEAP8[(1091288)];
 var $21=((($20)+(1))&255);
 HEAP8[(1091288)]=$21;
 var $22=HEAP32[((1091600)>>2)];
 var $23=($22|0)!=0;
 if($23){label=6;break;}else{label=7;break;}
 case 6:
 var $25=HEAP32[((1091632)>>2)];
 var $26=$1;
 var $27=HEAP8[(1091288)];
 var $28=(($27<<24)>>24);
 var $29=HEAP32[((68464)>>2)];
 var $30=_fprintf($25,4328,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$26,HEAP32[(((tempVarArgs)+(8))>>2)]=$28,HEAP32[(((tempVarArgs)+(16))>>2)]=$29,tempVarArgs)); STACKTOP=tempVarArgs;
 label=7;break;
 case 7:
 var $32=_zmalloc(36);
 var $33=$32;
 $inf=$33;
 var $34=HEAP32[((68472)>>2)];
 var $35=$inf;
 var $36=(($35)|0);
 HEAP32[(($36)>>2)]=$34;
 var $37=$1;
 var $38=_strlen($37);
 var $39=((($38)+(1))|0);
 var $40=_ckmalloc($39);
 var $41=$1;
 var $42=_strcpy($40,$41);
 var $43=$inf;
 var $44=(($43+4)|0);
 HEAP32[(($44)>>2)]=$42;
 var $45=$fi;
 var $46=$inf;
 var $47=(($46+8)|0);
 HEAP32[(($47)>>2)]=$45;
 var $48=$inf;
 var $49=(($48+12)|0);
 HEAP32[(($49)>>2)]=0;
 var $50=$inf;
 HEAP32[((68472)>>2)]=$50;
 label=9;break;
 case 8:
 var $52=$1;
 var $53=_printf(4248,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$52,tempVarArgs)); STACKTOP=tempVarArgs;
 label=9;break;
 case 9:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _zmalloc($bytes){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $ptr;
 $1=$bytes;
 var $2=$1;
 var $3=_ckmalloc($2);
 $ptr=$3;
 var $4=$ptr;
 var $5=($4|0)!=0;
 if($5){label=2;break;}else{label=3;break;}
 case 2:
 var $7=$ptr;
 var $8=$1;
 _memset($7, 0, $8)|0;
 label=3;break;
 case 3:
 var $10=$ptr;
 STACKTOP=sp;return $10;
  default: assert(0, "bad label: " + label);
 }

}


function _ckmalloc($bytes){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $ptr;
 $2=$bytes;
 var $3=$2;
 var $4=_malloc($3);
 $ptr=$4;
 var $5=$ptr;
 var $6=($5|0)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=$ptr;
 $1=$8;
 label=4;break;
 case 3:
 _panic(3600);
 $1=0;
 label=4;break;
 case 4:
 var $11=$1;
 STACKTOP=sp;return $11;
  default: assert(0, "bad label: " + label);
 }

}


function _main($ac,$av){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $bTableSort=sp;
 var $nError;
 $1=0;
 $2=$ac;
 $3=$av;
 HEAP8[($bTableSort)]=0;
 var $4=$2;
 var $5=$3;
 var $6=_MainShadow($4,$5,$bTableSort);
 $nError=$6;
 var $7=$nError;
 var $8=($7|0)!=0;
 if($8){label=2;break;}else{label=3;break;}
 case 2:
 HEAP8[(70616)]=32;
 var $10=_printf(3760,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=70616,tempVarArgs)); STACKTOP=tempVarArgs;
 var $11=_printf(3760,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=80656,tempVarArgs)); STACKTOP=tempVarArgs;
 var $12=$nError;
 var $13=((8+((($12)*(12))&-1))|0);
 var $14=(($13+8)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=_printf(3456,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$15,tempVarArgs)); STACKTOP=tempVarArgs;
 label=3;break;
 case 3:
 var $18=HEAP8[($bTableSort)];
 var $19=(($18)&1);
 _DumpSymbolTable($19);
 var $20=$nError;
 STACKTOP=sp;return $20;
  default: assert(0, "bad label: " + label);
 }

}
Module["_main"] = _main;

function _MainShadow($ac,$av,$pbTableSort){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+1088)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $4;
 var $nError;
 var $bDoAllPasses;
 var $buf=sp;
 var $i;
 var $mne;
 var $oldredo;
 var $oldwhy;
 var $oldeval;
 var $str;
 var $seg;
 var $ifs;
 var $comment;
 var $sBuffer=(sp)+(1024);
 $2=$ac;
 $3=$av;
 $4=$pbTableSort;
 $nError=0;
 $bDoAllPasses=0;
 $oldredo=-1;
 $oldwhy=0;
 $oldeval=0;
 _addhashtable(11064);
 HEAP32[((68464)>>2)]=1;
 var $5=$2;
 var $6=($5|0)<2;
 if($6){label=2;break;}else{label=4;break;}
 case 2:
 label=3;break;
 case 3:
 var $9=_puts(448);
 var $10=_puts(2576);
 var $11=_puts(2472);
 var $12=_puts(2352);
 var $13=_puts(2240);
 var $14=_puts(1082184);
 var $15=_puts(2168);
 var $16=_puts(1082184);
 var $17=_puts(2088);
 var $18=_puts(1992);
 var $19=_puts(1912);
 var $20=_puts(1816);
 var $21=_puts(1720);
 var $22=_puts(1632);
 var $23=_puts(1560);
 var $24=_puts(1472);
 var $25=_puts(1384);
 var $26=_puts(1296);
 var $27=_puts(1216);
 var $28=_puts(1136);
 var $29=_puts(1064);
 var $30=_puts(928);
 var $31=_puts(840);
 var $32=_puts(1082184);
 var $33=_puts(736);
 $1=1;
 label=130;break;
 case 4:
 $i=2;
 label=5;break;
 case 5:
 var $36=$i;
 var $37=$2;
 var $38=($36|0)<($37|0);
 if($38){label=6;break;}else{label=49;break;}
 case 6:
 var $40=$i;
 var $41=$3;
 var $42=(($41+($40<<2))|0);
 var $43=HEAP32[(($42)>>2)];
 var $44=(($43)|0);
 var $45=HEAP8[($44)];
 var $46=(($45<<24)>>24);
 var $47=($46|0)==45;
 if($47){label=8;break;}else{label=7;break;}
 case 7:
 var $49=$i;
 var $50=$3;
 var $51=(($50+($49<<2))|0);
 var $52=HEAP32[(($51)>>2)];
 var $53=(($52)|0);
 var $54=HEAP8[($53)];
 var $55=(($54<<24)>>24);
 var $56=($55|0)==47;
 if($56){label=8;break;}else{label=47;break;}
 case 8:
 var $58=$i;
 var $59=$3;
 var $60=(($59+($58<<2))|0);
 var $61=HEAP32[(($60)>>2)];
 var $62=(($61+2)|0);
 $str=$62;
 var $63=$i;
 var $64=$3;
 var $65=(($64+($63<<2))|0);
 var $66=HEAP32[(($65)>>2)];
 var $67=(($66+1)|0);
 var $68=HEAP8[($67)];
 var $69=(($68<<24)>>24);
 switch(($69|0)){case 84:{ label=13;break;}case 100:{ label=17;break;}case 77:case 68:{ label=18;break;}case 102:{ label=30;break;}case 111:{ label=34;break;}case 76:{ label=38;break;}case 108:{ label=39;break;}case 80:{ label=40;break;}case 112:{ label=41;break;}case 115:{ label=42;break;}case 118:{ label=43;break;}case 73:{ label=44;break;}case 69:{ label=9;break;}default:{label=45;break;}}break;
 case 9:
 var $71=$str;
 var $72=_strtol($71,0,10);
 HEAP32[((1091608)>>2)]=$72;
 var $73=HEAP32[((1091608)>>2)];
 var $74=($73>>>0)<0;
 if($74){label=11;break;}else{label=10;break;}
 case 10:
 var $76=HEAP32[((1091608)>>2)];
 var $77=($76>>>0)>=3;
 if($77){label=11;break;}else{label=12;break;}
 case 11:
 _panic(672);
 label=12;break;
 case 12:
 label=46;break;
 case 13:
 var $81=$str;
 var $82=_strtol($81,0,10);
 HEAP32[((1091592)>>2)]=$82;
 var $83=HEAP32[((1091592)>>2)];
 var $84=($83>>>0)<0;
 if($84){label=15;break;}else{label=14;break;}
 case 14:
 var $86=HEAP32[((1091592)>>2)];
 var $87=($86>>>0)>=2;
 if($87){label=15;break;}else{label=16;break;}
 case 15:
 _panic(584);
 label=16;break;
 case 16:
 var $90=HEAP32[((1091592)>>2)];
 var $91=($90|0)!=0;
 var $92=$4;
 var $93=($91&1);
 HEAP8[($92)]=$93;
 label=46;break;
 case 17:
 var $95=$str;
 var $96=_strtol($95,0,10);
 var $97=($96|0)!=0;
 var $98=($97&1);
 HEAP8[(1082664)]=$98;
 var $99=HEAP8[(1082664)];
 var $100=(($99)&1);
 var $101=($100?520:488);
 var $102=_printf(544,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$101,tempVarArgs)); STACKTOP=tempVarArgs;
 label=46;break;
 case 18:
 label=19;break;
 case 19:
 var $105=$str;
 var $106=HEAP8[($105)];
 var $107=(($106<<24)>>24);
 var $108=($107|0)!=0;
 if($108){label=20;break;}else{var $115=0;label=21;break;}
 case 20:
 var $110=$str;
 var $111=HEAP8[($110)];
 var $112=(($111<<24)>>24);
 var $113=($112|0)!=61;
 var $115=$113;label=21;break;
 case 21:
 var $115;
 if($115){label=22;break;}else{label=23;break;}
 case 22:
 var $117=$str;
 var $118=(($117+1)|0);
 $str=$118;
 label=19;break;
 case 23:
 var $120=$str;
 var $121=HEAP8[($120)];
 var $122=(($121<<24)>>24);
 var $123=($122|0)==61;
 if($123){label=24;break;}else{label=25;break;}
 case 24:
 var $125=$str;
 HEAP8[($125)]=0;
 var $126=$str;
 var $127=(($126+1)|0);
 $str=$127;
 label=26;break;
 case 25:
 $str=10904;
 label=26;break;
 case 26:
 var $130=$i;
 var $131=$3;
 var $132=(($131+($130<<2))|0);
 var $133=HEAP32[(($132)>>2)];
 var $134=(($133+2)|0);
 tempBigInt=$134;HEAP8[(1092176)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092177)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092178)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092179)]=tempBigInt&0xff;
 var $135=$i;
 var $136=$3;
 var $137=(($136+($135<<2))|0);
 var $138=HEAP32[(($137)>>2)];
 var $139=(($138+1)|0);
 var $140=HEAP8[($139)];
 var $141=(($140<<24)>>24);
 var $142=($141|0)==77;
 if($142){label=27;break;}else{label=28;break;}
 case 27:
 var $144=$str;
 _v_eqm($144,0);
 label=29;break;
 case 28:
 var $146=$str;
 _v_set($146,0);
 label=29;break;
 case 29:
 label=46;break;
 case 30:
 var $149=$str;
 var $150=_strtol($149,0,10);
 HEAP32[((67248)>>2)]=$150;
 var $151=HEAP32[((67248)>>2)];
 var $152=($151|0)<1;
 if($152){label=32;break;}else{label=31;break;}
 case 31:
 var $154=HEAP32[((67248)>>2)];
 var $155=($154|0)>=4;
 if($155){label=32;break;}else{label=33;break;}
 case 32:
 _panic(10856);
 label=33;break;
 case 33:
 label=46;break;
 case 34:
 var $159=$str;
 HEAP32[((67240)>>2)]=$159;
 label=35;break;
 case 35:
 var $161=$str;
 var $162=HEAP8[($161)];
 var $163=(($162<<24)>>24);
 var $164=($163|0)==0;
 if($164){label=36;break;}else{label=37;break;}
 case 36:
 _panic(10760);
 label=37;break;
 case 37:
 label=46;break;
 case 38:
 HEAP8[(1091616)]=1;
 label=39;break;
 case 39:
 var $169=$str;
 HEAP32[((1091600)>>2)]=$169;
 label=35;break;
 case 40:
 $bDoAllPasses=1;
 label=41;break;
 case 41:
 var $172=$str;
 var $173=_strtol($172,0,10);
 HEAP32[((440)>>2)]=$173;
 label=46;break;
 case 42:
 var $175=$str;
 HEAP32[((1091584)>>2)]=$175;
 label=35;break;
 case 43:
 var $177=$str;
 var $178=_strtol($177,0,10);
 var $179=(($178)&255);
 HEAP8[(1091576)]=$179;
 label=46;break;
 case 44:
 var $181=$str;
 _v_incdir($181,0);
 label=46;break;
 case 45:
 label=3;break;
 case 46:
 label=48;break;
 case 47:
 label=3;break;
 case 48:
 var $186=$i;
 var $187=((($186)+(1))|0);
 $i=$187;
 label=5;break;
 case 49:
 var $189=_permalloc(32);
 var $190=$189;
 $seg=$190;
 var $191=_permalloc(21);
 var $192=_strcpy($191,10712);
 var $193=$seg;
 var $194=(($193+4)|0);
 HEAP32[(($194)>>2)]=$192;
 var $195=$seg;
 var $196=(($195+29)|0);
 HEAP8[($196)]=1;
 var $197=$seg;
 var $198=(($197+28)|0);
 HEAP8[($198)]=1;
 var $199=$seg;
 var $200=(($199+9)|0);
 HEAP8[($200)]=1;
 var $201=$seg;
 var $202=(($201+8)|0);
 HEAP8[($202)]=1;
 var $203=$seg;
 HEAP32[((1082680)>>2)]=$203;
 HEAP32[((1091648)>>2)]=$203;
 var $204=_zmalloc(12);
 var $205=$204;
 $ifs=$205;
 var $206=$ifs;
 var $207=(($206+4)|0);
 HEAP32[(($207)>>2)]=0;
 var $208=$ifs;
 var $209=(($208+8)|0);
 HEAP8[($209)]=4;
 var $210=$ifs;
 var $211=(($210+10)|0);
 HEAP8[($211)]=1;
 var $212=$ifs;
 var $213=(($212+9)|0);
 HEAP8[($213)]=1;
 var $214=$ifs;
 HEAP32[((1091296)>>2)]=$214;
 HEAP8[(80656)]=0;
 HEAP8[(70616)]=0;
 label=50;break;
 case 50:
 var $216=HEAP8[(1091576)];
 var $217=(($216<<24)>>24)!=0;
 if($217){label=51;break;}else{label=52;break;}
 case 51:
 var $219=_puts(1082184);
 var $220=HEAP32[((68464)>>2)];
 var $221=_printf(10648,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$220,tempVarArgs)); STACKTOP=tempVarArgs;
 label=52;break;
 case 52:
 HEAP32[((1091272)>>2)]=0;
 HEAP32[((1091248)>>2)]=0;
 HEAP32[((1091280)>>2)]=0;
 HEAP32[((1091256)>>2)]=0;
 var $223=HEAP32[((67240)>>2)];
 var $224=_fopen($223,10624);
 HEAP32[((1091624)>>2)]=$224;
 HEAP8[(1091568)]=1;
 HEAP32[((1091656)>>2)]=0;
 var $225=HEAP32[((1091624)>>2)];
 var $226=($225|0)==0;
 if($226){label=53;break;}else{label=54;break;}
 case 53:
 var $228=HEAP32[((67240)>>2)];
 var $229=_printf(10552,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$228,tempVarArgs)); STACKTOP=tempVarArgs;
 $1=2;
 label=130;break;
 case 54:
 var $231=HEAP32[((1091600)>>2)];
 var $232=($231|0)!=0;
 if($232){label=55;break;}else{label=60;break;}
 case 55:
 var $234=HEAP32[((1091600)>>2)];
 var $235=HEAP8[(1091616)];
 var $236=($235&255);
 var $237=($236|0)!=0;
 if($237){label=56;break;}else{var $242=0;label=57;break;}
 case 56:
 var $239=HEAP32[((68464)>>2)];
 var $240=($239|0)>1;
 var $242=$240;label=57;break;
 case 57:
 var $242;
 var $243=($242?10520:3384);
 var $244=_fopen($234,$243);
 HEAP32[((1091632)>>2)]=$244;
 var $245=HEAP32[((1091632)>>2)];
 var $246=($245|0)==0;
 if($246){label=58;break;}else{label=59;break;}
 case 58:
 var $248=HEAP32[((1091600)>>2)];
 var $249=_printf(10552,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$248,tempVarArgs)); STACKTOP=tempVarArgs;
 $1=2;
 label=130;break;
 case 59:
 label=60;break;
 case 60:
 var $252=$3;
 var $253=(($252+4)|0);
 var $254=HEAP32[(($253)>>2)];
 _pushinclude($254);
 label=61;break;
 case 61:
 var $256=HEAP32[((68472)>>2)];
 var $257=($256|0)!=0;
 if($257){label=62;break;}else{label=105;break;}
 case 62:
 label=63;break;
 case 63:
 var $260=HEAP32[((68472)>>2)];
 var $261=(($260+16)|0);
 var $262=HEAP8[($261)];
 var $263=($262&255);
 var $264=$263&1;
 var $265=($264|0)!=0;
 if($265){label=64;break;}else{label=67;break;}
 case 64:
 var $267=HEAP32[((68472)>>2)];
 var $268=(($267+24)|0);
 var $269=HEAP32[(($268)>>2)];
 var $270=($269|0)==0;
 if($270){label=65;break;}else{label=66;break;}
 case 65:
 tempBigInt=1082184;HEAP8[(1092176)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092177)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092178)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[(1092179)]=tempBigInt&0xff;
 _v_mexit(0,0);
 label=63;break;
 case 66:
 var $273=(($buf)|0);
 var $274=HEAP32[((68472)>>2)];
 var $275=(($274+24)|0);
 var $276=HEAP32[(($275)>>2)];
 var $277=(($276+4)|0);
 var $278=(($277)|0);
 var $279=_strcpy($273,$278);
 var $280=HEAP32[((68472)>>2)];
 var $281=(($280+24)|0);
 var $282=HEAP32[(($281)>>2)];
 var $283=(($282)|0);
 var $284=HEAP32[(($283)>>2)];
 var $285=HEAP32[((68472)>>2)];
 var $286=(($285+24)|0);
 HEAP32[(($286)>>2)]=$284;
 label=70;break;
 case 67:
 var $288=(($buf)|0);
 var $289=HEAP32[((68472)>>2)];
 var $290=(($289+8)|0);
 var $291=HEAP32[(($290)>>2)];
 var $292=_fgets($288,1024,$291);
 var $293=($292|0)==0;
 if($293){label=68;break;}else{label=69;break;}
 case 68:
 label=92;break;
 case 69:
 label=70;break;
 case 70:
 var $297=HEAP8[(1082664)];
 var $298=(($297)&1);
 if($298){label=71;break;}else{label=72;break;}
 case 71:
 var $300=HEAP32[((68472)>>2)];
 var $301=$300;
 var $302=(($buf)|0);
 var $303=_printf(4568,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$301,HEAP32[(((tempVarArgs)+(8))>>2)]=$302,tempVarArgs)); STACKTOP=tempVarArgs;
 label=72;break;
 case 72:
 var $305=(($buf)|0);
 var $306=_cleanup($305,0);
 $comment=$306;
 var $307=HEAP32[((68472)>>2)];
 var $308=(($307+12)|0);
 var $309=HEAP32[(($308)>>2)];
 var $310=((($309)+(1))|0);
 HEAP32[(($308)>>2)]=$310;
 var $311=(($buf)|0);
 var $312=_parse($311);
 $mne=$312;
 var $313=((((HEAPU8[(1092180)])|(HEAPU8[(1092181)]<<8)|(HEAPU8[(1092182)]<<16)|(HEAPU8[(1092183)]<<24))|0));
 var $314=(($313)|0);
 var $315=HEAP8[($314)];
 var $316=(($315<<24)>>24)!=0;
 if($316){label=73;break;}else{label=84;break;}
 case 73:
 var $318=$mne;
 var $319=($318|0)!=0;
 if($319){label=74;break;}else{label=79;break;}
 case 74:
 var $321=$mne;
 var $322=(($321+12)|0);
 var $323=HEAP8[($322)];
 var $324=($323&255);
 var $325=$324&4;
 var $326=($325|0)!=0;
 if($326){label=77;break;}else{label=75;break;}
 case 75:
 var $328=HEAP32[((1091296)>>2)];
 var $329=(($328+9)|0);
 var $330=HEAP8[($329)];
 var $331=($330&255);
 var $332=($331|0)!=0;
 if($332){label=76;break;}else{label=78;break;}
 case 76:
 var $334=HEAP32[((1091296)>>2)];
 var $335=(($334+10)|0);
 var $336=HEAP8[($335)];
 var $337=($336&255);
 var $338=($337|0)!=0;
 if($338){label=77;break;}else{label=78;break;}
 case 77:
 var $340=$mne;
 var $341=(($340+4)|0);
 var $342=HEAP32[(($341)>>2)];
 var $343=((((HEAPU8[(1092184)])|(HEAPU8[(1092185)]<<8)|(HEAPU8[(1092186)]<<16)|(HEAPU8[(1092187)]<<24))|0));
 var $344=$mne;
 FUNCTION_TABLE[$342]($343,$344);
 label=78;break;
 case 78:
 label=83;break;
 case 79:
 var $347=HEAP32[((1091296)>>2)];
 var $348=(($347+9)|0);
 var $349=HEAP8[($348)];
 var $350=($349&255);
 var $351=($350|0)!=0;
 if($351){label=80;break;}else{label=82;break;}
 case 80:
 var $353=HEAP32[((1091296)>>2)];
 var $354=(($353+10)|0);
 var $355=HEAP8[($354)];
 var $356=($355&255);
 var $357=($356|0)!=0;
 if($357){label=81;break;}else{label=82;break;}
 case 81:
 var $359=((((HEAPU8[(1092180)])|(HEAPU8[(1092181)]<<8)|(HEAPU8[(1092182)]<<16)|(HEAPU8[(1092183)]<<24))|0));
 var $360=_asmerr(9,0,$359);
 label=82;break;
 case 82:
 label=83;break;
 case 83:
 label=88;break;
 case 84:
 var $364=HEAP32[((1091296)>>2)];
 var $365=(($364+9)|0);
 var $366=HEAP8[($365)];
 var $367=($366&255);
 var $368=($367|0)!=0;
 if($368){label=85;break;}else{label=87;break;}
 case 85:
 var $370=HEAP32[((1091296)>>2)];
 var $371=(($370+10)|0);
 var $372=HEAP8[($371)];
 var $373=($372&255);
 var $374=($373|0)!=0;
 if($374){label=86;break;}else{label=87;break;}
 case 86:
 _programlabel();
 label=87;break;
 case 87:
 label=88;break;
 case 88:
 var $378=HEAP32[((1091600)>>2)];
 var $379=($378|0)!=0;
 if($379){label=89;break;}else{label=91;break;}
 case 89:
 var $381=HEAP8[(67232)];
 var $382=(($381<<24)>>24);
 var $383=($382|0)!=0;
 if($383){label=90;break;}else{label=91;break;}
 case 90:
 var $385=$comment;
 _outlistfile($385);
 label=91;break;
 case 91:
 label=63;break;
 case 92:
 label=93;break;
 case 93:
 var $389=HEAP32[((1086800)>>2)];
 var $390=($389|0)!=0;
 if($390){label=94;break;}else{var $398=0;label=95;break;}
 case 94:
 var $392=HEAP32[((1086800)>>2)];
 var $393=(($392+16)|0);
 var $394=HEAP32[(($393)>>2)];
 var $395=HEAP32[((68472)>>2)];
 var $396=($394|0)==($395|0);
 var $398=$396;label=95;break;
 case 95:
 var $398;
 if($398){label=96;break;}else{label=97;break;}
 case 96:
 _rmnode(1086800,24);
 label=93;break;
 case 97:
 label=98;break;
 case 98:
 var $402=HEAP32[((1091296)>>2)];
 var $403=(($402+4)|0);
 var $404=HEAP32[(($403)>>2)];
 var $405=HEAP32[((68472)>>2)];
 var $406=($404|0)==($405|0);
 if($406){label=99;break;}else{label=100;break;}
 case 99:
 _rmnode(1091296,12);
 label=98;break;
 case 100:
 var $409=HEAP32[((68472)>>2)];
 var $410=(($409+8)|0);
 var $411=HEAP32[(($410)>>2)];
 var $412=_fclose($411);
 var $413=HEAP32[((68472)>>2)];
 var $414=(($413+4)|0);
 var $415=HEAP32[(($414)>>2)];
 _free($415);
 var $416=HEAP8[(1091288)];
 var $417=((($416)-(1))&255);
 HEAP8[(1091288)]=$417;
 _rmnode(68472,36);
 var $418=HEAP32[((68472)>>2)];
 var $419=($418|0)!=0;
 if($419){label=101;break;}else{label=104;break;}
 case 101:
 var $421=HEAP32[((1091600)>>2)];
 var $422=($421|0)!=0;
 if($422){label=102;break;}else{label=103;break;}
 case 102:
 var $424=HEAP32[((1091632)>>2)];
 var $425=HEAP32[((68472)>>2)];
 var $426=(($425+4)|0);
 var $427=HEAP32[(($426)>>2)];
 var $428=_fprintf($424,10480,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$427,tempVarArgs)); STACKTOP=tempVarArgs;
 label=103;break;
 case 103:
 label=104;break;
 case 104:
 label=61;break;
 case 105:
 var $432=HEAP8[(1091576)];
 var $433=($432&255);
 var $434=($433|0)>=1;
 if($434){label=106;break;}else{label=107;break;}
 case 106:
 _ShowSegments();
 label=107;break;
 case 107:
 var $437=HEAP8[(1091576)];
 var $438=($437&255);
 var $439=($438|0)>=3;
 if($439){label=108;break;}else{label=112;break;}
 case 108:
 var $441=HEAP32[((1086832)>>2)];
 var $442=($441|0)!=0;
 if($442){label=109;break;}else{label=110;break;}
 case 109:
 var $444=HEAP8[(1091576)];
 var $445=($444&255);
 var $446=($445|0)==4;
 if($446){label=110;break;}else{label=111;break;}
 case 110:
 var $448=HEAP32[((_stdout)>>2)];
 var $449=$4;
 var $450=HEAP8[($449)];
 var $451=(($450)&1);
 _ShowSymbols($448,$451);
 label=111;break;
 case 111:
 var $453=_ShowUnresolvedSymbols();
 label=112;break;
 case 112:
 _closegenerate();
 var $455=HEAP32[((1091624)>>2)];
 var $456=_fclose($455);
 var $457=HEAP32[((1091632)>>2)];
 var $458=($457|0)!=0;
 if($458){label=113;break;}else{label=114;break;}
 case 113:
 var $460=HEAP32[((1091632)>>2)];
 var $461=_fclose($460);
 label=114;break;
 case 114:
 var $463=HEAP32[((1086832)>>2)];
 var $464=($463|0)!=0;
 if($464){label=115;break;}else{label=127;break;}
 case 115:
 var $466=$bDoAllPasses;
 var $467=(($466)&1);
 if($467){label=121;break;}else{label=116;break;}
 case 116:
 var $469=HEAP32[((1086832)>>2)];
 var $470=$oldredo;
 var $471=($469|0)==($470|0);
 if($471){label=117;break;}else{label=120;break;}
 case 117:
 var $473=HEAP32[((1086808)>>2)];
 var $474=$oldwhy;
 var $475=($473|0)==($474|0);
 if($475){label=118;break;}else{label=120;break;}
 case 118:
 var $477=HEAP32[((1086824)>>2)];
 var $478=$oldeval;
 var $479=($477|0)==($478|0);
 if($479){label=119;break;}else{label=120;break;}
 case 119:
 var $481=_ShowUnresolvedSymbols();
 $1=3;
 label=130;break;
 case 120:
 label=121;break;
 case 121:
 var $484=HEAP32[((1086832)>>2)];
 $oldredo=$484;
 var $485=HEAP32[((1086808)>>2)];
 $oldwhy=$485;
 var $486=HEAP32[((1086824)>>2)];
 $oldeval=$486;
 HEAP32[((1086832)>>2)]=0;
 HEAP32[((1086808)>>2)]=0;
 HEAP32[((1086824)>>2)]=0;
 var $487=HEAP32[((1086816)>>2)];
 var $488=$487<<1;
 HEAP32[((1086816)>>2)]=$488;
 var $489=HEAP32[((68464)>>2)];
 var $490=((($489)+(1))|0);
 HEAP32[((68464)>>2)]=$490;
 var $491=HEAP8[(1082176)];
 var $492=(($491)&1);
 if($492){label=122;break;}else{label=123;break;}
 case 122:
 var $494=_printf(3760,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=80656,tempVarArgs)); STACKTOP=tempVarArgs;
 var $495=_printf(10400,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=126;break;
 case 123:
 var $497=HEAP32[((68464)>>2)];
 var $498=HEAP32[((440)>>2)];
 var $499=($497|0)>($498|0);
 if($499){label=124;break;}else{label=125;break;}
 case 124:
 var $501=(($sBuffer)|0);
 var $502=HEAP32[((68464)>>2)];
 var $503=_sprintf($501,10336,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$502,tempVarArgs)); STACKTOP=tempVarArgs;
 var $504=(($sBuffer)|0);
 var $505=_asmerr(4,0,$504);
 $1=$505;
 label=130;break;
 case 125:
 HEAP8[(80656)]=0;
 HEAP8[(70616)]=0;
 _clearrefs();
 _clearsegs();
 label=50;break;
 case 126:
 label=127;break;
 case 127:
 var $509=HEAP8[(1082176)];
 var $510=(($509)&1);
 if($510){label=129;break;}else{label=128;break;}
 case 128:
 HEAP8[(70616)]=32;
 var $512=_printf(3760,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=70616,tempVarArgs)); STACKTOP=tempVarArgs;
 label=129;break;
 case 129:
 var $514=_printf(10304,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $515=$nError;
 $1=$515;
 label=130;break;
 case 130:
 var $517=$1;
 STACKTOP=sp;return $517;
  default: assert(0, "bad label: " + label);
 }

}


function _DumpSymbolTable($bTableSort){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $fi;
 var $2=($bTableSort&1);
 $1=$2;
 var $3=HEAP32[((1091584)>>2)];
 var $4=($3|0)!=0;
 if($4){label=2;break;}else{label=6;break;}
 case 2:
 var $6=HEAP32[((1091584)>>2)];
 var $7=_fopen($6,3384);
 $fi=$7;
 var $8=$fi;
 var $9=($8|0)!=0;
 if($9){label=3;break;}else{label=4;break;}
 case 3:
 var $11=$fi;
 var $12=$1;
 var $13=(($12)&1);
 _ShowSymbols($11,$13);
 var $14=$fi;
 var $15=_fclose($14);
 label=5;break;
 case 4:
 var $17=HEAP32[((1091584)>>2)];
 var $18=_printf(3296,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$17,tempVarArgs)); STACKTOP=tempVarArgs;
 label=5;break;
 case 5:
 label=6;break;
 case 6:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _ShowSymbols($file,$bTableSort){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $symArray;
 var $sym;
 var $i;
 var $nSymbols;
 var $nPtr;
 $1=$file;
 var $3=($bTableSort&1);
 $2=$3;
 $nSymbols=0;
 var $4=$1;
 var $5=_fprintf($4,3224,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 $i=0;
 label=2;break;
 case 2:
 var $7=$i;
 var $8=($7|0)<1024;
 if($8){label=3;break;}else{label=9;break;}
 case 3:
 var $10=$i;
 var $11=((1082704+($10<<2))|0);
 var $12=((((HEAPU8[($11)])|(HEAPU8[((($11)+(1))|0)]<<8)|(HEAPU8[((($11)+(2))|0)]<<16)|(HEAPU8[((($11)+(3))|0)]<<24))|0));
 $sym=$12;
 label=4;break;
 case 4:
 var $14=$sym;
 var $15=($14|0)!=0;
 if($15){label=5;break;}else{label=7;break;}
 case 5:
 var $17=$nSymbols;
 var $18=((($17)+(1))|0);
 $nSymbols=$18;
 label=6;break;
 case 6:
 var $20=$sym;
 var $21=(($20)|0);
 var $22=HEAP32[(($21)>>2)];
 $sym=$22;
 label=4;break;
 case 7:
 label=8;break;
 case 8:
 var $25=$i;
 var $26=((($25)+(1))|0);
 $i=$26;
 label=2;break;
 case 9:
 var $28=$nSymbols;
 var $29=($28<<2);
 var $30=_ckmalloc($29);
 var $31=$30;
 $symArray=$31;
 var $32=$symArray;
 var $33=($32|0)!=0;
 if($33){label=19;break;}else{label=10;break;}
 case 10:
 var $35=$1;
 var $36=_fprintf($35,3120,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 $i=0;
 label=11;break;
 case 11:
 var $38=$i;
 var $39=($38|0)<1024;
 if($39){label=12;break;}else{label=18;break;}
 case 12:
 var $41=$i;
 var $42=((1082704+($41<<2))|0);
 var $43=((((HEAPU8[($42)])|(HEAPU8[((($42)+(1))|0)]<<8)|(HEAPU8[((($42)+(2))|0)]<<16)|(HEAPU8[((($42)+(3))|0)]<<24))|0));
 $sym=$43;
 label=13;break;
 case 13:
 var $45=$sym;
 var $46=($45|0)!=0;
 if($46){label=14;break;}else{label=16;break;}
 case 14:
 var $48=$1;
 var $49=$sym;
 var $50=(($49+4)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=$sym;
 var $53=(($52+16)|0);
 var $54=HEAP32[(($53)>>2)];
 var $55=$sym;
 var $56=(($55+12)|0);
 var $57=HEAP8[($56)];
 var $58=($57&255);
 var $59=_sftos($54,$58);
 var $60=_fprintf($48,3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$51,HEAP32[(((tempVarArgs)+(8))>>2)]=$59,tempVarArgs)); STACKTOP=tempVarArgs;
 label=15;break;
 case 15:
 var $62=$sym;
 var $63=(($62)|0);
 var $64=HEAP32[(($63)>>2)];
 $sym=$64;
 label=13;break;
 case 16:
 label=17;break;
 case 17:
 var $67=$i;
 var $68=((($67)+(1))|0);
 $i=$68;
 label=11;break;
 case 18:
 label=37;break;
 case 19:
 $nPtr=0;
 $i=0;
 label=20;break;
 case 20:
 var $72=$i;
 var $73=($72|0)<1024;
 if($73){label=21;break;}else{label=27;break;}
 case 21:
 var $75=$i;
 var $76=((1082704+($75<<2))|0);
 var $77=((((HEAPU8[($76)])|(HEAPU8[((($76)+(1))|0)]<<8)|(HEAPU8[((($76)+(2))|0)]<<16)|(HEAPU8[((($76)+(3))|0)]<<24))|0));
 $sym=$77;
 label=22;break;
 case 22:
 var $79=$sym;
 var $80=($79|0)!=0;
 if($80){label=23;break;}else{label=25;break;}
 case 23:
 var $82=$sym;
 var $83=$nPtr;
 var $84=((($83)+(1))|0);
 $nPtr=$84;
 var $85=$symArray;
 var $86=(($85+($83<<2))|0);
 HEAP32[(($86)>>2)]=$82;
 label=24;break;
 case 24:
 var $88=$sym;
 var $89=(($88)|0);
 var $90=HEAP32[(($89)>>2)];
 $sym=$90;
 label=22;break;
 case 25:
 label=26;break;
 case 26:
 var $93=$i;
 var $94=((($93)+(1))|0);
 $i=$94;
 label=20;break;
 case 27:
 var $96=$2;
 var $97=(($96)&1);
 if($97){label=28;break;}else{label=29;break;}
 case 28:
 var $99=$1;
 var $100=_fprintf($99,2992,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $101=$symArray;
 var $102=$101;
 var $103=$nPtr;
 _qsort($102,$103,4,50);
 label=30;break;
 case 29:
 var $105=$1;
 var $106=_fprintf($105,2904,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $107=$symArray;
 var $108=$107;
 var $109=$nPtr;
 _qsort($108,$109,4,120);
 label=30;break;
 case 30:
 $i=0;
 label=31;break;
 case 31:
 var $112=$i;
 var $113=$nPtr;
 var $114=($112|0)<($113|0);
 if($114){label=32;break;}else{label=36;break;}
 case 32:
 var $116=$1;
 var $117=$i;
 var $118=$symArray;
 var $119=(($118+($117<<2))|0);
 var $120=HEAP32[(($119)>>2)];
 var $121=(($120+4)|0);
 var $122=HEAP32[(($121)>>2)];
 var $123=$i;
 var $124=$symArray;
 var $125=(($124+($123<<2))|0);
 var $126=HEAP32[(($125)>>2)];
 var $127=(($126+16)|0);
 var $128=HEAP32[(($127)>>2)];
 var $129=$i;
 var $130=$symArray;
 var $131=(($130+($129<<2))|0);
 var $132=HEAP32[(($131)>>2)];
 var $133=(($132+12)|0);
 var $134=HEAP8[($133)];
 var $135=($134&255);
 var $136=_sftos($128,$135);
 var $137=_fprintf($116,2848,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$122,HEAP32[(((tempVarArgs)+(8))>>2)]=$136,tempVarArgs)); STACKTOP=tempVarArgs;
 var $138=$i;
 var $139=$symArray;
 var $140=(($139+($138<<2))|0);
 var $141=HEAP32[(($140)>>2)];
 var $142=(($141+12)|0);
 var $143=HEAP8[($142)];
 var $144=($143&255);
 var $145=$144&8;
 var $146=($145|0)!=0;
 if($146){label=33;break;}else{label=34;break;}
 case 33:
 var $148=$1;
 var $149=$i;
 var $150=$symArray;
 var $151=(($150+($149<<2))|0);
 var $152=HEAP32[(($151)>>2)];
 var $153=(($152+8)|0);
 var $154=HEAP32[(($153)>>2)];
 var $155=_fprintf($148,2792,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$154,tempVarArgs)); STACKTOP=tempVarArgs;
 label=34;break;
 case 34:
 var $157=$1;
 var $158=_fprintf($157,3816,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=35;break;
 case 35:
 var $160=$i;
 var $161=((($160)+(1))|0);
 $i=$161;
 label=31;break;
 case 36:
 var $163=$symArray;
 var $164=$163;
 _free($164);
 label=37;break;
 case 37:
 var $166=$1;
 var $167=_fputs(2712,$166);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _CompareAddress($arg1,$arg2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $sym1;
 var $sym2;
 $1=$arg1;
 $2=$arg2;
 var $3=$1;
 var $4=$3;
 var $5=HEAP32[(($4)>>2)];
 $sym1=$5;
 var $6=$2;
 var $7=$6;
 var $8=HEAP32[(($7)>>2)];
 $sym2=$8;
 var $9=$sym1;
 var $10=(($9+16)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=$sym2;
 var $13=(($12+16)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=((($11)-($14))|0);
 STACKTOP=sp;return $15;
}


function _CompareAlpha($arg1,$arg2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $sym1;
 var $sym2;
 $1=$arg1;
 $2=$arg2;
 var $3=$1;
 var $4=$3;
 var $5=HEAP32[(($4)>>2)];
 $sym1=$5;
 var $6=$2;
 var $7=$6;
 var $8=HEAP32[(($7)>>2)];
 $sym2=$8;
 var $9=$sym1;
 var $10=(($9+4)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=$sym2;
 var $13=(($12+4)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=_strcasecmp($11,$14);
 STACKTOP=sp;return $15;
}


function _ShowSegments(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $seg;
 var $bss;
 var $sFormat;
 $sFormat=10096;
 var $1=_printf(10000,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $2=$sFormat;
 var $3=_printf($2,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=9944,HEAP32[(((tempVarArgs)+(8))>>2)]=1082184,HEAP32[(((tempVarArgs)+(16))>>2)]=9912,HEAP32[(((tempVarArgs)+(24))>>2)]=9880,HEAP32[(((tempVarArgs)+(32))>>2)]=9840,HEAP32[(((tempVarArgs)+(40))>>2)]=9768,tempVarArgs)); STACKTOP=tempVarArgs;
 var $4=HEAP32[((1082680)>>2)];
 $seg=$4;
 label=2;break;
 case 2:
 var $6=$seg;
 var $7=($6|0)!=0;
 if($7){label=3;break;}else{label=5;break;}
 case 3:
 var $9=$seg;
 var $10=(($9+8)|0);
 var $11=HEAP8[($10)];
 var $12=($11&255);
 var $13=$12&16;
 var $14=($13|0)!=0;
 var $15=($14?9744:9696);
 $bss=$15;
 var $16=$sFormat;
 var $17=$seg;
 var $18=(($17+4)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$bss;
 var $21=$seg;
 var $22=(($21+20)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=$seg;
 var $25=(($24+28)|0);
 var $26=HEAP8[($25)];
 var $27=($26&255);
 var $28=_sftos($23,$27);
 var $29=$seg;
 var $30=(($29+24)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=$seg;
 var $33=(($32+29)|0);
 var $34=HEAP8[($33)];
 var $35=($34&255);
 var $36=_sftos($31,$35);
 var $37=$seg;
 var $38=(($37+12)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=$seg;
 var $41=(($40+8)|0);
 var $42=HEAP8[($41)];
 var $43=($42&255);
 var $44=_sftos($39,$43);
 var $45=$seg;
 var $46=(($45+16)|0);
 var $47=HEAP32[(($46)>>2)];
 var $48=$seg;
 var $49=(($48+9)|0);
 var $50=HEAP8[($49)];
 var $51=($50&255);
 var $52=_sftos($47,$51);
 var $53=_printf($16,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$19,HEAP32[(((tempVarArgs)+(8))>>2)]=$20,HEAP32[(((tempVarArgs)+(16))>>2)]=$28,HEAP32[(((tempVarArgs)+(24))>>2)]=$36,HEAP32[(((tempVarArgs)+(32))>>2)]=$44,HEAP32[(((tempVarArgs)+(40))>>2)]=$52,tempVarArgs)); STACKTOP=tempVarArgs;
 label=4;break;
 case 4:
 var $55=$seg;
 var $56=(($55)|0);
 var $57=HEAP32[(($56)>>2)];
 $seg=$57;
 label=2;break;
 case 5:
 var $59=_puts(9600);
 var $60=HEAP32[((1086824)>>2)];
 var $61=_printf(9504,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$60,tempVarArgs)); STACKTOP=tempVarArgs;
 var $62=HEAP32[((1086832)>>2)];
 var $63=_printf(9432,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$62,tempVarArgs)); STACKTOP=tempVarArgs;
 var $64=HEAP32[((1086808)>>2)];
 var $65=($64|0)!=0;
 if($65){label=6;break;}else{label=39;break;}
 case 6:
 var $67=HEAP32[((1086808)>>2)];
 var $68=$67&1;
 var $69=($68|0)!=0;
 if($69){label=7;break;}else{label=8;break;}
 case 7:
 var $71=_printf(9352,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=8;break;
 case 8:
 var $73=HEAP32[((1086808)>>2)];
 var $74=$73&2;
 var $75=($74|0)!=0;
 if($75){label=9;break;}else{label=10;break;}
 case 9:
 var $77=_printf(9280,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=10;break;
 case 10:
 var $79=HEAP32[((1086808)>>2)];
 var $80=$79&4;
 var $81=($80|0)!=0;
 if($81){label=11;break;}else{label=12;break;}
 case 11:
 var $83=_printf(9224,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=12;break;
 case 12:
 var $85=HEAP32[((1086808)>>2)];
 var $86=$85&8;
 var $87=($86|0)!=0;
 if($87){label=13;break;}else{label=14;break;}
 case 13:
 var $89=_printf(9128,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=14;break;
 case 14:
 var $91=HEAP32[((1086808)>>2)];
 var $92=$91&16;
 var $93=($92|0)!=0;
 if($93){label=15;break;}else{label=16;break;}
 case 15:
 var $95=_printf(9024,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=16;break;
 case 16:
 var $97=HEAP32[((1086808)>>2)];
 var $98=$97&32;
 var $99=($98|0)!=0;
 if($99){label=17;break;}else{label=18;break;}
 case 17:
 var $101=_printf(8976,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=18;break;
 case 18:
 var $103=HEAP32[((1086808)>>2)];
 var $104=$103&64;
 var $105=($104|0)!=0;
 if($105){label=19;break;}else{label=20;break;}
 case 19:
 var $107=_printf(8912,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=20;break;
 case 20:
 var $109=HEAP32[((1086808)>>2)];
 var $110=$109&128;
 var $111=($110|0)!=0;
 if($111){label=21;break;}else{label=22;break;}
 case 21:
 var $113=_printf(8824,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=22;break;
 case 22:
 var $115=HEAP32[((1086808)>>2)];
 var $116=$115&256;
 var $117=($116|0)!=0;
 if($117){label=23;break;}else{label=24;break;}
 case 23:
 var $119=_printf(8712,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=24;break;
 case 24:
 var $121=HEAP32[((1086808)>>2)];
 var $122=$121&512;
 var $123=($122|0)!=0;
 if($123){label=25;break;}else{label=26;break;}
 case 25:
 var $125=_printf(8664,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=26;break;
 case 26:
 var $127=HEAP32[((1086808)>>2)];
 var $128=$127&1024;
 var $129=($128|0)!=0;
 if($129){label=27;break;}else{label=28;break;}
 case 27:
 var $131=_printf(8560,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=28;break;
 case 28:
 var $133=HEAP32[((1086808)>>2)];
 var $134=$133&2048;
 var $135=($134|0)!=0;
 if($135){label=29;break;}else{label=30;break;}
 case 29:
 var $137=_printf(8496,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=30;break;
 case 30:
 var $139=HEAP32[((1086808)>>2)];
 var $140=$139&4096;
 var $141=($140|0)!=0;
 if($141){label=31;break;}else{label=32;break;}
 case 31:
 var $143=_printf(8448,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=32;break;
 case 32:
 var $145=HEAP32[((1086808)>>2)];
 var $146=$145&8192;
 var $147=($146|0)!=0;
 if($147){label=33;break;}else{label=34;break;}
 case 33:
 var $149=_printf(8360,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=34;break;
 case 34:
 var $151=HEAP32[((1086808)>>2)];
 var $152=$151&16384;
 var $153=($152|0)!=0;
 if($153){label=35;break;}else{label=36;break;}
 case 35:
 var $155=_printf(8248,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=36;break;
 case 36:
 var $157=HEAP32[((1086808)>>2)];
 var $158=$157&32768;
 var $159=($158|0)!=0;
 if($159){label=37;break;}else{label=38;break;}
 case 37:
 var $161=_printf(8208,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 label=38;break;
 case 38:
 label=39;break;
 case 39:
 var $164=_printf(3816,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _ShowUnresolvedSymbols(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $sym;
 var $i;
 var $nUnresolved;
 var $1=_CountUnresolvedSymbols();
 $nUnresolved=$1;
 var $2=$nUnresolved;
 var $3=($2|0)!=0;
 if($3){label=2;break;}else{label=13;break;}
 case 2:
 var $5=_printf(10248,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 $i=0;
 label=3;break;
 case 3:
 var $7=$i;
 var $8=($7|0)<1024;
 if($8){label=4;break;}else{label=12;break;}
 case 4:
 var $10=$i;
 var $11=((1082704+($10<<2))|0);
 var $12=((((HEAPU8[($11)])|(HEAPU8[((($11)+(1))|0)]<<8)|(HEAPU8[((($11)+(2))|0)]<<16)|(HEAPU8[((($11)+(3))|0)]<<24))|0));
 $sym=$12;
 label=5;break;
 case 5:
 var $14=$sym;
 var $15=($14|0)!=0;
 if($15){label=6;break;}else{label=10;break;}
 case 6:
 var $17=$sym;
 var $18=(($17+12)|0);
 var $19=HEAP8[($18)];
 var $20=($19&255);
 var $21=$20&1;
 var $22=($21|0)!=0;
 if($22){label=7;break;}else{label=8;break;}
 case 7:
 var $24=$sym;
 var $25=(($24+4)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=$sym;
 var $28=(($27+16)|0);
 var $29=HEAP32[(($28)>>2)];
 var $30=$sym;
 var $31=(($30+12)|0);
 var $32=HEAP8[($31)];
 var $33=($32&255);
 var $34=_sftos($29,$33);
 var $35=_printf(3064,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$26,HEAP32[(((tempVarArgs)+(8))>>2)]=$34,tempVarArgs)); STACKTOP=tempVarArgs;
 label=8;break;
 case 8:
 label=9;break;
 case 9:
 var $38=$sym;
 var $39=(($38)|0);
 var $40=HEAP32[(($39)>>2)];
 $sym=$40;
 label=5;break;
 case 10:
 label=11;break;
 case 11:
 var $43=$i;
 var $44=((($43)+(1))|0);
 $i=$44;
 label=3;break;
 case 12:
 var $46=$nUnresolved;
 var $47=$nUnresolved;
 var $48=($47|0)==1;
 var $49=($48?32:115);
 var $50=_printf(10192,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$46,HEAP32[(((tempVarArgs)+(8))>>2)]=$49,tempVarArgs)); STACKTOP=tempVarArgs;
 label=13;break;
 case 13:
 var $52=$nUnresolved;
 STACKTOP=sp;return $52;
  default: assert(0, "bad label: " + label);
 }

}


function _CountUnresolvedSymbols(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $sym;
 var $nUnresolved;
 var $i;
 $nUnresolved=0;
 $i=0;
 label=2;break;
 case 2:
 var $2=$i;
 var $3=($2|0)<1024;
 if($3){label=3;break;}else{label=11;break;}
 case 3:
 var $5=$i;
 var $6=((1082704+($5<<2))|0);
 var $7=((((HEAPU8[($6)])|(HEAPU8[((($6)+(1))|0)]<<8)|(HEAPU8[((($6)+(2))|0)]<<16)|(HEAPU8[((($6)+(3))|0)]<<24))|0));
 $sym=$7;
 label=4;break;
 case 4:
 var $9=$sym;
 var $10=($9|0)!=0;
 if($10){label=5;break;}else{label=9;break;}
 case 5:
 var $12=$sym;
 var $13=(($12+12)|0);
 var $14=HEAP8[($13)];
 var $15=($14&255);
 var $16=$15&1;
 var $17=($16|0)!=0;
 if($17){label=6;break;}else{label=7;break;}
 case 6:
 var $19=$nUnresolved;
 var $20=((($19)+(1))|0);
 $nUnresolved=$20;
 label=7;break;
 case 7:
 label=8;break;
 case 8:
 var $23=$sym;
 var $24=(($23)|0);
 var $25=HEAP32[(($24)>>2)];
 $sym=$25;
 label=4;break;
 case 9:
 label=10;break;
 case 10:
 var $28=$i;
 var $29=((($28)+(1))|0);
 $i=$29;
 label=2;break;
 case 11:
 var $31=$nUnresolved;
 STACKTOP=sp;return $31;
  default: assert(0, "bad label: " + label);
 }

}


function _tabit($buf1,$buf2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $bp;
 var $ptr;
 var $j;
 var $k;
 $1=$buf1;
 $2=$buf2;
 var $3=$2;
 $bp=$3;
 var $4=$1;
 $ptr=$4;
 $j=0;
 label=2;break;
 case 2:
 var $6=$ptr;
 var $7=HEAP8[($6)];
 var $8=(($7<<24)>>24);
 var $9=($8|0)!=0;
 if($9){label=3;break;}else{var $16=0;label=4;break;}
 case 3:
 var $11=$ptr;
 var $12=HEAP8[($11)];
 var $13=(($12<<24)>>24);
 var $14=($13|0)!=10;
 var $16=$14;label=4;break;
 case 4:
 var $16;
 if($16){label=5;break;}else{label=23;break;}
 case 5:
 var $18=$ptr;
 var $19=HEAP8[($18)];
 var $20=$bp;
 HEAP8[($20)]=$19;
 var $21=$ptr;
 var $22=HEAP8[($21)];
 var $23=(($22<<24)>>24);
 var $24=($23|0)==9;
 if($24){label=6;break;}else{label=12;break;}
 case 6:
 label=7;break;
 case 7:
 var $27=$j;
 var $28=($27|0)>0;
 if($28){label=8;break;}else{var $36=0;label=9;break;}
 case 8:
 var $30=$bp;
 var $31=((($30)-(1))|0);
 var $32=HEAP8[($31)];
 var $33=(($32<<24)>>24);
 var $34=($33|0)==32;
 var $36=$34;label=9;break;
 case 9:
 var $36;
 if($36){label=10;break;}else{label=11;break;}
 case 10:
 var $38=$bp;
 var $39=((($38)-(1))|0);
 $bp=$39;
 var $40=$j;
 var $41=((($40)-(1))|0);
 $j=$41;
 label=7;break;
 case 11:
 $j=0;
 var $43=$bp;
 HEAP8[($43)]=9;
 label=12;break;
 case 12:
 var $45=$j;
 var $46=($45|0)==7;
 if($46){label=13;break;}else{label=21;break;}
 case 13:
 var $48=$bp;
 var $49=HEAP8[($48)];
 var $50=(($49<<24)>>24);
 var $51=($50|0)==32;
 if($51){label=14;break;}else{label=21;break;}
 case 14:
 var $53=$bp;
 var $54=((($53)-(1))|0);
 var $55=HEAP8[($54)];
 var $56=(($55<<24)>>24);
 var $57=($56|0)==32;
 if($57){label=15;break;}else{label=21;break;}
 case 15:
 var $59=$j;
 $k=$59;
 label=16;break;
 case 16:
 var $61=$k;
 var $62=((($61)-(1))|0);
 $k=$62;
 var $63=($61|0)>=0;
 if($63){label=17;break;}else{var $70=0;label=18;break;}
 case 17:
 var $65=$bp;
 var $66=HEAP8[($65)];
 var $67=(($66<<24)>>24);
 var $68=($67|0)==32;
 var $70=$68;label=18;break;
 case 18:
 var $70;
 if($70){label=19;break;}else{label=20;break;}
 case 19:
 var $72=$bp;
 var $73=((($72)-(1))|0);
 $bp=$73;
 label=16;break;
 case 20:
 var $75=$bp;
 var $76=(($75+1)|0);
 $bp=$76;
 HEAP8[($76)]=9;
 label=21;break;
 case 21:
 label=22;break;
 case 22:
 var $79=$ptr;
 var $80=(($79+1)|0);
 $ptr=$80;
 var $81=$bp;
 var $82=(($81+1)|0);
 $bp=$82;
 var $83=$j;
 var $84=((($83)+(1))|0);
 var $85=$84&7;
 $j=$85;
 label=2;break;
 case 23:
 label=24;break;
 case 24:
 var $88=$bp;
 var $89=$2;
 var $90=($88|0)!=($89|0);
 if($90){label=25;break;}else{var $106=0;label=28;break;}
 case 25:
 var $92=$bp;
 var $93=((($92)-(1))|0);
 var $94=HEAP8[($93)];
 var $95=(($94<<24)>>24);
 var $96=($95|0)==32;
 if($96){var $104=1;label=27;break;}else{label=26;break;}
 case 26:
 var $98=$bp;
 var $99=((($98)-(1))|0);
 var $100=HEAP8[($99)];
 var $101=(($100<<24)>>24);
 var $102=($101|0)==9;
 var $104=$102;label=27;break;
 case 27:
 var $104;
 var $106=$104;label=28;break;
 case 28:
 var $106;
 if($106){label=29;break;}else{label=30;break;}
 case 29:
 var $108=$bp;
 var $109=((($108)-(1))|0);
 $bp=$109;
 label=24;break;
 case 30:
 var $111=$bp;
 var $112=(($111+1)|0);
 $bp=$112;
 HEAP8[($111)]=10;
 var $113=$bp;
 HEAP8[($113)]=0;
 var $114=$bp;
 var $115=$2;
 var $116=$114;
 var $117=$115;
 var $118=((($116)-($117))|0);
 STACKTOP=sp;return $118;
  default: assert(0, "bad label: " + label);
 }

}


function _v_processor($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $PreviousProcessor;
 $1=$str;
 $2=$dummy;
 var $3=HEAP32[((1086840)>>2)];
 $PreviousProcessor=$3;
 HEAP32[((1086840)>>2)]=0;
 var $4=$1;
 var $5=_strcmp($4,7720);
 var $6=($5|0)==0;
 if($6){label=2;break;}else{label=5;break;}
 case 2:
 var $8=HEAP8[(67328)];
 var $9=(($8)&1);
 if($9){label=4;break;}else{label=3;break;}
 case 3:
 _addhashtable(59328);
 label=4;break;
 case 4:
 HEAP8[(15016)]=0;
 HEAP32[((1086840)>>2)]=6502;
 label=5;break;
 case 5:
 var $13=$1;
 var $14=_strcmp($13,9976);
 var $15=($14|0)==0;
 if($15){label=6;break;}else{label=9;break;}
 case 6:
 var $17=HEAP8[(67328)];
 var $18=(($17)&1);
 if($18){label=8;break;}else{label=7;break;}
 case 7:
 _addhashtable(46328);
 label=8;break;
 case 8:
 HEAP8[(15016)]=1;
 HEAP32[((1086840)>>2)]=6803;
 label=9;break;
 case 9:
 var $22=$1;
 var $23=_strcmp($22,7128);
 var $24=($23|0)==0;
 if($24){label=11;break;}else{label=10;break;}
 case 10:
 var $26=$1;
 var $27=_strcmp($26,5952);
 var $28=($27|0)==0;
 if($28){label=11;break;}else{label=14;break;}
 case 11:
 var $30=HEAP8[(67328)];
 var $31=(($30)&1);
 if($31){label=13;break;}else{label=12;break;}
 case 12:
 _addhashtable(46328);
 _addhashtable(15024);
 label=13;break;
 case 13:
 HEAP8[(15016)]=1;
 HEAP32[((1086840)>>2)]=6303;
 label=14;break;
 case 14:
 var $35=$1;
 var $36=_strcmp($35,4960);
 var $37=($36|0)==0;
 if($37){label=15;break;}else{label=18;break;}
 case 15:
 var $39=HEAP8[(67328)];
 var $40=(($39)&1);
 if($40){label=17;break;}else{label=16;break;}
 case 16:
 _addhashtable(37072);
 label=17;break;
 case 17:
 HEAP8[(15016)]=1;
 HEAP32[((1086840)>>2)]=68705;
 label=18;break;
 case 18:
 var $44=$1;
 var $45=_strcmp($44,4304);
 var $46=($45|0)==0;
 if($46){label=20;break;}else{label=19;break;}
 case 19:
 var $48=$1;
 var $49=_strcmp($48,3576);
 var $50=($49|0)==0;
 if($50){label=20;break;}else{label=23;break;}
 case 20:
 var $52=HEAP8[(67328)];
 var $53=(($52)&1);
 if($53){label=22;break;}else{label=21;break;}
 case 21:
 _addhashtable(21888);
 label=22;break;
 case 22:
 HEAP8[(15016)]=1;
 HEAP32[((1086840)>>2)]=6811;
 label=23;break;
 case 23:
 var $57=$1;
 var $58=_strcmp($57,2824);
 var $59=($58|0)==0;
 if($59){label=25;break;}else{label=24;break;}
 case 24:
 var $61=$1;
 var $62=_strcmp($61,1888);
 var $63=($62|0)==0;
 if($63){label=25;break;}else{label=28;break;}
 case 25:
 var $65=HEAP8[(67328)];
 var $66=(($65)&1);
 if($66){label=27;break;}else{label=26;break;}
 case 26:
 _addhashtable(15752);
 label=27;break;
 case 27:
 HEAP8[(15016)]=1;
 HEAP32[((1086840)>>2)]=248;
 label=28;break;
 case 28:
 HEAP8[(67328)]=1;
 var $70=HEAP32[((1086840)>>2)];
 var $71=($70|0)!=0;
 if($71){label=30;break;}else{label=29;break;}
 case 29:
 var $73=$1;
 var $74=_asmerr(24,1,$73);
 label=30;break;
 case 30:
 var $76=$PreviousProcessor;
 var $77=($76|0)!=0;
 if($77){label=31;break;}else{label=33;break;}
 case 31:
 var $79=HEAP32[((1086840)>>2)];
 var $80=$PreviousProcessor;
 var $81=($79|0)!=($80|0);
 if($81){label=32;break;}else{label=33;break;}
 case 32:
 var $83=$1;
 var $84=_asmerr(27,1,$83);
 label=33;break;
 case 33:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_mnemonic($str,$mne){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+320)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $addrmode;
 var $sym;
 var $opcode;
 var $opidx;
 var $symbase;
 var $opsize;
 var $sBuffer=sp;
 var $sBuffer1=(sp)+(128);
 var $pc;
 var $pcf;
 var $dest;
 var $sBuffer2=(sp)+(256);
 $1=$str;
 $2=$mne;
 var $3=HEAP32[((1091648)>>2)];
 var $4=(($3+8)|0);
 var $5=HEAP8[($4)];
 var $6=($5&255);
 var $7=$6|4;
 var $8=(($7)&255);
 HEAP8[($4)]=$8;
 _programlabel();
 var $9=$1;
 var $10=_eval($9,1);
 $symbase=$10;
 var $11=HEAP8[(1082168)];
 var $12=(($11)&1);
 if($12){label=2;break;}else{label=3;break;}
 case 2:
 var $14=HEAP32[((1091648)>>2)];
 var $15=(($14+12)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=$2;
 var $18=(($17+8)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$symbase;
 var $21=(($20+13)|0);
 var $22=HEAP8[($21)];
 var $23=($22&255);
 var $24=_printf(1016,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$16,HEAP32[(((tempVarArgs)+(8))>>2)]=$19,HEAP32[(((tempVarArgs)+(16))>>2)]=$23,tempVarArgs)); STACKTOP=tempVarArgs;
 label=3;break;
 case 3:
 var $26=$symbase;
 $sym=$26;
 label=4;break;
 case 4:
 var $28=$sym;
 var $29=($28|0)!=0;
 if($29){label=5;break;}else{label=9;break;}
 case 5:
 var $31=$sym;
 var $32=(($31+12)|0);
 var $33=HEAP8[($32)];
 var $34=($33&255);
 var $35=$34&1;
 var $36=($35|0)!=0;
 if($36){label=6;break;}else{label=7;break;}
 case 6:
 var $38=HEAP32[((1086832)>>2)];
 var $39=((($38)+(1))|0);
 HEAP32[((1086832)>>2)]=$39;
 var $40=HEAP32[((1086808)>>2)];
 var $41=$40|1;
 HEAP32[((1086808)>>2)]=$41;
 label=7;break;
 case 7:
 label=8;break;
 case 8:
 var $44=$sym;
 var $45=(($44)|0);
 var $46=HEAP32[(($45)>>2)];
 $sym=$46;
 label=4;break;
 case 9:
 var $48=$symbase;
 $sym=$48;
 var $49=$2;
 var $50=(($49+12)|0);
 var $51=HEAP8[($50)];
 var $52=($51&255);
 var $53=$52&64;
 var $54=($53|0)!=0;
 if($54){label=10;break;}else{label=16;break;}
 case 10:
 var $56=$sym;
 var $57=(($56)|0);
 var $58=HEAP32[(($57)>>2)];
 var $59=($58|0)!=0;
 if($59){label=11;break;}else{label=15;break;}
 case 11:
 var $61=$sym;
 var $62=(($61+13)|0);
 HEAP8[($62)]=15;
 var $63=$2;
 var $64=(($63+12)|0);
 var $65=HEAP8[($64)];
 var $66=($65&255);
 var $67=$66&32;
 var $68=($67|0)!=0;
 if($68){label=12;break;}else{label=14;break;}
 case 12:
 var $70=$sym;
 var $71=(($70)|0);
 var $72=HEAP32[(($71)>>2)];
 var $73=($72|0)!=0;
 if($73){label=13;break;}else{label=14;break;}
 case 13:
 var $75=$sym;
 var $76=(($75+13)|0);
 HEAP8[($76)]=16;
 label=14;break;
 case 14:
 label=15;break;
 case 15:
 label=16;break;
 case 16:
 var $80=$sym;
 var $81=(($80+13)|0);
 var $82=HEAP8[($81)];
 var $83=($82&255);
 $addrmode=$83;
 var $84=$sym;
 var $85=(($84+12)|0);
 var $86=HEAP8[($85)];
 var $87=($86&255);
 var $88=$87&1;
 var $89=($88|0)!=0;
 if($89){label=18;break;}else{label=17;break;}
 case 17:
 var $91=$sym;
 var $92=(($91+16)|0);
 var $93=HEAP32[(($92)>>2)];
 var $94=($93|0)>=256;
 if($94){label=18;break;}else{label=19;break;}
 case 18:
 $opsize=2;
 label=20;break;
 case 19:
 var $97=$sym;
 var $98=(($97+16)|0);
 var $99=HEAP32[(($98)>>2)];
 var $100=($99|0)!=0;
 var $101=($100?1:0);
 $opsize=$101;
 label=20;break;
 case 20:
 label=21;break;
 case 21:
 var $104=$2;
 var $105=(($104+16)|0);
 var $106=HEAP32[(($105)>>2)];
 var $107=$addrmode;
 var $108=1<<$107;
 var $109=$106&$108;
 var $110=($109|0)!=0;
 if($110){var $117=0;label=23;break;}else{label=22;break;}
 case 22:
 var $112=$addrmode;
 var $113=((67256+($112<<2))|0);
 var $114=((((HEAPU8[($113)])|(HEAPU8[((($113)+(1))|0)]<<8)|(HEAPU8[((($113)+(2))|0)]<<16)|(HEAPU8[((($113)+(3))|0)]<<24))|0));
 var $115=($114|0)!=0;
 var $117=$115;label=23;break;
 case 23:
 var $117;
 if($117){label=24;break;}else{label=25;break;}
 case 24:
 var $119=$addrmode;
 var $120=((67256+($119<<2))|0);
 var $121=((((HEAPU8[($120)])|(HEAPU8[((($120)+(1))|0)]<<8)|(HEAPU8[((($120)+(2))|0)]<<16)|(HEAPU8[((($120)+(3))|0)]<<24))|0));
 $addrmode=$121;
 label=21;break;
 case 25:
 var $123=HEAP8[(1082168)];
 var $124=(($123)&1);
 if($124){label=26;break;}else{label=27;break;}
 case 26:
 var $126=$2;
 var $127=(($126+16)|0);
 var $128=HEAP32[(($127)>>2)];
 var $129=$addrmode;
 var $130=$addrmode;
 var $131=((67256+($130<<2))|0);
 var $132=((((HEAPU8[($131)])|(HEAPU8[((($131)+(1))|0)]<<8)|(HEAPU8[((($131)+(2))|0)]<<16)|(HEAPU8[((($131)+(3))|0)]<<24))|0));
 var $133=_printf(10800,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$128,HEAP32[(((tempVarArgs)+(8))>>2)]=$129,HEAP32[(((tempVarArgs)+(16))>>2)]=$132,tempVarArgs)); STACKTOP=tempVarArgs;
 label=27;break;
 case 27:
 var $135=$2;
 var $136=(($135+16)|0);
 var $137=HEAP32[(($136)>>2)];
 var $138=$addrmode;
 var $139=1<<$138;
 var $140=$137&$139;
 var $141=($140|0)!=0;
 if($141){label=29;break;}else{label=28;break;}
 case 28:
 var $143=(($sBuffer)|0);
 var $144=$2;
 var $145=(($144+8)|0);
 var $146=HEAP32[(($145)>>2)];
 var $147=$1;
 var $148=_sprintf($143,10288,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$146,HEAP32[(((tempVarArgs)+(8))>>2)]=$147,tempVarArgs)); STACKTOP=tempVarArgs;
 var $149=(($sBuffer)|0);
 var $150=_asmerr(10,0,$149);
 var $151=$symbase;
 _FreeSymbolList($151);
 var $152=HEAP32[((1086832)>>2)];
 var $153=((($152)+(1))|0);
 HEAP32[((1086832)>>2)]=$153;
 var $154=HEAP32[((1086808)>>2)];
 var $155=$154|1;
 HEAP32[((1086808)>>2)]=$155;
 label=107;break;
 case 29:
 var $157=HEAP32[((1087136)>>2)];
 var $158=($157|0)>=0;
 if($158){label=30;break;}else{label=34;break;}
 case 30:
 var $160=HEAP32[((1087136)>>2)];
 var $161=($160|0)<21;
 if($161){label=31;break;}else{label=34;break;}
 case 31:
 var $163=HEAP32[((1087136)>>2)];
 $addrmode=$163;
 var $164=$2;
 var $165=(($164+16)|0);
 var $166=HEAP32[(($165)>>2)];
 var $167=$addrmode;
 var $168=1<<$167;
 var $169=$166&$168;
 var $170=($169|0)!=0;
 if($170){label=33;break;}else{label=32;break;}
 case 32:
 var $172=$2;
 var $173=(($172+8)|0);
 var $174=HEAP32[(($173)>>2)];
 var $175=_asmerr(11,0,$174);
 var $176=$symbase;
 _FreeSymbolList($176);
 var $177=HEAP32[((1086832)>>2)];
 var $178=((($177)+(1))|0);
 HEAP32[((1086832)>>2)]=$178;
 var $179=HEAP32[((1086808)>>2)];
 var $180=$179|1;
 HEAP32[((1086808)>>2)]=$180;
 label=107;break;
 case 33:
 label=34;break;
 case 34:
 var $183=HEAP8[(1082168)];
 var $184=(($183)&1);
 if($184){label=35;break;}else{label=36;break;}
 case 35:
 var $186=$addrmode;
 var $187=_printf(9712,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$186,tempVarArgs)); STACKTOP=tempVarArgs;
 label=36;break;
 case 36:
 label=37;break;
 case 37:
 var $190=$opsize;
 var $191=$addrmode;
 var $192=((10992+($191<<2))|0);
 var $193=((((HEAPU8[($192)])|(HEAPU8[((($192)+(1))|0)]<<8)|(HEAPU8[((($192)+(2))|0)]<<16)|(HEAPU8[((($192)+(3))|0)]<<24))|0));
 var $194=($190>>>0)>($193>>>0);
 if($194){label=38;break;}else{label=47;break;}
 case 38:
 var $196=$addrmode;
 var $197=((67256+($196<<2))|0);
 var $198=((((HEAPU8[($197)])|(HEAPU8[((($197)+(1))|0)]<<8)|(HEAPU8[((($197)+(2))|0)]<<16)|(HEAPU8[((($197)+(3))|0)]<<24))|0));
 var $199=($198|0)==0;
 if($199){label=40;break;}else{label=39;break;}
 case 39:
 var $201=$2;
 var $202=(($201+16)|0);
 var $203=HEAP32[(($202)>>2)];
 var $204=$addrmode;
 var $205=((67256+($204<<2))|0);
 var $206=((((HEAPU8[($205)])|(HEAPU8[((($205)+(1))|0)]<<8)|(HEAPU8[((($205)+(2))|0)]<<16)|(HEAPU8[((($205)+(3))|0)]<<24))|0));
 var $207=1<<$206;
 var $208=$203&$207;
 var $209=($208|0)!=0;
 if($209){label=46;break;}else{label=40;break;}
 case 40:
 var $211=$sym;
 var $212=(($211+12)|0);
 var $213=HEAP8[($212)];
 var $214=($213&255);
 var $215=$214&1;
 var $216=($215|0)!=0;
 if($216){label=41;break;}else{label=42;break;}
 case 41:
 label=47;break;
 case 42:
 var $219=$addrmode;
 var $220=($219|0)==1;
 if($220){label=43;break;}else{label=45;break;}
 case 43:
 var $222=$sym;
 var $223=(($222+16)|0);
 var $224=HEAP32[(($223)>>2)];
 var $225=($224|0)<0;
 if($225){label=44;break;}else{label=45;break;}
 case 44:
 $opsize=1;
 var $227=$sym;
 var $228=(($227+16)|0);
 var $229=HEAP32[(($228)>>2)];
 var $230=$229&255;
 var $231=(($230)&255);
 var $232=(($231<<24)>>24);
 var $233=$sym;
 var $234=(($233+16)|0);
 HEAP32[(($234)>>2)]=$232;
 label=47;break;
 case 45:
 var $236=(($sBuffer1)|0);
 var $237=$2;
 var $238=(($237+8)|0);
 var $239=HEAP32[(($238)>>2)];
 var $240=$1;
 var $241=_sprintf($236,10288,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$239,HEAP32[(((tempVarArgs)+(8))>>2)]=$240,tempVarArgs)); STACKTOP=tempVarArgs;
 var $242=(($sBuffer1)|0);
 var $243=_asmerr(19,0,$242);
 label=47;break;
 case 46:
 var $245=$addrmode;
 var $246=((67256+($245<<2))|0);
 var $247=((((HEAPU8[($246)])|(HEAPU8[((($246)+(1))|0)]<<8)|(HEAPU8[((($246)+(2))|0)]<<16)|(HEAPU8[((($246)+(3))|0)]<<24))|0));
 $addrmode=$247;
 label=37;break;
 case 47:
 var $249=$addrmode;
 var $250=$2;
 var $251=(($250+20)|0);
 var $252=(($251+($249<<2))|0);
 var $253=HEAP32[(($252)>>2)];
 $opcode=$253;
 var $254=$opcode;
 var $255=($254>>>0)>255;
 var $256=($255&1);
 var $257=((($256)+(1))|0);
 var $258=(($257)&65535);
 $opidx=$258;
 var $259=$opidx;
 var $260=(($259<<16)>>16);
 var $261=($260|0)==2;
 if($261){label=48;break;}else{label=49;break;}
 case 48:
 var $263=$opcode;
 var $264=$263>>>8;
 var $265=(($264)&255);
 HEAP8[(1091312)]=$265;
 var $266=$opcode;
 var $267=(($266)&255);
 HEAP8[(1091313)]=$267;
 label=50;break;
 case 49:
 var $269=$opcode;
 var $270=(($269)&255);
 HEAP8[(1091312)]=$270;
 label=50;break;
 case 50:
 var $272=$addrmode;
 if(($272|0)==15){ label=51;break;}else if(($272|0)==16){ label=60;break;}else if(($272|0)==9){ label=69;break;}else{label=70;break;}
 case 51:
 var $274=$symbase;
 var $275=(($274)|0);
 var $276=HEAP32[(($275)>>2)];
 $sym=$276;
 var $277=$sym;
 var $278=(($277+12)|0);
 var $279=HEAP8[($278)];
 var $280=($279&255);
 var $281=$280&1;
 var $282=($281|0)!=0;
 if($282){label=54;break;}else{label=52;break;}
 case 52:
 var $284=$sym;
 var $285=(($284+16)|0);
 var $286=HEAP32[(($285)>>2)];
 var $287=($286|0)>=256;
 if($287){label=53;break;}else{label=54;break;}
 case 53:
 var $289=_asmerr(19,0,0);
 label=54;break;
 case 54:
 var $291=$sym;
 var $292=(($291+16)|0);
 var $293=HEAP32[(($292)>>2)];
 var $294=(($293)&255);
 var $295=$opidx;
 var $296=((($295)+(1))&65535);
 $opidx=$296;
 var $297=(($295<<16)>>16);
 var $298=((1091312+$297)|0);
 HEAP8[($298)]=$294;
 var $299=$symbase;
 var $300=(($299+12)|0);
 var $301=HEAP8[($300)];
 var $302=($301&255);
 var $303=$302&1;
 var $304=($303|0)!=0;
 if($304){label=59;break;}else{label=55;break;}
 case 55:
 var $306=$symbase;
 var $307=(($306+16)|0);
 var $308=HEAP32[(($307)>>2)];
 var $309=($308|0)>7;
 if($309){label=56;break;}else{label=57;break;}
 case 56:
 var $311=$1;
 var $312=_asmerr(20,0,$311);
 label=58;break;
 case 57:
 var $314=$symbase;
 var $315=(($314+16)|0);
 var $316=HEAP32[(($315)>>2)];
 var $317=$316<<1;
 var $318=HEAP8[(1091312)];
 var $319=($318&255);
 var $320=((($319)+($317))|0);
 var $321=(($320)&255);
 HEAP8[(1091312)]=$321;
 label=58;break;
 case 58:
 label=59;break;
 case 59:
 label=78;break;
 case 60:
 var $325=$symbase;
 var $326=(($325+12)|0);
 var $327=HEAP8[($326)];
 var $328=($327&255);
 var $329=$328&1;
 var $330=($329|0)!=0;
 if($330){label=65;break;}else{label=61;break;}
 case 61:
 var $332=$symbase;
 var $333=(($332+16)|0);
 var $334=HEAP32[(($333)>>2)];
 var $335=($334|0)>7;
 if($335){label=62;break;}else{label=63;break;}
 case 62:
 var $337=$1;
 var $338=_asmerr(20,0,$337);
 label=64;break;
 case 63:
 var $340=$symbase;
 var $341=(($340+16)|0);
 var $342=HEAP32[(($341)>>2)];
 var $343=$342<<1;
 var $344=HEAP8[(1091312)];
 var $345=($344&255);
 var $346=((($345)+($343))|0);
 var $347=(($346)&255);
 HEAP8[(1091312)]=$347;
 label=64;break;
 case 64:
 label=65;break;
 case 65:
 var $350=$symbase;
 var $351=(($350)|0);
 var $352=HEAP32[(($351)>>2)];
 $sym=$352;
 var $353=$sym;
 var $354=(($353+12)|0);
 var $355=HEAP8[($354)];
 var $356=($355&255);
 var $357=$356&1;
 var $358=($357|0)!=0;
 if($358){label=68;break;}else{label=66;break;}
 case 66:
 var $360=$sym;
 var $361=(($360+16)|0);
 var $362=HEAP32[(($361)>>2)];
 var $363=($362|0)>=256;
 if($363){label=67;break;}else{label=68;break;}
 case 67:
 var $365=_asmerr(19,0,0);
 label=68;break;
 case 68:
 var $367=$sym;
 var $368=(($367+16)|0);
 var $369=HEAP32[(($368)>>2)];
 var $370=(($369)&255);
 var $371=$opidx;
 var $372=((($371)+(1))&65535);
 $opidx=$372;
 var $373=(($371<<16)>>16);
 var $374=((1091312+$373)|0);
 HEAP8[($374)]=$370;
 var $375=$sym;
 var $376=(($375)|0);
 var $377=HEAP32[(($376)>>2)];
 $sym=$377;
 label=78;break;
 case 69:
 label=78;break;
 case 70:
 var $380=$addrmode;
 var $381=((10992+($380<<2))|0);
 var $382=((((HEAPU8[($381)])|(HEAPU8[((($381)+(1))|0)]<<8)|(HEAPU8[((($381)+(2))|0)]<<16)|(HEAPU8[((($381)+(3))|0)]<<24))|0));
 var $383=($382>>>0)>0;
 if($383){label=71;break;}else{label=72;break;}
 case 71:
 var $385=$sym;
 var $386=(($385+16)|0);
 var $387=HEAP32[(($386)>>2)];
 var $388=(($387)&255);
 var $389=$opidx;
 var $390=((($389)+(1))&65535);
 $opidx=$390;
 var $391=(($389<<16)>>16);
 var $392=((1091312+$391)|0);
 HEAP8[($392)]=$388;
 label=72;break;
 case 72:
 var $394=$addrmode;
 var $395=((10992+($394<<2))|0);
 var $396=((((HEAPU8[($395)])|(HEAPU8[((($395)+(1))|0)]<<8)|(HEAPU8[((($395)+(2))|0)]<<16)|(HEAPU8[((($395)+(3))|0)]<<24))|0));
 var $397=($396|0)==2;
 if($397){label=73;break;}else{label=77;break;}
 case 73:
 var $399=HEAP8[(15016)];
 var $400=(($399<<24)>>24)!=0;
 if($400){label=74;break;}else{label=75;break;}
 case 74:
 var $402=$sym;
 var $403=(($402+16)|0);
 var $404=HEAP32[(($403)>>2)];
 var $405=$404>>8;
 var $406=(($405)&255);
 var $407=$opidx;
 var $408=(($407<<16)>>16);
 var $409=((($408)-(1))|0);
 var $410=((1091312+$409)|0);
 HEAP8[($410)]=$406;
 var $411=$sym;
 var $412=(($411+16)|0);
 var $413=HEAP32[(($412)>>2)];
 var $414=(($413)&255);
 var $415=$opidx;
 var $416=((($415)+(1))&65535);
 $opidx=$416;
 var $417=(($415<<16)>>16);
 var $418=((1091312+$417)|0);
 HEAP8[($418)]=$414;
 label=76;break;
 case 75:
 var $420=$sym;
 var $421=(($420+16)|0);
 var $422=HEAP32[(($421)>>2)];
 var $423=$422>>8;
 var $424=(($423)&255);
 var $425=$opidx;
 var $426=((($425)+(1))&65535);
 $opidx=$426;
 var $427=(($425<<16)>>16);
 var $428=((1091312+$427)|0);
 HEAP8[($428)]=$424;
 label=76;break;
 case 76:
 label=77;break;
 case 77:
 var $431=$sym;
 var $432=(($431)|0);
 var $433=HEAP32[(($432)>>2)];
 $sym=$433;
 label=78;break;
 case 78:
 var $435=$2;
 var $436=(($435+12)|0);
 var $437=HEAP8[($436)];
 var $438=($437&255);
 var $439=$438&16;
 var $440=($439|0)!=0;
 if($440){label=79;break;}else{label=86;break;}
 case 79:
 var $442=$sym;
 var $443=($442|0)!=0;
 if($443){label=80;break;}else{label=84;break;}
 case 80:
 var $445=$sym;
 var $446=(($445+12)|0);
 var $447=HEAP8[($446)];
 var $448=($447&255);
 var $449=$448&1;
 var $450=($449|0)!=0;
 if($450){label=83;break;}else{label=81;break;}
 case 81:
 var $452=$sym;
 var $453=(($452+16)|0);
 var $454=HEAP32[(($453)>>2)];
 var $455=($454|0)>=256;
 if($455){label=82;break;}else{label=83;break;}
 case 82:
 var $457=_asmerr(19,0,0);
 label=83;break;
 case 83:
 var $459=$sym;
 var $460=(($459+16)|0);
 var $461=HEAP32[(($460)>>2)];
 var $462=(($461)&255);
 var $463=$opidx;
 var $464=(($463<<16)>>16);
 var $465=((1091312+$464)|0);
 HEAP8[($465)]=$462;
 var $466=$sym;
 var $467=(($466)|0);
 var $468=HEAP32[(($467)>>2)];
 $sym=$468;
 label=85;break;
 case 84:
 var $470=_asmerr(21,1,0);
 label=85;break;
 case 85:
 var $472=$opidx;
 var $473=((($472)+(1))&65535);
 $opidx=$473;
 label=86;break;
 case 86:
 var $475=$2;
 var $476=(($475+12)|0);
 var $477=HEAP8[($476)];
 var $478=($477&255);
 var $479=$478&32;
 var $480=($479|0)!=0;
 if($480){label=88;break;}else{label=87;break;}
 case 87:
 var $482=$addrmode;
 var $483=($482|0)==9;
 if($483){label=88;break;}else{label=106;break;}
 case 88:
 var $485=$opidx;
 var $486=((($485)+(1))&65535);
 $opidx=$486;
 var $487=$sym;
 var $488=($487|0)!=0;
 if($488){label=90;break;}else{label=89;break;}
 case 89:
 var $490=_asmerr(21,1,0);
 label=105;break;
 case 90:
 var $492=$sym;
 var $493=(($492+12)|0);
 var $494=HEAP8[($493)];
 var $495=($494&255);
 var $496=$495&1;
 var $497=($496|0)!=0;
 if($497){label=104;break;}else{label=91;break;}
 case 91:
 var $499=HEAP32[((1091648)>>2)];
 var $500=(($499+8)|0);
 var $501=HEAP8[($500)];
 var $502=($501&255);
 var $503=$502&32;
 var $504=($503|0)!=0;
 if($504){label=92;break;}else{label=93;break;}
 case 92:
 var $506=HEAP32[((1091648)>>2)];
 var $507=(($506+16)|0);
 var $508=HEAP32[(($507)>>2)];
 var $514=$508;label=94;break;
 case 93:
 var $510=HEAP32[((1091648)>>2)];
 var $511=(($510+12)|0);
 var $512=HEAP32[(($511)>>2)];
 var $514=$512;label=94;break;
 case 94:
 var $514;
 $pc=$514;
 var $515=HEAP32[((1091648)>>2)];
 var $516=(($515+8)|0);
 var $517=HEAP8[($516)];
 var $518=($517&255);
 var $519=$518&32;
 var $520=($519|0)!=0;
 if($520){label=95;break;}else{label=96;break;}
 case 95:
 var $522=HEAP32[((1091648)>>2)];
 var $523=(($522+9)|0);
 var $524=HEAP8[($523)];
 var $525=($524&255);
 var $532=$525;label=97;break;
 case 96:
 var $527=HEAP32[((1091648)>>2)];
 var $528=(($527+8)|0);
 var $529=HEAP8[($528)];
 var $530=($529&255);
 var $532=$530;label=97;break;
 case 97:
 var $532;
 var $533=(($532)&255);
 $pcf=$533;
 var $534=$pcf;
 var $535=($534&255);
 var $536=$535&3;
 var $537=($536|0)==0;
 if($537){label=98;break;}else{label=102;break;}
 case 98:
 var $539=$sym;
 var $540=(($539+16)|0);
 var $541=HEAP32[(($540)>>2)];
 var $542=$pc;
 var $543=((($541)-($542))|0);
 var $544=$opidx;
 var $545=(($544<<16)>>16);
 var $546=((($543)-($545))|0);
 $dest=$546;
 var $547=$dest;
 var $548=($547|0)>=128;
 if($548){label=100;break;}else{label=99;break;}
 case 99:
 var $550=$dest;
 var $551=($550|0)<-128;
 if($551){label=100;break;}else{label=101;break;}
 case 100:
 var $553=(($sBuffer2)|0);
 var $554=$dest;
 var $555=_sprintf($553,8968,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$554,tempVarArgs)); STACKTOP=tempVarArgs;
 var $556=(($sBuffer2)|0);
 var $557=_asmerr(15,0,$556);
 var $558=HEAP32[((1086832)>>2)];
 var $559=((($558)+(1))|0);
 HEAP32[((1086832)>>2)]=$559;
 var $560=HEAP32[((1086808)>>2)];
 var $561=$560|32768;
 HEAP32[((1086808)>>2)]=$561;
 var $562=$sym;
 var $563=(($562+12)|0);
 var $564=HEAP8[($563)];
 var $565=($564&255);
 var $566=$565|1;
 var $567=(($566)&255);
 var $568=$sym;
 var $569=(($568+12)|0);
 HEAP8[($569)]=$567;
 $dest=0;
 label=101;break;
 case 101:
 label=103;break;
 case 102:
 $dest=0;
 label=103;break;
 case 103:
 var $573=$dest;
 var $574=$573&255;
 var $575=(($574)&255);
 var $576=$opidx;
 var $577=(($576<<16)>>16);
 var $578=((($577)-(1))|0);
 var $579=((1091312+$578)|0);
 HEAP8[($579)]=$575;
 label=104;break;
 case 104:
 label=105;break;
 case 105:
 label=106;break;
 case 106:
 var $583=$opidx;
 var $584=(($583<<16)>>16);
 HEAP32[((1091304)>>2)]=$584;
 _generate();
 var $585=$symbase;
 _FreeSymbolList($585);
 label=107;break;
 case 107:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _generate(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $seekpos;
 var $i;
 var $1=HEAP32[((1086832)>>2)];
 var $2=($1|0)!=0;
 if($2){label=28;break;}else{label=2;break;}
 case 2:
 var $4=HEAP32[((1091648)>>2)];
 var $5=(($4+8)|0);
 var $6=HEAP8[($5)];
 var $7=($6&255);
 var $8=$7&16;
 var $9=($8|0)!=0;
 if($9){label=27;break;}else{label=3;break;}
 case 3:
 var $11=HEAP32[((1091304)>>2)];
 var $12=((($11)-(1))|0);
 $i=$12;
 label=4;break;
 case 4:
 var $14=$i;
 var $15=($14|0)>=0;
 if($15){label=5;break;}else{label=7;break;}
 case 5:
 var $17=$i;
 var $18=((1091312+$17)|0);
 var $19=HEAP8[($18)];
 var $20=($19&255);
 var $21=HEAP32[((1091656)>>2)];
 var $22=((($21)+($20))|0);
 HEAP32[((1091656)>>2)]=$22;
 label=6;break;
 case 6:
 var $24=$i;
 var $25=((($24)-(1))|0);
 $i=$25;
 label=4;break;
 case 7:
 var $27=HEAP8[(1091568)];
 var $28=(($27<<24)>>24)!=0;
 if($28){label=8;break;}else{label=15;break;}
 case 8:
 HEAP8[(1091568)]=0;
 var $30=HEAP32[((1091648)>>2)];
 var $31=(($30+8)|0);
 var $32=HEAP8[($31)];
 var $33=($32&255);
 var $34=$33&1;
 var $35=($34|0)!=0;
 if($35){label=9;break;}else{label=10;break;}
 case 9:
 var $37=HEAP32[((1086832)>>2)];
 var $38=((($37)+(1))|0);
 HEAP32[((1086832)>>2)]=$38;
 var $39=HEAP32[((1086808)>>2)];
 var $40=$39|2;
 HEAP32[((1086808)>>2)]=$40;
 label=30;break;
 case 10:
 var $42=HEAP32[((1091648)>>2)];
 var $43=(($42+12)|0);
 var $44=HEAP32[(($43)>>2)];
 HEAP32[((80648)>>2)]=$44;
 var $45=HEAP32[((67248)>>2)];
 var $46=($45|0)<3;
 if($46){label=11;break;}else{label=14;break;}
 case 11:
 var $48=HEAP32[((80648)>>2)];
 var $49=$48&255;
 var $50=HEAP32[((1091624)>>2)];
 var $51=_fputc($49,$50);
 var $52=HEAP32[((80648)>>2)];
 var $53=$52>>>8;
 var $54=$53&255;
 var $55=HEAP32[((1091624)>>2)];
 var $56=_fputc($54,$55);
 var $57=HEAP32[((67248)>>2)];
 var $58=($57|0)==2;
 if($58){label=12;break;}else{label=13;break;}
 case 12:
 var $60=HEAP32[((1091624)>>2)];
 var $61=_ftell($60);
 HEAP32[((1082696)>>2)]=$61;
 HEAP32[((1082688)>>2)]=0;
 var $62=HEAP32[((1091624)>>2)];
 var $63=_fputc(0,$62);
 var $64=HEAP32[((1091624)>>2)];
 var $65=_fputc(0,$64);
 label=13;break;
 case 13:
 label=14;break;
 case 14:
 label=15;break;
 case 15:
 var $69=HEAP32[((67248)>>2)];
 if(($69|0)==3|($69|0)==1){ label=17;break;}else if(($69|0)==2){ label=23;break;}else{label=16;break;}
 case 16:
 var $71=_asmerr(28,1,5144);
 label=26;break;
 case 17:
 var $73=HEAP32[((1091648)>>2)];
 var $74=(($73+12)|0);
 var $75=HEAP32[(($74)>>2)];
 var $76=HEAP32[((80648)>>2)];
 var $77=($75>>>0)<($76>>>0);
 if($77){label=18;break;}else{label=19;break;}
 case 18:
 var $79=HEAP32[((1091648)>>2)];
 var $80=(($79+4)|0);
 var $81=HEAP32[(($80)>>2)];
 var $82=HEAP32[((1091648)>>2)];
 var $83=(($82+12)|0);
 var $84=HEAP32[(($83)>>2)];
 var $85=HEAP32[((1091648)>>2)];
 var $86=(($85+8)|0);
 var $87=HEAP8[($86)];
 var $88=($87&255);
 var $89=_sftos($84,$88);
 var $90=HEAP32[((80648)>>2)];
 var $91=_printf(5032,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$81,HEAP32[(((tempVarArgs)+(8))>>2)]=$89,HEAP32[(((tempVarArgs)+(16))>>2)]=$90,tempVarArgs)); STACKTOP=tempVarArgs;
 var $92=_asmerr(17,1,0);
 _exit(1);
 throw "Reached an unreachable!";
 case 19:
 label=20;break;
 case 20:
 var $95=HEAP32[((1091648)>>2)];
 var $96=(($95+12)|0);
 var $97=HEAP32[(($96)>>2)];
 var $98=HEAP32[((80648)>>2)];
 var $99=($97|0)!=($98|0);
 if($99){label=21;break;}else{label=22;break;}
 case 21:
 var $101=HEAP8[(10984)];
 var $102=($101&255);
 var $103=HEAP32[((1091624)>>2)];
 var $104=_fputc($102,$103);
 var $105=HEAP32[((80648)>>2)];
 var $106=((($105)+(1))|0);
 HEAP32[((80648)>>2)]=$106;
 label=20;break;
 case 22:
 var $108=HEAP32[((1091304)>>2)];
 var $109=HEAP32[((1091624)>>2)];
 var $110=_fwrite(1091312,$108,1,$109);
 label=26;break;
 case 23:
 var $112=HEAP32[((80648)>>2)];
 var $113=HEAP32[((1091648)>>2)];
 var $114=(($113+12)|0);
 var $115=HEAP32[(($114)>>2)];
 var $116=($112|0)!=($115|0);
 if($116){label=24;break;}else{label=25;break;}
 case 24:
 var $118=HEAP32[((1091648)>>2)];
 var $119=(($118+12)|0);
 var $120=HEAP32[(($119)>>2)];
 HEAP32[((80648)>>2)]=$120;
 var $121=HEAP32[((1091624)>>2)];
 var $122=_ftell($121);
 $seekpos=$122;
 var $123=HEAP32[((1091624)>>2)];
 var $124=HEAP32[((1082696)>>2)];
 var $125=_fseek($123,$124,0);
 var $126=HEAP32[((1082688)>>2)];
 var $127=$126&255;
 var $128=HEAP32[((1091624)>>2)];
 var $129=_fputc($127,$128);
 var $130=HEAP32[((1082688)>>2)];
 var $131=$130>>8;
 var $132=$131&255;
 var $133=HEAP32[((1091624)>>2)];
 var $134=_fputc($132,$133);
 var $135=HEAP32[((1091624)>>2)];
 var $136=$seekpos;
 var $137=_fseek($135,$136,0);
 var $138=HEAP32[((80648)>>2)];
 var $139=$138&255;
 var $140=HEAP32[((1091624)>>2)];
 var $141=_fputc($139,$140);
 var $142=HEAP32[((80648)>>2)];
 var $143=$142>>>8;
 var $144=$143&255;
 var $145=HEAP32[((1091624)>>2)];
 var $146=_fputc($144,$145);
 var $147=HEAP32[((1091624)>>2)];
 var $148=_ftell($147);
 HEAP32[((1082696)>>2)]=$148;
 HEAP32[((1082688)>>2)]=0;
 var $149=HEAP32[((1091624)>>2)];
 var $150=_fputc(0,$149);
 var $151=HEAP32[((1091624)>>2)];
 var $152=_fputc(0,$151);
 label=25;break;
 case 25:
 var $154=HEAP32[((1091304)>>2)];
 var $155=HEAP32[((1091624)>>2)];
 var $156=_fwrite(1091312,$154,1,$155);
 var $157=HEAP32[((1091304)>>2)];
 var $158=HEAP32[((1082688)>>2)];
 var $159=((($158)+($157))|0);
 HEAP32[((1082688)>>2)]=$159;
 label=26;break;
 case 26:
 var $161=HEAP32[((1091304)>>2)];
 var $162=HEAP32[((80648)>>2)];
 var $163=((($162)+($161))|0);
 HEAP32[((80648)>>2)]=$163;
 label=27;break;
 case 27:
 label=28;break;
 case 28:
 var $166=HEAP32[((1091304)>>2)];
 var $167=HEAP32[((1091648)>>2)];
 var $168=(($167+12)|0);
 var $169=HEAP32[(($168)>>2)];
 var $170=((($169)+($166))|0);
 HEAP32[(($168)>>2)]=$170;
 var $171=HEAP32[((1091648)>>2)];
 var $172=(($171+8)|0);
 var $173=HEAP8[($172)];
 var $174=($173&255);
 var $175=$174&32;
 var $176=($175|0)!=0;
 if($176){label=29;break;}else{label=30;break;}
 case 29:
 var $178=HEAP32[((1091304)>>2)];
 var $179=HEAP32[((1091648)>>2)];
 var $180=(($179+16)|0);
 var $181=HEAP32[(($180)>>2)];
 var $182=((($181)+($178))|0);
 HEAP32[(($180)>>2)]=$182;
 label=30;break;
 case 30:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_trace($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$str;
 $2=$dummy;
 var $3=$1;
 var $4=(($3+1)|0);
 var $5=HEAP8[($4)];
 var $6=(($5<<24)>>24);
 var $7=($6|0)==110;
 var $8=($7&1);
 HEAP8[(1082168)]=$8;
 STACKTOP=sp;return;
}


function _v_list($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 $1=$str;
 $2=$dummy;
 _programlabel();
 HEAP32[((1091304)>>2)]=0;
 var $3=$1;
 var $4=_strncmp($3,8192,7);
 var $5=($4|0)==0;
 if($5){label=3;break;}else{label=2;break;}
 case 2:
 var $7=$1;
 var $8=_strncmp($7,7816,7);
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3:
 var $11=HEAP32[((68472)>>2)];
 var $12=(($11+16)|0);
 var $13=HEAP8[($12)];
 var $14=($13&255);
 var $15=$14|2;
 var $16=(($15)&255);
 HEAP8[($12)]=$16;
 label=13;break;
 case 4:
 var $18=$1;
 var $19=_strncmp($18,7640,7);
 var $20=($19|0)==0;
 if($20){label=6;break;}else{label=5;break;}
 case 5:
 var $22=$1;
 var $23=_strncmp($22,7552,7);
 var $24=($23|0)==0;
 if($24){label=6;break;}else{label=7;break;}
 case 6:
 var $26=HEAP32[((68472)>>2)];
 var $27=(($26+16)|0);
 var $28=HEAP8[($27)];
 var $29=($28&255);
 var $30=$29&-3;
 var $31=(($30)&255);
 HEAP8[($27)]=$31;
 label=12;break;
 case 7:
 var $33=$1;
 var $34=_strncmp($33,7464,2);
 var $35=($34|0)==0;
 if($35){label=9;break;}else{label=8;break;}
 case 8:
 var $37=$1;
 var $38=_strncmp($37,7368,2);
 var $39=($38|0)==0;
 if($39){label=9;break;}else{label=10;break;}
 case 9:
 HEAP8[(67232)]=0;
 label=11;break;
 case 10:
 HEAP8[(67232)]=1;
 label=11;break;
 case 11:
 label=12;break;
 case 12:
 label=13;break;
 case 13:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_include($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $buf;
 $1=$str;
 $2=$dummy;
 _programlabel();
 var $3=$1;
 var $4=_getfilename($3);
 $buf=$4;
 var $5=$buf;
 _pushinclude($5);
 var $6=$buf;
 var $7=$1;
 var $8=($6|0)!=($7|0);
 if($8){label=2;break;}else{label=3;break;}
 case 2:
 var $10=$buf;
 _free($10);
 label=3;break;
 case 3:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_incbin($str,$dummy){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $buf;
 var $binfile;
 $1=$str;
 $2=$dummy;
 _programlabel();
 var $3=$1;
 var $4=_getfilename($3);
 $buf=$4;
 var $5=$buf;
 var $6=_pfopen($5,7256);
 $binfile=$6;
 var $7=$binfile;
 var $8=($7|0)!=0;
 if($8){label=2;break;}else{label=10;break;}
 case 2:
 var $10=HEAP32[((1086832)>>2)];
 var $11=($10|0)!=0;
 if($11){label=3;break;}else{label=4;break;}
 case 3:
 var $13=$binfile;
 var $14=_fseek($13,0,2);
 var $15=$binfile;
 var $16=_ftell($15);
 HEAP32[((1091304)>>2)]=$16;
 _generate();
 label=9;break;
 case 4:
 label=5;break;
 case 5:
 var $19=$binfile;
 var $20=_fread(1091312,1,256,$19);
 HEAP32[((1091304)>>2)]=$20;
 var $21=HEAP32[((1091304)>>2)];
 var $22=($21|0)<=0;
 if($22){label=6;break;}else{label=7;break;}
 case 6:
 label=8;break;
 case 7:
 _generate();
 label=5;break;
 case 8:
 label=9;break;
 case 9:
 var $27=$binfile;
 var $28=_fclose($27);
 label=11;break;
 case 10:
 var $30=$buf;
 var $31=_printf(7160,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$30,tempVarArgs)); STACKTOP=tempVarArgs;
 label=11;break;
 case 11:
 var $33=$buf;
 var $34=$1;
 var $35=($33|0)!=($34|0);
 if($35){label=12;break;}else{label=13;break;}
 case 12:
 var $37=$buf;
 _free($37);
 label=13;break;
 case 13:
 HEAP32[((1091304)>>2)]=0;
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _pfopen($name,$mode){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $f;
 var $incdir;
 var $buf;
 $2=$name;
 $3=$mode;
 var $4=$2;
 var $5=$3;
 var $6=_fopen($4,$5);
 $f=$6;
 var $7=$f;
 var $8=($7|0)!=0;
 if($8){label=2;break;}else{label=3;break;}
 case 2:
 var $10=$f;
 $1=$10;
 label=12;break;
 case 3:
 var $12=$2;
 var $13=_strchr($12,58);
 var $14=($13|0)!=0;
 if($14){label=4;break;}else{label=5;break;}
 case 4:
 $1=0;
 label=12;break;
 case 5:
 var $17=_zmalloc(512);
 $buf=$17;
 var $18=HEAP32[((80640)>>2)];
 $incdir=$18;
 label=6;break;
 case 6:
 var $20=$incdir;
 var $21=($20|0)!=0;
 if($21){label=7;break;}else{label=11;break;}
 case 7:
 var $23=$buf;
 var $24=$incdir;
 var $25=(($24+4)|0);
 var $26=(($25)|0);
 var $27=$2;
 _addpart($23,$26,$27);
 var $28=$buf;
 var $29=$3;
 var $30=_fopen($28,$29);
 $f=$30;
 var $31=$f;
 var $32=($31|0)!=0;
 if($32){label=8;break;}else{label=9;break;}
 case 8:
 label=11;break;
 case 9:
 label=10;break;
 case 10:
 var $36=$incdir;
 var $37=(($36)|0);
 var $38=HEAP32[(($37)>>2)];
 $incdir=$38;
 label=6;break;
 case 11:
 var $40=$buf;
 _free($40);
 var $41=$f;
 $1=$41;
 label=12;break;
 case 12:
 var $43=$1;
 STACKTOP=sp;return $43;
  default: assert(0, "bad label: " + label);
 }

}


function _v_seg($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $seg;
 $1=$str;
 $2=$dummy;
 var $3=HEAP32[((1082680)>>2)];
 $seg=$3;
 label=2;break;
 case 2:
 var $5=$seg;
 var $6=($5|0)!=0;
 if($6){label=3;break;}else{label=7;break;}
 case 3:
 var $8=$1;
 var $9=$seg;
 var $10=(($9+4)|0);
 var $11=HEAP32[(($10)>>2)];
 var $12=_strcmp($8,$11);
 var $13=($12|0)==0;
 if($13){label=4;break;}else{label=5;break;}
 case 4:
 var $15=$seg;
 HEAP32[((1091648)>>2)]=$15;
 _programlabel();
 label=10;break;
 case 5:
 label=6;break;
 case 6:
 var $18=$seg;
 var $19=(($18)|0);
 var $20=HEAP32[(($19)>>2)];
 $seg=$20;
 label=2;break;
 case 7:
 var $22=_zmalloc(32);
 var $23=$22;
 $seg=$23;
 HEAP32[((1091648)>>2)]=$23;
 var $24=HEAP32[((1082680)>>2)];
 var $25=$seg;
 var $26=(($25)|0);
 HEAP32[(($26)>>2)]=$24;
 var $27=$1;
 var $28=_strlen($27);
 var $29=((($28)+(1))|0);
 var $30=_ckmalloc($29);
 var $31=$1;
 var $32=_strcpy($30,$31);
 var $33=$seg;
 var $34=(($33+4)|0);
 HEAP32[(($34)>>2)]=$32;
 var $35=$seg;
 var $36=(($35+29)|0);
 HEAP8[($36)]=1;
 var $37=$seg;
 var $38=(($37+28)|0);
 HEAP8[($38)]=1;
 var $39=$seg;
 var $40=(($39+9)|0);
 HEAP8[($40)]=1;
 var $41=$seg;
 var $42=(($41+8)|0);
 HEAP8[($42)]=1;
 var $43=$seg;
 HEAP32[((1082680)>>2)]=$43;
 var $44=HEAP32[((1087136)>>2)];
 var $45=($44|0)==20;
 if($45){label=8;break;}else{label=9;break;}
 case 8:
 var $47=$seg;
 var $48=(($47+8)|0);
 var $49=HEAP8[($48)];
 var $50=($49&255);
 var $51=$50|16;
 var $52=(($51)&255);
 HEAP8[($48)]=$52;
 label=9;break;
 case 9:
 _programlabel();
 label=10;break;
 case 10:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_hex($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $i;
 var $result;
 $1=$str;
 $2=$dummy;
 _programlabel();
 HEAP32[((1091304)>>2)]=0;
 $i=0;
 label=2;break;
 case 2:
 var $4=$i;
 var $5=$1;
 var $6=(($5+$4)|0);
 var $7=HEAP8[($6)];
 var $8=(($7<<24)>>24)!=0;
 if($8){label=3;break;}else{label=9;break;}
 case 3:
 var $10=$i;
 var $11=$1;
 var $12=(($11+$10)|0);
 var $13=HEAP8[($12)];
 var $14=(($13<<24)>>24);
 var $15=($14|0)==32;
 if($15){label=4;break;}else{label=5;break;}
 case 4:
 label=8;break;
 case 5:
 var $18=$i;
 var $19=$1;
 var $20=(($19+$18)|0);
 var $21=HEAP8[($20)];
 var $22=(($21<<24)>>24);
 var $23=_gethexdig($22);
 var $24=$23<<4;
 var $25=$i;
 var $26=((($25)+(1))|0);
 var $27=$1;
 var $28=(($27+$26)|0);
 var $29=HEAP8[($28)];
 var $30=(($29<<24)>>24);
 var $31=_gethexdig($30);
 var $32=((($24)+($31))|0);
 $result=$32;
 var $33=$i;
 var $34=((($33)+(1))|0);
 $i=$34;
 var $35=$1;
 var $36=(($35+$34)|0);
 var $37=HEAP8[($36)];
 var $38=(($37<<24)>>24);
 var $39=($38|0)==0;
 if($39){label=6;break;}else{label=7;break;}
 case 6:
 label=9;break;
 case 7:
 var $42=$result;
 var $43=(($42)&255);
 var $44=HEAP32[((1091304)>>2)];
 var $45=((($44)+(1))|0);
 HEAP32[((1091304)>>2)]=$45;
 var $46=((1091312+$44)|0);
 HEAP8[($46)]=$43;
 label=8;break;
 case 8:
 var $48=$i;
 var $49=((($48)+(1))|0);
 $i=$49;
 label=2;break;
 case 9:
 _generate();
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _gethexdig($c){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+64)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sBuffer=sp;
 $2=$c;
 var $3=$2;
 var $4=($3|0)>=48;
 if($4){label=2;break;}else{label=4;break;}
 case 2:
 var $6=$2;
 var $7=($6|0)<=57;
 if($7){label=3;break;}else{label=4;break;}
 case 3:
 var $9=$2;
 var $10=((($9)-(48))|0);
 $1=$10;
 label=13;break;
 case 4:
 var $12=$2;
 var $13=($12|0)>=97;
 if($13){label=5;break;}else{label=7;break;}
 case 5:
 var $15=$2;
 var $16=($15|0)<=102;
 if($16){label=6;break;}else{label=7;break;}
 case 6:
 var $18=$2;
 var $19=((($18)-(97))|0);
 var $20=((($19)+(10))|0);
 $1=$20;
 label=13;break;
 case 7:
 var $22=$2;
 var $23=($22|0)>=65;
 if($23){label=8;break;}else{label=10;break;}
 case 8:
 var $25=$2;
 var $26=($25|0)<=70;
 if($26){label=9;break;}else{label=10;break;}
 case 9:
 var $28=$2;
 var $29=((($28)-(65))|0);
 var $30=((($29)+(10))|0);
 $1=$30;
 label=13;break;
 case 10:
 var $32=(($sBuffer)|0);
 var $33=$2;
 var $34=_sprintf($32,7048,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$33,tempVarArgs)); STACKTOP=tempVarArgs;
 var $35=(($sBuffer)|0);
 var $36=_asmerr(5,0,$35);
 var $37=_puts(6936);
 var $38=HEAP32[((1091600)>>2)];
 var $39=($38|0)!=0;
 if($39){label=11;break;}else{label=12;break;}
 case 11:
 var $41=HEAP32[((1091632)>>2)];
 var $42=_fputs(6760,$41);
 label=12;break;
 case 12:
 $1=0;
 label=13;break;
 case 13:
 var $45=$1;
 STACKTOP=sp;return $45;
  default: assert(0, "bad label: " + label);
 }

}


function _v_err($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$str;
 $2=$dummy;
 _programlabel();
 var $3=_asmerr(16,1,0);
 _exit(1);
 throw "Reached an unreachable!";
 STACKTOP=sp;return;
}


function _v_dc($str,$mne){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 var $tmp;
 var $value;
 var $macstr;
 var $vmode;
 var $i;
 var $ptr;
 $1=$str;
 $2=$mne;
 $macstr=0;
 $vmode=0;
 HEAP32[((1091304)>>2)]=0;
 _programlabel();
 var $3=$2;
 var $4=(($3+8)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=(($5)|0);
 var $7=HEAP8[($6)];
 var $8=(($7<<24)>>24);
 var $9=($8|0)!=100;
 if($9){label=2;break;}else{label=3;break;}
 case 2:
 var $11=_strcpy(67344,6664);
 var $12=$2;
 var $13=(($12+8)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=(($14)|0);
 var $16=HEAP8[($15)];
 HEAP8[(67346)]=$16;
 _findext(67344);
 label=3;break;
 case 3:
 var $18=$2;
 var $19=(($18+8)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=(($20)|0);
 var $22=HEAP8[($21)];
 var $23=(($22<<24)>>24);
 var $24=($23|0)==100;
 if($24){label=4;break;}else{label=9;break;}
 case 4:
 var $26=$2;
 var $27=(($26+8)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=(($28+1)|0);
 var $30=HEAP8[($29)];
 var $31=(($30<<24)>>24);
 var $32=($31|0)!=99;
 if($32){label=5;break;}else{label=9;break;}
 case 5:
 var $34=_strcpy(67336,6664);
 var $35=$2;
 var $36=(($35+8)|0);
 var $37=HEAP32[(($36)>>2)];
 var $38=(($37+1)|0);
 var $39=HEAP8[($38)];
 var $40=(($39<<24)>>24);
 var $41=100==($40|0);
 if($41){label=6;break;}else{label=7;break;}
 case 6:
 HEAP8[(67338)]=108;
 label=8;break;
 case 7:
 var $44=$2;
 var $45=(($44+8)|0);
 var $46=HEAP32[(($45)>>2)];
 var $47=(($46+1)|0);
 var $48=HEAP8[($47)];
 HEAP8[(67338)]=$48;
 label=8;break;
 case 8:
 _findext(67336);
 label=9;break;
 case 9:
 var $51=$2;
 var $52=(($51+8)|0);
 var $53=HEAP32[(($52)>>2)];
 var $54=(($53+1)|0);
 var $55=HEAP8[($54)];
 var $56=(($55<<24)>>24);
 var $57=($56|0)==118;
 if($57){label=10;break;}else{label=22;break;}
 case 10:
 $vmode=1;
 $i=0;
 label=11;break;
 case 11:
 var $60=$i;
 var $61=$1;
 var $62=(($61+$60)|0);
 var $63=HEAP8[($62)];
 var $64=(($63<<24)>>24);
 var $65=($64|0)!=0;
 if($65){label=12;break;}else{var $74=0;label=13;break;}
 case 12:
 var $67=$i;
 var $68=$1;
 var $69=(($68+$67)|0);
 var $70=HEAP8[($69)];
 var $71=(($70<<24)>>24);
 var $72=($71|0)!=32;
 var $74=$72;label=13;break;
 case 13:
 var $74;
 if($74){label=14;break;}else{label=16;break;}
 case 14:
 label=15;break;
 case 15:
 var $77=$i;
 var $78=((($77)+(1))|0);
 $i=$78;
 label=11;break;
 case 16:
 var $80=$1;
 var $81=$i;
 var $82=_findsymbol($80,$81);
 $tmp=$82;
 var $83=$i;
 var $84=$1;
 var $85=(($84+$83)|0);
 $1=$85;
 var $86=$tmp;
 var $87=($86|0)==0;
 if($87){label=17;break;}else{label=18;break;}
 case 17:
 var $89=_puts(6440);
 label=65;break;
 case 18:
 var $91=$tmp;
 var $92=(($91+12)|0);
 var $93=HEAP8[($92)];
 var $94=($93&255);
 var $95=$94&32;
 var $96=($95|0)!=0;
 if($96){label=19;break;}else{label=20;break;}
 case 19:
 var $98=$tmp;
 var $99=(($98+8)|0);
 var $100=HEAP32[(($99)>>2)];
 $macstr=$100;
 label=21;break;
 case 20:
 var $102=_puts(6312);
 label=65;break;
 case 21:
 label=22;break;
 case 22:
 var $105=$1;
 var $106=_eval($105,0);
 $sym=$106;
 label=23;break;
 case 23:
 var $108=$sym;
 var $109=($108|0)!=0;
 if($109){label=24;break;}else{label=64;break;}
 case 24:
 var $111=$sym;
 var $112=(($111+16)|0);
 var $113=HEAP32[(($112)>>2)];
 $value=$113;
 var $114=$sym;
 var $115=(($114+12)|0);
 var $116=HEAP8[($115)];
 var $117=($116&255);
 var $118=$117&1;
 var $119=($118|0)!=0;
 if($119){label=25;break;}else{label=26;break;}
 case 25:
 var $121=HEAP32[((1086832)>>2)];
 var $122=((($121)+(1))|0);
 HEAP32[((1086832)>>2)]=$122;
 var $123=HEAP32[((1086808)>>2)];
 var $124=$123|4;
 HEAP32[((1086808)>>2)]=$124;
 label=26;break;
 case 26:
 var $126=$sym;
 var $127=(($126+12)|0);
 var $128=HEAP8[($127)];
 var $129=($128&255);
 var $130=$129&8;
 var $131=($130|0)!=0;
 if($131){label=27;break;}else{label=46;break;}
 case 27:
 var $133=$sym;
 var $134=(($133+8)|0);
 var $135=HEAP32[(($134)>>2)];
 $ptr=$135;
 label=28;break;
 case 28:
 var $137=$ptr;
 var $138=HEAP8[($137)];
 var $139=($138&255);
 $value=$139;
 var $140=($139|0)!=0;
 if($140){label=29;break;}else{label=45;break;}
 case 29:
 var $142=$vmode;
 var $143=(($142<<24)>>24)!=0;
 if($143){label=30;break;}else{label=33;break;}
 case 30:
 var $145=$value;
 _setspecial($145,0);
 var $146=$macstr;
 var $147=_eval($146,0);
 $tmp=$147;
 var $148=$tmp;
 var $149=(($148+16)|0);
 var $150=HEAP32[(($149)>>2)];
 $value=$150;
 var $151=$tmp;
 var $152=(($151+12)|0);
 var $153=HEAP8[($152)];
 var $154=($153&255);
 var $155=$154&1;
 var $156=($155|0)!=0;
 if($156){label=31;break;}else{label=32;break;}
 case 31:
 var $158=HEAP32[((1086832)>>2)];
 var $159=((($158)+(1))|0);
 HEAP32[((1086832)>>2)]=$159;
 var $160=HEAP32[((1086808)>>2)];
 var $161=$160|8;
 HEAP32[((1086808)>>2)]=$161;
 label=32;break;
 case 32:
 var $163=$tmp;
 _FreeSymbolList($163);
 label=33;break;
 case 33:
 var $165=HEAP32[((1087136)>>2)];
 if(($165|0)==3){ label=35;break;}else if(($165|0)==6){ label=36;break;}else if(($165|0)==19){ label=40;break;}else{label=34;break;}
 case 34:
 label=35;break;
 case 35:
 var $168=$value;
 var $169=$168&255;
 var $170=(($169)&255);
 var $171=HEAP32[((1091304)>>2)];
 var $172=((($171)+(1))|0);
 HEAP32[((1091304)>>2)]=$172;
 var $173=((1091312+$171)|0);
 HEAP8[($173)]=$170;
 label=44;break;
 case 36:
 var $175=HEAP8[(15016)];
 var $176=(($175<<24)>>24)!=0;
 if($176){label=37;break;}else{label=38;break;}
 case 37:
 var $178=$value;
 var $179=$178>>>8;
 var $180=$179&255;
 var $181=(($180)&255);
 var $182=HEAP32[((1091304)>>2)];
 var $183=((($182)+(1))|0);
 HEAP32[((1091304)>>2)]=$183;
 var $184=((1091312+$182)|0);
 HEAP8[($184)]=$181;
 var $185=$value;
 var $186=$185&255;
 var $187=(($186)&255);
 var $188=HEAP32[((1091304)>>2)];
 var $189=((($188)+(1))|0);
 HEAP32[((1091304)>>2)]=$189;
 var $190=((1091312+$188)|0);
 HEAP8[($190)]=$187;
 label=39;break;
 case 38:
 var $192=$value;
 var $193=$192&255;
 var $194=(($193)&255);
 var $195=HEAP32[((1091304)>>2)];
 var $196=((($195)+(1))|0);
 HEAP32[((1091304)>>2)]=$196;
 var $197=((1091312+$195)|0);
 HEAP8[($197)]=$194;
 var $198=$value;
 var $199=$198>>>8;
 var $200=$199&255;
 var $201=(($200)&255);
 var $202=HEAP32[((1091304)>>2)];
 var $203=((($202)+(1))|0);
 HEAP32[((1091304)>>2)]=$203;
 var $204=((1091312+$202)|0);
 HEAP8[($204)]=$201;
 label=39;break;
 case 39:
 label=44;break;
 case 40:
 var $207=HEAP8[(15016)];
 var $208=(($207<<24)>>24)!=0;
 if($208){label=41;break;}else{label=42;break;}
 case 41:
 var $210=$value;
 var $211=$210>>>24;
 var $212=$211&255;
 var $213=(($212)&255);
 var $214=HEAP32[((1091304)>>2)];
 var $215=((($214)+(1))|0);
 HEAP32[((1091304)>>2)]=$215;
 var $216=((1091312+$214)|0);
 HEAP8[($216)]=$213;
 var $217=$value;
 var $218=$217>>>16;
 var $219=$218&255;
 var $220=(($219)&255);
 var $221=HEAP32[((1091304)>>2)];
 var $222=((($221)+(1))|0);
 HEAP32[((1091304)>>2)]=$222;
 var $223=((1091312+$221)|0);
 HEAP8[($223)]=$220;
 var $224=$value;
 var $225=$224>>>8;
 var $226=$225&255;
 var $227=(($226)&255);
 var $228=HEAP32[((1091304)>>2)];
 var $229=((($228)+(1))|0);
 HEAP32[((1091304)>>2)]=$229;
 var $230=((1091312+$228)|0);
 HEAP8[($230)]=$227;
 var $231=$value;
 var $232=$231&255;
 var $233=(($232)&255);
 var $234=HEAP32[((1091304)>>2)];
 var $235=((($234)+(1))|0);
 HEAP32[((1091304)>>2)]=$235;
 var $236=((1091312+$234)|0);
 HEAP8[($236)]=$233;
 label=43;break;
 case 42:
 var $238=$value;
 var $239=$238&255;
 var $240=(($239)&255);
 var $241=HEAP32[((1091304)>>2)];
 var $242=((($241)+(1))|0);
 HEAP32[((1091304)>>2)]=$242;
 var $243=((1091312+$241)|0);
 HEAP8[($243)]=$240;
 var $244=$value;
 var $245=$244>>>8;
 var $246=$245&255;
 var $247=(($246)&255);
 var $248=HEAP32[((1091304)>>2)];
 var $249=((($248)+(1))|0);
 HEAP32[((1091304)>>2)]=$249;
 var $250=((1091312+$248)|0);
 HEAP8[($250)]=$247;
 var $251=$value;
 var $252=$251>>>16;
 var $253=$252&255;
 var $254=(($253)&255);
 var $255=HEAP32[((1091304)>>2)];
 var $256=((($255)+(1))|0);
 HEAP32[((1091304)>>2)]=$256;
 var $257=((1091312+$255)|0);
 HEAP8[($257)]=$254;
 var $258=$value;
 var $259=$258>>>24;
 var $260=$259&255;
 var $261=(($260)&255);
 var $262=HEAP32[((1091304)>>2)];
 var $263=((($262)+(1))|0);
 HEAP32[((1091304)>>2)]=$263;
 var $264=((1091312+$262)|0);
 HEAP8[($264)]=$261;
 label=43;break;
 case 43:
 label=44;break;
 case 44:
 var $267=$ptr;
 var $268=(($267+1)|0);
 $ptr=$268;
 label=28;break;
 case 45:
 label=62;break;
 case 46:
 var $271=$vmode;
 var $272=(($271<<24)>>24)!=0;
 if($272){label=47;break;}else{label=50;break;}
 case 47:
 var $274=$value;
 var $275=$sym;
 var $276=(($275+12)|0);
 var $277=HEAP8[($276)];
 var $278=($277&255);
 _setspecial($274,$278);
 var $279=$macstr;
 var $280=_eval($279,0);
 $tmp=$280;
 var $281=$tmp;
 var $282=(($281+16)|0);
 var $283=HEAP32[(($282)>>2)];
 $value=$283;
 var $284=$tmp;
 var $285=(($284+12)|0);
 var $286=HEAP8[($285)];
 var $287=($286&255);
 var $288=$287&1;
 var $289=($288|0)!=0;
 if($289){label=48;break;}else{label=49;break;}
 case 48:
 var $291=HEAP32[((1086832)>>2)];
 var $292=((($291)+(1))|0);
 HEAP32[((1086832)>>2)]=$292;
 var $293=HEAP32[((1086808)>>2)];
 var $294=$293|16;
 HEAP32[((1086808)>>2)]=$294;
 label=49;break;
 case 49:
 var $296=$tmp;
 _FreeSymbolList($296);
 label=50;break;
 case 50:
 var $298=HEAP32[((1087136)>>2)];
 if(($298|0)==3){ label=52;break;}else if(($298|0)==6){ label=53;break;}else if(($298|0)==19){ label=57;break;}else{label=51;break;}
 case 51:
 label=52;break;
 case 52:
 var $301=$value;
 var $302=$301&255;
 var $303=(($302)&255);
 var $304=HEAP32[((1091304)>>2)];
 var $305=((($304)+(1))|0);
 HEAP32[((1091304)>>2)]=$305;
 var $306=((1091312+$304)|0);
 HEAP8[($306)]=$303;
 label=61;break;
 case 53:
 var $308=HEAP8[(15016)];
 var $309=(($308<<24)>>24)!=0;
 if($309){label=54;break;}else{label=55;break;}
 case 54:
 var $311=$value;
 var $312=$311>>>8;
 var $313=$312&255;
 var $314=(($313)&255);
 var $315=HEAP32[((1091304)>>2)];
 var $316=((($315)+(1))|0);
 HEAP32[((1091304)>>2)]=$316;
 var $317=((1091312+$315)|0);
 HEAP8[($317)]=$314;
 var $318=$value;
 var $319=$318&255;
 var $320=(($319)&255);
 var $321=HEAP32[((1091304)>>2)];
 var $322=((($321)+(1))|0);
 HEAP32[((1091304)>>2)]=$322;
 var $323=((1091312+$321)|0);
 HEAP8[($323)]=$320;
 label=56;break;
 case 55:
 var $325=$value;
 var $326=$325&255;
 var $327=(($326)&255);
 var $328=HEAP32[((1091304)>>2)];
 var $329=((($328)+(1))|0);
 HEAP32[((1091304)>>2)]=$329;
 var $330=((1091312+$328)|0);
 HEAP8[($330)]=$327;
 var $331=$value;
 var $332=$331>>>8;
 var $333=$332&255;
 var $334=(($333)&255);
 var $335=HEAP32[((1091304)>>2)];
 var $336=((($335)+(1))|0);
 HEAP32[((1091304)>>2)]=$336;
 var $337=((1091312+$335)|0);
 HEAP8[($337)]=$334;
 label=56;break;
 case 56:
 label=61;break;
 case 57:
 var $340=HEAP8[(15016)];
 var $341=(($340<<24)>>24)!=0;
 if($341){label=58;break;}else{label=59;break;}
 case 58:
 var $343=$value;
 var $344=$343>>>24;
 var $345=$344&255;
 var $346=(($345)&255);
 var $347=HEAP32[((1091304)>>2)];
 var $348=((($347)+(1))|0);
 HEAP32[((1091304)>>2)]=$348;
 var $349=((1091312+$347)|0);
 HEAP8[($349)]=$346;
 var $350=$value;
 var $351=$350>>>16;
 var $352=$351&255;
 var $353=(($352)&255);
 var $354=HEAP32[((1091304)>>2)];
 var $355=((($354)+(1))|0);
 HEAP32[((1091304)>>2)]=$355;
 var $356=((1091312+$354)|0);
 HEAP8[($356)]=$353;
 var $357=$value;
 var $358=$357>>>8;
 var $359=$358&255;
 var $360=(($359)&255);
 var $361=HEAP32[((1091304)>>2)];
 var $362=((($361)+(1))|0);
 HEAP32[((1091304)>>2)]=$362;
 var $363=((1091312+$361)|0);
 HEAP8[($363)]=$360;
 var $364=$value;
 var $365=$364&255;
 var $366=(($365)&255);
 var $367=HEAP32[((1091304)>>2)];
 var $368=((($367)+(1))|0);
 HEAP32[((1091304)>>2)]=$368;
 var $369=((1091312+$367)|0);
 HEAP8[($369)]=$366;
 label=60;break;
 case 59:
 var $371=$value;
 var $372=$371&255;
 var $373=(($372)&255);
 var $374=HEAP32[((1091304)>>2)];
 var $375=((($374)+(1))|0);
 HEAP32[((1091304)>>2)]=$375;
 var $376=((1091312+$374)|0);
 HEAP8[($376)]=$373;
 var $377=$value;
 var $378=$377>>>8;
 var $379=$378&255;
 var $380=(($379)&255);
 var $381=HEAP32[((1091304)>>2)];
 var $382=((($381)+(1))|0);
 HEAP32[((1091304)>>2)]=$382;
 var $383=((1091312+$381)|0);
 HEAP8[($383)]=$380;
 var $384=$value;
 var $385=$384>>>16;
 var $386=$385&255;
 var $387=(($386)&255);
 var $388=HEAP32[((1091304)>>2)];
 var $389=((($388)+(1))|0);
 HEAP32[((1091304)>>2)]=$389;
 var $390=((1091312+$388)|0);
 HEAP8[($390)]=$387;
 var $391=$value;
 var $392=$391>>>24;
 var $393=$392&255;
 var $394=(($393)&255);
 var $395=HEAP32[((1091304)>>2)];
 var $396=((($395)+(1))|0);
 HEAP32[((1091304)>>2)]=$396;
 var $397=((1091312+$395)|0);
 HEAP8[($397)]=$394;
 label=60;break;
 case 60:
 label=61;break;
 case 61:
 label=62;break;
 case 62:
 label=63;break;
 case 63:
 var $402=$sym;
 var $403=(($402)|0);
 var $404=HEAP32[(($403)>>2)];
 $sym=$404;
 label=23;break;
 case 64:
 _generate();
 var $406=$sym;
 _FreeSymbolList($406);
 label=65;break;
 case 65:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_ds($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 var $mult;
 var $filler;
 $1=$str;
 $2=$dummy;
 $mult=1;
 $filler=0;
 var $3=HEAP32[((1087136)>>2)];
 var $4=($3|0)==6;
 if($4){label=2;break;}else{label=3;break;}
 case 2:
 $mult=2;
 label=3;break;
 case 3:
 var $7=HEAP32[((1087136)>>2)];
 var $8=($7|0)==19;
 if($8){label=4;break;}else{label=5;break;}
 case 4:
 $mult=4;
 label=5;break;
 case 5:
 _programlabel();
 var $11=$1;
 var $12=_eval($11,0);
 $sym=$12;
 var $13=($12|0)!=0;
 if($13){label=6;break;}else{label=15;break;}
 case 6:
 var $15=$sym;
 var $16=(($15)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=($17|0)!=0;
 if($18){label=7;break;}else{label=8;break;}
 case 7:
 var $20=$sym;
 var $21=(($20)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=(($22+16)|0);
 var $24=HEAP32[(($23)>>2)];
 $filler=$24;
 label=8;break;
 case 8:
 var $26=$sym;
 var $27=(($26+12)|0);
 var $28=HEAP8[($27)];
 var $29=($28&255);
 var $30=$29&1;
 var $31=($30|0)!=0;
 if($31){label=9;break;}else{label=10;break;}
 case 9:
 var $33=HEAP32[((1086832)>>2)];
 var $34=((($33)+(1))|0);
 HEAP32[((1086832)>>2)]=$34;
 var $35=HEAP32[((1086808)>>2)];
 var $36=$35|32;
 HEAP32[((1086808)>>2)]=$36;
 label=14;break;
 case 10:
 var $38=$sym;
 var $39=(($38)|0);
 var $40=HEAP32[(($39)>>2)];
 var $41=($40|0)!=0;
 if($41){label=11;break;}else{label=13;break;}
 case 11:
 var $43=$sym;
 var $44=(($43)|0);
 var $45=HEAP32[(($44)>>2)];
 var $46=(($45+12)|0);
 var $47=HEAP8[($46)];
 var $48=($47&255);
 var $49=$48&1;
 var $50=($49|0)!=0;
 if($50){label=12;break;}else{label=13;break;}
 case 12:
 var $52=HEAP32[((1086832)>>2)];
 var $53=((($52)+(1))|0);
 HEAP32[((1086832)>>2)]=$53;
 var $54=HEAP32[((1086808)>>2)];
 var $55=$54|32;
 HEAP32[((1086808)>>2)]=$55;
 label=13;break;
 case 13:
 var $57=$filler;
 var $58=$sym;
 var $59=(($58+16)|0);
 var $60=HEAP32[(($59)>>2)];
 var $61=$mult;
 _genfill($57,$60,$61);
 label=14;break;
 case 14:
 var $63=$sym;
 _FreeSymbolList($63);
 label=15;break;
 case 15:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _genfill($fill,$entries,$size){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $bytes;
 var $i;
 var $c3;
 var $c2;
 var $c1;
 var $c0;
 $1=$fill;
 $2=$entries;
 $3=$size;
 var $4=$2;
 $bytes=$4;
 var $5=$bytes;
 var $6=($5|0)!=0;
 if($6){label=3;break;}else{label=2;break;}
 case 2:
 label=26;break;
 case 3:
 var $9=$1;
 var $10=$9>>24;
 var $11=(($10)&255);
 $c3=$11;
 var $12=$1;
 var $13=$12>>16;
 var $14=(($13)&255);
 $c2=$14;
 var $15=$1;
 var $16=$15>>8;
 var $17=(($16)&255);
 $c1=$17;
 var $18=$1;
 var $19=(($18)&255);
 $c0=$19;
 var $20=$3;
 if(($20|0)==4){ label=13;break;}else if(($20|0)==1){ label=4;break;}else if(($20|0)==2){ label=5;break;}else{label=21;break;}
 case 4:
 var $22=$c0;
 var $23=($22&255);
 var $24=(($23)&255);
 _memset(1091312, $24, 256)|0;
 label=21;break;
 case 5:
 var $26=$bytes;
 var $27=$26<<1;
 $bytes=$27;
 $i=0;
 label=6;break;
 case 6:
 var $29=$i;
 var $30=($29>>>0)<256;
 if($30){label=7;break;}else{label=12;break;}
 case 7:
 var $32=HEAP8[(15016)];
 var $33=(($32<<24)>>24)!=0;
 if($33){label=8;break;}else{label=9;break;}
 case 8:
 var $35=$c1;
 var $36=$i;
 var $37=(($36)|0);
 var $38=((1091312+$37)|0);
 HEAP8[($38)]=$35;
 var $39=$c0;
 var $40=$i;
 var $41=((($40)+(1))|0);
 var $42=((1091312+$41)|0);
 HEAP8[($42)]=$39;
 label=10;break;
 case 9:
 var $44=$c0;
 var $45=$i;
 var $46=(($45)|0);
 var $47=((1091312+$46)|0);
 HEAP8[($47)]=$44;
 var $48=$c1;
 var $49=$i;
 var $50=((($49)+(1))|0);
 var $51=((1091312+$50)|0);
 HEAP8[($51)]=$48;
 label=10;break;
 case 10:
 label=11;break;
 case 11:
 var $54=$i;
 var $55=((($54)+(2))|0);
 $i=$55;
 label=6;break;
 case 12:
 label=21;break;
 case 13:
 var $58=$bytes;
 var $59=$58<<2;
 $bytes=$59;
 $i=0;
 label=14;break;
 case 14:
 var $61=$i;
 var $62=($61>>>0)<256;
 if($62){label=15;break;}else{label=20;break;}
 case 15:
 var $64=HEAP8[(15016)];
 var $65=(($64<<24)>>24)!=0;
 if($65){label=16;break;}else{label=17;break;}
 case 16:
 var $67=$c3;
 var $68=$i;
 var $69=(($68)|0);
 var $70=((1091312+$69)|0);
 HEAP8[($70)]=$67;
 var $71=$c2;
 var $72=$i;
 var $73=((($72)+(1))|0);
 var $74=((1091312+$73)|0);
 HEAP8[($74)]=$71;
 var $75=$c1;
 var $76=$i;
 var $77=((($76)+(2))|0);
 var $78=((1091312+$77)|0);
 HEAP8[($78)]=$75;
 var $79=$c0;
 var $80=$i;
 var $81=((($80)+(3))|0);
 var $82=((1091312+$81)|0);
 HEAP8[($82)]=$79;
 label=18;break;
 case 17:
 var $84=$c0;
 var $85=$i;
 var $86=(($85)|0);
 var $87=((1091312+$86)|0);
 HEAP8[($87)]=$84;
 var $88=$c1;
 var $89=$i;
 var $90=((($89)+(1))|0);
 var $91=((1091312+$90)|0);
 HEAP8[($91)]=$88;
 var $92=$c2;
 var $93=$i;
 var $94=((($93)+(2))|0);
 var $95=((1091312+$94)|0);
 HEAP8[($95)]=$92;
 var $96=$c3;
 var $97=$i;
 var $98=((($97)+(3))|0);
 var $99=((1091312+$98)|0);
 HEAP8[($99)]=$96;
 label=18;break;
 case 18:
 label=19;break;
 case 19:
 var $102=$i;
 var $103=((($102)+(4))|0);
 $i=$103;
 label=14;break;
 case 20:
 label=21;break;
 case 21:
 HEAP32[((1091304)>>2)]=256;
 label=22;break;
 case 22:
 var $107=$bytes;
 var $108=($107>>>0)>256;
 if($108){label=23;break;}else{label=25;break;}
 case 23:
 _generate();
 label=24;break;
 case 24:
 var $111=$bytes;
 var $112=((($111)-(256))|0);
 $bytes=$112;
 label=22;break;
 case 25:
 var $114=$bytes;
 HEAP32[((1091304)>>2)]=$114;
 _generate();
 label=26;break;
 case 26:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_org($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 $1=$str;
 $2=$dummy;
 var $3=$1;
 var $4=_eval($3,0);
 $sym=$4;
 var $5=$sym;
 var $6=(($5+16)|0);
 var $7=HEAP32[(($6)>>2)];
 var $8=HEAP32[((1091648)>>2)];
 var $9=(($8+12)|0);
 HEAP32[(($9)>>2)]=$7;
 var $10=$sym;
 var $11=(($10+12)|0);
 var $12=HEAP8[($11)];
 var $13=($12&255);
 var $14=$13&1;
 var $15=($14|0)!=0;
 if($15){label=2;break;}else{label=3;break;}
 case 2:
 var $17=HEAP32[((1091648)>>2)];
 var $18=(($17+8)|0);
 var $19=HEAP8[($18)];
 var $20=($19&255);
 var $21=$20|1;
 var $22=(($21)&255);
 HEAP8[($18)]=$22;
 label=4;break;
 case 3:
 var $24=HEAP32[((1091648)>>2)];
 var $25=(($24+8)|0);
 var $26=HEAP8[($25)];
 var $27=($26&255);
 var $28=$27&-2;
 var $29=(($28)&255);
 HEAP8[($25)]=$29;
 label=4;break;
 case 4:
 var $31=HEAP32[((1091648)>>2)];
 var $32=(($31+28)|0);
 var $33=HEAP8[($32)];
 var $34=($33&255);
 var $35=$34&1;
 var $36=($35|0)!=0;
 if($36){label=5;break;}else{label=6;break;}
 case 5:
 var $38=$sym;
 var $39=(($38+16)|0);
 var $40=HEAP32[(($39)>>2)];
 var $41=HEAP32[((1091648)>>2)];
 var $42=(($41+20)|0);
 HEAP32[(($42)>>2)]=$40;
 var $43=$sym;
 var $44=(($43+12)|0);
 var $45=HEAP8[($44)];
 var $46=HEAP32[((1091648)>>2)];
 var $47=(($46+28)|0);
 HEAP8[($47)]=$45;
 label=6;break;
 case 6:
 var $49=$sym;
 var $50=(($49)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=($51|0)!=0;
 if($52){label=7;break;}else{label=10;break;}
 case 7:
 var $54=$sym;
 var $55=(($54)|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=(($56+16)|0);
 var $58=HEAP32[(($57)>>2)];
 var $59=(($58)&255);
 HEAP8[(10984)]=$59;
 var $60=$sym;
 var $61=(($60)|0);
 var $62=HEAP32[(($61)>>2)];
 var $63=(($62+12)|0);
 var $64=HEAP8[($63)];
 var $65=($64&255);
 var $66=$65&1;
 var $67=($66|0)!=0;
 if($67){label=8;break;}else{label=9;break;}
 case 8:
 var $69=_asmerr(23,1,0);
 label=9;break;
 case 9:
 label=10;break;
 case 10:
 _programlabel();
 var $72=$sym;
 _FreeSymbolList($72);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_rorg($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 $1=$str;
 $2=$dummy;
 var $3=$1;
 var $4=_eval($3,0);
 $sym=$4;
 var $5=HEAP32[((1091648)>>2)];
 var $6=(($5+8)|0);
 var $7=HEAP8[($6)];
 var $8=($7&255);
 var $9=$8|32;
 var $10=(($9)&255);
 HEAP8[($6)]=$10;
 var $11=$sym;
 var $12=(($11+13)|0);
 var $13=HEAP8[($12)];
 var $14=($13&255);
 var $15=($14|0)!=0;
 if($15){label=2;break;}else{label=8;break;}
 case 2:
 var $17=$sym;
 var $18=(($17+16)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=HEAP32[((1091648)>>2)];
 var $21=(($20+16)|0);
 HEAP32[(($21)>>2)]=$19;
 var $22=$sym;
 var $23=(($22+12)|0);
 var $24=HEAP8[($23)];
 var $25=($24&255);
 var $26=$25&1;
 var $27=($26|0)!=0;
 if($27){label=3;break;}else{label=4;break;}
 case 3:
 var $29=HEAP32[((1091648)>>2)];
 var $30=(($29+9)|0);
 var $31=HEAP8[($30)];
 var $32=($31&255);
 var $33=$32|1;
 var $34=(($33)&255);
 HEAP8[($30)]=$34;
 label=5;break;
 case 4:
 var $36=HEAP32[((1091648)>>2)];
 var $37=(($36+9)|0);
 var $38=HEAP8[($37)];
 var $39=($38&255);
 var $40=$39&-2;
 var $41=(($40)&255);
 HEAP8[($37)]=$41;
 label=5;break;
 case 5:
 var $43=HEAP32[((1091648)>>2)];
 var $44=(($43+29)|0);
 var $45=HEAP8[($44)];
 var $46=($45&255);
 var $47=$46&1;
 var $48=($47|0)!=0;
 if($48){label=6;break;}else{label=7;break;}
 case 6:
 var $50=$sym;
 var $51=(($50+16)|0);
 var $52=HEAP32[(($51)>>2)];
 var $53=HEAP32[((1091648)>>2)];
 var $54=(($53+24)|0);
 HEAP32[(($54)>>2)]=$52;
 var $55=$sym;
 var $56=(($55+12)|0);
 var $57=HEAP8[($56)];
 var $58=HEAP32[((1091648)>>2)];
 var $59=(($58+29)|0);
 HEAP8[($59)]=$57;
 label=7;break;
 case 7:
 label=8;break;
 case 8:
 _programlabel();
 var $62=$sym;
 _FreeSymbolList($62);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_rend($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$str;
 $2=$dummy;
 _programlabel();
 var $3=HEAP32[((1091648)>>2)];
 var $4=(($3+8)|0);
 var $5=HEAP8[($4)];
 var $6=($5&255);
 var $7=$6&-33;
 var $8=(($7)&255);
 HEAP8[($4)]=$8;
 STACKTOP=sp;return;
}


function _v_align($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 var $fill;
 var $rorg;
 var $n;
 var $n1;
 $1=$str;
 $2=$dummy;
 var $3=$1;
 var $4=_eval($3,0);
 $sym=$4;
 $fill=0;
 var $5=HEAP32[((1091648)>>2)];
 var $6=(($5+8)|0);
 var $7=HEAP8[($6)];
 var $8=($7&255);
 var $9=$8&32;
 var $10=(($9)&255);
 $rorg=$10;
 var $11=$rorg;
 var $12=(($11<<24)>>24)!=0;
 if($12){label=2;break;}else{label=3;break;}
 case 2:
 var $14=HEAP32[((1091648)>>2)];
 var $15=(($14+9)|0);
 var $16=HEAP8[($15)];
 var $17=($16&255);
 var $18=$17|4;
 var $19=(($18)&255);
 HEAP8[($15)]=$19;
 label=4;break;
 case 3:
 var $21=HEAP32[((1091648)>>2)];
 var $22=(($21+8)|0);
 var $23=HEAP8[($22)];
 var $24=($23&255);
 var $25=$24|4;
 var $26=(($25)&255);
 HEAP8[($22)]=$26;
 label=4;break;
 case 4:
 var $28=$sym;
 var $29=(($28)|0);
 var $30=HEAP32[(($29)>>2)];
 var $31=($30|0)!=0;
 if($31){label=5;break;}else{label=9;break;}
 case 5:
 var $33=$sym;
 var $34=(($33)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=(($35+12)|0);
 var $37=HEAP8[($36)];
 var $38=($37&255);
 var $39=$38&1;
 var $40=($39|0)!=0;
 if($40){label=6;break;}else{label=7;break;}
 case 6:
 var $42=HEAP32[((1086832)>>2)];
 var $43=((($42)+(1))|0);
 HEAP32[((1086832)>>2)]=$43;
 var $44=HEAP32[((1086808)>>2)];
 var $45=$44|64;
 HEAP32[((1086808)>>2)]=$45;
 label=8;break;
 case 7:
 var $47=$sym;
 var $48=(($47)|0);
 var $49=HEAP32[(($48)>>2)];
 var $50=(($49+16)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=(($51)&255);
 $fill=$52;
 label=8;break;
 case 8:
 label=9;break;
 case 9:
 var $55=$rorg;
 var $56=(($55<<24)>>24)!=0;
 if($56){label=10;break;}else{label=16;break;}
 case 10:
 var $58=HEAP32[((1091648)>>2)];
 var $59=(($58+9)|0);
 var $60=HEAP8[($59)];
 var $61=($60&255);
 var $62=$sym;
 var $63=(($62+12)|0);
 var $64=HEAP8[($63)];
 var $65=($64&255);
 var $66=$61|$65;
 var $67=$66&1;
 var $68=($67|0)!=0;
 if($68){label=11;break;}else{label=12;break;}
 case 11:
 var $70=HEAP32[((1086832)>>2)];
 var $71=((($70)+(1))|0);
 HEAP32[((1086832)>>2)]=$71;
 var $72=HEAP32[((1086808)>>2)];
 var $73=$72|128;
 HEAP32[((1086808)>>2)]=$73;
 label=15;break;
 case 12:
 var $75=$sym;
 var $76=(($75+16)|0);
 var $77=HEAP32[(($76)>>2)];
 var $78=HEAP32[((1091648)>>2)];
 var $79=(($78+16)|0);
 var $80=HEAP32[(($79)>>2)];
 var $81=$sym;
 var $82=(($81+16)|0);
 var $83=HEAP32[(($82)>>2)];
 var $84=(((($80>>>0))%(($83>>>0)))&-1);
 var $85=((($77)-($84))|0);
 $n=$85;
 var $86=$n;
 var $87=$sym;
 var $88=(($87+16)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($86|0)!=($89|0);
 if($90){label=13;break;}else{label=14;break;}
 case 13:
 var $92=$fill;
 var $93=($92&255);
 var $94=$n;
 _genfill($93,$94,1);
 label=14;break;
 case 14:
 label=15;break;
 case 15:
 label=22;break;
 case 16:
 var $98=HEAP32[((1091648)>>2)];
 var $99=(($98+8)|0);
 var $100=HEAP8[($99)];
 var $101=($100&255);
 var $102=$sym;
 var $103=(($102+12)|0);
 var $104=HEAP8[($103)];
 var $105=($104&255);
 var $106=$101|$105;
 var $107=$106&1;
 var $108=($107|0)!=0;
 if($108){label=17;break;}else{label=18;break;}
 case 17:
 var $110=HEAP32[((1086832)>>2)];
 var $111=((($110)+(1))|0);
 HEAP32[((1086832)>>2)]=$111;
 var $112=HEAP32[((1086808)>>2)];
 var $113=$112|256;
 HEAP32[((1086808)>>2)]=$113;
 label=21;break;
 case 18:
 var $115=$sym;
 var $116=(($115+16)|0);
 var $117=HEAP32[(($116)>>2)];
 var $118=HEAP32[((1091648)>>2)];
 var $119=(($118+12)|0);
 var $120=HEAP32[(($119)>>2)];
 var $121=$sym;
 var $122=(($121+16)|0);
 var $123=HEAP32[(($122)>>2)];
 var $124=(((($120>>>0))%(($123>>>0)))&-1);
 var $125=((($117)-($124))|0);
 $n1=$125;
 var $126=$n1;
 var $127=$sym;
 var $128=(($127+16)|0);
 var $129=HEAP32[(($128)>>2)];
 var $130=($126|0)!=($129|0);
 if($130){label=19;break;}else{label=20;break;}
 case 19:
 var $132=$fill;
 var $133=($132&255);
 var $134=$n1;
 _genfill($133,$134,1);
 label=20;break;
 case 20:
 label=21;break;
 case 21:
 label=22;break;
 case 22:
 var $138=$sym;
 _FreeSymbolList($138);
 _programlabel();
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_subroutine($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$str;
 $2=$dummy;
 var $3=HEAP32[((1091272)>>2)];
 var $4=((($3)+(1))|0);
 HEAP32[((1091272)>>2)]=$4;
 var $5=HEAP32[((1091272)>>2)];
 HEAP32[((1091248)>>2)]=$5;
 _programlabel();
 STACKTOP=sp;return;
}


function _v_equ($str,$dummy){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 var $lab;
 var $v;
 $1=$str;
 $2=$dummy;
 var $3=$1;
 var $4=_eval($3,0);
 $sym=$4;
 var $5=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $6=_strlen($5);
 var $7=($6|0)==1;
 if($7){label=2;break;}else{label=9;break;}
 case 2:
 var $9=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $10=(($9)|0);
 var $11=HEAP8[($10)];
 var $12=(($11<<24)>>24);
 var $13=($12|0)==46;
 if($13){label=5;break;}else{label=3;break;}
 case 3:
 var $15=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $16=(($15)|0);
 var $17=HEAP8[($16)];
 var $18=(($17<<24)>>24);
 var $19=($18|0)==42;
 if($19){label=4;break;}else{label=9;break;}
 case 4:
 var $21=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $22=(($21)|0);
 HEAP8[($22)]=46;
 if(1){label=5;break;}else{label=9;break;}
 case 5:
 var $24=HEAP32[((1091648)>>2)];
 var $25=(($24+8)|0);
 var $26=HEAP8[($25)];
 var $27=($26&255);
 var $28=$27&32;
 var $29=($28|0)!=0;
 if($29){label=6;break;}else{label=7;break;}
 case 6:
 var $31=$1;
 var $32=$2;
 _v_rorg($31,$32);
 label=8;break;
 case 7:
 var $34=$1;
 var $35=$2;
 _v_org($34,$35);
 label=8;break;
 case 8:
 label=21;break;
 case 9:
 var $38=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $39=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $40=_strlen($39);
 var $41=_findsymbol($38,$40);
 $lab=$41;
 var $42=$lab;
 var $43=($42|0)!=0;
 if($43){label=11;break;}else{label=10;break;}
 case 10:
 var $45=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $46=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $47=_strlen($46);
 var $48=_CreateSymbol($45,$47);
 $lab=$48;
 label=11;break;
 case 11:
 var $50=$lab;
 var $51=(($50+12)|0);
 var $52=HEAP8[($51)];
 var $53=($52&255);
 var $54=$53&1;
 var $55=($54|0)!=0;
 if($55){label=18;break;}else{label=12;break;}
 case 12:
 var $57=$sym;
 var $58=(($57+12)|0);
 var $59=HEAP8[($58)];
 var $60=($59&255);
 var $61=$60&1;
 var $62=($61|0)!=0;
 if($62){label=13;break;}else{label=14;break;}
 case 13:
 var $64=HEAP32[((1086832)>>2)];
 var $65=((($64)+(1))|0);
 HEAP32[((1086832)>>2)]=$65;
 var $66=HEAP32[((1086808)>>2)];
 var $67=$66|512;
 HEAP32[((1086808)>>2)]=$67;
 label=17;break;
 case 14:
 var $69=$lab;
 var $70=(($69+16)|0);
 var $71=HEAP32[(($70)>>2)];
 var $72=$sym;
 var $73=(($72+16)|0);
 var $74=HEAP32[(($73)>>2)];
 var $75=($71|0)!=($74|0);
 if($75){label=15;break;}else{label=16;break;}
 case 15:
 var $77=_asmerr(18,0,0);
 var $78=$lab;
 var $79=(($78+16)|0);
 var $80=HEAP32[(($79)>>2)];
 var $81=$sym;
 var $82=(($81+16)|0);
 var $83=HEAP32[(($82)>>2)];
 var $84=_printf(6192,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$80,HEAP32[(((tempVarArgs)+(8))>>2)]=$83,tempVarArgs)); STACKTOP=tempVarArgs;
 var $85=HEAP32[((1086832)>>2)];
 var $86=((($85)+(1))|0);
 HEAP32[((1086832)>>2)]=$86;
 var $87=HEAP32[((1086808)>>2)];
 var $88=$87|1024;
 HEAP32[((1086808)>>2)]=$88;
 label=16;break;
 case 16:
 label=17;break;
 case 17:
 label=18;break;
 case 18:
 var $92=$sym;
 var $93=(($92+16)|0);
 var $94=HEAP32[(($93)>>2)];
 var $95=$lab;
 var $96=(($95+16)|0);
 HEAP32[(($96)>>2)]=$94;
 var $97=$sym;
 var $98=(($97+12)|0);
 var $99=HEAP8[($98)];
 var $100=($99&255);
 var $101=$100&9;
 var $102=(($101)&255);
 var $103=$lab;
 var $104=(($103+12)|0);
 HEAP8[($104)]=$102;
 var $105=$sym;
 var $106=(($105+8)|0);
 var $107=HEAP32[(($106)>>2)];
 var $108=$lab;
 var $109=(($108+8)|0);
 HEAP32[(($109)>>2)]=$107;
 var $110=$sym;
 var $111=(($110+12)|0);
 var $112=HEAP8[($111)];
 var $113=($112&255);
 var $114=$113&-41;
 var $115=(($114)&255);
 HEAP8[($111)]=$115;
 var $116=$lab;
 var $117=(($116+16)|0);
 var $118=HEAP32[(($117)>>2)];
 $v=$118;
 HEAP32[((1091304)>>2)]=0;
 var $119=$v;
 var $120=($119>>>0)>65535;
 if($120){label=19;break;}else{label=20;break;}
 case 19:
 var $122=$v;
 var $123=$122>>>24;
 var $124=(($123)&255);
 var $125=HEAP32[((1091304)>>2)];
 var $126=((($125)+(1))|0);
 HEAP32[((1091304)>>2)]=$126;
 var $127=((1091312+$125)|0);
 HEAP8[($127)]=$124;
 var $128=$v;
 var $129=$128>>>16;
 var $130=(($129)&255);
 var $131=HEAP32[((1091304)>>2)];
 var $132=((($131)+(1))|0);
 HEAP32[((1091304)>>2)]=$132;
 var $133=((1091312+$131)|0);
 HEAP8[($133)]=$130;
 label=20;break;
 case 20:
 var $135=$v;
 var $136=$135>>>8;
 var $137=(($136)&255);
 var $138=HEAP32[((1091304)>>2)];
 var $139=((($138)+(1))|0);
 HEAP32[((1091304)>>2)]=$139;
 var $140=((1091312+$138)|0);
 HEAP8[($140)]=$137;
 var $141=$v;
 var $142=(($141)&255);
 var $143=HEAP32[((1091304)>>2)];
 var $144=((($143)+(1))|0);
 HEAP32[((1091304)>>2)]=$144;
 var $145=((1091312+$143)|0);
 HEAP8[($145)]=$142;
 var $146=$sym;
 _FreeSymbolList($146);
 label=21;break;
 case 21:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_eqm($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $lab;
 var $len;
 $1=$str;
 $2=$dummy;
 var $3=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $4=_strlen($3);
 $len=$4;
 var $5=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $6=$len;
 var $7=_findsymbol($5,$6);
 $lab=$7;
 var $8=($7|0)!=0;
 if($8){label=2;break;}else{label=5;break;}
 case 2:
 var $10=$lab;
 var $11=(($10+12)|0);
 var $12=HEAP8[($11)];
 var $13=($12&255);
 var $14=$13&8;
 var $15=($14|0)!=0;
 if($15){label=3;break;}else{label=4;break;}
 case 3:
 var $17=$lab;
 var $18=(($17+8)|0);
 var $19=HEAP32[(($18)>>2)];
 _free($19);
 label=4;break;
 case 4:
 label=6;break;
 case 5:
 var $22=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $23=$len;
 var $24=_CreateSymbol($22,$23);
 $lab=$24;
 label=6;break;
 case 6:
 var $26=$lab;
 var $27=(($26+16)|0);
 HEAP32[(($27)>>2)]=0;
 var $28=$lab;
 var $29=(($28+12)|0);
 HEAP8[($29)]=56;
 var $30=$1;
 var $31=_strlen($30);
 var $32=((($31)+(1))|0);
 var $33=_ckmalloc($32);
 var $34=$1;
 var $35=_strcpy($33,$34);
 var $36=$lab;
 var $37=(($36+8)|0);
 HEAP32[(($37)>>2)]=$35;
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_echo($str,$dummy){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+256)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 var $s;
 var $buf=sp;
 $1=$str;
 $2=$dummy;
 var $3=$1;
 var $4=_eval($3,0);
 $sym=$4;
 var $5=$sym;
 $s=$5;
 label=2;break;
 case 2:
 var $7=$s;
 var $8=($7|0)!=0;
 if($8){label=3;break;}else{label=12;break;}
 case 3:
 var $10=$s;
 var $11=(($10+12)|0);
 var $12=HEAP8[($11)];
 var $13=($12&255);
 var $14=$13&1;
 var $15=($14|0)!=0;
 if($15){label=10;break;}else{label=4;break;}
 case 4:
 var $17=$s;
 var $18=(($17+12)|0);
 var $19=HEAP8[($18)];
 var $20=($19&255);
 var $21=$20&40;
 var $22=($21|0)!=0;
 if($22){label=5;break;}else{label=6;break;}
 case 5:
 var $24=(($buf)|0);
 var $25=$s;
 var $26=(($25+8)|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=_sprintf($24,6072,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$27,tempVarArgs)); STACKTOP=tempVarArgs;
 label=7;break;
 case 6:
 var $30=(($buf)|0);
 var $31=$s;
 var $32=(($31+16)|0);
 var $33=HEAP32[(($32)>>2)];
 var $34=_sprintf($30,5984,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$33,tempVarArgs)); STACKTOP=tempVarArgs;
 label=7;break;
 case 7:
 var $36=HEAP32[((1091632)>>2)];
 var $37=($36|0)!=0;
 if($37){label=8;break;}else{label=9;break;}
 case 8:
 var $39=HEAP32[((1091632)>>2)];
 var $40=(($buf)|0);
 var $41=_fprintf($39,5888,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$40,tempVarArgs)); STACKTOP=tempVarArgs;
 label=9;break;
 case 9:
 var $43=_addmsg(5792);
 var $44=(($buf)|0);
 var $45=_addmsg($44);
 label=10;break;
 case 10:
 label=11;break;
 case 11:
 var $48=$s;
 var $49=(($48)|0);
 var $50=HEAP32[(($49)>>2)];
 $s=$50;
 label=2;break;
 case 12:
 var $52=_addmsg(5656);
 var $53=HEAP32[((1091632)>>2)];
 var $54=($53|0)!=0;
 if($54){label=13;break;}else{label=14;break;}
 case 13:
 var $56=HEAP32[((1091632)>>2)];
 var $57=_fputc(10,$56);
 label=14;break;
 case 14:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_set($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 var $lab;
 $1=$str;
 $2=$dummy;
 var $3=$1;
 var $4=_eval($3,0);
 $sym=$4;
 var $5=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $6=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $7=_strlen($6);
 var $8=_findsymbol($5,$7);
 $lab=$8;
 var $9=$lab;
 var $10=($9|0)!=0;
 if($10){label=3;break;}else{label=2;break;}
 case 2:
 var $12=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $13=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 var $14=_strlen($13);
 var $15=_CreateSymbol($12,$14);
 $lab=$15;
 label=3;break;
 case 3:
 var $17=$sym;
 var $18=(($17+16)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$lab;
 var $21=(($20+16)|0);
 HEAP32[(($21)>>2)]=$19;
 var $22=$sym;
 var $23=(($22+12)|0);
 var $24=HEAP8[($23)];
 var $25=($24&255);
 var $26=$25&9;
 var $27=(($26)&255);
 var $28=$lab;
 var $29=(($28+12)|0);
 HEAP8[($29)]=$27;
 var $30=$sym;
 var $31=(($30+8)|0);
 var $32=HEAP32[(($31)>>2)];
 var $33=$lab;
 var $34=(($33+8)|0);
 HEAP32[(($34)>>2)]=$32;
 var $35=$sym;
 var $36=(($35+12)|0);
 var $37=HEAP8[($36)];
 var $38=($37&255);
 var $39=$38&-41;
 var $40=(($39)&255);
 HEAP8[($36)]=$40;
 var $41=$sym;
 _FreeSymbolList($41);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_execmac($str,$mac){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $inc;
 var $base;
 var $psl;
 var $sl;
 var $s1;
 $1=$str;
 $2=$mac;
 _programlabel();
 var $3=HEAP32[((1087144)>>2)];
 var $4=($3|0)==32;
 if($4){label=2;break;}else{label=3;break;}
 case 2:
 var $6=_puts(5504);
 label=20;break;
 case 3:
 var $8=HEAP32[((1087144)>>2)];
 var $9=((($8)+(1))|0);
 HEAP32[((1087144)>>2)]=$9;
 var $10=$1;
 var $11=_strlen($10);
 var $12=((($11)+(4))|0);
 var $13=((($12)+(1))|0);
 var $14=_ckmalloc($13);
 var $15=$14;
 $base=$15;
 var $16=$base;
 var $17=(($16)|0);
 HEAP32[(($17)>>2)]=0;
 var $18=$base;
 var $19=(($18+4)|0);
 var $20=(($19)|0);
 var $21=$1;
 var $22=_strcpy($20,$21);
 var $23=$base;
 var $24=(($23)|0);
 $psl=$24;
 label=4;break;
 case 4:
 var $26=$1;
 var $27=HEAP8[($26)];
 var $28=(($27<<24)>>24);
 var $29=($28|0)!=0;
 if($29){label=5;break;}else{var $36=0;label=6;break;}
 case 5:
 var $31=$1;
 var $32=HEAP8[($31)];
 var $33=(($32<<24)>>24);
 var $34=($33|0)!=10;
 var $36=$34;label=6;break;
 case 6:
 var $36;
 if($36){label=7;break;}else{label=19;break;}
 case 7:
 var $38=$1;
 $s1=$38;
 label=8;break;
 case 8:
 var $40=$1;
 var $41=HEAP8[($40)];
 var $42=(($41<<24)>>24);
 var $43=($42|0)!=0;
 if($43){label=9;break;}else{var $55=0;label=11;break;}
 case 9:
 var $45=$1;
 var $46=HEAP8[($45)];
 var $47=(($46<<24)>>24);
 var $48=($47|0)!=10;
 if($48){label=10;break;}else{var $55=0;label=11;break;}
 case 10:
 var $50=$1;
 var $51=HEAP8[($50)];
 var $52=(($51<<24)>>24);
 var $53=($52|0)!=44;
 var $55=$53;label=11;break;
 case 11:
 var $55;
 if($55){label=12;break;}else{label=13;break;}
 case 12:
 var $57=$1;
 var $58=(($57+1)|0);
 $1=$58;
 label=8;break;
 case 13:
 var $60=$1;
 var $61=$s1;
 var $62=$60;
 var $63=$61;
 var $64=((($62)-($63))|0);
 var $65=((($64)+(5))|0);
 var $66=_ckmalloc($65);
 var $67=$66;
 $sl=$67;
 var $68=$sl;
 var $69=(($68)|0);
 HEAP32[(($69)>>2)]=0;
 var $70=$sl;
 var $71=$psl;
 HEAP32[(($71)>>2)]=$70;
 var $72=$sl;
 var $73=(($72)|0);
 $psl=$73;
 var $74=$sl;
 var $75=(($74+4)|0);
 var $76=$75;
 var $77=$s1;
 var $78=$1;
 var $79=$s1;
 var $80=$78;
 var $81=$79;
 var $82=((($80)-($81))|0);
 assert($82 % 1 === 0);(_memcpy($76, $77, $82)|0);
 var $83=$1;
 var $84=$s1;
 var $85=$83;
 var $86=$84;
 var $87=((($85)-($86))|0);
 var $88=$sl;
 var $89=(($88+4)|0);
 var $90=(($89+$87)|0);
 HEAP8[($90)]=0;
 var $91=$1;
 var $92=HEAP8[($91)];
 var $93=(($92<<24)>>24);
 var $94=($93|0)==44;
 if($94){label=14;break;}else{label=15;break;}
 case 14:
 var $96=$1;
 var $97=(($96+1)|0);
 $1=$97;
 label=15;break;
 case 15:
 label=16;break;
 case 16:
 var $100=$1;
 var $101=HEAP8[($100)];
 var $102=(($101<<24)>>24);
 var $103=($102|0)==32;
 if($103){label=17;break;}else{label=18;break;}
 case 17:
 var $105=$1;
 var $106=(($105+1)|0);
 $1=$106;
 label=16;break;
 case 18:
 label=4;break;
 case 19:
 var $109=_zmalloc(36);
 var $110=$109;
 $inc=$110;
 var $111=HEAP32[((68472)>>2)];
 var $112=$inc;
 var $113=(($112)|0);
 HEAP32[(($113)>>2)]=$111;
 var $114=$2;
 var $115=(($114+8)|0);
 var $116=HEAP32[(($115)>>2)];
 var $117=$inc;
 var $118=(($117+4)|0);
 HEAP32[(($118)>>2)]=$116;
 var $119=HEAP32[((68472)>>2)];
 var $120=(($119+8)|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=$inc;
 var $123=(($122+8)|0);
 HEAP32[(($123)>>2)]=$121;
 var $124=$inc;
 var $125=(($124+12)|0);
 HEAP32[(($125)>>2)]=0;
 var $126=$inc;
 var $127=(($126+16)|0);
 HEAP8[($127)]=1;
 var $128=HEAP32[((1091248)>>2)];
 var $129=$inc;
 var $130=(($129+28)|0);
 HEAP32[(($130)>>2)]=$128;
 var $131=HEAP32[((1091256)>>2)];
 var $132=$inc;
 var $133=(($132+32)|0);
 HEAP32[(($133)>>2)]=$131;
 var $134=$2;
 var $135=(($134+16)|0);
 var $136=HEAP32[(($135)>>2)];
 var $137=$inc;
 var $138=(($137+24)|0);
 HEAP32[(($138)>>2)]=$136;
 var $139=$base;
 var $140=$inc;
 var $141=(($140+20)|0);
 HEAP32[(($141)>>2)]=$139;
 var $142=$inc;
 HEAP32[((68472)>>2)]=$142;
 var $143=HEAP32[((1091272)>>2)];
 var $144=((($143)+(1))|0);
 HEAP32[((1091272)>>2)]=$144;
 var $145=HEAP32[((1091272)>>2)];
 HEAP32[((1091248)>>2)]=$145;
 var $146=HEAP32[((1091280)>>2)];
 var $147=((($146)+(1))|0);
 HEAP32[((1091280)>>2)]=$147;
 var $148=HEAP32[((1091280)>>2)];
 HEAP32[((1091256)>>2)]=$148;
 label=20;break;
 case 20:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_end($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 $1=$str;
 $2=$dummy;
 label=2;break;
 case 2:
 var $4=HEAP32[((68472)>>2)];
 var $5=(($4+16)|0);
 var $6=HEAP8[($5)];
 var $7=($6&255);
 var $8=$7&1;
 var $9=($8|0)!=0;
 if($9){label=3;break;}else{label=4;break;}
 case 3:
 _v_endm(0,0);
 label=2;break;
 case 4:
 var $12=HEAP32[((68472)>>2)];
 var $13=(($12+8)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=_fseek($14,0,2);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_endm($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $inc;
 var $args;
 var $an;
 $1=$str;
 $2=$dummy;
 var $3=HEAP32[((68472)>>2)];
 $inc=$3;
 var $4=$inc;
 var $5=(($4+16)|0);
 var $6=HEAP8[($5)];
 var $7=($6&255);
 var $8=$7&1;
 var $9=($8|0)!=0;
 if($9){label=2;break;}else{label=7;break;}
 case 2:
 var $11=HEAP32[((1087144)>>2)];
 var $12=((($11)-(1))|0);
 HEAP32[((1087144)>>2)]=$12;
 var $13=$inc;
 var $14=(($13+20)|0);
 var $15=HEAP32[(($14)>>2)];
 $args=$15;
 label=3;break;
 case 3:
 var $17=$args;
 var $18=($17|0)!=0;
 if($18){label=4;break;}else{label=6;break;}
 case 4:
 var $20=$args;
 var $21=(($20)|0);
 var $22=HEAP32[(($21)>>2)];
 $an=$22;
 var $23=$args;
 var $24=$23;
 _free($24);
 label=5;break;
 case 5:
 var $26=$an;
 $args=$26;
 label=3;break;
 case 6:
 var $28=$inc;
 var $29=(($28+28)|0);
 var $30=HEAP32[(($29)>>2)];
 HEAP32[((1091248)>>2)]=$30;
 var $31=$inc;
 var $32=(($31+32)|0);
 var $33=HEAP32[(($32)>>2)];
 HEAP32[((1091256)>>2)]=$33;
 var $34=$inc;
 var $35=(($34)|0);
 var $36=HEAP32[(($35)>>2)];
 HEAP32[((68472)>>2)]=$36;
 var $37=$inc;
 var $38=$37;
 _free($38);
 label=8;break;
 case 7:
 var $40=_puts(5408);
 label=8;break;
 case 8:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_mexit($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$str;
 $2=$dummy;
 _v_endm(0,0);
 STACKTOP=sp;return;
}


function _v_ifconst($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $sym;
 $1=$str;
 $2=$dummy;
 _programlabel();
 var $3=$1;
 var $4=_eval($3,0);
 $sym=$4;
 var $5=$sym;
 var $6=(($5+12)|0);
 var $7=HEAP8[($6)];
 var $8=($7&255);
 var $9=($8|0)==0;
 _pushif($9);
 var $10=$sym;
 _FreeSymbolList($10);
 STACKTOP=sp;return;
}


function _pushif($xbool){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $ifs;
 var $2=($xbool&1);
 $1=$2;
 var $3=_zmalloc(12);
 var $4=$3;
 $ifs=$4;
 var $5=HEAP32[((1091296)>>2)];
 var $6=$ifs;
 var $7=(($6)|0);
 HEAP32[(($7)>>2)]=$5;
 var $8=HEAP32[((68472)>>2)];
 var $9=$ifs;
 var $10=(($9+4)|0);
 HEAP32[(($10)>>2)]=$8;
 var $11=$ifs;
 var $12=(($11+8)|0);
 HEAP8[($12)]=0;
 var $13=$1;
 var $14=(($13)&1);
 var $15=($14&1);
 var $16=$ifs;
 var $17=(($16+9)|0);
 HEAP8[($17)]=$15;
 var $18=HEAP32[((1091296)>>2)];
 var $19=(($18+10)|0);
 var $20=HEAP8[($19)];
 var $21=($20&255);
 var $22=($21|0)!=0;
 if($22){label=2;break;}else{var $30=0;label=3;break;}
 case 2:
 var $24=HEAP32[((1091296)>>2)];
 var $25=(($24+9)|0);
 var $26=HEAP8[($25)];
 var $27=($26&255);
 var $28=($27|0)!=0;
 var $30=$28;label=3;break;
 case 3:
 var $30;
 var $31=($30&1);
 var $32=(($31)&255);
 var $33=$ifs;
 var $34=(($33+10)|0);
 HEAP8[($34)]=$32;
 var $35=$ifs;
 HEAP32[((1091296)>>2)]=$35;
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_ifnconst($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $sym;
 $1=$str;
 $2=$dummy;
 _programlabel();
 var $3=$1;
 var $4=_eval($3,0);
 $sym=$4;
 var $5=$sym;
 var $6=(($5+12)|0);
 var $7=HEAP8[($6)];
 var $8=($7&255);
 var $9=($8|0)!=0;
 _pushif($9);
 var $10=$sym;
 _FreeSymbolList($10);
 STACKTOP=sp;return;
}


function _v_if($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 $1=$str;
 $2=$dummy;
 var $3=HEAP32[((1091296)>>2)];
 var $4=(($3+9)|0);
 var $5=HEAP8[($4)];
 var $6=(($5<<24)>>24)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=HEAP32[((1091296)>>2)];
 var $9=(($8+10)|0);
 var $10=HEAP8[($9)];
 var $11=(($10<<24)>>24)!=0;
 if($11){label=4;break;}else{label=3;break;}
 case 3:
 _pushif(0);
 label=8;break;
 case 4:
 _programlabel();
 var $14=$1;
 var $15=_eval($14,0);
 $sym=$15;
 var $16=$sym;
 var $17=(($16+12)|0);
 var $18=HEAP8[($17)];
 var $19=(($18<<24)>>24)!=0;
 if($19){label=5;break;}else{label=6;break;}
 case 5:
 var $21=HEAP32[((1086832)>>2)];
 var $22=((($21)+(1))|0);
 HEAP32[((1086832)>>2)]=$22;
 var $23=HEAP32[((1086808)>>2)];
 var $24=$23|2048;
 HEAP32[((1086808)>>2)]=$24;
 _pushif(0);
 var $25=HEAP32[((1091296)>>2)];
 var $26=(($25+10)|0);
 HEAP8[($26)]=0;
 var $27=HEAP32[((1086816)>>2)];
 var $28=$27|1;
 HEAP32[((1086816)>>2)]=$28;
 label=7;break;
 case 6:
 var $30=$sym;
 var $31=(($30+16)|0);
 var $32=HEAP32[(($31)>>2)];
 var $33=($32|0)!=0;
 var $34=$33^1;
 var $35=$34^1;
 _pushif($35);
 label=7;break;
 case 7:
 var $37=$sym;
 _FreeSymbolList($37);
 label=8;break;
 case 8:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_else($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 $1=$str;
 $2=$dummy;
 var $3=HEAP32[((1091296)>>2)];
 var $4=(($3+10)|0);
 var $5=HEAP8[($4)];
 var $6=($5&255);
 var $7=($6|0)!=0;
 if($7){label=2;break;}else{label=4;break;}
 case 2:
 var $9=HEAP32[((1091296)>>2)];
 var $10=(($9+8)|0);
 var $11=HEAP8[($10)];
 var $12=($11&255);
 var $13=$12&4;
 var $14=($13|0)!=0;
 if($14){label=4;break;}else{label=3;break;}
 case 3:
 _programlabel();
 var $16=HEAP32[((1091296)>>2)];
 var $17=(($16+9)|0);
 var $18=HEAP8[($17)];
 var $19=(($18<<24)>>24)!=0;
 var $20=$19^1;
 var $21=($20&1);
 var $22=(($21)&255);
 var $23=HEAP32[((1091296)>>2)];
 var $24=(($23+9)|0);
 HEAP8[($24)]=$22;
 label=4;break;
 case 4:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_endif($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $ifs;
 $1=$str;
 $2=$dummy;
 var $3=HEAP32[((1091296)>>2)];
 $ifs=$3;
 var $4=$ifs;
 var $5=(($4+8)|0);
 var $6=HEAP8[($5)];
 var $7=($6&255);
 var $8=$7&4;
 var $9=($8|0)!=0;
 if($9){label=8;break;}else{label=2;break;}
 case 2:
 var $11=$ifs;
 var $12=(($11+10)|0);
 var $13=HEAP8[($12)];
 var $14=(($13<<24)>>24)!=0;
 if($14){label=3;break;}else{label=4;break;}
 case 3:
 _programlabel();
 label=4;break;
 case 4:
 var $17=$ifs;
 var $18=(($17+4)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=HEAP32[((68472)>>2)];
 var $21=($19|0)!=($20|0);
 if($21){label=5;break;}else{label=6;break;}
 case 5:
 var $23=_puts(5312);
 label=7;break;
 case 6:
 var $25=$ifs;
 var $26=(($25)|0);
 var $27=HEAP32[(($26)>>2)];
 HEAP32[((1091296)>>2)]=$27;
 var $28=$ifs;
 var $29=$28;
 _free($29);
 label=7;break;
 case 7:
 label=8;break;
 case 8:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_repeat($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $rp;
 var $sym;
 $1=$str;
 $2=$dummy;
 var $3=HEAP32[((1091296)>>2)];
 var $4=(($3+9)|0);
 var $5=HEAP8[($4)];
 var $6=(($5<<24)>>24)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=HEAP32[((1091296)>>2)];
 var $9=(($8+10)|0);
 var $10=HEAP8[($9)];
 var $11=(($10<<24)>>24)!=0;
 if($11){label=4;break;}else{label=3;break;}
 case 3:
 _pushif(0);
 label=14;break;
 case 4:
 _programlabel();
 var $14=$1;
 var $15=_eval($14,0);
 $sym=$15;
 var $16=$sym;
 var $17=(($16+16)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=($18|0)==0;
 if($19){label=5;break;}else{label=6;break;}
 case 5:
 _pushif(0);
 var $21=$sym;
 _FreeSymbolList($21);
 label=14;break;
 case 6:
 var $23=$sym;
 var $24=(($23+16)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=($25|0)<0;
 if($26){label=7;break;}else{label=8;break;}
 case 7:
 _pushif(0);
 var $28=$sym;
 _FreeSymbolList($28);
 var $29=_asmerr(25,0,0);
 label=14;break;
 case 8:
 var $31=_zmalloc(24);
 var $32=$31;
 $rp=$32;
 var $33=HEAP32[((1086800)>>2)];
 var $34=$rp;
 var $35=(($34)|0);
 HEAP32[(($35)>>2)]=$33;
 var $36=HEAP32[((68472)>>2)];
 var $37=$rp;
 var $38=(($37+16)|0);
 HEAP32[(($38)>>2)]=$36;
 var $39=HEAP32[((68472)>>2)];
 var $40=(($39+16)|0);
 var $41=HEAP8[($40)];
 var $42=($41&255);
 var $43=$42&1;
 var $44=($43|0)!=0;
 if($44){label=9;break;}else{label=10;break;}
 case 9:
 var $46=HEAP32[((68472)>>2)];
 var $47=(($46+24)|0);
 var $48=HEAP32[(($47)>>2)];
 var $49=$48;
 var $50=$rp;
 var $51=(($50+8)|0);
 HEAP32[(($51)>>2)]=$49;
 label=11;break;
 case 10:
 var $53=HEAP32[((68472)>>2)];
 var $54=(($53+8)|0);
 var $55=HEAP32[(($54)>>2)];
 var $56=_ftell($55);
 var $57=$rp;
 var $58=(($57+8)|0);
 HEAP32[(($58)>>2)]=$56;
 label=11;break;
 case 11:
 var $60=HEAP32[((68472)>>2)];
 var $61=(($60+12)|0);
 var $62=HEAP32[(($61)>>2)];
 var $63=$rp;
 var $64=(($63+12)|0);
 HEAP32[(($64)>>2)]=$62;
 var $65=$sym;
 var $66=(($65+16)|0);
 var $67=HEAP32[(($66)>>2)];
 var $68=$rp;
 var $69=(($68+4)|0);
 HEAP32[(($69)>>2)]=$67;
 var $70=$sym;
 var $71=(($70+12)|0);
 var $72=HEAP8[($71)];
 var $73=$rp;
 var $74=(($73+20)|0);
 HEAP8[($74)]=$72;
 var $75=($72&255);
 var $76=($75|0)!=0;
 if($76){label=12;break;}else{label=13;break;}
 case 12:
 var $78=HEAP32[((1086832)>>2)];
 var $79=((($78)+(1))|0);
 HEAP32[((1086832)>>2)]=$79;
 var $80=HEAP32[((1086808)>>2)];
 var $81=$80|4096;
 HEAP32[((1086808)>>2)]=$81;
 label=13;break;
 case 13:
 var $83=$rp;
 HEAP32[((1086800)>>2)]=$83;
 var $84=$sym;
 _FreeSymbolList($84);
 _pushif(1);
 label=14;break;
 case 14:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_repend($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 $1=$str;
 $2=$dummy;
 var $3=HEAP32[((1091296)>>2)];
 var $4=(($3+9)|0);
 var $5=HEAP8[($4)];
 var $6=(($5<<24)>>24)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=HEAP32[((1091296)>>2)];
 var $9=(($8+10)|0);
 var $10=HEAP8[($9)];
 var $11=(($10<<24)>>24)!=0;
 if($11){label=4;break;}else{label=3;break;}
 case 3:
 _v_endif(0,0);
 label=15;break;
 case 4:
 var $14=HEAP32[((1086800)>>2)];
 var $15=($14|0)!=0;
 if($15){label=5;break;}else{label=14;break;}
 case 5:
 var $17=HEAP32[((1086800)>>2)];
 var $18=(($17+16)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=HEAP32[((68472)>>2)];
 var $21=($19|0)==($20|0);
 if($21){label=6;break;}else{label=14;break;}
 case 6:
 var $23=HEAP32[((1086800)>>2)];
 var $24=(($23+20)|0);
 var $25=HEAP8[($24)];
 var $26=($25&255);
 var $27=($26|0)==0;
 if($27){label=7;break;}else{label=12;break;}
 case 7:
 var $29=HEAP32[((1086800)>>2)];
 var $30=(($29+4)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=((($31)-(1))|0);
 HEAP32[(($30)>>2)]=$32;
 var $33=($32|0)!=0;
 if($33){label=8;break;}else{label=12;break;}
 case 8:
 var $35=HEAP32[((68472)>>2)];
 var $36=(($35+16)|0);
 var $37=HEAP8[($36)];
 var $38=($37&255);
 var $39=$38&1;
 var $40=($39|0)!=0;
 if($40){label=9;break;}else{label=10;break;}
 case 9:
 var $42=HEAP32[((1086800)>>2)];
 var $43=(($42+8)|0);
 var $44=HEAP32[(($43)>>2)];
 var $45=$44;
 var $46=HEAP32[((68472)>>2)];
 var $47=(($46+24)|0);
 HEAP32[(($47)>>2)]=$45;
 label=11;break;
 case 10:
 var $49=HEAP32[((68472)>>2)];
 var $50=(($49+8)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=HEAP32[((1086800)>>2)];
 var $53=(($52+8)|0);
 var $54=HEAP32[(($53)>>2)];
 var $55=_fseek($51,$54,0);
 label=11;break;
 case 11:
 var $57=HEAP32[((1086800)>>2)];
 var $58=(($57+12)|0);
 var $59=HEAP32[(($58)>>2)];
 var $60=HEAP32[((68472)>>2)];
 var $61=(($60+12)|0);
 HEAP32[(($61)>>2)]=$59;
 label=13;break;
 case 12:
 _rmnode(1086800,24);
 _v_endif(0,0);
 label=13;break;
 case 13:
 label=15;break;
 case 14:
 var $65=_puts(5232);
 label=15;break;
 case 15:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_incdir($str,$dummy){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $tail;
 var $buf;
 var $found;
 var $newdir;
 $1=$str;
 $2=$dummy;
 $found=0;
 var $3=$1;
 var $4=_getfilename($3);
 $buf=$4;
 $tail=80640;
 label=2;break;
 case 2:
 var $6=$tail;
 var $7=HEAP32[(($6)>>2)];
 var $8=($7|0)!=0;
 if($8){label=3;break;}else{label=7;break;}
 case 3:
 var $10=$tail;
 var $11=HEAP32[(($10)>>2)];
 var $12=(($11+4)|0);
 var $13=(($12)|0);
 var $14=$buf;
 var $15=_strcmp($13,$14);
 var $16=($15|0)==0;
 if($16){label=4;break;}else{label=5;break;}
 case 4:
 $found=1;
 label=5;break;
 case 5:
 label=6;break;
 case 6:
 var $20=$tail;
 var $21=HEAP32[(($20)>>2)];
 var $22=(($21)|0);
 $tail=$22;
 label=2;break;
 case 7:
 var $24=$found;
 var $25=($24|0)!=0;
 if($25){label=9;break;}else{label=8;break;}
 case 8:
 var $27=$buf;
 var $28=_strlen($27);
 var $29=((($28)+(5))|0);
 var $30=_permalloc($29);
 var $31=$30;
 $newdir=$31;
 var $32=$newdir;
 var $33=(($32+4)|0);
 var $34=(($33)|0);
 var $35=$buf;
 var $36=_strcpy($34,$35);
 var $37=$newdir;
 var $38=$tail;
 HEAP32[(($38)>>2)]=$37;
 label=9;break;
 case 9:
 var $40=$buf;
 var $41=$1;
 var $42=($40|0)!=($41|0);
 if($42){label=10;break;}else{label=11;break;}
 case 10:
 var $44=$buf;
 _free($44);
 label=11;break;
 case 11:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _closegenerate(){
 var label=0;

 label = 1;
 while(1)switch(label){
 case 1:
 var $1=HEAP32[((1086832)>>2)];
 var $2=($1|0)!=0;
 if($2){label=5;break;}else{label=2;break;}
 case 2:
 var $4=HEAP32[((67248)>>2)];
 var $5=($4|0)==2;
 if($5){label=3;break;}else{label=4;break;}
 case 3:
 var $7=HEAP32[((1091624)>>2)];
 var $8=HEAP32[((1082696)>>2)];
 var $9=_fseek($7,$8,0);
 var $10=HEAP32[((1082688)>>2)];
 var $11=$10&255;
 var $12=HEAP32[((1091624)>>2)];
 var $13=_fputc($11,$12);
 var $14=HEAP32[((1082688)>>2)];
 var $15=$14>>8;
 var $16=$15&255;
 var $17=HEAP32[((1091624)>>2)];
 var $18=_fputc($16,$17);
 var $19=HEAP32[((1091624)>>2)];
 var $20=_fseek($19,0,2);
 label=4;break;
 case 4:
 label=5;break;
 case 5:
 return;
  default: assert(0, "bad label: " + label);
 }

}


function _getfilename($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $buf;
 $2=$str;
 var $3=$2;
 var $4=HEAP8[($3)];
 var $5=(($4<<24)>>24);
 var $6=($5|0)==34;
 if($6){label=2;break;}else{label=9;break;}
 case 2:
 var $8=$2;
 var $9=(($8+1)|0);
 $2=$9;
 var $10=$2;
 var $11=_strlen($10);
 var $12=((($11)+(1))|0);
 var $13=_ckmalloc($12);
 $buf=$13;
 var $14=$buf;
 var $15=$2;
 var $16=_strcpy($14,$15);
 var $17=$buf;
 $2=$17;
 label=3;break;
 case 3:
 var $19=$2;
 var $20=HEAP8[($19)];
 var $21=(($20<<24)>>24);
 var $22=($21|0)!=0;
 if($22){label=4;break;}else{var $29=0;label=5;break;}
 case 4:
 var $24=$2;
 var $25=HEAP8[($24)];
 var $26=(($25<<24)>>24);
 var $27=($26|0)!=34;
 var $29=$27;label=5;break;
 case 5:
 var $29;
 if($29){label=6;break;}else{label=8;break;}
 case 6:
 label=7;break;
 case 7:
 var $32=$2;
 var $33=(($32+1)|0);
 $2=$33;
 label=3;break;
 case 8:
 var $35=$2;
 HEAP8[($35)]=0;
 var $36=$buf;
 $1=$36;
 label=10;break;
 case 9:
 var $38=$2;
 $1=$38;
 label=10;break;
 case 10:
 var $40=$1;
 STACKTOP=sp;return $40;
  default: assert(0, "bad label: " + label);
 }

}


function _addpart($dest,$dir,$file){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $pos;
 $1=$dest;
 $2=$dir;
 $3=$file;
 var $4=$1;
 var $5=$2;
 var $6=_strcpy($4,$5);
 var $7=$1;
 var $8=_strlen($7);
 $pos=$8;
 var $9=$pos;
 var $10=($9|0)>0;
 if($10){label=2;break;}else{label=5;break;}
 case 2:
 var $12=$pos;
 var $13=((($12)-(1))|0);
 var $14=$1;
 var $15=(($14+$13)|0);
 var $16=HEAP8[($15)];
 var $17=(($16<<24)>>24);
 var $18=($17|0)!=58;
 if($18){label=3;break;}else{label=5;break;}
 case 3:
 var $20=$pos;
 var $21=((($20)-(1))|0);
 var $22=$1;
 var $23=(($22+$21)|0);
 var $24=HEAP8[($23)];
 var $25=(($24<<24)>>24);
 var $26=($25|0)!=47;
 if($26){label=4;break;}else{label=5;break;}
 case 4:
 var $28=$pos;
 var $29=$1;
 var $30=(($29+$28)|0);
 HEAP8[($30)]=47;
 var $31=$pos;
 var $32=((($31)+(1))|0);
 $pos=$32;
 label=5;break;
 case 5:
 var $34=$1;
 var $35=$pos;
 var $36=(($34+$35)|0);
 var $37=$3;
 var $38=_strcpy($36,$37);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _eval($str,$wantmode){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+288)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $base;
 var $cur;
 var $oldargibase;
 var $oldopibase;
 var $scr;
 var $pLine;
 var $sBuffer=sp;
 var $buf=(sp)+(128);
 var $sBuffer1=(sp)+(160);
 var $pNewSymbol;
 var $dol;
 $1=$str;
 $2=$wantmode;
 var $3=HEAP32[((1093712)>>2)];
 $oldargibase=$3;
 var $4=HEAP32[((1086992)>>2)];
 $oldopibase=$4;
 var $5=$1;
 $pLine=$5;
 var $6=HEAP32[((1093720)>>2)];
 HEAP32[((1093712)>>2)]=$6;
 var $7=HEAP32[((1087000)>>2)];
 HEAP32[((1086992)>>2)]=$7;
 HEAP32[((1091264)>>2)]=1;
 var $8=_allocsymbol();
 $cur=$8;
 $base=$8;
 label=2;break;
 case 2:
 var $10=$1;
 var $11=HEAP8[($10)];
 var $12=(($11<<24)>>24)!=0;
 if($12){label=3;break;}else{label=155;break;}
 case 3:
 var $14=HEAP8[(1082664)];
 var $15=(($14)&1);
 if($15){label=4;break;}else{label=5;break;}
 case 4:
 var $17=$1;
 var $18=HEAP8[($17)];
 var $19=(($18<<24)>>24);
 var $20=_printf(5768,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$19,tempVarArgs)); STACKTOP=tempVarArgs;
 label=5;break;
 case 5:
 var $22=$1;
 var $23=HEAP8[($22)];
 var $24=(($23<<24)>>24);
 switch(($24|0)){case 42:{ label=11;break;}case 36:{ label=136;break;}case 39:{ label=137;break;}case 34:{ label=138;break;}case 47:{ label=15;break;}case 37:{ label=16;break;}case 63:{ label=20;break;}case 43:{ label=21;break;}case 45:{ label=22;break;}case 62:{ label=26;break;}case 60:{ label=35;break;}case 61:{ label=44;break;}case 33:{ label=47;break;}case 38:{ label=51;break;}case 94:{ label=55;break;}case 124:{ label=56;break;}case 32:case 10:{ label=6;break;}case 40:{ label=60;break;}case 91:{ label=63;break;}case 41:{ label=67;break;}case 126:{ label=7;break;}case 93:{ label=78;break;}case 35:{ label=92;break;}case 44:{ label=93;break;}default:{label=139;break;}}break;
 case 6:
 var $26=$1;
 var $27=(($26+1)|0);
 $1=$27;
 label=154;break;
 case 7:
 var $29=HEAP32[((1091264)>>2)];
 var $30=($29|0)!=0;
 if($30){label=8;break;}else{label=9;break;}
 case 8:
 _doop((116),128);
 label=10;break;
 case 9:
 var $33=$pLine;
 var $34=_asmerr(5,0,$33);
 label=10;break;
 case 10:
 var $36=$1;
 var $37=(($36+1)|0);
 $1=$37;
 label=154;break;
 case 11:
 var $39=HEAP32[((1091264)>>2)];
 var $40=($39|0)!=0;
 if($40){label=12;break;}else{label=13;break;}
 case 12:
 var $42=_pushsymbol(8816);
 label=14;break;
 case 13:
 _doop((40),20);
 label=14;break;
 case 14:
 var $45=$1;
 var $46=(($45+1)|0);
 $1=$46;
 label=154;break;
 case 15:
 _doop((68),20);
 var $48=$1;
 var $49=(($48+1)|0);
 $1=$49;
 label=154;break;
 case 16:
 var $51=HEAP32[((1091264)>>2)];
 var $52=($51|0)!=0;
 if($52){label=17;break;}else{label=18;break;}
 case 17:
 var $54=$1;
 var $55=(($54+1)|0);
 var $56=_pushbin($55);
 $1=$56;
 label=19;break;
 case 18:
 _doop((88),20);
 var $58=$1;
 var $59=(($58+1)|0);
 $1=$59;
 label=19;break;
 case 19:
 label=154;break;
 case 20:
 _doop((52),10);
 var $62=$1;
 var $63=(($62+1)|0);
 $1=$63;
 label=154;break;
 case 21:
 _doop((108),19);
 var $65=$1;
 var $66=(($65+1)|0);
 $1=$66;
 label=154;break;
 case 22:
 var $68=HEAP32[((1091264)>>2)];
 var $69=($68|0)!=0;
 if($69){label=23;break;}else{label=24;break;}
 case 23:
 _doop((82),128);
 label=25;break;
 case 24:
 _doop((106),19);
 label=25;break;
 case 25:
 var $73=$1;
 var $74=(($73+1)|0);
 $1=$74;
 label=154;break;
 case 26:
 var $76=HEAP32[((1091264)>>2)];
 var $77=($76|0)!=0;
 if($77){label=27;break;}else{label=28;break;}
 case 27:
 _doop((46),128);
 var $79=$1;
 var $80=(($79+1)|0);
 $1=$80;
 label=154;break;
 case 28:
 var $82=$1;
 var $83=(($82+1)|0);
 var $84=HEAP8[($83)];
 var $85=(($84<<24)>>24);
 var $86=($85|0)==62;
 if($86){label=29;break;}else{label=30;break;}
 case 29:
 _doop((38),18);
 var $88=$1;
 var $89=(($88+1)|0);
 $1=$89;
 label=34;break;
 case 30:
 var $91=$1;
 var $92=(($91+1)|0);
 var $93=HEAP8[($92)];
 var $94=(($93<<24)>>24);
 var $95=($94|0)==61;
 if($95){label=31;break;}else{label=32;break;}
 case 31:
 _doop((66),17);
 var $97=$1;
 var $98=(($97+1)|0);
 $1=$98;
 label=33;break;
 case 32:
 _doop((76),17);
 label=33;break;
 case 33:
 label=34;break;
 case 34:
 var $102=$1;
 var $103=(($102+1)|0);
 $1=$103;
 label=154;break;
 case 35:
 var $105=HEAP32[((1091264)>>2)];
 var $106=($105|0)!=0;
 if($106){label=36;break;}else{label=37;break;}
 case 36:
 _doop((56),128);
 var $108=$1;
 var $109=(($108+1)|0);
 $1=$109;
 label=154;break;
 case 37:
 var $111=$1;
 var $112=(($111+1)|0);
 var $113=HEAP8[($112)];
 var $114=(($113<<24)>>24);
 var $115=($114|0)==60;
 if($115){label=38;break;}else{label=39;break;}
 case 38:
 _doop((60),18);
 var $117=$1;
 var $118=(($117+1)|0);
 $1=$118;
 label=43;break;
 case 39:
 var $120=$1;
 var $121=(($120+1)|0);
 var $122=HEAP8[($121)];
 var $123=(($122<<24)>>24);
 var $124=($123|0)==61;
 if($124){label=40;break;}else{label=41;break;}
 case 40:
 _doop((36),17);
 var $126=$1;
 var $127=(($126+1)|0);
 $1=$127;
 label=42;break;
 case 41:
 _doop((16),17);
 label=42;break;
 case 42:
 label=43;break;
 case 43:
 var $131=$1;
 var $132=(($131+1)|0);
 $1=$132;
 label=154;break;
 case 44:
 var $134=$1;
 var $135=(($134+1)|0);
 var $136=HEAP8[($135)];
 var $137=(($136<<24)>>24);
 var $138=($137|0)==61;
 if($138){label=45;break;}else{label=46;break;}
 case 45:
 var $140=$1;
 var $141=(($140+1)|0);
 $1=$141;
 label=46;break;
 case 46:
 _doop((42),16);
 var $143=$1;
 var $144=(($143+1)|0);
 $1=$144;
 label=154;break;
 case 47:
 var $146=HEAP32[((1091264)>>2)];
 var $147=($146|0)!=0;
 if($147){label=48;break;}else{label=49;break;}
 case 48:
 _doop((124),128);
 label=50;break;
 case 49:
 _doop((14),16);
 var $150=$1;
 var $151=(($150+1)|0);
 $1=$151;
 label=50;break;
 case 50:
 var $153=$1;
 var $154=(($153+1)|0);
 $1=$154;
 label=154;break;
 case 51:
 var $156=$1;
 var $157=(($156+1)|0);
 var $158=HEAP8[($157)];
 var $159=(($158<<24)>>24);
 var $160=($159|0)==38;
 if($160){label=52;break;}else{label=53;break;}
 case 52:
 _doop((24),12);
 var $162=$1;
 var $163=(($162+1)|0);
 $1=$163;
 label=54;break;
 case 53:
 _doop((78),15);
 label=54;break;
 case 54:
 var $166=$1;
 var $167=(($166+1)|0);
 $1=$167;
 label=154;break;
 case 55:
 _doop((20),14);
 var $169=$1;
 var $170=(($169+1)|0);
 $1=$170;
 label=154;break;
 case 56:
 var $172=$1;
 var $173=(($172+1)|0);
 var $174=HEAP8[($173)];
 var $175=(($174<<24)>>24);
 var $176=($175|0)==124;
 if($176){label=57;break;}else{label=58;break;}
 case 57:
 _doop((48),11);
 var $178=$1;
 var $179=(($178+1)|0);
 $1=$179;
 label=59;break;
 case 58:
 _doop((74),13);
 label=59;break;
 case 59:
 var $182=$1;
 var $183=(($182+1)|0);
 $1=$183;
 label=154;break;
 case 60:
 var $185=$2;
 var $186=($185|0)!=0;
 if($186){label=61;break;}else{label=62;break;}
 case 61:
 var $188=$cur;
 var $189=(($188+13)|0);
 HEAP8[($189)]=12;
 var $190=$1;
 var $191=(($190+1)|0);
 $1=$191;
 label=154;break;
 case 62:
 label=63;break;
 case 63:
 var $194=HEAP32[((1087000)>>2)];
 var $195=($194|0)==32;
 if($195){label=64;break;}else{label=65;break;}
 case 64:
 var $197=_puts(6912);
 label=66;break;
 case 65:
 var $199=HEAP32[((1087000)>>2)];
 var $200=((($199)+(1))|0);
 HEAP32[((1087000)>>2)]=$200;
 var $201=((1086864+($199<<2))|0);
 HEAP32[(($201)>>2)]=0;
 label=66;break;
 case 66:
 var $203=$1;
 var $204=(($203+1)|0);
 $1=$204;
 label=154;break;
 case 67:
 var $206=$2;
 var $207=($206|0)!=0;
 if($207){label=68;break;}else{label=77;break;}
 case 68:
 var $209=$cur;
 var $210=(($209+13)|0);
 var $211=HEAP8[($210)];
 var $212=($211&255);
 var $213=($212|0)==12;
 if($213){label=69;break;}else{label=72;break;}
 case 69:
 var $215=$1;
 var $216=(($215+1)|0);
 var $217=HEAP8[($216)];
 var $218=(($217<<24)>>24);
 var $219=($218|0)==44;
 if($219){label=70;break;}else{label=72;break;}
 case 70:
 var $221=$1;
 var $222=(($221+2)|0);
 var $223=HEAP8[($222)];
 var $224=(($223<<24)>>24);
 var $225=$224|32;
 var $226=($225|0)==121;
 if($226){label=71;break;}else{label=72;break;}
 case 71:
 var $228=$cur;
 var $229=(($228+13)|0);
 HEAP8[($229)]=11;
 var $230=$1;
 var $231=(($230+2)|0);
 $1=$231;
 label=72;break;
 case 72:
 var $233=$cur;
 var $234=(($233+13)|0);
 var $235=HEAP8[($234)];
 var $236=($235&255);
 var $237=($236|0)==12;
 if($237){label=73;break;}else{label=76;break;}
 case 73:
 var $239=$1;
 var $240=(($239+1)|0);
 var $241=HEAP8[($240)];
 var $242=(($241<<24)>>24);
 var $243=($242|0)==44;
 if($243){label=74;break;}else{label=76;break;}
 case 74:
 var $245=$1;
 var $246=(($245+2)|0);
 var $247=HEAP8[($246)];
 var $248=(($247<<24)>>24);
 var $249=$248|32;
 var $250=($249|0)==120;
 if($250){label=75;break;}else{label=76;break;}
 case 75:
 var $252=(($sBuffer)|0);
 var $253=$1;
 var $254=_sprintf($252,5760,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$253,tempVarArgs)); STACKTOP=tempVarArgs;
 var $255=$pLine;
 var $256=_asmerr(10,0,$255);
 var $257=HEAP32[((1086832)>>2)];
 var $258=((($257)+(1))|0);
 HEAP32[((1086832)>>2)]=$258;
 var $259=HEAP32[((1086808)>>2)];
 var $260=$259|1;
 HEAP32[((1086808)>>2)]=$260;
 label=76;break;
 case 76:
 var $262=$1;
 var $263=(($262+1)|0);
 $1=$263;
 label=154;break;
 case 77:
 label=78;break;
 case 78:
 label=79;break;
 case 79:
 var $267=HEAP32[((1087000)>>2)];
 var $268=HEAP32[((1086992)>>2)];
 var $269=($267|0)!=($268|0);
 if($269){label=80;break;}else{var $277=0;label=81;break;}
 case 80:
 var $271=HEAP32[((1087000)>>2)];
 var $272=((($271)-(1))|0);
 var $273=((1086864+($272<<2))|0);
 var $274=HEAP32[(($273)>>2)];
 var $275=($274|0)!=0;
 var $277=$275;label=81;break;
 case 81:
 var $277;
 if($277){label=82;break;}else{label=83;break;}
 case 82:
 _evaltop();
 label=79;break;
 case 83:
 var $280=HEAP32[((1087000)>>2)];
 var $281=HEAP32[((1086992)>>2)];
 var $282=($280|0)!=($281|0);
 if($282){label=84;break;}else{label=85;break;}
 case 84:
 var $284=HEAP32[((1087000)>>2)];
 var $285=((($284)-(1))|0);
 HEAP32[((1087000)>>2)]=$285;
 label=85;break;
 case 85:
 var $287=$1;
 var $288=(($287+1)|0);
 $1=$288;
 var $289=HEAP32[((1093720)>>2)];
 var $290=HEAP32[((1093712)>>2)];
 var $291=($289|0)==($290|0);
 if($291){label=86;break;}else{label=87;break;}
 case 86:
 var $293=_puts(4840);
 label=154;break;
 case 87:
 var $295=$1;
 var $296=HEAP8[($295)];
 var $297=(($296<<24)>>24);
 var $298=($297|0)==100;
 if($298){label=88;break;}else{label=91;break;}
 case 88:
 var $300=$1;
 var $301=(($300+1)|0);
 $1=$301;
 var $302=HEAP32[((1093720)>>2)];
 var $303=((($302)-(1))|0);
 var $304=((1093728+$303)|0);
 var $305=HEAP8[($304)];
 var $306=($305&255);
 var $307=($306|0)==0;
 if($307){label=89;break;}else{label=90;break;}
 case 89:
 var $309=(($buf)|0);
 var $310=HEAP32[((1093720)>>2)];
 var $311=((($310)-(1))|0);
 var $312=((1093456+($311<<2))|0);
 var $313=HEAP32[(($312)>>2)];
 var $314=_sprintf($309,4168,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$313,tempVarArgs)); STACKTOP=tempVarArgs;
 var $315=(($buf)|0);
 var $316=_strlen($315);
 var $317=((($316)+(1))|0);
 var $318=_ckmalloc($317);
 var $319=(($buf)|0);
 var $320=_strcpy($318,$319);
 var $321=HEAP32[((1093720)>>2)];
 var $322=((($321)-(1))|0);
 var $323=((1093200+($322<<2))|0);
 HEAP32[(($323)>>2)]=$320;
 label=90;break;
 case 90:
 label=91;break;
 case 91:
 label=154;break;
 case 92:
 var $327=$cur;
 var $328=(($327+13)|0);
 HEAP8[($328)]=1;
 var $329=$1;
 var $330=(($329+1)|0);
 $1=$330;
 $2=0;
 label=154;break;
 case 93:
 label=94;break;
 case 94:
 var $333=HEAP32[((1087000)>>2)];
 var $334=HEAP32[((1086992)>>2)];
 var $335=($333|0)!=($334|0);
 if($335){label=95;break;}else{label=96;break;}
 case 95:
 _evaltop();
 label=94;break;
 case 96:
 HEAP32[((1091264)>>2)]=1;
 var $338=$1;
 var $339=(($338+1)|0);
 var $340=HEAP8[($339)];
 var $341=(($340<<24)>>24);
 var $342=$341|32;
 $scr=$342;
 var $343=$cur;
 var $344=(($343+13)|0);
 var $345=HEAP8[($344)];
 var $346=($345&255);
 var $347=($346|0)==12;
 if($347){label=97;break;}else{label=100;break;}
 case 97:
 var $349=$scr;
 var $350=($349|0)==120;
 if($350){label=98;break;}else{label=100;break;}
 case 98:
 var $352=$1;
 var $353=(($352+2)|0);
 var $354=HEAP8[($353)];
 var $355=(($354<<24)>>24);
 var $356=_IsAlphaNum($355);
 var $357=($356|0)!=0;
 if($357){label=100;break;}else{label=99;break;}
 case 99:
 var $359=$cur;
 var $360=(($359+13)|0);
 HEAP8[($360)]=10;
 var $361=$1;
 var $362=(($361+1)|0);
 $1=$362;
 label=135;break;
 case 100:
 var $364=$cur;
 var $365=(($364+13)|0);
 var $366=HEAP8[($365)];
 var $367=($366&255);
 var $368=($367|0)==12;
 if($368){label=101;break;}else{label=105;break;}
 case 101:
 var $370=$scr;
 var $371=($370|0)==121;
 if($371){label=102;break;}else{label=105;break;}
 case 102:
 var $373=$1;
 var $374=(($373+2)|0);
 var $375=HEAP8[($374)];
 var $376=(($375<<24)>>24);
 var $377=($376|0)==41;
 if($377){label=103;break;}else{label=105;break;}
 case 103:
 var $379=$2;
 var $380=($379|0)!=0;
 if($380){label=104;break;}else{label=105;break;}
 case 104:
 var $382=(($sBuffer1)|0);
 var $383=$1;
 var $384=_sprintf($382,5760,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$383,tempVarArgs)); STACKTOP=tempVarArgs;
 var $385=$pLine;
 var $386=_asmerr(10,0,$385);
 var $387=HEAP32[((1086832)>>2)];
 var $388=((($387)+(1))|0);
 HEAP32[((1086832)>>2)]=$388;
 var $389=HEAP32[((1086808)>>2)];
 var $390=$389|1;
 HEAP32[((1086808)>>2)]=$390;
 var $391=$cur;
 var $392=(($391+13)|0);
 HEAP8[($392)]=14;
 var $393=$1;
 var $394=(($393+1)|0);
 $1=$394;
 label=134;break;
 case 105:
 var $396=$scr;
 var $397=($396|0)==120;
 if($397){label=106;break;}else{label=114;break;}
 case 106:
 var $399=$1;
 var $400=(($399+2)|0);
 var $401=HEAP8[($400)];
 var $402=(($401<<24)>>24);
 var $403=_IsAlphaNum($402);
 var $404=($403|0)!=0;
 if($404){label=114;break;}else{label=107;break;}
 case 107:
 var $406=$cur;
 var $407=(($406+13)|0);
 HEAP8[($407)]=13;
 var $408=$1;
 var $409=(($408+1)|0);
 $1=$409;
 var $410=HEAP32[((1087136)>>2)];
 var $411=($410|0)==6;
 if($411){label=108;break;}else{label=109;break;}
 case 108:
 HEAP32[((1087136)>>2)]=7;
 label=109;break;
 case 109:
 var $414=HEAP32[((1087136)>>2)];
 var $415=($414|0)==3;
 if($415){label=110;break;}else{label=111;break;}
 case 110:
 HEAP32[((1087136)>>2)]=4;
 label=111;break;
 case 111:
 var $418=HEAP32[((1087136)>>2)];
 var $419=($418|0)==12;
 if($419){label=112;break;}else{label=113;break;}
 case 112:
 HEAP32[((1087136)>>2)]=13;
 label=113;break;
 case 113:
 label=133;break;
 case 114:
 var $423=$scr;
 var $424=($423|0)==121;
 if($424){label=115;break;}else{label=123;break;}
 case 115:
 var $426=$1;
 var $427=(($426+2)|0);
 var $428=HEAP8[($427)];
 var $429=(($428<<24)>>24);
 var $430=_IsAlphaNum($429);
 var $431=($430|0)!=0;
 if($431){label=123;break;}else{label=116;break;}
 case 116:
 var $433=$cur;
 var $434=(($433+13)|0);
 HEAP8[($434)]=14;
 var $435=$1;
 var $436=(($435+1)|0);
 $1=$436;
 var $437=HEAP32[((1087136)>>2)];
 var $438=($437|0)==6;
 if($438){label=117;break;}else{label=118;break;}
 case 117:
 HEAP32[((1087136)>>2)]=8;
 label=118;break;
 case 118:
 var $441=HEAP32[((1087136)>>2)];
 var $442=($441|0)==3;
 if($442){label=119;break;}else{label=120;break;}
 case 119:
 HEAP32[((1087136)>>2)]=5;
 label=120;break;
 case 120:
 var $445=HEAP32[((1087136)>>2)];
 var $446=($445|0)==12;
 if($446){label=121;break;}else{label=122;break;}
 case 121:
 HEAP32[((1087136)>>2)]=14;
 label=122;break;
 case 122:
 label=132;break;
 case 123:
 var $450=_allocsymbol();
 $pNewSymbol=$450;
 var $451=$pNewSymbol;
 var $452=$cur;
 var $453=(($452)|0);
 HEAP32[(($453)>>2)]=$451;
 var $454=HEAP32[((1093720)>>2)];
 var $455=((($454)-(1))|0);
 HEAP32[((1093720)>>2)]=$455;
 var $456=HEAP32[((1093720)>>2)];
 var $457=HEAP32[((1093712)>>2)];
 var $458=($456|0)<($457|0);
 if($458){label=124;break;}else{label=125;break;}
 case 124:
 var $460=$pLine;
 var $461=_asmerr(5,0,$460);
 label=125;break;
 case 125:
 var $463=HEAP32[((1093720)>>2)];
 var $464=HEAP32[((1093712)>>2)];
 var $465=($463|0)>($464|0);
 if($465){label=126;break;}else{label=127;break;}
 case 126:
 var $467=$pLine;
 var $468=_asmerr(5,0,$467);
 label=127;break;
 case 127:
 var $470=HEAP32[((1093720)>>2)];
 var $471=((1093456+($470<<2))|0);
 var $472=HEAP32[(($471)>>2)];
 var $473=$cur;
 var $474=(($473+16)|0);
 HEAP32[(($474)>>2)]=$472;
 var $475=HEAP32[((1093720)>>2)];
 var $476=((1093728+$475)|0);
 var $477=HEAP8[($476)];
 var $478=$cur;
 var $479=(($478+12)|0);
 HEAP8[($479)]=$477;
 var $480=HEAP32[((1093720)>>2)];
 var $481=((1093200+($480<<2))|0);
 var $482=HEAP32[(($481)>>2)];
 var $483=$cur;
 var $484=(($483+8)|0);
 HEAP32[(($484)>>2)]=$482;
 var $485=($482|0)!=0;
 if($485){label=128;break;}else{label=131;break;}
 case 128:
 var $487=$cur;
 var $488=(($487+12)|0);
 var $489=HEAP8[($488)];
 var $490=($489&255);
 var $491=$490|8;
 var $492=(($491)&255);
 HEAP8[($488)]=$492;
 var $493=HEAP8[(1082664)];
 var $494=(($493)&1);
 if($494){label=129;break;}else{label=130;break;}
 case 129:
 var $496=$cur;
 var $497=(($496+8)|0);
 var $498=HEAP32[(($497)>>2)];
 var $499=_printf(3440,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$498,tempVarArgs)); STACKTOP=tempVarArgs;
 label=130;break;
 case 130:
 label=131;break;
 case 131:
 var $502=$pNewSymbol;
 $cur=$502;
 label=132;break;
 case 132:
 label=133;break;
 case 133:
 label=134;break;
 case 134:
 label=135;break;
 case 135:
 var $507=$1;
 var $508=(($507+1)|0);
 $1=$508;
 label=154;break;
 case 136:
 var $510=$1;
 var $511=(($510+1)|0);
 var $512=_pushhex($511);
 $1=$512;
 label=154;break;
 case 137:
 var $514=$1;
 var $515=(($514+1)|0);
 var $516=_pushchar($515);
 $1=$516;
 label=154;break;
 case 138:
 var $518=$1;
 var $519=(($518+1)|0);
 var $520=_pushstr($519);
 $1=$520;
 label=154;break;
 case 139:
 var $522=$1;
 $dol=$522;
 label=140;break;
 case 140:
 var $524=$dol;
 var $525=HEAP8[($524)];
 var $526=(($525<<24)>>24);
 var $527=($526|0)>=48;
 if($527){label=141;break;}else{var $534=0;label=142;break;}
 case 141:
 var $529=$dol;
 var $530=HEAP8[($529)];
 var $531=(($530<<24)>>24);
 var $532=($531|0)<=57;
 var $534=$532;label=142;break;
 case 142:
 var $534;
 if($534){label=143;break;}else{label=144;break;}
 case 143:
 var $536=$dol;
 var $537=(($536+1)|0);
 $dol=$537;
 label=140;break;
 case 144:
 var $539=$dol;
 var $540=HEAP8[($539)];
 var $541=(($540<<24)>>24);
 var $542=($541|0)==36;
 if($542){label=145;break;}else{label=146;break;}
 case 145:
 var $544=$1;
 var $545=_pushsymbol($544);
 $1=$545;
 label=154;break;
 case 146:
 var $547=$1;
 var $548=HEAP8[($547)];
 var $549=(($548<<24)>>24);
 var $550=($549|0)==48;
 if($550){label=147;break;}else{label=148;break;}
 case 147:
 var $552=$1;
 var $553=_pushoct($552);
 $1=$553;
 label=153;break;
 case 148:
 var $555=$1;
 var $556=HEAP8[($555)];
 var $557=(($556<<24)>>24);
 var $558=($557|0)>48;
 if($558){label=149;break;}else{label=151;break;}
 case 149:
 var $560=$1;
 var $561=HEAP8[($560)];
 var $562=(($561<<24)>>24);
 var $563=($562|0)<=57;
 if($563){label=150;break;}else{label=151;break;}
 case 150:
 var $565=$1;
 var $566=_pushdec($565);
 $1=$566;
 label=152;break;
 case 151:
 var $568=$1;
 var $569=_pushsymbol($568);
 $1=$569;
 label=152;break;
 case 152:
 label=153;break;
 case 153:
 label=154;break;
 case 154:
 label=2;break;
 case 155:
 label=156;break;
 case 156:
 var $575=HEAP32[((1087000)>>2)];
 var $576=HEAP32[((1086992)>>2)];
 var $577=($575|0)!=($576|0);
 if($577){label=157;break;}else{label=158;break;}
 case 157:
 _evaltop();
 label=156;break;
 case 158:
 var $580=HEAP32[((1093720)>>2)];
 var $581=HEAP32[((1093712)>>2)];
 var $582=($580|0)!=($581|0);
 if($582){label=159;break;}else{label=166;break;}
 case 159:
 var $584=HEAP32[((1093720)>>2)];
 var $585=((($584)-(1))|0);
 HEAP32[((1093720)>>2)]=$585;
 var $586=HEAP32[((1093720)>>2)];
 var $587=((1093456+($586<<2))|0);
 var $588=HEAP32[(($587)>>2)];
 var $589=$cur;
 var $590=(($589+16)|0);
 HEAP32[(($590)>>2)]=$588;
 var $591=HEAP32[((1093720)>>2)];
 var $592=((1093728+$591)|0);
 var $593=HEAP8[($592)];
 var $594=$cur;
 var $595=(($594+12)|0);
 HEAP8[($595)]=$593;
 var $596=HEAP32[((1093720)>>2)];
 var $597=((1093200+($596<<2))|0);
 var $598=HEAP32[(($597)>>2)];
 var $599=$cur;
 var $600=(($599+8)|0);
 HEAP32[(($600)>>2)]=$598;
 var $601=($598|0)!=0;
 if($601){label=160;break;}else{label=163;break;}
 case 160:
 var $603=$cur;
 var $604=(($603+12)|0);
 var $605=HEAP8[($604)];
 var $606=($605&255);
 var $607=$606|8;
 var $608=(($607)&255);
 HEAP8[($604)]=$608;
 var $609=HEAP8[(1082664)];
 var $610=(($609)&1);
 if($610){label=161;break;}else{label=162;break;}
 case 161:
 var $612=$cur;
 var $613=(($612+8)|0);
 var $614=HEAP32[(($613)>>2)];
 var $615=_printf(3440,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$614,tempVarArgs)); STACKTOP=tempVarArgs;
 label=162;break;
 case 162:
 label=163;break;
 case 163:
 var $618=$base;
 var $619=(($618+13)|0);
 var $620=HEAP8[($619)];
 var $621=($620&255);
 var $622=($621|0)==0;
 if($622){label=164;break;}else{label=165;break;}
 case 164:
 var $624=$base;
 var $625=(($624+13)|0);
 HEAP8[($625)]=3;
 label=165;break;
 case 165:
 label=166;break;
 case 166:
 var $628=HEAP32[((1093720)>>2)];
 var $629=HEAP32[((1093712)>>2)];
 var $630=($628|0)!=($629|0);
 if($630){label=168;break;}else{label=167;break;}
 case 167:
 var $632=HEAP32[((1087000)>>2)];
 var $633=HEAP32[((1086992)>>2)];
 var $634=($632|0)!=($633|0);
 if($634){label=168;break;}else{label=169;break;}
 case 168:
 var $636=$pLine;
 var $637=_asmerr(5,0,$636);
 label=169;break;
 case 169:
 var $639=HEAP32[((1093712)>>2)];
 HEAP32[((1093720)>>2)]=$639;
 var $640=HEAP32[((1086992)>>2)];
 HEAP32[((1087000)>>2)]=$640;
 var $641=$oldargibase;
 HEAP32[((1093712)>>2)]=$641;
 var $642=$oldopibase;
 HEAP32[((1086992)>>2)]=$642;
 var $643=$base;
 STACKTOP=sp;return $643;
  default: assert(0, "bad label: " + label);
 }

}


function _doop($func,$pri){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 $1=$func;
 $2=$pri;
 var $3=HEAP8[(1082664)];
 var $4=(($3)&1);
 if($4){label=2;break;}else{label=3;break;}
 case 2:
 var $6=_puts(1712);
 label=3;break;
 case 3:
 HEAP32[((1091264)>>2)]=1;
 var $8=HEAP32[((1087000)>>2)];
 var $9=HEAP32[((1086992)>>2)];
 var $10=($8|0)==($9|0);
 if($10){label=5;break;}else{label=4;break;}
 case 4:
 var $12=$2;
 var $13=($12|0)==128;
 if($13){label=5;break;}else{label=8;break;}
 case 5:
 var $15=HEAP8[(1082664)];
 var $16=(($15)&1);
 if($16){label=6;break;}else{label=7;break;}
 case 6:
 var $18=HEAP32[((1087000)>>2)];
 var $19=_printf(816,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$18,tempVarArgs)); STACKTOP=tempVarArgs;
 label=7;break;
 case 7:
 var $21=$1;
 var $22=HEAP32[((1087000)>>2)];
 var $23=((1087008+($22<<2))|0);
 HEAP32[(($23)>>2)]=$21;
 var $24=$2;
 var $25=HEAP32[((1087000)>>2)];
 var $26=((1086864+($25<<2))|0);
 HEAP32[(($26)>>2)]=$24;
 var $27=HEAP32[((1087000)>>2)];
 var $28=((($27)+(1))|0);
 HEAP32[((1087000)>>2)]=$28;
 label=19;break;
 case 8:
 label=9;break;
 case 9:
 var $31=HEAP32[((1087000)>>2)];
 var $32=HEAP32[((1086992)>>2)];
 var $33=($31|0)!=($32|0);
 if($33){label=10;break;}else{var $48=0;label=12;break;}
 case 10:
 var $35=HEAP32[((1087000)>>2)];
 var $36=((($35)-(1))|0);
 var $37=((1086864+($36<<2))|0);
 var $38=HEAP32[(($37)>>2)];
 var $39=($38|0)!=0;
 if($39){label=11;break;}else{var $48=0;label=12;break;}
 case 11:
 var $41=$2;
 var $42=HEAP32[((1087000)>>2)];
 var $43=((($42)-(1))|0);
 var $44=((1086864+($43<<2))|0);
 var $45=HEAP32[(($44)>>2)];
 var $46=($41|0)<=($45|0);
 var $48=$46;label=12;break;
 case 12:
 var $48;
 if($48){label=13;break;}else{label=14;break;}
 case 13:
 _evaltop();
 label=9;break;
 case 14:
 var $51=HEAP8[(1082664)];
 var $52=(($51)&1);
 if($52){label=15;break;}else{label=16;break;}
 case 15:
 var $54=HEAP32[((1087000)>>2)];
 var $55=_printf(10696,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$54,tempVarArgs)); STACKTOP=tempVarArgs;
 label=16;break;
 case 16:
 var $57=$1;
 var $58=HEAP32[((1087000)>>2)];
 var $59=((1087008+($58<<2))|0);
 HEAP32[(($59)>>2)]=$57;
 var $60=$2;
 var $61=HEAP32[((1087000)>>2)];
 var $62=((1086864+($61<<2))|0);
 HEAP32[(($62)>>2)]=$60;
 var $63=HEAP32[((1087000)>>2)];
 var $64=((($63)+(1))|0);
 HEAP32[((1087000)>>2)]=$64;
 var $65=HEAP32[((1087000)>>2)];
 var $66=($65|0)==32;
 if($66){label=17;break;}else{label=18;break;}
 case 17:
 var $68=_puts(10160);
 var $69=HEAP32[((1086992)>>2)];
 HEAP32[((1087000)>>2)]=$69;
 label=18;break;
 case 18:
 label=19;break;
 case 19:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _op_invert($v1,$f1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$v1;
 $2=$f1;
 var $3=$1;
 var $4=$3^-1;
 var $5=$2;
 _stackarg($4,$5,0);
 STACKTOP=sp;return;
}


function _pushsymbol($str){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 var $ptr;
 var $macro;
 $2=$str;
 $macro=0;
 var $3=$2;
 $ptr=$3;
 label=2;break;
 case 2:
 var $5=$ptr;
 var $6=HEAP8[($5)];
 var $7=(($6<<24)>>24);
 var $8=($7|0)==95;
 if($8){var $47=1;label=11;break;}else{label=3;break;}
 case 3:
 var $10=$ptr;
 var $11=HEAP8[($10)];
 var $12=(($11<<24)>>24);
 var $13=($12|0)==46;
 if($13){var $47=1;label=11;break;}else{label=4;break;}
 case 4:
 var $15=$ptr;
 var $16=HEAP8[($15)];
 var $17=(($16<<24)>>24);
 var $18=($17|0)>=97;
 if($18){label=5;break;}else{label=6;break;}
 case 5:
 var $20=$ptr;
 var $21=HEAP8[($20)];
 var $22=(($21<<24)>>24);
 var $23=($22|0)<=122;
 if($23){var $47=1;label=11;break;}else{label=6;break;}
 case 6:
 var $25=$ptr;
 var $26=HEAP8[($25)];
 var $27=(($26<<24)>>24);
 var $28=($27|0)>=65;
 if($28){label=7;break;}else{label=8;break;}
 case 7:
 var $30=$ptr;
 var $31=HEAP8[($30)];
 var $32=(($31<<24)>>24);
 var $33=($32|0)<=90;
 if($33){var $47=1;label=11;break;}else{label=8;break;}
 case 8:
 var $35=$ptr;
 var $36=HEAP8[($35)];
 var $37=(($36<<24)>>24);
 var $38=($37|0)>=48;
 if($38){label=9;break;}else{var $45=0;label=10;break;}
 case 9:
 var $40=$ptr;
 var $41=HEAP8[($40)];
 var $42=(($41<<24)>>24);
 var $43=($42|0)<=57;
 var $45=$43;label=10;break;
 case 10:
 var $45;
 var $47=$45;label=11;break;
 case 11:
 var $47;
 if($47){label=12;break;}else{label=14;break;}
 case 12:
 label=13;break;
 case 13:
 var $50=$ptr;
 var $51=(($50+1)|0);
 $ptr=$51;
 label=2;break;
 case 14:
 var $53=$ptr;
 var $54=$2;
 var $55=($53|0)==($54|0);
 if($55){label=15;break;}else{label=18;break;}
 case 15:
 var $57=$2;
 var $58=_asmerr(14,0,$57);
 var $59=$2;
 var $60=HEAP8[($59)];
 var $61=(($60<<24)>>24);
 var $62=$2;
 var $63=HEAP8[($62)];
 var $64=(($63<<24)>>24);
 var $65=$2;
 var $66=((($65)-(1))|0);
 var $67=HEAP8[($66)];
 var $68=(($67<<24)>>24);
 var $69=_printf(9568,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$61,HEAP32[(((tempVarArgs)+(8))>>2)]=$64,HEAP32[(((tempVarArgs)+(16))>>2)]=$68,tempVarArgs)); STACKTOP=tempVarArgs;
 var $70=HEAP32[((1091600)>>2)];
 var $71=($70|0)!=0;
 if($71){label=16;break;}else{label=17;break;}
 case 16:
 var $73=HEAP32[((1091632)>>2)];
 var $74=$2;
 var $75=HEAP8[($74)];
 var $76=(($75<<24)>>24);
 var $77=$2;
 var $78=HEAP8[($77)];
 var $79=(($78<<24)>>24);
 var $80=_fprintf($73,8792,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$76,HEAP32[(((tempVarArgs)+(8))>>2)]=$79,tempVarArgs)); STACKTOP=tempVarArgs;
 label=17;break;
 case 17:
 var $82=$2;
 var $83=(($82+1)|0);
 $1=$83;
 label=33;break;
 case 18:
 var $85=$ptr;
 var $86=HEAP8[($85)];
 var $87=(($86<<24)>>24);
 var $88=($87|0)==36;
 if($88){label=19;break;}else{label=20;break;}
 case 19:
 var $90=$ptr;
 var $91=(($90+1)|0);
 $ptr=$91;
 label=20;break;
 case 20:
 var $93=$2;
 var $94=$ptr;
 var $95=$2;
 var $96=$94;
 var $97=$95;
 var $98=((($96)-($97))|0);
 var $99=_findsymbol($93,$98);
 $sym=$99;
 var $100=($99|0)!=0;
 if($100){label=21;break;}else{label=31;break;}
 case 21:
 var $102=$sym;
 var $103=(($102+12)|0);
 var $104=HEAP8[($103)];
 var $105=($104&255);
 var $106=$105&1;
 var $107=($106|0)!=0;
 if($107){label=22;break;}else{label=23;break;}
 case 22:
 var $109=HEAP32[((1086824)>>2)];
 var $110=((($109)+(1))|0);
 HEAP32[((1086824)>>2)]=$110;
 label=23;break;
 case 23:
 var $112=$sym;
 var $113=(($112+12)|0);
 var $114=HEAP8[($113)];
 var $115=($114&255);
 var $116=$115&32;
 var $117=($116|0)!=0;
 if($117){label=24;break;}else{label=25;break;}
 case 24:
 $macro=1;
 var $119=$sym;
 var $120=(($119+8)|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=_eval($121,0);
 $sym=$122;
 label=25;break;
 case 25:
 var $124=$sym;
 var $125=(($124+12)|0);
 var $126=HEAP8[($125)];
 var $127=($126&255);
 var $128=$127&8;
 var $129=($128|0)!=0;
 if($129){label=26;break;}else{label=27;break;}
 case 26:
 var $131=$sym;
 var $132=(($131+8)|0);
 var $133=HEAP32[(($132)>>2)];
 _stackarg(0,8,$133);
 label=28;break;
 case 27:
 var $135=$sym;
 var $136=(($135+16)|0);
 var $137=HEAP32[(($136)>>2)];
 var $138=$sym;
 var $139=(($138+12)|0);
 var $140=HEAP8[($139)];
 var $141=($140&255);
 var $142=$141&1;
 _stackarg($137,$142,0);
 label=28;break;
 case 28:
 var $144=$sym;
 var $145=(($144+12)|0);
 var $146=HEAP8[($145)];
 var $147=($146&255);
 var $148=$147|68;
 var $149=(($148)&255);
 HEAP8[($145)]=$149;
 var $150=$macro;
 var $151=(($150<<24)>>24)!=0;
 if($151){label=29;break;}else{label=30;break;}
 case 29:
 var $153=$sym;
 _FreeSymbolList($153);
 label=30;break;
 case 30:
 label=32;break;
 case 31:
 _stackarg(0,1,0);
 var $156=$2;
 var $157=$ptr;
 var $158=$2;
 var $159=$157;
 var $160=$158;
 var $161=((($159)-($160))|0);
 var $162=_CreateSymbol($156,$161);
 $sym=$162;
 var $163=$sym;
 var $164=(($163+12)|0);
 HEAP8[($164)]=69;
 var $165=HEAP32[((1086824)>>2)];
 var $166=((($165)+(1))|0);
 HEAP32[((1086824)>>2)]=$166;
 label=32;break;
 case 32:
 var $168=$ptr;
 $1=$168;
 label=33;break;
 case 33:
 var $170=$1;
 STACKTOP=sp;return $170;
  default: assert(0, "bad label: " + label);
 }

}


function _op_mult($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=(Math_imul($5,$6)|0);
 var $8=$3;
 var $9=$4;
 var $10=$8|$9;
 _stackarg($7,$10,0);
 STACKTOP=sp;return;
}


function _op_div($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$3;
 var $6=$4;
 var $7=$5|$6;
 var $8=($7|0)!=0;
 if($8){label=2;break;}else{label=3;break;}
 case 2:
 var $10=$3;
 var $11=$4;
 var $12=$10|$11;
 _stackarg(0,$12,0);
 label=6;break;
 case 3:
 var $14=$2;
 var $15=($14|0)==0;
 if($15){label=4;break;}else{label=5;break;}
 case 4:
 var $17=_asmerr(8,1,0);
 _stackarg(0,0,0);
 label=6;break;
 case 5:
 var $19=$1;
 var $20=$2;
 var $21=(((($19|0))/(($20|0)))&-1);
 _stackarg($21,0,0);
 label=6;break;
 case 6:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _pushbin($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $val;
 $1=$str;
 $val=0;
 label=2;break;
 case 2:
 var $3=$1;
 var $4=HEAP8[($3)];
 var $5=(($4<<24)>>24);
 var $6=($5|0)==48;
 if($6){var $13=1;label=4;break;}else{label=3;break;}
 case 3:
 var $8=$1;
 var $9=HEAP8[($8)];
 var $10=(($9<<24)>>24);
 var $11=($10|0)==49;
 var $13=$11;label=4;break;
 case 4:
 var $13;
 if($13){label=5;break;}else{label=6;break;}
 case 5:
 var $15=$val;
 var $16=$15<<1;
 var $17=$1;
 var $18=HEAP8[($17)];
 var $19=(($18<<24)>>24);
 var $20=((($19)-(48))|0);
 var $21=$16|$20;
 $val=$21;
 var $22=$1;
 var $23=(($22+1)|0);
 $1=$23;
 label=2;break;
 case 6:
 var $25=$val;
 _stackarg($25,0,0);
 var $26=$1;
 STACKTOP=sp;return $26;
  default: assert(0, "bad label: " + label);
 }

}


function _op_mod($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$3;
 var $6=$4;
 var $7=$5|$6;
 var $8=($7|0)!=0;
 if($8){label=2;break;}else{label=3;break;}
 case 2:
 var $10=$3;
 var $11=$4;
 var $12=$10|$11;
 _stackarg(0,$12,0);
 label=6;break;
 case 3:
 var $14=$2;
 var $15=($14|0)==0;
 if($15){label=4;break;}else{label=5;break;}
 case 4:
 var $17=$1;
 _stackarg($17,0,0);
 label=6;break;
 case 5:
 var $19=$1;
 var $20=$2;
 var $21=(((($19|0))%(($20|0)))&-1);
 _stackarg($21,0,0);
 label=6;break;
 case 6:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _op_question($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$3;
 var $6=($5|0)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=$3;
 _stackarg(0,$8,0);
 label=10;break;
 case 3:
 var $10=$1;
 var $11=($10|0)!=0;
 if($11){label=4;break;}else{label=5;break;}
 case 4:
 var $13=$2;
 var $16=$13;label=6;break;
 case 5:
 var $16=0;label=6;break;
 case 6:
 var $16;
 var $17=$1;
 var $18=($17|0)!=0;
 if($18){label=7;break;}else{label=8;break;}
 case 7:
 var $20=$4;
 var $23=$20;label=9;break;
 case 8:
 var $23=0;label=9;break;
 case 9:
 var $23;
 _stackarg($16,$23,0);
 label=10;break;
 case 10:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _op_add($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=((($5)+($6))|0);
 var $8=$3;
 var $9=$4;
 var $10=$8|$9;
 _stackarg($7,$10,0);
 STACKTOP=sp;return;
}


function _op_negate($v1,$f1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$v1;
 $2=$f1;
 var $3=$1;
 var $4=(((-$3))|0);
 var $5=$2;
 _stackarg($4,$5,0);
 STACKTOP=sp;return;
}


function _op_sub($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=((($5)-($6))|0);
 var $8=$3;
 var $9=$4;
 var $10=$8|$9;
 _stackarg($7,$10,0);
 STACKTOP=sp;return;
}


function _op_takemsb($v1,$f1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$v1;
 $2=$f1;
 var $3=$1;
 var $4=$3>>8;
 var $5=$4&255;
 var $6=$2;
 _stackarg($5,$6,0);
 STACKTOP=sp;return;
}


function _op_shiftright($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$3;
 var $6=$4;
 var $7=$5|$6;
 var $8=($7|0)!=0;
 if($8){label=2;break;}else{label=3;break;}
 case 2:
 var $10=$3;
 var $11=$4;
 var $12=$10|$11;
 _stackarg(0,$12,0);
 label=4;break;
 case 3:
 var $14=$1;
 var $15=$2;
 var $16=$14>>($15|0);
 _stackarg($16,0,0);
 label=4;break;
 case 4:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _op_greatereq($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=($5|0)>=($6|0);
 var $8=($7&1);
 var $9=$3;
 var $10=$4;
 var $11=$9|$10;
 _stackarg($8,$11,0);
 STACKTOP=sp;return;
}


function _op_greater($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=($5|0)>($6|0);
 var $8=($7&1);
 var $9=$3;
 var $10=$4;
 var $11=$9|$10;
 _stackarg($8,$11,0);
 STACKTOP=sp;return;
}


function _op_takelsb($v1,$f1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$v1;
 $2=$f1;
 var $3=$1;
 var $4=$3&255;
 var $5=$2;
 _stackarg($4,$5,0);
 STACKTOP=sp;return;
}


function _op_shiftleft($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$3;
 var $6=$4;
 var $7=$5|$6;
 var $8=($7|0)!=0;
 if($8){label=2;break;}else{label=3;break;}
 case 2:
 var $10=$3;
 var $11=$4;
 var $12=$10|$11;
 _stackarg(0,$12,0);
 label=4;break;
 case 3:
 var $14=$1;
 var $15=$2;
 var $16=$14<<$15;
 _stackarg($16,0,0);
 label=4;break;
 case 4:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _op_smallereq($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=($5|0)<=($6|0);
 var $8=($7&1);
 var $9=$3;
 var $10=$4;
 var $11=$9|$10;
 _stackarg($8,$11,0);
 STACKTOP=sp;return;
}


function _op_smaller($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=($5|0)<($6|0);
 var $8=($7&1);
 var $9=$3;
 var $10=$4;
 var $11=$9|$10;
 _stackarg($8,$11,0);
 STACKTOP=sp;return;
}


function _op_eqeq($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=($5|0)==($6|0);
 var $8=($7&1);
 var $9=$3;
 var $10=$4;
 var $11=$9|$10;
 _stackarg($8,$11,0);
 STACKTOP=sp;return;
}


function _op_not($v1,$f1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$v1;
 $2=$f1;
 var $3=$1;
 var $4=($3|0)!=0;
 var $5=$4^1;
 var $6=($5&1);
 var $7=$2;
 _stackarg($6,$7,0);
 STACKTOP=sp;return;
}


function _op_noteq($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=($5|0)!=($6|0);
 var $8=($7&1);
 var $9=$3;
 var $10=$4;
 var $11=$9|$10;
 _stackarg($8,$11,0);
 STACKTOP=sp;return;
}


function _op_andand($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$3;
 var $6=($5|0)!=0;
 if($6){label=3;break;}else{label=2;break;}
 case 2:
 var $8=$1;
 var $9=($8|0)!=0;
 if($9){label=3;break;}else{label=5;break;}
 case 3:
 var $11=$4;
 var $12=($11|0)!=0;
 if($12){label=6;break;}else{label=4;break;}
 case 4:
 var $14=$2;
 var $15=($14|0)!=0;
 if($15){label=6;break;}else{label=5;break;}
 case 5:
 _stackarg(0,0,0);
 label=7;break;
 case 6:
 var $18=$3;
 var $19=$4;
 var $20=$18|$19;
 _stackarg(1,$20,0);
 label=7;break;
 case 7:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _op_and($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=$5&$6;
 var $8=$3;
 var $9=$4;
 var $10=$8|$9;
 _stackarg($7,$10,0);
 STACKTOP=sp;return;
}


function _op_xor($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=$5^$6;
 var $8=$3;
 var $9=$4;
 var $10=$8|$9;
 _stackarg($7,$10,0);
 STACKTOP=sp;return;
}


function _op_oror($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$3;
 var $6=($5|0)!=0;
 if($6){label=3;break;}else{label=2;break;}
 case 2:
 var $8=$1;
 var $9=($8|0)!=0;
 if($9){label=5;break;}else{label=3;break;}
 case 3:
 var $11=$4;
 var $12=($11|0)!=0;
 if($12){label=6;break;}else{label=4;break;}
 case 4:
 var $14=$2;
 var $15=($14|0)!=0;
 if($15){label=5;break;}else{label=6;break;}
 case 5:
 _stackarg(1,0,0);
 label=7;break;
 case 6:
 var $18=$3;
 var $19=$4;
 var $20=$18|$19;
 _stackarg(0,$20,0);
 label=7;break;
 case 7:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _op_or($v1,$v2,$f1,$f2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 $1=$v1;
 $2=$v2;
 $3=$f1;
 $4=$f2;
 var $5=$1;
 var $6=$2;
 var $7=$5|$6;
 var $8=$3;
 var $9=$4;
 var $10=$8|$9;
 _stackarg($7,$10,0);
 STACKTOP=sp;return;
}


function _evaltop(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1=HEAP8[(1082664)];
 var $2=(($1)&1);
 if($2){label=2;break;}else{label=3;break;}
 case 2:
 var $4=HEAP32[((1093720)>>2)];
 var $5=HEAP32[((1087000)>>2)];
 var $6=_printf(2688,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$4,HEAP32[(((tempVarArgs)+(8))>>2)]=$5,tempVarArgs)); STACKTOP=tempVarArgs;
 label=3;break;
 case 3:
 var $8=HEAP32[((1087000)>>2)];
 var $9=HEAP32[((1086992)>>2)];
 var $10=($8|0)<=($9|0);
 if($10){label=4;break;}else{label=5;break;}
 case 4:
 var $12=_asmerr(5,0,0);
 var $13=HEAP32[((1086992)>>2)];
 HEAP32[((1087000)>>2)]=$13;
 label=12;break;
 case 5:
 var $15=HEAP32[((1087000)>>2)];
 var $16=((($15)-(1))|0);
 HEAP32[((1087000)>>2)]=$16;
 var $17=HEAP32[((1087000)>>2)];
 var $18=((1086864+($17<<2))|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=($19|0)==128;
 if($20){label=6;break;}else{label=9;break;}
 case 6:
 var $22=HEAP32[((1093720)>>2)];
 var $23=HEAP32[((1093712)>>2)];
 var $24=((($23)+(1))|0);
 var $25=($22|0)<($24|0);
 if($25){label=7;break;}else{label=8;break;}
 case 7:
 var $27=_asmerr(5,0,0);
 var $28=HEAP32[((1093712)>>2)];
 HEAP32[((1093720)>>2)]=$28;
 label=12;break;
 case 8:
 var $30=HEAP32[((1093720)>>2)];
 var $31=((($30)-(1))|0);
 HEAP32[((1093720)>>2)]=$31;
 var $32=HEAP32[((1087000)>>2)];
 var $33=((1087008+($32<<2))|0);
 var $34=HEAP32[(($33)>>2)];
 var $35=HEAP32[((1093720)>>2)];
 var $36=((1093456+($35<<2))|0);
 var $37=HEAP32[(($36)>>2)];
 var $38=HEAP32[((1093720)>>2)];
 var $39=((1093728+$38)|0);
 var $40=HEAP8[($39)];
 var $41=($40&255);
 var $42=$34;
 FUNCTION_TABLE[$42]($37,$41);
 label=12;break;
 case 9:
 var $44=HEAP32[((1093720)>>2)];
 var $45=HEAP32[((1093712)>>2)];
 var $46=((($45)+(2))|0);
 var $47=($44|0)<($46|0);
 if($47){label=10;break;}else{label=11;break;}
 case 10:
 var $49=_asmerr(5,0,0);
 var $50=HEAP32[((1093712)>>2)];
 HEAP32[((1093720)>>2)]=$50;
 label=12;break;
 case 11:
 var $52=HEAP32[((1093720)>>2)];
 var $53=((($52)-(2))|0);
 HEAP32[((1093720)>>2)]=$53;
 var $54=HEAP32[((1087000)>>2)];
 var $55=((1087008+($54<<2))|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=HEAP32[((1093720)>>2)];
 var $58=((1093456+($57<<2))|0);
 var $59=HEAP32[(($58)>>2)];
 var $60=HEAP32[((1093720)>>2)];
 var $61=((($60)+(1))|0);
 var $62=((1093456+($61<<2))|0);
 var $63=HEAP32[(($62)>>2)];
 var $64=HEAP32[((1093720)>>2)];
 var $65=((1093728+$64)|0);
 var $66=HEAP8[($65)];
 var $67=($66&255);
 var $68=HEAP32[((1093720)>>2)];
 var $69=((($68)+(1))|0);
 var $70=((1093728+$69)|0);
 var $71=HEAP8[($70)];
 var $72=($71&255);
 var $73=$56;
 FUNCTION_TABLE[$73]($59,$63,$67,$72);
 label=12;break;
 case 12:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _IsAlphaNum($c){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 $1=$c;
 var $2=$1;
 var $3=($2|0)>=97;
 if($3){label=2;break;}else{label=3;break;}
 case 2:
 var $5=$1;
 var $6=($5|0)<=122;
 if($6){var $22=1;label=8;break;}else{label=3;break;}
 case 3:
 var $8=$1;
 var $9=($8|0)>=65;
 if($9){label=4;break;}else{label=5;break;}
 case 4:
 var $11=$1;
 var $12=($11|0)<=90;
 if($12){var $22=1;label=8;break;}else{label=5;break;}
 case 5:
 var $14=$1;
 var $15=($14|0)>=48;
 if($15){label=6;break;}else{var $20=0;label=7;break;}
 case 6:
 var $17=$1;
 var $18=($17|0)<=57;
 var $20=$18;label=7;break;
 case 7:
 var $20;
 var $22=$20;label=8;break;
 case 8:
 var $22;
 var $23=($22&1);
 STACKTOP=sp;return $23;
  default: assert(0, "bad label: " + label);
 }

}


function _pushhex($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $val;
 $1=$str;
 $val=0;
 label=2;break;
 case 2:
 var $3=$1;
 var $4=HEAP8[($3)];
 var $5=(($4<<24)>>24);
 var $6=($5|0)>=48;
 if($6){label=3;break;}else{label=5;break;}
 case 3:
 var $8=$1;
 var $9=HEAP8[($8)];
 var $10=(($9<<24)>>24);
 var $11=($10|0)<=57;
 if($11){label=4;break;}else{label=5;break;}
 case 4:
 var $13=$val;
 var $14=$13<<4;
 var $15=$1;
 var $16=HEAP8[($15)];
 var $17=(($16<<24)>>24);
 var $18=((($17)-(48))|0);
 var $19=((($14)+($18))|0);
 $val=$19;
 label=11;break;
 case 5:
 var $21=$1;
 var $22=HEAP8[($21)];
 var $23=(($22<<24)>>24);
 var $24=($23|0)>=97;
 if($24){label=6;break;}else{label=7;break;}
 case 6:
 var $26=$1;
 var $27=HEAP8[($26)];
 var $28=(($27<<24)>>24);
 var $29=($28|0)<=102;
 if($29){label=9;break;}else{label=7;break;}
 case 7:
 var $31=$1;
 var $32=HEAP8[($31)];
 var $33=(($32<<24)>>24);
 var $34=($33|0)>=65;
 if($34){label=8;break;}else{label=10;break;}
 case 8:
 var $36=$1;
 var $37=HEAP8[($36)];
 var $38=(($37<<24)>>24);
 var $39=($38|0)<=70;
 if($39){label=9;break;}else{label=10;break;}
 case 9:
 var $41=$val;
 var $42=$41<<4;
 var $43=$1;
 var $44=HEAP8[($43)];
 var $45=(($44<<24)>>24);
 var $46=$45&31;
 var $47=((($46)+(9))|0);
 var $48=((($42)+($47))|0);
 $val=$48;
 label=11;break;
 case 10:
 label=12;break;
 case 11:
 var $51=$1;
 var $52=(($51+1)|0);
 $1=$52;
 label=2;break;
 case 12:
 var $54=$val;
 _stackarg($54,0,0);
 var $55=$1;
 STACKTOP=sp;return $55;
  default: assert(0, "bad label: " + label);
 }

}


function _pushchar($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 $1=$str;
 var $2=$1;
 var $3=HEAP8[($2)];
 var $4=(($3<<24)>>24)!=0;
 if($4){label=2;break;}else{label=3;break;}
 case 2:
 var $6=$1;
 var $7=HEAP8[($6)];
 var $8=(($7<<24)>>24);
 _stackarg($8,0,0);
 var $9=$1;
 var $10=(($9+1)|0);
 $1=$10;
 label=4;break;
 case 3:
 _stackarg(32,0,0);
 label=4;break;
 case 4:
 var $13=$1;
 STACKTOP=sp;return $13;
  default: assert(0, "bad label: " + label);
 }

}


function _pushstr($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 $1=$str;
 var $2=$1;
 _stackarg(0,8,$2);
 label=2;break;
 case 2:
 var $4=$1;
 var $5=HEAP8[($4)];
 var $6=(($5<<24)>>24);
 var $7=($6|0)!=0;
 if($7){label=3;break;}else{var $14=0;label=4;break;}
 case 3:
 var $9=$1;
 var $10=HEAP8[($9)];
 var $11=(($10<<24)>>24);
 var $12=($11|0)!=34;
 var $14=$12;label=4;break;
 case 4:
 var $14;
 if($14){label=5;break;}else{label=6;break;}
 case 5:
 var $16=$1;
 var $17=(($16+1)|0);
 $1=$17;
 label=2;break;
 case 6:
 var $19=$1;
 var $20=HEAP8[($19)];
 var $21=(($20<<24)>>24);
 var $22=($21|0)==34;
 if($22){label=7;break;}else{label=8;break;}
 case 7:
 var $24=$1;
 var $25=(($24+1)|0);
 $1=$25;
 label=8;break;
 case 8:
 var $27=$1;
 STACKTOP=sp;return $27;
  default: assert(0, "bad label: " + label);
 }

}


function _pushoct($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $val;
 $1=$str;
 $val=0;
 label=2;break;
 case 2:
 var $3=$1;
 var $4=HEAP8[($3)];
 var $5=(($4<<24)>>24);
 var $6=($5|0)>=48;
 if($6){label=3;break;}else{var $13=0;label=4;break;}
 case 3:
 var $8=$1;
 var $9=HEAP8[($8)];
 var $10=(($9<<24)>>24);
 var $11=($10|0)<=55;
 var $13=$11;label=4;break;
 case 4:
 var $13;
 if($13){label=5;break;}else{label=6;break;}
 case 5:
 var $15=$val;
 var $16=$15<<3;
 var $17=$1;
 var $18=HEAP8[($17)];
 var $19=(($18<<24)>>24);
 var $20=((($19)-(48))|0);
 var $21=((($16)+($20))|0);
 $val=$21;
 var $22=$1;
 var $23=(($22+1)|0);
 $1=$23;
 label=2;break;
 case 6:
 var $25=$val;
 _stackarg($25,0,0);
 var $26=$1;
 STACKTOP=sp;return $26;
  default: assert(0, "bad label: " + label);
 }

}


function _pushdec($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $val;
 $1=$str;
 $val=0;
 label=2;break;
 case 2:
 var $3=$1;
 var $4=HEAP8[($3)];
 var $5=(($4<<24)>>24);
 var $6=($5|0)>=48;
 if($6){label=3;break;}else{var $13=0;label=4;break;}
 case 3:
 var $8=$1;
 var $9=HEAP8[($8)];
 var $10=(($9<<24)>>24);
 var $11=($10|0)<=57;
 var $13=$11;label=4;break;
 case 4:
 var $13;
 if($13){label=5;break;}else{label=6;break;}
 case 5:
 var $15=$val;
 var $16=((($15)*(10))&-1);
 var $17=$1;
 var $18=HEAP8[($17)];
 var $19=(($18<<24)>>24);
 var $20=((($19)-(48))|0);
 var $21=((($16)+($20))|0);
 $val=$21;
 var $22=$1;
 var $23=(($22+1)|0);
 $1=$23;
 label=2;break;
 case 6:
 var $25=$val;
 _stackarg($25,0,0);
 var $26=$1;
 STACKTOP=sp;return $26;
  default: assert(0, "bad label: " + label);
 }

}


function _stackarg($val,$flags,$ptr1){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $str;
 var $ptr;
 var $new;
 var $len;
 $1=$val;
 $2=$flags;
 $3=$ptr1;
 $str=0;
 var $4=HEAP8[(1082664)];
 var $5=(($4)&1);
 if($5){label=2;break;}else{label=3;break;}
 case 2:
 var $7=$1;
 var $8=HEAP32[((1093720)>>2)];
 var $9=_printf(8096,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$7,HEAP32[(((tempVarArgs)+(8))>>2)]=$8,tempVarArgs)); STACKTOP=tempVarArgs;
 label=3;break;
 case 3:
 HEAP32[((1091264)>>2)]=0;
 var $11=$2;
 var $12=$11&8;
 var $13=($12|0)!=0;
 if($13){label=4;break;}else{label=10;break;}
 case 4:
 var $15=$3;
 $ptr=$15;
 $len=0;
 $1=0;
 label=5;break;
 case 5:
 var $17=$ptr;
 var $18=HEAP8[($17)];
 var $19=($18&255);
 var $20=($19|0)!=0;
 if($20){label=6;break;}else{var $27=0;label=7;break;}
 case 6:
 var $22=$ptr;
 var $23=HEAP8[($22)];
 var $24=($23&255);
 var $25=($24|0)!=34;
 var $27=$25;label=7;break;
 case 7:
 var $27;
 if($27){label=8;break;}else{label=9;break;}
 case 8:
 var $29=$1;
 var $30=$29<<8;
 var $31=$ptr;
 var $32=HEAP8[($31)];
 var $33=($32&255);
 var $34=$30|$33;
 $1=$34;
 var $35=$ptr;
 var $36=(($35+1)|0);
 $ptr=$36;
 var $37=$len;
 var $38=((($37)+(1))|0);
 $len=$38;
 label=5;break;
 case 9:
 var $40=$len;
 var $41=((($40)+(1))|0);
 var $42=_ckmalloc($41);
 $new=$42;
 var $43=$new;
 var $44=$3;
 var $45=$len;
 assert($45 % 1 === 0);(_memcpy($43, $44, $45)|0);
 var $46=$len;
 var $47=$new;
 var $48=(($47+$46)|0);
 HEAP8[($48)]=0;
 var $49=$2;
 var $50=$49&-9;
 $2=$50;
 var $51=$new;
 $str=$51;
 label=10;break;
 case 10:
 var $53=$1;
 var $54=HEAP32[((1093720)>>2)];
 var $55=((1093456+($54<<2))|0);
 HEAP32[(($55)>>2)]=$53;
 var $56=$str;
 var $57=HEAP32[((1093720)>>2)];
 var $58=((1093200+($57<<2))|0);
 HEAP32[(($58)>>2)]=$56;
 var $59=$2;
 var $60=(($59)&255);
 var $61=HEAP32[((1093720)>>2)];
 var $62=((1093728+$61)|0);
 HEAP8[($62)]=$60;
 var $63=HEAP32[((1093720)>>2)];
 var $64=((($63)+(1))|0);
 HEAP32[((1093720)>>2)]=$64;
 var $65=($64|0)==64;
 if($65){label=11;break;}else{label=12;break;}
 case 11:
 var $67=_puts(7744);
 var $68=HEAP32[((1093712)>>2)];
 HEAP32[((1093720)>>2)]=$68;
 label=12;break;
 case 12:
 label=13;break;
 case 13:
 var $71=HEAP32[((1087000)>>2)];
 var $72=HEAP32[((1086992)>>2)];
 var $73=($71|0)!=($72|0);
 if($73){label=14;break;}else{var $81=0;label=15;break;}
 case 14:
 var $75=HEAP32[((1087000)>>2)];
 var $76=((($75)-(1))|0);
 var $77=((1086864+($76<<2))|0);
 var $78=HEAP32[(($77)>>2)];
 var $79=($78|0)==128;
 var $81=$79;label=15;break;
 case 15:
 var $81;
 if($81){label=16;break;}else{label=17;break;}
 case 16:
 _evaltop();
 label=13;break;
 case 17:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _setspecial($value,$flags){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$value;
 $2=$flags;
 var $3=$1;
 HEAP32[((67368)>>2)]=$3;
 var $4=$2;
 var $5=(($4)&255);
 HEAP8[(67364)]=$5;
 STACKTOP=sp;return;
}


function _findsymbol($str,$len){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+1040)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $h1;
 var $sym;
 var $buf=sp;
 $2=$str;
 $3=$len;
 var $4=$3;
 var $5=($4|0)>1024;
 if($5){label=2;break;}else{label=3;break;}
 case 2:
 $3=1024;
 label=3;break;
 case 3:
 var $8=$2;
 var $9=(($8)|0);
 var $10=HEAP8[($9)];
 var $11=(($10<<24)>>24);
 var $12=($11|0)==46;
 if($12){label=4;break;}else{label=17;break;}
 case 4:
 var $14=$3;
 var $15=($14|0)==1;
 if($15){label=5;break;}else{label=9;break;}
 case 5:
 var $17=HEAP32[((1091648)>>2)];
 var $18=(($17+8)|0);
 var $19=HEAP8[($18)];
 var $20=($19&255);
 var $21=$20&32;
 var $22=($21|0)!=0;
 if($22){label=6;break;}else{label=7;break;}
 case 6:
 var $24=HEAP32[((1091648)>>2)];
 var $25=(($24+9)|0);
 var $26=HEAP8[($25)];
 var $27=($26&255);
 var $28=$27&1;
 var $29=(($28)&255);
 HEAP8[(70604)]=$29;
 var $30=HEAP32[((1091648)>>2)];
 var $31=(($30+16)|0);
 var $32=HEAP32[(($31)>>2)];
 HEAP32[((70608)>>2)]=$32;
 label=8;break;
 case 7:
 var $34=HEAP32[((1091648)>>2)];
 var $35=(($34+8)|0);
 var $36=HEAP8[($35)];
 var $37=($36&255);
 var $38=$37&1;
 var $39=(($38)&255);
 HEAP8[(70604)]=$39;
 var $40=HEAP32[((1091648)>>2)];
 var $41=(($40+12)|0);
 var $42=HEAP32[(($41)>>2)];
 HEAP32[((70608)>>2)]=$42;
 label=8;break;
 case 8:
 $1=70592;
 label=28;break;
 case 9:
 var $45=$3;
 var $46=($45|0)==2;
 if($46){label=10;break;}else{label=12;break;}
 case 10:
 var $48=$2;
 var $49=(($48+1)|0);
 var $50=HEAP8[($49)];
 var $51=(($50<<24)>>24);
 var $52=($51|0)==46;
 if($52){label=11;break;}else{label=12;break;}
 case 11:
 $1=67352;
 label=28;break;
 case 12:
 var $55=$3;
 var $56=($55|0)==3;
 if($56){label=13;break;}else{label=16;break;}
 case 13:
 var $58=$2;
 var $59=(($58+1)|0);
 var $60=HEAP8[($59)];
 var $61=(($60<<24)>>24);
 var $62=($61|0)==46;
 if($62){label=14;break;}else{label=16;break;}
 case 14:
 var $64=$2;
 var $65=(($64+2)|0);
 var $66=HEAP8[($65)];
 var $67=(($66<<24)>>24);
 var $68=($67|0)==46;
 if($68){label=15;break;}else{label=16;break;}
 case 15:
 HEAP8[(67388)]=0;
 var $70=HEAP32[((1091656)>>2)];
 HEAP32[((67392)>>2)]=$70;
 $1=67376;
 label=28;break;
 case 16:
 var $72=(($buf)|0);
 var $73=HEAP32[((1091248)>>2)];
 var $74=$3;
 var $75=$2;
 var $76=_sprintf($72,5536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$73,HEAP32[(((tempVarArgs)+(8))>>2)]=$74,HEAP32[(((tempVarArgs)+(16))>>2)]=$75,tempVarArgs)); STACKTOP=tempVarArgs;
 var $77=(($buf)|0);
 var $78=_strlen($77);
 $3=$78;
 var $79=(($buf)|0);
 $2=$79;
 label=20;break;
 case 17:
 var $81=$3;
 var $82=((($81)-(1))|0);
 var $83=$2;
 var $84=(($83+$82)|0);
 var $85=HEAP8[($84)];
 var $86=(($85<<24)>>24);
 var $87=($86|0)==36;
 if($87){label=18;break;}else{label=19;break;}
 case 18:
 var $89=(($buf)|0);
 var $90=HEAP32[((1091256)>>2)];
 var $91=$3;
 var $92=$2;
 var $93=_sprintf($89,8640,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$90,HEAP32[(((tempVarArgs)+(8))>>2)]=$91,HEAP32[(((tempVarArgs)+(16))>>2)]=$92,tempVarArgs)); STACKTOP=tempVarArgs;
 var $94=(($buf)|0);
 var $95=_strlen($94);
 $3=$95;
 var $96=(($buf)|0);
 $2=$96;
 label=19;break;
 case 19:
 label=20;break;
 case 20:
 var $99=$2;
 var $100=$3;
 var $101=_hash1367($99,$100);
 $h1=$101;
 var $102=$h1;
 var $103=((1082704+($102<<2))|0);
 var $104=((((HEAPU8[($103)])|(HEAPU8[((($103)+(1))|0)]<<8)|(HEAPU8[((($103)+(2))|0)]<<16)|(HEAPU8[((($103)+(3))|0)]<<24))|0));
 $sym=$104;
 label=21;break;
 case 21:
 var $106=$sym;
 var $107=($106|0)!=0;
 if($107){label=22;break;}else{label=27;break;}
 case 22:
 var $109=$sym;
 var $110=(($109+20)|0);
 var $111=HEAP32[(($110)>>2)];
 var $112=$3;
 var $113=($111|0)==($112|0);
 if($113){label=23;break;}else{label=25;break;}
 case 23:
 var $115=$sym;
 var $116=(($115+4)|0);
 var $117=HEAP32[(($116)>>2)];
 var $118=$2;
 var $119=$3;
 var $120=_memcmp($117,$118,$119);
 var $121=($120|0)!=0;
 if($121){label=25;break;}else{label=24;break;}
 case 24:
 label=27;break;
 case 25:
 label=26;break;
 case 26:
 var $125=$sym;
 var $126=(($125)|0);
 var $127=HEAP32[(($126)>>2)];
 $sym=$127;
 label=21;break;
 case 27:
 var $129=$sym;
 $1=$129;
 label=28;break;
 case 28:
 var $131=$1;
 STACKTOP=sp;return $131;
  default: assert(0, "bad label: " + label);
 }

}


function _CreateSymbol($str,$len){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+1040)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 var $h1;
 var $buf=sp;
 $1=$str;
 $2=$len;
 var $3=$2;
 var $4=($3|0)>1024;
 if($4){label=2;break;}else{label=3;break;}
 case 2:
 $2=1024;
 label=3;break;
 case 3:
 var $7=$1;
 var $8=(($7)|0);
 var $9=HEAP8[($8)];
 var $10=(($9<<24)>>24);
 var $11=($10|0)==46;
 if($11){label=4;break;}else{label=5;break;}
 case 4:
 var $13=(($buf)|0);
 var $14=HEAP32[((1091248)>>2)];
 var $15=$2;
 var $16=$1;
 var $17=_sprintf($13,5536,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$14,HEAP32[(((tempVarArgs)+(8))>>2)]=$15,HEAP32[(((tempVarArgs)+(16))>>2)]=$16,tempVarArgs)); STACKTOP=tempVarArgs;
 var $18=(($buf)|0);
 var $19=_strlen($18);
 $2=$19;
 var $20=(($buf)|0);
 $1=$20;
 label=8;break;
 case 5:
 var $22=$2;
 var $23=((($22)-(1))|0);
 var $24=$1;
 var $25=(($24+$23)|0);
 var $26=HEAP8[($25)];
 var $27=(($26<<24)>>24);
 var $28=($27|0)==36;
 if($28){label=6;break;}else{label=7;break;}
 case 6:
 var $30=(($buf)|0);
 var $31=HEAP32[((1091256)>>2)];
 var $32=$2;
 var $33=$1;
 var $34=_sprintf($30,8640,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$31,HEAP32[(((tempVarArgs)+(8))>>2)]=$32,HEAP32[(((tempVarArgs)+(16))>>2)]=$33,tempVarArgs)); STACKTOP=tempVarArgs;
 var $35=(($buf)|0);
 var $36=_strlen($35);
 $2=$36;
 var $37=(($buf)|0);
 $1=$37;
 label=7;break;
 case 7:
 label=8;break;
 case 8:
 var $40=_allocsymbol();
 $sym=$40;
 var $41=$2;
 var $42=((($41)+(1))|0);
 var $43=_permalloc($42);
 var $44=$sym;
 var $45=(($44+4)|0);
 HEAP32[(($45)>>2)]=$43;
 var $46=$sym;
 var $47=(($46+4)|0);
 var $48=HEAP32[(($47)>>2)];
 var $49=$1;
 var $50=$2;
 assert($50 % 1 === 0);(_memcpy($48, $49, $50)|0);
 var $51=$2;
 var $52=$sym;
 var $53=(($52+20)|0);
 HEAP32[(($53)>>2)]=$51;
 var $54=$1;
 var $55=$2;
 var $56=_hash1367($54,$55);
 $h1=$56;
 var $57=$h1;
 var $58=((1082704+($57<<2))|0);
 var $59=((((HEAPU8[($58)])|(HEAPU8[((($58)+(1))|0)]<<8)|(HEAPU8[((($58)+(2))|0)]<<16)|(HEAPU8[((($58)+(3))|0)]<<24))|0));
 var $60=$sym;
 var $61=(($60)|0);
 HEAP32[(($61)>>2)]=$59;
 var $62=$sym;
 var $63=(($62+12)|0);
 HEAP8[($63)]=1;
 var $64=$sym;
 var $65=$h1;
 var $66=((1082704+($65<<2))|0);
 tempBigInt=$64;HEAP8[($66)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($66)+(1))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($66)+(2))|0)]=tempBigInt&0xff;tempBigInt = tempBigInt>>8;HEAP8[((($66)+(3))|0)]=tempBigInt&0xff;
 var $67=$sym;
 STACKTOP=sp;return $67;
  default: assert(0, "bad label: " + label);
 }

}


function _allocsymbol(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $sym;
 var $1=HEAP32[((1082672)>>2)];
 var $2=($1|0)!=0;
 if($2){label=2;break;}else{label=3;break;}
 case 2:
 var $4=HEAP32[((1082672)>>2)];
 $sym=$4;
 var $5=HEAP32[((1082672)>>2)];
 var $6=(($5)|0);
 var $7=HEAP32[(($6)>>2)];
 HEAP32[((1082672)>>2)]=$7;
 var $8=$sym;
 var $9=$8;
 HEAP32[(($9)>>2)]=0; HEAP32[((($9)+(4))>>2)]=0; HEAP32[((($9)+(8))>>2)]=0; HEAP32[((($9)+(12))>>2)]=0; HEAP32[((($9)+(16))>>2)]=0; HEAP32[((($9)+(20))>>2)]=0;
 label=4;break;
 case 3:
 var $11=_permalloc(24);
 var $12=$11;
 $sym=$12;
 label=4;break;
 case 4:
 var $14=$sym;
 STACKTOP=sp;return $14;
  default: assert(0, "bad label: " + label);
 }

}


function _programlabel(){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+4096)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $len;
 var $sym;
 var $cseg;
 var $str;
 var $rorg;
 var $cflags;
 var $pc;
 var $sBuffer=sp;
 var $1=HEAP32[((1091648)>>2)];
 $cseg=$1;
 var $2=$cseg;
 var $3=(($2+8)|0);
 var $4=HEAP8[($3)];
 var $5=($4&255);
 var $6=$5&32;
 var $7=(($6)&255);
 $rorg=$7;
 var $8=$rorg;
 var $9=($8&255);
 var $10=($9|0)!=0;
 if($10){label=2;break;}else{label=3;break;}
 case 2:
 var $12=$cseg;
 var $13=(($12+9)|0);
 var $14=HEAP8[($13)];
 var $15=($14&255);
 var $22=$15;label=4;break;
 case 3:
 var $17=$cseg;
 var $18=(($17+8)|0);
 var $19=HEAP8[($18)];
 var $20=($19&255);
 var $22=$20;label=4;break;
 case 4:
 var $22;
 var $23=(($22)&255);
 $cflags=$23;
 var $24=$rorg;
 var $25=($24&255);
 var $26=($25|0)!=0;
 if($26){label=5;break;}else{label=6;break;}
 case 5:
 var $28=$cseg;
 var $29=(($28+16)|0);
 var $30=HEAP32[(($29)>>2)];
 var $36=$30;label=7;break;
 case 6:
 var $32=$cseg;
 var $33=(($32+12)|0);
 var $34=HEAP32[(($33)>>2)];
 var $36=$34;label=7;break;
 case 7:
 var $36;
 $pc=$36;
 var $37=$cseg;
 var $38=(($37+12)|0);
 var $39=HEAP32[(($38)>>2)];
 HEAP32[((1086848)>>2)]=$39;
 var $40=$cseg;
 var $41=(($40+8)|0);
 var $42=HEAP8[($41)];
 var $43=($42&255);
 HEAP32[((1086856)>>2)]=$43;
 var $44=((((HEAPU8[(1092176)])|(HEAPU8[(1092177)]<<8)|(HEAPU8[(1092178)]<<16)|(HEAPU8[(1092179)]<<24))|0));
 $str=$44;
 var $45=$str;
 var $46=HEAP8[($45)];
 var $47=(($46<<24)>>24);
 var $48=($47|0)==0;
 if($48){label=8;break;}else{label=9;break;}
 case 8:
 label=34;break;
 case 9:
 var $51=$str;
 var $52=_strlen($51);
 $len=$52;
 var $53=$len;
 var $54=((($53)-(1))|0);
 var $55=$str;
 var $56=(($55+$54)|0);
 var $57=HEAP8[($56)];
 var $58=(($57<<24)>>24);
 var $59=($58|0)==58;
 if($59){label=10;break;}else{label=11;break;}
 case 10:
 var $61=$len;
 var $62=((($61)-(1))|0);
 $len=$62;
 label=11;break;
 case 11:
 var $64=$str;
 var $65=(($64)|0);
 var $66=HEAP8[($65)];
 var $67=(($66<<24)>>24);
 var $68=($67|0)!=46;
 if($68){label=12;break;}else{label=14;break;}
 case 12:
 var $70=$len;
 var $71=((($70)-(1))|0);
 var $72=$str;
 var $73=(($72+$71)|0);
 var $74=HEAP8[($73)];
 var $75=(($74<<24)>>24);
 var $76=($75|0)!=36;
 if($76){label=13;break;}else{label=14;break;}
 case 13:
 var $78=HEAP32[((1091280)>>2)];
 var $79=((($78)+(1))|0);
 HEAP32[((1091280)>>2)]=$79;
 var $80=HEAP32[((1091280)>>2)];
 HEAP32[((1091256)>>2)]=$80;
 label=14;break;
 case 14:
 var $82=$str;
 var $83=$len;
 var $84=_findsymbol($82,$83);
 $sym=$84;
 var $85=($84|0)!=0;
 if($85){label=15;break;}else{label=32;break;}
 case 15:
 var $87=$sym;
 var $88=(($87+12)|0);
 var $89=HEAP8[($88)];
 var $90=($89&255);
 var $91=$90&5;
 var $92=($91|0)==5;
 if($92){label=16;break;}else{label=19;break;}
 case 16:
 var $94=HEAP32[((1086832)>>2)];
 var $95=((($94)+(1))|0);
 HEAP32[((1086832)>>2)]=$95;
 var $96=HEAP32[((1086808)>>2)];
 var $97=$96|8192;
 HEAP32[((1086808)>>2)]=$97;
 var $98=HEAP8[(1082664)];
 var $99=(($98)&1);
 if($99){label=17;break;}else{label=18;break;}
 case 17:
 var $101=$sym;
 var $102=(($101+4)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=$sym;
 var $105=(($104+12)|0);
 var $106=HEAP8[($105)];
 var $107=($106&255);
 var $108=$cflags;
 var $109=($108&255);
 var $110=_printf(6856,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$103,HEAP32[(((tempVarArgs)+(8))>>2)]=$107,HEAP32[(((tempVarArgs)+(16))>>2)]=$109,tempVarArgs)); STACKTOP=tempVarArgs;
 label=18;break;
 case 18:
 label=31;break;
 case 19:
 var $113=$cflags;
 var $114=($113&255);
 var $115=$114&1;
 var $116=($115|0)!=0;
 if($116){label=20;break;}else{label=22;break;}
 case 20:
 var $118=$sym;
 var $119=(($118+12)|0);
 var $120=HEAP8[($119)];
 var $121=($120&255);
 var $122=$121&4;
 var $123=($122|0)!=0;
 if($123){label=21;break;}else{label=22;break;}
 case 21:
 var $125=HEAP32[((1086832)>>2)];
 var $126=((($125)+(1))|0);
 HEAP32[((1086832)>>2)]=$126;
 var $127=HEAP32[((1086808)>>2)];
 var $128=$127|8192;
 HEAP32[((1086808)>>2)]=$128;
 label=30;break;
 case 22:
 var $130=$cflags;
 var $131=($130&255);
 var $132=$131&1;
 var $133=($132|0)!=0;
 if($133){label=29;break;}else{label=23;break;}
 case 23:
 var $135=$sym;
 var $136=(($135+12)|0);
 var $137=HEAP8[($136)];
 var $138=($137&255);
 var $139=$138&1;
 var $140=($139|0)!=0;
 if($140){label=29;break;}else{label=24;break;}
 case 24:
 var $142=$pc;
 var $143=$sym;
 var $144=(($143+16)|0);
 var $145=HEAP32[(($144)>>2)];
 var $146=($142|0)!=($145|0);
 if($146){label=25;break;}else{label=28;break;}
 case 25:
 var $148=HEAP32[((1086816)>>2)];
 var $149=$148&2;
 var $150=($149|0)!=0;
 if($150){label=27;break;}else{label=26;break;}
 case 26:
 var $152=(($sBuffer)|0);
 var $153=$sym;
 var $154=(($153+4)|0);
 var $155=HEAP32[(($154)>>2)];
 var $156=$sym;
 var $157=(($156+16)|0);
 var $158=HEAP32[(($157)>>2)];
 var $159=_sftos($158,0);
 var $160=_sprintf($152,5736,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$155,HEAP32[(((tempVarArgs)+(8))>>2)]=$159,tempVarArgs)); STACKTOP=tempVarArgs;
 var $161=(($sBuffer)|0);
 var $162=_asmerr(22,0,$161);
 label=27;break;
 case 27:
 var $164=HEAP32[((1086832)>>2)];
 var $165=((($164)+(1))|0);
 HEAP32[((1086832)>>2)]=$165;
 var $166=HEAP32[((1086808)>>2)];
 var $167=$166|16384;
 HEAP32[((1086808)>>2)]=$167;
 label=28;break;
 case 28:
 label=29;break;
 case 29:
 label=30;break;
 case 30:
 label=31;break;
 case 31:
 label=33;break;
 case 32:
 var $173=$str;
 var $174=$len;
 var $175=_CreateSymbol($173,$174);
 $sym=$175;
 label=33;break;
 case 33:
 var $177=$pc;
 var $178=$sym;
 var $179=(($178+16)|0);
 HEAP32[(($179)>>2)]=$177;
 var $180=$sym;
 var $181=(($180+12)|0);
 var $182=HEAP8[($181)];
 var $183=($182&255);
 var $184=$183&-2;
 var $185=$cflags;
 var $186=($185&255);
 var $187=$186&1;
 var $188=$184|$187;
 var $189=(($188)&255);
 var $190=$sym;
 var $191=(($190+12)|0);
 HEAP8[($191)]=$189;
 label=34;break;
 case 34:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _FreeSymbolList($sym){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $next;
 $1=$sym;
 label=2;break;
 case 2:
 var $3=$1;
 var $4=($3|0)!=0;
 if($4){label=3;break;}else{label=6;break;}
 case 3:
 var $6=$1;
 var $7=(($6)|0);
 var $8=HEAP32[(($7)>>2)];
 $next=$8;
 var $9=HEAP32[((1082672)>>2)];
 var $10=$1;
 var $11=(($10)|0);
 HEAP32[(($11)>>2)]=$9;
 var $12=$1;
 var $13=(($12+12)|0);
 var $14=HEAP8[($13)];
 var $15=($14&255);
 var $16=$15&8;
 var $17=($16|0)!=0;
 if($17){label=4;break;}else{label=5;break;}
 case 4:
 var $19=$1;
 var $20=(($19+8)|0);
 var $21=HEAP32[(($20)>>2)];
 _free($21);
 label=5;break;
 case 5:
 var $23=$1;
 HEAP32[((1082672)>>2)]=$23;
 var $24=$next;
 $1=$24;
 label=2;break;
 case 6:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _hash1367($str,$len){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $result;
 $1=$str;
 $2=$len;
 $result=0;
 label=2;break;
 case 2:
 var $4=$2;
 var $5=((($4)-(1))|0);
 $2=$5;
 var $6=($4|0)!=0;
 if($6){label=3;break;}else{label=4;break;}
 case 3:
 var $8=$result;
 var $9=$8<<2;
 var $10=$1;
 var $11=(($10+1)|0);
 $1=$11;
 var $12=HEAP8[($10)];
 var $13=(($12<<24)>>24);
 var $14=$9^$13;
 $result=$14;
 label=2;break;
 case 4:
 var $16=$result;
 var $17=$16&1023;
 STACKTOP=sp;return $17;
  default: assert(0, "bad label: " + label);
 }

}


function _v_byteop($str,$mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $value=sp;
 $1=$str;
 $2=$mne;
 _programlabel();
 var $3=$1;
 var $4=_parse_value($3,$value);
 var $5=HEAP32[(($value)>>2)];
 var $6=($5>>>0)>255;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=$2;
 var $9=(($8+8)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$1;
 _f8err(19,$10,$11,0);
 label=3;break;
 case 3:
 var $13=$2;
 var $14=(($13+20)|0);
 var $15=(($14)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=(($16)&255);
 var $18=HEAP32[(($value)>>2)];
 var $19=$18&255;
 var $20=(($19)&255);
 _emit_opcode2($17,$20);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_sreg_op($str,$mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $reg=sp;
 $1=$str;
 $2=$mne;
 _programlabel();
 var $3=$1;
 var $4=_parse_scratchpad_register($3,$reg);
 var $5=$2;
 var $6=(($5+20)|0);
 var $7=(($6)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=HEAP8[($reg)];
 var $10=($9&255);
 var $11=$8|$10;
 var $12=(($11)&255);
 _emit_opcode1($12);
 STACKTOP=sp;return;
}


function _v_branch($str,$mne){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$str;
 $2=$mne;
 var $3=$2;
 var $4=(($3+20)|0);
 var $5=(($4)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=(($6)&255);
 var $8=$1;
 _generate_branch($7,$8);
 STACKTOP=sp;return;
}


function _v_bf_bt($str,$mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $ncommas;
 var $cindex;
 var $i;
 var $op1;
 var $op2;
 var $value=sp;
 $1=$str;
 $2=$mne;
 $ncommas=0;
 $cindex=0;
 $i=0;
 label=2;break;
 case 2:
 var $4=$i;
 var $5=$1;
 var $6=(($5+$4)|0);
 var $7=HEAP8[($6)];
 var $8=(($7<<24)>>24)!=0;
 if($8){label=3;break;}else{label=7;break;}
 case 3:
 var $10=$i;
 var $11=$1;
 var $12=(($11+$10)|0);
 var $13=HEAP8[($12)];
 var $14=(($13<<24)>>24);
 var $15=44==($14|0);
 if($15){label=4;break;}else{label=5;break;}
 case 4:
 var $17=$ncommas;
 var $18=((($17)+(1))|0);
 $ncommas=$18;
 var $19=$i;
 $cindex=$19;
 label=5;break;
 case 5:
 label=6;break;
 case 6:
 var $22=$i;
 var $23=((($22)+(1))|0);
 $i=$23;
 label=2;break;
 case 7:
 var $25=$ncommas;
 var $26=1!=($25|0);
 if($26){label=8;break;}else{label=9;break;}
 case 8:
 var $28=$2;
 var $29=(($28+8)|0);
 var $30=HEAP32[(($29)>>2)];
 var $31=$1;
 _f8err(5,$30,$31,0);
 label=19;break;
 case 9:
 var $33=$cindex;
 var $34=$1;
 var $35=(($34+$33)|0);
 HEAP8[($35)]=0;
 var $36=$1;
 $op1=$36;
 var $37=$cindex;
 var $38=((($37)+(1))|0);
 var $39=$1;
 var $40=(($39+$38)|0);
 $op2=$40;
 var $41=$op1;
 var $42=_parse_value($41,$value);
 var $43=($42|0)!=0;
 if($43){label=10;break;}else{label=11;break;}
 case 10:
 _emit_opcode2(0,0);
 label=19;break;
 case 11:
 var $46=$cindex;
 var $47=$1;
 var $48=(($47+$46)|0);
 HEAP8[($48)]=44;
 var $49=$2;
 var $50=(($49+8)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=(($51+1)|0);
 var $53=HEAP8[($52)];
 var $54=(($53<<24)>>24);
 var $55=102==($54|0);
 if($55){label=12;break;}else{label=15;break;}
 case 12:
 var $57=HEAP32[(($value)>>2)];
 var $58=($57>>>0)>15;
 if($58){label=13;break;}else{label=14;break;}
 case 13:
 var $60=$2;
 var $61=(($60+8)|0);
 var $62=HEAP32[(($61)>>2)];
 var $63=$1;
 _f8err(30,$62,$63,0);
 var $64=HEAP32[(($value)>>2)];
 var $65=$64&15;
 HEAP32[(($value)>>2)]=$65;
 label=14;break;
 case 14:
 label=18;break;
 case 15:
 var $68=HEAP32[(($value)>>2)];
 var $69=($68>>>0)>7;
 if($69){label=16;break;}else{label=17;break;}
 case 16:
 var $71=$2;
 var $72=(($71+8)|0);
 var $73=HEAP32[(($72)>>2)];
 var $74=$1;
 _f8err(31,$73,$74,0);
 var $75=HEAP32[(($value)>>2)];
 var $76=$75&7;
 HEAP32[(($value)>>2)]=$76;
 label=17;break;
 case 17:
 label=18;break;
 case 18:
 var $79=$2;
 var $80=(($79+20)|0);
 var $81=(($80)|0);
 var $82=HEAP32[(($81)>>2)];
 var $83=HEAP32[(($value)>>2)];
 var $84=$82|$83;
 var $85=(($84)&255);
 var $86=$op2;
 _generate_branch($85,$86);
 label=19;break;
 case 19:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_wordop($str,$mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $value=sp;
 $1=$str;
 $2=$mne;
 _programlabel();
 var $3=$1;
 var $4=_parse_value($3,$value);
 var $5=HEAP32[(($value)>>2)];
 var $6=($5>>>0)>65535;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=$2;
 var $9=(($8+8)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$1;
 _f8err(33,$10,$11,0);
 label=3;break;
 case 3:
 var $13=$2;
 var $14=(($13+20)|0);
 var $15=(($14)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=(($16)&255);
 var $18=HEAP32[(($value)>>2)];
 var $19=$18>>>8;
 var $20=$19&255;
 var $21=(($20)&255);
 var $22=HEAP32[(($value)>>2)];
 var $23=$22&255;
 var $24=(($23)&255);
 _emit_opcode3($17,$21,$24);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_ins_outs($str,$mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $operand=sp;
 $1=$str;
 $2=$mne;
 _programlabel();
 var $3=$1;
 var $4=_parse_value($3,$operand);
 var $5=HEAP32[(($operand)>>2)];
 var $6=($5>>>0)>15;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=$2;
 var $9=(($8+8)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$1;
 _f8err(30,$10,$11,0);
 label=3;break;
 case 3:
 var $13=$2;
 var $14=(($13+20)|0);
 var $15=(($14)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=HEAP32[(($operand)>>2)];
 var $18=$17&15;
 var $19=$16|$18;
 var $20=(($19)&255);
 _emit_opcode1($20);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_lis($str,$mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $operand=sp;
 $1=$str;
 $2=$mne;
 _programlabel();
 var $3=$1;
 var $4=_parse_value($3,$operand);
 var $5=HEAP32[(($operand)>>2)];
 var $6=($5>>>0)>15;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=$2;
 var $9=(($8+8)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$1;
 _f8err(30,$10,$11,0);
 label=3;break;
 case 3:
 var $13=HEAP32[(($operand)>>2)];
 var $14=$13&15;
 var $15=112|$14;
 var $16=(($15)&255);
 _emit_opcode1($16);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_lisu_lisl($str,$mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $operand=sp;
 $1=$str;
 $2=$mne;
 _programlabel();
 var $3=$1;
 var $4=_parse_value($3,$operand);
 var $5=HEAP32[(($operand)>>2)];
 var $6=($5>>>0)>7;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=$2;
 var $9=(($8+8)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=$1;
 _f8err(31,$10,$11,0);
 label=3;break;
 case 3:
 var $13=$2;
 var $14=(($13+20)|0);
 var $15=(($14)|0);
 var $16=HEAP32[(($15)>>2)];
 var $17=HEAP32[(($operand)>>2)];
 var $18=$17&7;
 var $19=$16|$18;
 var $20=(($19)&255);
 _emit_opcode1($20);
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_lr($str,$mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $i;
 var $ncommas;
 var $cindex;
 var $op1;
 var $op2;
 var $reg_dst=sp;
 var $reg_src=(sp)+(8);
 var $opcode;
 $1=$str;
 $2=$mne;
 _programlabel();
 $ncommas=0;
 $cindex=0;
 $i=0;
 label=2;break;
 case 2:
 var $4=$i;
 var $5=$1;
 var $6=(($5+$4)|0);
 var $7=HEAP8[($6)];
 var $8=(($7<<24)>>24)!=0;
 if($8){label=3;break;}else{label=7;break;}
 case 3:
 var $10=$i;
 var $11=$1;
 var $12=(($11+$10)|0);
 var $13=HEAP8[($12)];
 var $14=(($13<<24)>>24);
 var $15=44==($14|0);
 if($15){label=4;break;}else{label=5;break;}
 case 4:
 var $17=$ncommas;
 var $18=((($17)+(1))|0);
 $ncommas=$18;
 var $19=$i;
 $cindex=$19;
 label=5;break;
 case 5:
 label=6;break;
 case 6:
 var $22=$i;
 var $23=((($22)+(1))|0);
 $i=$23;
 label=2;break;
 case 7:
 var $25=$ncommas;
 var $26=1!=($25|0);
 if($26){label=8;break;}else{label=9;break;}
 case 8:
 var $28=$2;
 var $29=(($28+8)|0);
 var $30=HEAP32[(($29)>>2)];
 var $31=$1;
 _f8err(5,$30,$31,0);
 label=84;break;
 case 9:
 var $33=$cindex;
 var $34=$1;
 var $35=(($34+$33)|0);
 HEAP8[($35)]=0;
 var $36=$1;
 $op1=$36;
 var $37=$cindex;
 var $38=((($37)+(1))|0);
 var $39=$1;
 var $40=(($39+$38)|0);
 $op2=$40;
 var $41=$cindex;
 var $42=0!=($41|0);
 if($42){label=10;break;}else{label=12;break;}
 case 10:
 var $44=$cindex;
 var $45=((($44)-(1))|0);
 var $46=$1;
 var $47=(($46+$45)|0);
 var $48=HEAP8[($47)];
 var $49=(($48<<24)>>24);
 var $50=_isspace($49);
 var $51=($50|0)!=0;
 if($51){label=11;break;}else{label=12;break;}
 case 11:
 var $53=$cindex;
 var $54=((($53)-(1))|0);
 var $55=$1;
 var $56=(($55+$54)|0);
 HEAP8[($56)]=0;
 label=12;break;
 case 12:
 var $58=$op2;
 var $59=HEAP8[($58)];
 var $60=(($59<<24)>>24);
 var $61=_isspace($60);
 var $62=($61|0)!=0;
 if($62){label=13;break;}else{label=14;break;}
 case 13:
 var $64=$op2;
 var $65=(($64+1)|0);
 $op2=$65;
 label=14;break;
 case 14:
 var $67=$op1;
 var $68=_parse_special_register($67);
 var $69=(($68)&255);
 HEAP8[($reg_dst)]=$69;
 var $70=HEAP8[($reg_dst)];
 var $71=($70&255);
 var $72=29==($71|0);
 if($72){label=15;break;}else{label=18;break;}
 case 15:
 var $74=$op1;
 var $75=_parse_scratchpad_register($74,$reg_dst);
 var $76=($75|0)!=0;
 if($76){label=16;break;}else{label=17;break;}
 case 16:
 _emit_opcode1(0);
 label=84;break;
 case 17:
 label=18;break;
 case 18:
 var $80=$op2;
 var $81=_parse_special_register($80);
 var $82=(($81)&255);
 HEAP8[($reg_src)]=$82;
 var $83=HEAP8[($reg_src)];
 var $84=($83&255);
 var $85=29==($84|0);
 if($85){label=19;break;}else{label=22;break;}
 case 19:
 var $87=$op2;
 var $88=_parse_scratchpad_register($87,$reg_src);
 var $89=($88|0)!=0;
 if($89){label=20;break;}else{label=21;break;}
 case 20:
 _emit_opcode1(0);
 label=84;break;
 case 21:
 label=22;break;
 case 22:
 var $93=$cindex;
 var $94=$1;
 var $95=(($94+$93)|0);
 HEAP8[($95)]=44;
 var $96=$cindex;
 var $97=0!=($96|0);
 if($97){label=23;break;}else{label=25;break;}
 case 23:
 var $99=$cindex;
 var $100=((($99)-(1))|0);
 var $101=$1;
 var $102=(($101+$100)|0);
 var $103=HEAP8[($102)];
 var $104=(($103<<24)>>24);
 var $105=0==($104|0);
 if($105){label=24;break;}else{label=25;break;}
 case 24:
 var $107=$cindex;
 var $108=((($107)-(1))|0);
 var $109=$1;
 var $110=(($109+$108)|0);
 HEAP8[($110)]=32;
 label=25;break;
 case 25:
 $opcode=-1;
 var $112=HEAP8[($reg_dst)];
 var $113=($112&255);
 switch(($113|0)){case 16:{ label=26;break;}case 17:{ label=36;break;}case 18:{ label=40;break;}case 19:{ label=43;break;}case 20:{ label=46;break;}case 22:{ label=49;break;}case 21:{ label=52;break;}case 23:{ label=55;break;}case 24:{ label=58;break;}case 25:{ label=61;break;}case 27:{ label=64;break;}case 26:{ label=67;break;}case 28:{ label=70;break;}default:{label=73;break;}}break;
 case 26:
 var $115=HEAP8[($reg_src)];
 var $116=($115&255);
 switch(($116|0)){case 19:{ label=27;break;}case 22:{ label=28;break;}case 21:{ label=29;break;}case 27:{ label=30;break;}case 26:{ label=31;break;}default:{label=32;break;}}break;
 case 27:
 $opcode=10;
 label=35;break;
 case 28:
 $opcode=1;
 label=35;break;
 case 29:
 $opcode=0;
 label=35;break;
 case 30:
 $opcode=3;
 label=35;break;
 case 31:
 $opcode=2;
 label=35;break;
 case 32:
 var $123=HEAP8[($reg_src)];
 var $124=($123&255);
 var $125=($124|0)<15;
 if($125){label=33;break;}else{label=34;break;}
 case 33:
 var $127=HEAP8[($reg_src)];
 var $128=($127&255);
 var $129=64|$128;
 $opcode=$129;
 label=34;break;
 case 34:
 label=35;break;
 case 35:
 label=81;break;
 case 36:
 var $133=HEAP8[($reg_src)];
 var $134=($133&255);
 if(($134|0)==18){ label=37;break;}else if(($134|0)==25){ label=38;break;}else{label=39;break;}
 case 37:
 $opcode=16;
 label=39;break;
 case 38:
 $opcode=15;
 label=39;break;
 case 39:
 label=81;break;
 case 40:
 var $139=HEAP8[($reg_src)];
 var $140=($139&255);
 var $141=17==($140|0);
 if($141){label=41;break;}else{label=42;break;}
 case 41:
 $opcode=17;
 label=42;break;
 case 42:
 label=81;break;
 case 43:
 var $145=HEAP8[($reg_src)];
 var $146=($145&255);
 var $147=16==($146|0);
 if($147){label=44;break;}else{label=45;break;}
 case 44:
 $opcode=11;
 label=45;break;
 case 45:
 label=81;break;
 case 46:
 var $151=HEAP8[($reg_src)];
 var $152=($151&255);
 var $153=24==($152|0);
 if($153){label=47;break;}else{label=48;break;}
 case 47:
 $opcode=8;
 label=48;break;
 case 48:
 label=81;break;
 case 49:
 var $157=HEAP8[($reg_src)];
 var $158=($157&255);
 var $159=16==($158|0);
 if($159){label=50;break;}else{label=51;break;}
 case 50:
 $opcode=5;
 label=51;break;
 case 51:
 label=81;break;
 case 52:
 var $163=HEAP8[($reg_src)];
 var $164=($163&255);
 var $165=16==($164|0);
 if($165){label=53;break;}else{label=54;break;}
 case 53:
 $opcode=4;
 label=54;break;
 case 54:
 label=81;break;
 case 55:
 var $169=HEAP8[($reg_src)];
 var $170=($169&255);
 var $171=25==($170|0);
 if($171){label=56;break;}else{label=57;break;}
 case 56:
 $opcode=13;
 label=57;break;
 case 57:
 label=81;break;
 case 58:
 var $175=HEAP8[($reg_src)];
 var $176=($175&255);
 var $177=20==($176|0);
 if($177){label=59;break;}else{label=60;break;}
 case 59:
 $opcode=9;
 label=60;break;
 case 60:
 label=81;break;
 case 61:
 var $181=HEAP8[($reg_src)];
 var $182=($181&255);
 var $183=17==($182|0);
 if($183){label=62;break;}else{label=63;break;}
 case 62:
 $opcode=14;
 label=63;break;
 case 63:
 label=81;break;
 case 64:
 var $187=HEAP8[($reg_src)];
 var $188=($187&255);
 var $189=16==($188|0);
 if($189){label=65;break;}else{label=66;break;}
 case 65:
 $opcode=7;
 label=66;break;
 case 66:
 label=81;break;
 case 67:
 var $193=HEAP8[($reg_src)];
 var $194=($193&255);
 var $195=16==($194|0);
 if($195){label=68;break;}else{label=69;break;}
 case 68:
 $opcode=6;
 label=69;break;
 case 69:
 label=81;break;
 case 70:
 var $199=HEAP8[($reg_src)];
 var $200=($199&255);
 var $201=9==($200|0);
 if($201){label=71;break;}else{label=72;break;}
 case 71:
 $opcode=29;
 label=72;break;
 case 72:
 label=81;break;
 case 73:
 var $205=HEAP8[($reg_dst)];
 var $206=($205&255);
 var $207=15>($206|0);
 if($207){label=74;break;}else{label=76;break;}
 case 74:
 var $209=HEAP8[($reg_src)];
 var $210=($209&255);
 var $211=16==($210|0);
 if($211){label=75;break;}else{label=76;break;}
 case 75:
 var $213=HEAP8[($reg_dst)];
 var $214=($213&255);
 var $215=80|$214;
 $opcode=$215;
 label=80;break;
 case 76:
 var $217=HEAP8[($reg_dst)];
 var $218=($217&255);
 var $219=9==($218|0);
 if($219){label=77;break;}else{label=79;break;}
 case 77:
 var $221=HEAP8[($reg_src)];
 var $222=($221&255);
 var $223=28==($222|0);
 if($223){label=78;break;}else{label=79;break;}
 case 78:
 $opcode=30;
 label=79;break;
 case 79:
 label=80;break;
 case 80:
 label=81;break;
 case 81:
 var $228=$opcode;
 var $229=($228|0)<0;
 if($229){label=82;break;}else{label=83;break;}
 case 82:
 var $231=$2;
 var $232=(($231+8)|0);
 var $233=HEAP32[(($232)>>2)];
 var $234=$1;
 _f8err(34,$233,$234,1);
 label=84;break;
 case 83:
 var $236=$opcode;
 var $237=(($236)&255);
 _emit_opcode1($237);
 label=84;break;
 case 84:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _v_sl_sr($str,$mne){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $operand=sp;
 $1=$str;
 $2=$mne;
 _programlabel();
 var $3=$1;
 var $4=_parse_value($3,$operand);
 var $5=($4|0)!=0;
 if($5){label=2;break;}else{label=3;break;}
 case 2:
 _emit_opcode1(0);
 label=8;break;
 case 3:
 var $8=HEAP32[(($operand)>>2)];
 if(($8|0)==1){ label=4;break;}else if(($8|0)==4){ label=5;break;}else{label=6;break;}
 case 4:
 var $10=$2;
 var $11=(($10+20)|0);
 var $12=(($11)|0);
 var $13=HEAP32[(($12)>>2)];
 var $14=(($13)&255);
 _emit_opcode1($14);
 label=7;break;
 case 5:
 var $16=$2;
 var $17=(($16+20)|0);
 var $18=(($17)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=((($19)+(2))|0);
 var $21=(($20)&255);
 _emit_opcode1($21);
 label=7;break;
 case 6:
 var $23=$2;
 var $24=(($23+8)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=$1;
 _f8err(29,$25,$26,0);
 _emit_opcode1(0);
 label=7;break;
 case 7:
 label=8;break;
 case 8:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _parse_value($str,$value){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $sym;
 var $result;
 $1=$str;
 $2=$value;
 $result=0;
 var $3=$2;
 HEAP32[(($3)>>2)]=0;
 var $4=$1;
 var $5=_eval($4,0);
 $sym=$5;
 var $6=$sym;
 var $7=(($6)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=0!=($8|0);
 if($9){label=3;break;}else{label=2;break;}
 case 2:
 var $11=$sym;
 var $12=(($11+13)|0);
 var $13=HEAP8[($12)];
 var $14=($13&255);
 var $15=3!=($14|0);
 if($15){label=3;break;}else{label=4;break;}
 case 3:
 var $17=$1;
 var $18=_asmerr(5,1,$17);
 label=8;break;
 case 4:
 var $20=$sym;
 var $21=(($20+12)|0);
 var $22=HEAP8[($21)];
 var $23=($22&255);
 var $24=$23&1;
 var $25=($24|0)!=0;
 if($25){label=5;break;}else{label=6;break;}
 case 5:
 var $27=HEAP32[((1086832)>>2)];
 var $28=((($27)+(1))|0);
 HEAP32[((1086832)>>2)]=$28;
 var $29=HEAP32[((1086808)>>2)];
 var $30=$29|1;
 HEAP32[((1086808)>>2)]=$30;
 $result=1;
 label=7;break;
 case 6:
 var $32=$sym;
 var $33=(($32+16)|0);
 var $34=HEAP32[(($33)>>2)];
 var $35=$2;
 HEAP32[(($35)>>2)]=$34;
 label=7;break;
 case 7:
 label=8;break;
 case 8:
 var $38=$sym;
 _FreeSymbolList($38);
 var $39=$result;
 STACKTOP=sp;return $39;
  default: assert(0, "bad label: " + label);
 }

}


function _f8err($err,$mnename,$opstring,$bAbort){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 var $4;
 var $buf;
 $1=$err;
 $2=$mnename;
 $3=$opstring;
 var $5=($bAbort&1);
 $4=$5;
 var $6=$2;
 var $7=_strlen($6);
 var $8=$3;
 var $9=_strlen($8);
 var $10=((($7)+($9))|0);
 var $11=((($10)+(64))|0);
 var $12=_ckmalloc($11);
 $buf=$12;
 var $13=$buf;
 var $14=$2;
 var $15=_strcpy($13,$14);
 var $16=$buf;
 var $17=_strcat($16,3768);
 var $18=$buf;
 var $19=$3;
 var $20=_strcat($18,$19);
 var $21=$1;
 var $22=$4;
 var $23=(($22)&1);
 var $24=$buf;
 var $25=_asmerr($21,$23,$24);
 var $26=$buf;
 _free($26);
 STACKTOP=sp;return;
}


function _emit_opcode2($byte0,$byte1){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 $1=$byte0;
 $2=$byte1;
 HEAP32[((1091304)>>2)]=2;
 var $3=$1;
 HEAP8[(1091312)]=$3;
 var $4=$2;
 HEAP8[(1091313)]=$4;
 _generate();
 STACKTOP=sp;return;
}


function _parse_scratchpad_register($str,$reg){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $3;
 var $regnum=sp;
 $2=$str;
 $3=$reg;
 var $4=$2;
 var $5=_strcasecmp(3720,$4);
 var $6=($5|0)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=$2;
 var $9=_strcasecmp(3624,$8);
 var $10=($9|0)!=0;
 if($10){label=4;break;}else{label=3;break;}
 case 3:
 var $12=$3;
 HEAP8[($12)]=12;
 $1=0;
 label=21;break;
 case 4:
 var $14=$2;
 var $15=_strcasecmp(3552,$14);
 var $16=($15|0)!=0;
 if($16){label=5;break;}else{label=6;break;}
 case 5:
 var $18=$2;
 var $19=_strcasecmp(3488,$18);
 var $20=($19|0)!=0;
 if($20){label=7;break;}else{label=6;break;}
 case 6:
 var $22=$3;
 HEAP8[($22)]=13;
 $1=0;
 label=21;break;
 case 7:
 var $24=$2;
 var $25=_strcasecmp(3392,$24);
 var $26=($25|0)!=0;
 if($26){label=8;break;}else{label=9;break;}
 case 8:
 var $28=$2;
 var $29=_strcasecmp(3344,$28);
 var $30=($29|0)!=0;
 if($30){label=10;break;}else{label=9;break;}
 case 9:
 var $32=$3;
 HEAP8[($32)]=14;
 $1=0;
 label=21;break;
 case 10:
 var $34=$2;
 var $35=_strcasecmp(3240,$34);
 var $36=($35|0)!=0;
 if($36){label=12;break;}else{label=11;break;}
 case 11:
 var $38=$3;
 HEAP8[($38)]=9;
 $1=0;
 label=21;break;
 case 12:
 var $40=$2;
 var $41=_strcasecmp(3176,$40);
 var $42=($41|0)!=0;
 if($42){label=14;break;}else{label=13;break;}
 case 13:
 var $44=$3;
 HEAP8[($44)]=10;
 $1=0;
 label=21;break;
 case 14:
 var $46=$2;
 var $47=_strcasecmp(3080,$46);
 var $48=($47|0)!=0;
 if($48){label=16;break;}else{label=15;break;}
 case 15:
 var $50=$3;
 HEAP8[($50)]=11;
 $1=0;
 label=21;break;
 case 16:
 var $52=$2;
 var $53=_parse_value($52,$regnum);
 var $54=($53|0)!=0;
 if($54){label=17;break;}else{label=18;break;}
 case 17:
 $1=1;
 label=21;break;
 case 18:
 var $57=HEAP32[(($regnum)>>2)];
 var $58=($57>>>0)>14;
 if($58){label=19;break;}else{label=20;break;}
 case 19:
 var $60=$2;
 var $61=_asmerr(32,1,$60);
 label=20;break;
 case 20:
 var $63=HEAP32[(($regnum)>>2)];
 var $64=(($63)&255);
 var $65=$3;
 HEAP8[($65)]=$64;
 $1=0;
 label=21;break;
 case 21:
 var $67=$1;
 STACKTOP=sp;return $67;
  default: assert(0, "bad label: " + label);
 }

}


function _emit_opcode1($opcode){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 $1=$opcode;
 HEAP32[((1091304)>>2)]=1;
 var $2=$1;
 HEAP8[(1091312)]=$2;
 _generate();
 STACKTOP=sp;return;
}


function _generate_branch($opcode,$str){
 var label=0;
 var tempVarArgs=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+72)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 var $target_adr=sp;
 var $disp;
 var $buf=(sp)+(8);
 $1=$opcode;
 $2=$str;
 _programlabel();
 var $3=$2;
 var $4=_parse_value($3,$target_adr);
 var $5=($4|0)!=0;
 if($5){label=2;break;}else{label=3;break;}
 case 2:
 _emit_opcode2(0,0);
 label=10;break;
 case 3:
 var $8=_isPCKnown();
 var $9=($8|0)!=0;
 if($9){label=4;break;}else{label=8;break;}
 case 4:
 var $11=HEAP32[(($target_adr)>>2)];
 var $12=_getPC();
 var $13=((($11)-($12))|0);
 var $14=((($13)-(1))|0);
 $disp=$14;
 var $15=$disp;
 var $16=($15|0)>127;
 if($16){label=6;break;}else{label=5;break;}
 case 5:
 var $18=$disp;
 var $19=($18|0)<-128;
 if($19){label=6;break;}else{label=7;break;}
 case 6:
 var $21=(($buf)|0);
 var $22=$disp;
 var $23=_sprintf($21,1600,(tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$22,tempVarArgs)); STACKTOP=tempVarArgs;
 var $24=(($buf)|0);
 var $25=_asmerr(15,0,$24);
 label=7;break;
 case 7:
 label=9;break;
 case 8:
 $disp=0;
 label=9;break;
 case 9:
 var $29=$1;
 var $30=$disp;
 var $31=$30&255;
 var $32=(($31)&255);
 _emit_opcode2($29,$32);
 label=10;break;
 case 10:
 STACKTOP=sp;return;
  default: assert(0, "bad label: " + label);
 }

}


function _emit_opcode3($byte0,$byte1,$byte2){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1;
 var $2;
 var $3;
 $1=$byte0;
 $2=$byte1;
 $3=$byte2;
 HEAP32[((1091304)>>2)]=3;
 var $4=$1;
 HEAP8[(1091312)]=$4;
 var $5=$2;
 HEAP8[(1091313)]=$5;
 var $6=$3;
 HEAP8[(1091314)]=$6;
 _generate();
 STACKTOP=sp;return;
}


function _parse_special_register($str){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $1;
 var $2;
 $2=$str;
 var $3=$2;
 var $4=_strcasecmp(3016,$3);
 var $5=($4|0)!=0;
 if($5){label=3;break;}else{label=2;break;}
 case 2:
 $1=16;
 label=31;break;
 case 3:
 var $8=$2;
 var $9=_strcasecmp(2952,$8);
 var $10=($9|0)!=0;
 if($10){label=4;break;}else{label=5;break;}
 case 4:
 var $12=$2;
 var $13=_strcasecmp(2864,$12);
 var $14=($13|0)!=0;
 if($14){label=6;break;}else{label=5;break;}
 case 5:
 $1=17;
 label=31;break;
 case 6:
 var $17=$2;
 var $18=_strcasecmp(2800,$17);
 var $19=($18|0)!=0;
 if($19){label=8;break;}else{label=7;break;}
 case 7:
 $1=18;
 label=31;break;
 case 8:
 var $22=$2;
 var $23=_strcasecmp(2744,$22);
 var $24=($23|0)!=0;
 if($24){label=10;break;}else{label=9;break;}
 case 9:
 $1=19;
 label=31;break;
 case 10:
 var $27=$2;
 var $28=_strcasecmp(2640,$27);
 var $29=($28|0)!=0;
 if($29){label=12;break;}else{label=11;break;}
 case 11:
 $1=20;
 label=31;break;
 case 12:
 var $32=$2;
 var $33=_strcasecmp(2536,$32);
 var $34=($33|0)!=0;
 if($34){label=14;break;}else{label=13;break;}
 case 13:
 $1=21;
 label=31;break;
 case 14:
 var $37=$2;
 var $38=_strcasecmp(2424,$37);
 var $39=($38|0)!=0;
 if($39){label=16;break;}else{label=15;break;}
 case 15:
 $1=22;
 label=31;break;
 case 16:
 var $42=$2;
 var $43=_strcasecmp(2312,$42);
 var $44=($43|0)!=0;
 if($44){label=17;break;}else{label=18;break;}
 case 17:
 var $46=$2;
 var $47=_strcasecmp(2208,$46);
 var $48=($47|0)!=0;
 if($48){label=19;break;}else{label=18;break;}
 case 18:
 $1=23;
 label=31;break;
 case 19:
 var $51=$2;
 var $52=_strcasecmp(2128,$51);
 var $53=($52|0)!=0;
 if($53){label=20;break;}else{label=21;break;}
 case 20:
 var $55=$2;
 var $56=_strcasecmp(2056,$55);
 var $57=($56|0)!=0;
 if($57){label=22;break;}else{label=21;break;}
 case 21:
 $1=24;
 label=31;break;
 case 22:
 var $60=$2;
 var $61=_strcasecmp(1960,$60);
 var $62=($61|0)!=0;
 if($62){label=24;break;}else{label=23;break;}
 case 23:
 $1=25;
 label=31;break;
 case 24:
 var $65=$2;
 var $66=_strcasecmp(1864,$65);
 var $67=($66|0)!=0;
 if($67){label=26;break;}else{label=25;break;}
 case 25:
 $1=26;
 label=31;break;
 case 26:
 var $70=$2;
 var $71=_strcasecmp(1776,$70);
 var $72=($71|0)!=0;
 if($72){label=28;break;}else{label=27;break;}
 case 27:
 $1=27;
 label=31;break;
 case 28:
 var $75=$2;
 var $76=_strcasecmp(1672,$75);
 var $77=($76|0)!=0;
 if($77){label=30;break;}else{label=29;break;}
 case 29:
 $1=28;
 label=31;break;
 case 30:
 $1=29;
 label=31;break;
 case 31:
 var $81=$1;
 STACKTOP=sp;return $81;
  default: assert(0, "bad label: " + label);
 }

}


function _isPCKnown(){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1;
 while(1)switch(label){
 case 1:
 var $pcf;
 var $1=HEAP32[((1091648)>>2)];
 var $2=(($1+8)|0);
 var $3=HEAP8[($2)];
 var $4=($3&255);
 var $5=$4&32;
 var $6=($5|0)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=HEAP32[((1091648)>>2)];
 var $9=(($8+9)|0);
 var $10=HEAP8[($9)];
 var $11=($10&255);
 var $18=$11;label=4;break;
 case 3:
 var $13=HEAP32[((1091648)>>2)];
 var $14=(($13+8)|0);
 var $15=HEAP8[($14)];
 var $16=($15&255);
 var $18=$16;label=4;break;
 case 4:
 var $18;
 var $19=(($18)&255);
 $pcf=$19;
 var $20=$pcf;
 var $21=($20&255);
 var $22=$21&3;
 var $23=($22|0)==0;
 var $24=($23?1:0);
 STACKTOP=sp;return $24;
  default: assert(0, "bad label: " + label);
 }

}


function _getPC(){
 var label=0;

 label = 1;
 while(1)switch(label){
 case 1:
 var $1=HEAP32[((1091648)>>2)];
 var $2=(($1+8)|0);
 var $3=HEAP8[($2)];
 var $4=($3&255);
 var $5=$4&32;
 var $6=($5|0)!=0;
 if($6){label=2;break;}else{label=3;break;}
 case 2:
 var $8=HEAP32[((1091648)>>2)];
 var $9=(($8+16)|0);
 var $10=HEAP32[(($9)>>2)];
 var $16=$10;label=4;break;
 case 3:
 var $12=HEAP32[((1091648)>>2)];
 var $13=(($12+12)|0);
 var $14=HEAP32[(($13)>>2)];
 var $16=$14;label=4;break;
 case 4:
 var $16;
 return $16;
  default: assert(0, "bad label: " + label);
 }

}


function _malloc($bytes){
 var label=0;

 label = 1;
 while(1)switch(label){
 case 1:
 var $1=($bytes>>>0)<245;
 if($1){label=2;break;}else{label=78;break;}
 case 2:
 var $3=($bytes>>>0)<11;
 if($3){var $8=16;label=4;break;}else{label=3;break;}
 case 3:
 var $5=((($bytes)+(11))|0);
 var $6=$5&-8;
 var $8=$6;label=4;break;
 case 4:
 var $8;
 var $9=$8>>>3;
 var $10=HEAP32[((1082192)>>2)];
 var $11=$10>>>($9>>>0);
 var $12=$11&3;
 var $13=($12|0)==0;
 if($13){label=12;break;}else{label=5;break;}
 case 5:
 var $15=$11&1;
 var $16=$15^1;
 var $17=((($16)+($9))|0);
 var $18=$17<<1;
 var $19=((1082232+($18<<2))|0);
 var $20=$19;
 var $_sum11=((($18)+(2))|0);
 var $21=((1082232+($_sum11<<2))|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=(($22+8)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=($20|0)==($24|0);
 if($25){label=6;break;}else{label=7;break;}
 case 6:
 var $27=1<<$17;
 var $28=$27^-1;
 var $29=$10&$28;
 HEAP32[((1082192)>>2)]=$29;
 label=11;break;
 case 7:
 var $31=$24;
 var $32=HEAP32[((1082208)>>2)];
 var $33=($31>>>0)<($32>>>0);
 if($33){label=10;break;}else{label=8;break;}
 case 8:
 var $35=(($24+12)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=($36|0)==($22|0);
 if($37){label=9;break;}else{label=10;break;}
 case 9:
 HEAP32[(($35)>>2)]=$20;
 HEAP32[(($21)>>2)]=$24;
 label=11;break;
 case 10:
 _abort();
 throw "Reached an unreachable!";
 case 11:
 var $40=$17<<3;
 var $41=$40|3;
 var $42=(($22+4)|0);
 HEAP32[(($42)>>2)]=$41;
 var $43=$22;
 var $_sum1314=$40|4;
 var $44=(($43+$_sum1314)|0);
 var $45=$44;
 var $46=HEAP32[(($45)>>2)];
 var $47=$46|1;
 HEAP32[(($45)>>2)]=$47;
 var $48=$23;
 var $mem_0=$48;label=341;break;
 case 12:
 var $50=HEAP32[((1082200)>>2)];
 var $51=($8>>>0)>($50>>>0);
 if($51){label=13;break;}else{var $nb_0=$8;label=160;break;}
 case 13:
 var $53=($11|0)==0;
 if($53){label=27;break;}else{label=14;break;}
 case 14:
 var $55=$11<<$9;
 var $56=2<<$9;
 var $57=(((-$56))|0);
 var $58=$56|$57;
 var $59=$55&$58;
 var $60=(((-$59))|0);
 var $61=$59&$60;
 var $62=((($61)-(1))|0);
 var $63=$62>>>12;
 var $64=$63&16;
 var $65=$62>>>($64>>>0);
 var $66=$65>>>5;
 var $67=$66&8;
 var $68=$67|$64;
 var $69=$65>>>($67>>>0);
 var $70=$69>>>2;
 var $71=$70&4;
 var $72=$68|$71;
 var $73=$69>>>($71>>>0);
 var $74=$73>>>1;
 var $75=$74&2;
 var $76=$72|$75;
 var $77=$73>>>($75>>>0);
 var $78=$77>>>1;
 var $79=$78&1;
 var $80=$76|$79;
 var $81=$77>>>($79>>>0);
 var $82=((($80)+($81))|0);
 var $83=$82<<1;
 var $84=((1082232+($83<<2))|0);
 var $85=$84;
 var $_sum4=((($83)+(2))|0);
 var $86=((1082232+($_sum4<<2))|0);
 var $87=HEAP32[(($86)>>2)];
 var $88=(($87+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($85|0)==($89|0);
 if($90){label=15;break;}else{label=16;break;}
 case 15:
 var $92=1<<$82;
 var $93=$92^-1;
 var $94=$10&$93;
 HEAP32[((1082192)>>2)]=$94;
 label=20;break;
 case 16:
 var $96=$89;
 var $97=HEAP32[((1082208)>>2)];
 var $98=($96>>>0)<($97>>>0);
 if($98){label=19;break;}else{label=17;break;}
 case 17:
 var $100=(($89+12)|0);
 var $101=HEAP32[(($100)>>2)];
 var $102=($101|0)==($87|0);
 if($102){label=18;break;}else{label=19;break;}
 case 18:
 HEAP32[(($100)>>2)]=$85;
 HEAP32[(($86)>>2)]=$89;
 label=20;break;
 case 19:
 _abort();
 throw "Reached an unreachable!";
 case 20:
 var $105=$82<<3;
 var $106=((($105)-($8))|0);
 var $107=$8|3;
 var $108=(($87+4)|0);
 HEAP32[(($108)>>2)]=$107;
 var $109=$87;
 var $110=(($109+$8)|0);
 var $111=$110;
 var $112=$106|1;
 var $_sum67=$8|4;
 var $113=(($109+$_sum67)|0);
 var $114=$113;
 HEAP32[(($114)>>2)]=$112;
 var $115=(($109+$105)|0);
 var $116=$115;
 HEAP32[(($116)>>2)]=$106;
 var $117=HEAP32[((1082200)>>2)];
 var $118=($117|0)==0;
 if($118){label=26;break;}else{label=21;break;}
 case 21:
 var $120=HEAP32[((1082212)>>2)];
 var $121=$117>>>3;
 var $122=$121<<1;
 var $123=((1082232+($122<<2))|0);
 var $124=$123;
 var $125=HEAP32[((1082192)>>2)];
 var $126=1<<$121;
 var $127=$125&$126;
 var $128=($127|0)==0;
 if($128){label=22;break;}else{label=23;break;}
 case 22:
 var $130=$125|$126;
 HEAP32[((1082192)>>2)]=$130;
 var $_sum9_pre=((($122)+(2))|0);
 var $_pre=((1082232+($_sum9_pre<<2))|0);
 var $F4_0=$124;var $_pre_phi=$_pre;label=25;break;
 case 23:
 var $_sum10=((($122)+(2))|0);
 var $132=((1082232+($_sum10<<2))|0);
 var $133=HEAP32[(($132)>>2)];
 var $134=$133;
 var $135=HEAP32[((1082208)>>2)];
 var $136=($134>>>0)<($135>>>0);
 if($136){label=24;break;}else{var $F4_0=$133;var $_pre_phi=$132;label=25;break;}
 case 24:
 _abort();
 throw "Reached an unreachable!";
 case 25:
 var $_pre_phi;
 var $F4_0;
 HEAP32[(($_pre_phi)>>2)]=$120;
 var $139=(($F4_0+12)|0);
 HEAP32[(($139)>>2)]=$120;
 var $140=(($120+8)|0);
 HEAP32[(($140)>>2)]=$F4_0;
 var $141=(($120+12)|0);
 HEAP32[(($141)>>2)]=$124;
 label=26;break;
 case 26:
 HEAP32[((1082200)>>2)]=$106;
 HEAP32[((1082212)>>2)]=$111;
 var $143=$88;
 var $mem_0=$143;label=341;break;
 case 27:
 var $145=HEAP32[((1082196)>>2)];
 var $146=($145|0)==0;
 if($146){var $nb_0=$8;label=160;break;}else{label=28;break;}
 case 28:
 var $148=(((-$145))|0);
 var $149=$145&$148;
 var $150=((($149)-(1))|0);
 var $151=$150>>>12;
 var $152=$151&16;
 var $153=$150>>>($152>>>0);
 var $154=$153>>>5;
 var $155=$154&8;
 var $156=$155|$152;
 var $157=$153>>>($155>>>0);
 var $158=$157>>>2;
 var $159=$158&4;
 var $160=$156|$159;
 var $161=$157>>>($159>>>0);
 var $162=$161>>>1;
 var $163=$162&2;
 var $164=$160|$163;
 var $165=$161>>>($163>>>0);
 var $166=$165>>>1;
 var $167=$166&1;
 var $168=$164|$167;
 var $169=$165>>>($167>>>0);
 var $170=((($168)+($169))|0);
 var $171=((1082496+($170<<2))|0);
 var $172=HEAP32[(($171)>>2)];
 var $173=(($172+4)|0);
 var $174=HEAP32[(($173)>>2)];
 var $175=$174&-8;
 var $176=((($175)-($8))|0);
 var $t_0_i=$172;var $v_0_i=$172;var $rsize_0_i=$176;label=29;break;
 case 29:
 var $rsize_0_i;
 var $v_0_i;
 var $t_0_i;
 var $178=(($t_0_i+16)|0);
 var $179=HEAP32[(($178)>>2)];
 var $180=($179|0)==0;
 if($180){label=30;break;}else{var $185=$179;label=31;break;}
 case 30:
 var $182=(($t_0_i+20)|0);
 var $183=HEAP32[(($182)>>2)];
 var $184=($183|0)==0;
 if($184){label=32;break;}else{var $185=$183;label=31;break;}
 case 31:
 var $185;
 var $186=(($185+4)|0);
 var $187=HEAP32[(($186)>>2)];
 var $188=$187&-8;
 var $189=((($188)-($8))|0);
 var $190=($189>>>0)<($rsize_0_i>>>0);
 var $_rsize_0_i=($190?$189:$rsize_0_i);
 var $_v_0_i=($190?$185:$v_0_i);
 var $t_0_i=$185;var $v_0_i=$_v_0_i;var $rsize_0_i=$_rsize_0_i;label=29;break;
 case 32:
 var $192=$v_0_i;
 var $193=HEAP32[((1082208)>>2)];
 var $194=($192>>>0)<($193>>>0);
 if($194){label=76;break;}else{label=33;break;}
 case 33:
 var $196=(($192+$8)|0);
 var $197=$196;
 var $198=($192>>>0)<($196>>>0);
 if($198){label=34;break;}else{label=76;break;}
 case 34:
 var $200=(($v_0_i+24)|0);
 var $201=HEAP32[(($200)>>2)];
 var $202=(($v_0_i+12)|0);
 var $203=HEAP32[(($202)>>2)];
 var $204=($203|0)==($v_0_i|0);
 if($204){label=40;break;}else{label=35;break;}
 case 35:
 var $206=(($v_0_i+8)|0);
 var $207=HEAP32[(($206)>>2)];
 var $208=$207;
 var $209=($208>>>0)<($193>>>0);
 if($209){label=39;break;}else{label=36;break;}
 case 36:
 var $211=(($207+12)|0);
 var $212=HEAP32[(($211)>>2)];
 var $213=($212|0)==($v_0_i|0);
 if($213){label=37;break;}else{label=39;break;}
 case 37:
 var $215=(($203+8)|0);
 var $216=HEAP32[(($215)>>2)];
 var $217=($216|0)==($v_0_i|0);
 if($217){label=38;break;}else{label=39;break;}
 case 38:
 HEAP32[(($211)>>2)]=$203;
 HEAP32[(($215)>>2)]=$207;
 var $R_1_i=$203;label=47;break;
 case 39:
 _abort();
 throw "Reached an unreachable!";
 case 40:
 var $220=(($v_0_i+20)|0);
 var $221=HEAP32[(($220)>>2)];
 var $222=($221|0)==0;
 if($222){label=41;break;}else{var $R_0_i=$221;var $RP_0_i=$220;label=42;break;}
 case 41:
 var $224=(($v_0_i+16)|0);
 var $225=HEAP32[(($224)>>2)];
 var $226=($225|0)==0;
 if($226){var $R_1_i=0;label=47;break;}else{var $R_0_i=$225;var $RP_0_i=$224;label=42;break;}
 case 42:
 var $RP_0_i;
 var $R_0_i;
 var $227=(($R_0_i+20)|0);
 var $228=HEAP32[(($227)>>2)];
 var $229=($228|0)==0;
 if($229){label=43;break;}else{var $R_0_i=$228;var $RP_0_i=$227;label=42;break;}
 case 43:
 var $231=(($R_0_i+16)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=($232|0)==0;
 if($233){label=44;break;}else{var $R_0_i=$232;var $RP_0_i=$231;label=42;break;}
 case 44:
 var $235=$RP_0_i;
 var $236=($235>>>0)<($193>>>0);
 if($236){label=46;break;}else{label=45;break;}
 case 45:
 HEAP32[(($RP_0_i)>>2)]=0;
 var $R_1_i=$R_0_i;label=47;break;
 case 46:
 _abort();
 throw "Reached an unreachable!";
 case 47:
 var $R_1_i;
 var $240=($201|0)==0;
 if($240){label=67;break;}else{label=48;break;}
 case 48:
 var $242=(($v_0_i+28)|0);
 var $243=HEAP32[(($242)>>2)];
 var $244=((1082496+($243<<2))|0);
 var $245=HEAP32[(($244)>>2)];
 var $246=($v_0_i|0)==($245|0);
 if($246){label=49;break;}else{label=51;break;}
 case 49:
 HEAP32[(($244)>>2)]=$R_1_i;
 var $cond_i=($R_1_i|0)==0;
 if($cond_i){label=50;break;}else{label=57;break;}
 case 50:
 var $248=HEAP32[(($242)>>2)];
 var $249=1<<$248;
 var $250=$249^-1;
 var $251=HEAP32[((1082196)>>2)];
 var $252=$251&$250;
 HEAP32[((1082196)>>2)]=$252;
 label=67;break;
 case 51:
 var $254=$201;
 var $255=HEAP32[((1082208)>>2)];
 var $256=($254>>>0)<($255>>>0);
 if($256){label=55;break;}else{label=52;break;}
 case 52:
 var $258=(($201+16)|0);
 var $259=HEAP32[(($258)>>2)];
 var $260=($259|0)==($v_0_i|0);
 if($260){label=53;break;}else{label=54;break;}
 case 53:
 HEAP32[(($258)>>2)]=$R_1_i;
 label=56;break;
 case 54:
 var $263=(($201+20)|0);
 HEAP32[(($263)>>2)]=$R_1_i;
 label=56;break;
 case 55:
 _abort();
 throw "Reached an unreachable!";
 case 56:
 var $266=($R_1_i|0)==0;
 if($266){label=67;break;}else{label=57;break;}
 case 57:
 var $268=$R_1_i;
 var $269=HEAP32[((1082208)>>2)];
 var $270=($268>>>0)<($269>>>0);
 if($270){label=66;break;}else{label=58;break;}
 case 58:
 var $272=(($R_1_i+24)|0);
 HEAP32[(($272)>>2)]=$201;
 var $273=(($v_0_i+16)|0);
 var $274=HEAP32[(($273)>>2)];
 var $275=($274|0)==0;
 if($275){label=62;break;}else{label=59;break;}
 case 59:
 var $277=$274;
 var $278=HEAP32[((1082208)>>2)];
 var $279=($277>>>0)<($278>>>0);
 if($279){label=61;break;}else{label=60;break;}
 case 60:
 var $281=(($R_1_i+16)|0);
 HEAP32[(($281)>>2)]=$274;
 var $282=(($274+24)|0);
 HEAP32[(($282)>>2)]=$R_1_i;
 label=62;break;
 case 61:
 _abort();
 throw "Reached an unreachable!";
 case 62:
 var $285=(($v_0_i+20)|0);
 var $286=HEAP32[(($285)>>2)];
 var $287=($286|0)==0;
 if($287){label=67;break;}else{label=63;break;}
 case 63:
 var $289=$286;
 var $290=HEAP32[((1082208)>>2)];
 var $291=($289>>>0)<($290>>>0);
 if($291){label=65;break;}else{label=64;break;}
 case 64:
 var $293=(($R_1_i+20)|0);
 HEAP32[(($293)>>2)]=$286;
 var $294=(($286+24)|0);
 HEAP32[(($294)>>2)]=$R_1_i;
 label=67;break;
 case 65:
 _abort();
 throw "Reached an unreachable!";
 case 66:
 _abort();
 throw "Reached an unreachable!";
 case 67:
 var $298=($rsize_0_i>>>0)<16;
 if($298){label=68;break;}else{label=69;break;}
 case 68:
 var $300=((($rsize_0_i)+($8))|0);
 var $301=$300|3;
 var $302=(($v_0_i+4)|0);
 HEAP32[(($302)>>2)]=$301;
 var $_sum4_i=((($300)+(4))|0);
 var $303=(($192+$_sum4_i)|0);
 var $304=$303;
 var $305=HEAP32[(($304)>>2)];
 var $306=$305|1;
 HEAP32[(($304)>>2)]=$306;
 label=77;break;
 case 69:
 var $308=$8|3;
 var $309=(($v_0_i+4)|0);
 HEAP32[(($309)>>2)]=$308;
 var $310=$rsize_0_i|1;
 var $_sum_i41=$8|4;
 var $311=(($192+$_sum_i41)|0);
 var $312=$311;
 HEAP32[(($312)>>2)]=$310;
 var $_sum1_i=((($rsize_0_i)+($8))|0);
 var $313=(($192+$_sum1_i)|0);
 var $314=$313;
 HEAP32[(($314)>>2)]=$rsize_0_i;
 var $315=HEAP32[((1082200)>>2)];
 var $316=($315|0)==0;
 if($316){label=75;break;}else{label=70;break;}
 case 70:
 var $318=HEAP32[((1082212)>>2)];
 var $319=$315>>>3;
 var $320=$319<<1;
 var $321=((1082232+($320<<2))|0);
 var $322=$321;
 var $323=HEAP32[((1082192)>>2)];
 var $324=1<<$319;
 var $325=$323&$324;
 var $326=($325|0)==0;
 if($326){label=71;break;}else{label=72;break;}
 case 71:
 var $328=$323|$324;
 HEAP32[((1082192)>>2)]=$328;
 var $_sum2_pre_i=((($320)+(2))|0);
 var $_pre_i=((1082232+($_sum2_pre_i<<2))|0);
 var $F1_0_i=$322;var $_pre_phi_i=$_pre_i;label=74;break;
 case 72:
 var $_sum3_i=((($320)+(2))|0);
 var $330=((1082232+($_sum3_i<<2))|0);
 var $331=HEAP32[(($330)>>2)];
 var $332=$331;
 var $333=HEAP32[((1082208)>>2)];
 var $334=($332>>>0)<($333>>>0);
 if($334){label=73;break;}else{var $F1_0_i=$331;var $_pre_phi_i=$330;label=74;break;}
 case 73:
 _abort();
 throw "Reached an unreachable!";
 case 74:
 var $_pre_phi_i;
 var $F1_0_i;
 HEAP32[(($_pre_phi_i)>>2)]=$318;
 var $337=(($F1_0_i+12)|0);
 HEAP32[(($337)>>2)]=$318;
 var $338=(($318+8)|0);
 HEAP32[(($338)>>2)]=$F1_0_i;
 var $339=(($318+12)|0);
 HEAP32[(($339)>>2)]=$322;
 label=75;break;
 case 75:
 HEAP32[((1082200)>>2)]=$rsize_0_i;
 HEAP32[((1082212)>>2)]=$197;
 label=77;break;
 case 76:
 _abort();
 throw "Reached an unreachable!";
 case 77:
 var $342=(($v_0_i+8)|0);
 var $343=$342;
 var $mem_0=$343;label=341;break;
 case 78:
 var $345=($bytes>>>0)>4294967231;
 if($345){var $nb_0=-1;label=160;break;}else{label=79;break;}
 case 79:
 var $347=((($bytes)+(11))|0);
 var $348=$347&-8;
 var $349=HEAP32[((1082196)>>2)];
 var $350=($349|0)==0;
 if($350){var $nb_0=$348;label=160;break;}else{label=80;break;}
 case 80:
 var $352=(((-$348))|0);
 var $353=$347>>>8;
 var $354=($353|0)==0;
 if($354){var $idx_0_i=0;label=83;break;}else{label=81;break;}
 case 81:
 var $356=($348>>>0)>16777215;
 if($356){var $idx_0_i=31;label=83;break;}else{label=82;break;}
 case 82:
 var $358=((($353)+(1048320))|0);
 var $359=$358>>>16;
 var $360=$359&8;
 var $361=$353<<$360;
 var $362=((($361)+(520192))|0);
 var $363=$362>>>16;
 var $364=$363&4;
 var $365=$364|$360;
 var $366=$361<<$364;
 var $367=((($366)+(245760))|0);
 var $368=$367>>>16;
 var $369=$368&2;
 var $370=$365|$369;
 var $371=(((14)-($370))|0);
 var $372=$366<<$369;
 var $373=$372>>>15;
 var $374=((($371)+($373))|0);
 var $375=$374<<1;
 var $376=((($374)+(7))|0);
 var $377=$348>>>($376>>>0);
 var $378=$377&1;
 var $379=$378|$375;
 var $idx_0_i=$379;label=83;break;
 case 83:
 var $idx_0_i;
 var $381=((1082496+($idx_0_i<<2))|0);
 var $382=HEAP32[(($381)>>2)];
 var $383=($382|0)==0;
 if($383){var $v_2_i=0;var $rsize_2_i=$352;var $t_1_i=0;label=90;break;}else{label=84;break;}
 case 84:
 var $385=($idx_0_i|0)==31;
 if($385){var $390=0;label=86;break;}else{label=85;break;}
 case 85:
 var $387=$idx_0_i>>>1;
 var $388=(((25)-($387))|0);
 var $390=$388;label=86;break;
 case 86:
 var $390;
 var $391=$348<<$390;
 var $v_0_i18=0;var $rsize_0_i17=$352;var $t_0_i16=$382;var $sizebits_0_i=$391;var $rst_0_i=0;label=87;break;
 case 87:
 var $rst_0_i;
 var $sizebits_0_i;
 var $t_0_i16;
 var $rsize_0_i17;
 var $v_0_i18;
 var $393=(($t_0_i16+4)|0);
 var $394=HEAP32[(($393)>>2)];
 var $395=$394&-8;
 var $396=((($395)-($348))|0);
 var $397=($396>>>0)<($rsize_0_i17>>>0);
 if($397){label=88;break;}else{var $v_1_i=$v_0_i18;var $rsize_1_i=$rsize_0_i17;label=89;break;}
 case 88:
 var $399=($395|0)==($348|0);
 if($399){var $v_2_i=$t_0_i16;var $rsize_2_i=$396;var $t_1_i=$t_0_i16;label=90;break;}else{var $v_1_i=$t_0_i16;var $rsize_1_i=$396;label=89;break;}
 case 89:
 var $rsize_1_i;
 var $v_1_i;
 var $401=(($t_0_i16+20)|0);
 var $402=HEAP32[(($401)>>2)];
 var $403=$sizebits_0_i>>>31;
 var $404=(($t_0_i16+16+($403<<2))|0);
 var $405=HEAP32[(($404)>>2)];
 var $406=($402|0)==0;
 var $407=($402|0)==($405|0);
 var $or_cond21_i=$406|$407;
 var $rst_1_i=($or_cond21_i?$rst_0_i:$402);
 var $408=($405|0)==0;
 var $409=$sizebits_0_i<<1;
 if($408){var $v_2_i=$v_1_i;var $rsize_2_i=$rsize_1_i;var $t_1_i=$rst_1_i;label=90;break;}else{var $v_0_i18=$v_1_i;var $rsize_0_i17=$rsize_1_i;var $t_0_i16=$405;var $sizebits_0_i=$409;var $rst_0_i=$rst_1_i;label=87;break;}
 case 90:
 var $t_1_i;
 var $rsize_2_i;
 var $v_2_i;
 var $410=($t_1_i|0)==0;
 var $411=($v_2_i|0)==0;
 var $or_cond_i=$410&$411;
 if($or_cond_i){label=91;break;}else{var $t_2_ph_i=$t_1_i;label=93;break;}
 case 91:
 var $413=2<<$idx_0_i;
 var $414=(((-$413))|0);
 var $415=$413|$414;
 var $416=$349&$415;
 var $417=($416|0)==0;
 if($417){var $nb_0=$348;label=160;break;}else{label=92;break;}
 case 92:
 var $419=(((-$416))|0);
 var $420=$416&$419;
 var $421=((($420)-(1))|0);
 var $422=$421>>>12;
 var $423=$422&16;
 var $424=$421>>>($423>>>0);
 var $425=$424>>>5;
 var $426=$425&8;
 var $427=$426|$423;
 var $428=$424>>>($426>>>0);
 var $429=$428>>>2;
 var $430=$429&4;
 var $431=$427|$430;
 var $432=$428>>>($430>>>0);
 var $433=$432>>>1;
 var $434=$433&2;
 var $435=$431|$434;
 var $436=$432>>>($434>>>0);
 var $437=$436>>>1;
 var $438=$437&1;
 var $439=$435|$438;
 var $440=$436>>>($438>>>0);
 var $441=((($439)+($440))|0);
 var $442=((1082496+($441<<2))|0);
 var $443=HEAP32[(($442)>>2)];
 var $t_2_ph_i=$443;label=93;break;
 case 93:
 var $t_2_ph_i;
 var $444=($t_2_ph_i|0)==0;
 if($444){var $rsize_3_lcssa_i=$rsize_2_i;var $v_3_lcssa_i=$v_2_i;label=96;break;}else{var $t_232_i=$t_2_ph_i;var $rsize_333_i=$rsize_2_i;var $v_334_i=$v_2_i;label=94;break;}
 case 94:
 var $v_334_i;
 var $rsize_333_i;
 var $t_232_i;
 var $445=(($t_232_i+4)|0);
 var $446=HEAP32[(($445)>>2)];
 var $447=$446&-8;
 var $448=((($447)-($348))|0);
 var $449=($448>>>0)<($rsize_333_i>>>0);
 var $_rsize_3_i=($449?$448:$rsize_333_i);
 var $t_2_v_3_i=($449?$t_232_i:$v_334_i);
 var $450=(($t_232_i+16)|0);
 var $451=HEAP32[(($450)>>2)];
 var $452=($451|0)==0;
 if($452){label=95;break;}else{var $t_232_i=$451;var $rsize_333_i=$_rsize_3_i;var $v_334_i=$t_2_v_3_i;label=94;break;}
 case 95:
 var $453=(($t_232_i+20)|0);
 var $454=HEAP32[(($453)>>2)];
 var $455=($454|0)==0;
 if($455){var $rsize_3_lcssa_i=$_rsize_3_i;var $v_3_lcssa_i=$t_2_v_3_i;label=96;break;}else{var $t_232_i=$454;var $rsize_333_i=$_rsize_3_i;var $v_334_i=$t_2_v_3_i;label=94;break;}
 case 96:
 var $v_3_lcssa_i;
 var $rsize_3_lcssa_i;
 var $456=($v_3_lcssa_i|0)==0;
 if($456){var $nb_0=$348;label=160;break;}else{label=97;break;}
 case 97:
 var $458=HEAP32[((1082200)>>2)];
 var $459=((($458)-($348))|0);
 var $460=($rsize_3_lcssa_i>>>0)<($459>>>0);
 if($460){label=98;break;}else{var $nb_0=$348;label=160;break;}
 case 98:
 var $462=$v_3_lcssa_i;
 var $463=HEAP32[((1082208)>>2)];
 var $464=($462>>>0)<($463>>>0);
 if($464){label=158;break;}else{label=99;break;}
 case 99:
 var $466=(($462+$348)|0);
 var $467=$466;
 var $468=($462>>>0)<($466>>>0);
 if($468){label=100;break;}else{label=158;break;}
 case 100:
 var $470=(($v_3_lcssa_i+24)|0);
 var $471=HEAP32[(($470)>>2)];
 var $472=(($v_3_lcssa_i+12)|0);
 var $473=HEAP32[(($472)>>2)];
 var $474=($473|0)==($v_3_lcssa_i|0);
 if($474){label=106;break;}else{label=101;break;}
 case 101:
 var $476=(($v_3_lcssa_i+8)|0);
 var $477=HEAP32[(($476)>>2)];
 var $478=$477;
 var $479=($478>>>0)<($463>>>0);
 if($479){label=105;break;}else{label=102;break;}
 case 102:
 var $481=(($477+12)|0);
 var $482=HEAP32[(($481)>>2)];
 var $483=($482|0)==($v_3_lcssa_i|0);
 if($483){label=103;break;}else{label=105;break;}
 case 103:
 var $485=(($473+8)|0);
 var $486=HEAP32[(($485)>>2)];
 var $487=($486|0)==($v_3_lcssa_i|0);
 if($487){label=104;break;}else{label=105;break;}
 case 104:
 HEAP32[(($481)>>2)]=$473;
 HEAP32[(($485)>>2)]=$477;
 var $R_1_i22=$473;label=113;break;
 case 105:
 _abort();
 throw "Reached an unreachable!";
 case 106:
 var $490=(($v_3_lcssa_i+20)|0);
 var $491=HEAP32[(($490)>>2)];
 var $492=($491|0)==0;
 if($492){label=107;break;}else{var $R_0_i20=$491;var $RP_0_i19=$490;label=108;break;}
 case 107:
 var $494=(($v_3_lcssa_i+16)|0);
 var $495=HEAP32[(($494)>>2)];
 var $496=($495|0)==0;
 if($496){var $R_1_i22=0;label=113;break;}else{var $R_0_i20=$495;var $RP_0_i19=$494;label=108;break;}
 case 108:
 var $RP_0_i19;
 var $R_0_i20;
 var $497=(($R_0_i20+20)|0);
 var $498=HEAP32[(($497)>>2)];
 var $499=($498|0)==0;
 if($499){label=109;break;}else{var $R_0_i20=$498;var $RP_0_i19=$497;label=108;break;}
 case 109:
 var $501=(($R_0_i20+16)|0);
 var $502=HEAP32[(($501)>>2)];
 var $503=($502|0)==0;
 if($503){label=110;break;}else{var $R_0_i20=$502;var $RP_0_i19=$501;label=108;break;}
 case 110:
 var $505=$RP_0_i19;
 var $506=($505>>>0)<($463>>>0);
 if($506){label=112;break;}else{label=111;break;}
 case 111:
 HEAP32[(($RP_0_i19)>>2)]=0;
 var $R_1_i22=$R_0_i20;label=113;break;
 case 112:
 _abort();
 throw "Reached an unreachable!";
 case 113:
 var $R_1_i22;
 var $510=($471|0)==0;
 if($510){label=133;break;}else{label=114;break;}
 case 114:
 var $512=(($v_3_lcssa_i+28)|0);
 var $513=HEAP32[(($512)>>2)];
 var $514=((1082496+($513<<2))|0);
 var $515=HEAP32[(($514)>>2)];
 var $516=($v_3_lcssa_i|0)==($515|0);
 if($516){label=115;break;}else{label=117;break;}
 case 115:
 HEAP32[(($514)>>2)]=$R_1_i22;
 var $cond_i23=($R_1_i22|0)==0;
 if($cond_i23){label=116;break;}else{label=123;break;}
 case 116:
 var $518=HEAP32[(($512)>>2)];
 var $519=1<<$518;
 var $520=$519^-1;
 var $521=HEAP32[((1082196)>>2)];
 var $522=$521&$520;
 HEAP32[((1082196)>>2)]=$522;
 label=133;break;
 case 117:
 var $524=$471;
 var $525=HEAP32[((1082208)>>2)];
 var $526=($524>>>0)<($525>>>0);
 if($526){label=121;break;}else{label=118;break;}
 case 118:
 var $528=(($471+16)|0);
 var $529=HEAP32[(($528)>>2)];
 var $530=($529|0)==($v_3_lcssa_i|0);
 if($530){label=119;break;}else{label=120;break;}
 case 119:
 HEAP32[(($528)>>2)]=$R_1_i22;
 label=122;break;
 case 120:
 var $533=(($471+20)|0);
 HEAP32[(($533)>>2)]=$R_1_i22;
 label=122;break;
 case 121:
 _abort();
 throw "Reached an unreachable!";
 case 122:
 var $536=($R_1_i22|0)==0;
 if($536){label=133;break;}else{label=123;break;}
 case 123:
 var $538=$R_1_i22;
 var $539=HEAP32[((1082208)>>2)];
 var $540=($538>>>0)<($539>>>0);
 if($540){label=132;break;}else{label=124;break;}
 case 124:
 var $542=(($R_1_i22+24)|0);
 HEAP32[(($542)>>2)]=$471;
 var $543=(($v_3_lcssa_i+16)|0);
 var $544=HEAP32[(($543)>>2)];
 var $545=($544|0)==0;
 if($545){label=128;break;}else{label=125;break;}
 case 125:
 var $547=$544;
 var $548=HEAP32[((1082208)>>2)];
 var $549=($547>>>0)<($548>>>0);
 if($549){label=127;break;}else{label=126;break;}
 case 126:
 var $551=(($R_1_i22+16)|0);
 HEAP32[(($551)>>2)]=$544;
 var $552=(($544+24)|0);
 HEAP32[(($552)>>2)]=$R_1_i22;
 label=128;break;
 case 127:
 _abort();
 throw "Reached an unreachable!";
 case 128:
 var $555=(($v_3_lcssa_i+20)|0);
 var $556=HEAP32[(($555)>>2)];
 var $557=($556|0)==0;
 if($557){label=133;break;}else{label=129;break;}
 case 129:
 var $559=$556;
 var $560=HEAP32[((1082208)>>2)];
 var $561=($559>>>0)<($560>>>0);
 if($561){label=131;break;}else{label=130;break;}
 case 130:
 var $563=(($R_1_i22+20)|0);
 HEAP32[(($563)>>2)]=$556;
 var $564=(($556+24)|0);
 HEAP32[(($564)>>2)]=$R_1_i22;
 label=133;break;
 case 131:
 _abort();
 throw "Reached an unreachable!";
 case 132:
 _abort();
 throw "Reached an unreachable!";
 case 133:
 var $568=($rsize_3_lcssa_i>>>0)<16;
 if($568){label=134;break;}else{label=135;break;}
 case 134:
 var $570=((($rsize_3_lcssa_i)+($348))|0);
 var $571=$570|3;
 var $572=(($v_3_lcssa_i+4)|0);
 HEAP32[(($572)>>2)]=$571;
 var $_sum19_i=((($570)+(4))|0);
 var $573=(($462+$_sum19_i)|0);
 var $574=$573;
 var $575=HEAP32[(($574)>>2)];
 var $576=$575|1;
 HEAP32[(($574)>>2)]=$576;
 label=159;break;
 case 135:
 var $578=$348|3;
 var $579=(($v_3_lcssa_i+4)|0);
 HEAP32[(($579)>>2)]=$578;
 var $580=$rsize_3_lcssa_i|1;
 var $_sum_i2540=$348|4;
 var $581=(($462+$_sum_i2540)|0);
 var $582=$581;
 HEAP32[(($582)>>2)]=$580;
 var $_sum1_i26=((($rsize_3_lcssa_i)+($348))|0);
 var $583=(($462+$_sum1_i26)|0);
 var $584=$583;
 HEAP32[(($584)>>2)]=$rsize_3_lcssa_i;
 var $585=$rsize_3_lcssa_i>>>3;
 var $586=($rsize_3_lcssa_i>>>0)<256;
 if($586){label=136;break;}else{label=141;break;}
 case 136:
 var $588=$585<<1;
 var $589=((1082232+($588<<2))|0);
 var $590=$589;
 var $591=HEAP32[((1082192)>>2)];
 var $592=1<<$585;
 var $593=$591&$592;
 var $594=($593|0)==0;
 if($594){label=137;break;}else{label=138;break;}
 case 137:
 var $596=$591|$592;
 HEAP32[((1082192)>>2)]=$596;
 var $_sum15_pre_i=((($588)+(2))|0);
 var $_pre_i27=((1082232+($_sum15_pre_i<<2))|0);
 var $F5_0_i=$590;var $_pre_phi_i28=$_pre_i27;label=140;break;
 case 138:
 var $_sum18_i=((($588)+(2))|0);
 var $598=((1082232+($_sum18_i<<2))|0);
 var $599=HEAP32[(($598)>>2)];
 var $600=$599;
 var $601=HEAP32[((1082208)>>2)];
 var $602=($600>>>0)<($601>>>0);
 if($602){label=139;break;}else{var $F5_0_i=$599;var $_pre_phi_i28=$598;label=140;break;}
 case 139:
 _abort();
 throw "Reached an unreachable!";
 case 140:
 var $_pre_phi_i28;
 var $F5_0_i;
 HEAP32[(($_pre_phi_i28)>>2)]=$467;
 var $605=(($F5_0_i+12)|0);
 HEAP32[(($605)>>2)]=$467;
 var $_sum16_i=((($348)+(8))|0);
 var $606=(($462+$_sum16_i)|0);
 var $607=$606;
 HEAP32[(($607)>>2)]=$F5_0_i;
 var $_sum17_i=((($348)+(12))|0);
 var $608=(($462+$_sum17_i)|0);
 var $609=$608;
 HEAP32[(($609)>>2)]=$590;
 label=159;break;
 case 141:
 var $611=$466;
 var $612=$rsize_3_lcssa_i>>>8;
 var $613=($612|0)==0;
 if($613){var $I7_0_i=0;label=144;break;}else{label=142;break;}
 case 142:
 var $615=($rsize_3_lcssa_i>>>0)>16777215;
 if($615){var $I7_0_i=31;label=144;break;}else{label=143;break;}
 case 143:
 var $617=((($612)+(1048320))|0);
 var $618=$617>>>16;
 var $619=$618&8;
 var $620=$612<<$619;
 var $621=((($620)+(520192))|0);
 var $622=$621>>>16;
 var $623=$622&4;
 var $624=$623|$619;
 var $625=$620<<$623;
 var $626=((($625)+(245760))|0);
 var $627=$626>>>16;
 var $628=$627&2;
 var $629=$624|$628;
 var $630=(((14)-($629))|0);
 var $631=$625<<$628;
 var $632=$631>>>15;
 var $633=((($630)+($632))|0);
 var $634=$633<<1;
 var $635=((($633)+(7))|0);
 var $636=$rsize_3_lcssa_i>>>($635>>>0);
 var $637=$636&1;
 var $638=$637|$634;
 var $I7_0_i=$638;label=144;break;
 case 144:
 var $I7_0_i;
 var $640=((1082496+($I7_0_i<<2))|0);
 var $_sum2_i=((($348)+(28))|0);
 var $641=(($462+$_sum2_i)|0);
 var $642=$641;
 HEAP32[(($642)>>2)]=$I7_0_i;
 var $_sum3_i29=((($348)+(16))|0);
 var $643=(($462+$_sum3_i29)|0);
 var $_sum4_i30=((($348)+(20))|0);
 var $644=(($462+$_sum4_i30)|0);
 var $645=$644;
 HEAP32[(($645)>>2)]=0;
 var $646=$643;
 HEAP32[(($646)>>2)]=0;
 var $647=HEAP32[((1082196)>>2)];
 var $648=1<<$I7_0_i;
 var $649=$647&$648;
 var $650=($649|0)==0;
 if($650){label=145;break;}else{label=146;break;}
 case 145:
 var $652=$647|$648;
 HEAP32[((1082196)>>2)]=$652;
 HEAP32[(($640)>>2)]=$611;
 var $653=$640;
 var $_sum5_i=((($348)+(24))|0);
 var $654=(($462+$_sum5_i)|0);
 var $655=$654;
 HEAP32[(($655)>>2)]=$653;
 var $_sum6_i=((($348)+(12))|0);
 var $656=(($462+$_sum6_i)|0);
 var $657=$656;
 HEAP32[(($657)>>2)]=$611;
 var $_sum7_i=((($348)+(8))|0);
 var $658=(($462+$_sum7_i)|0);
 var $659=$658;
 HEAP32[(($659)>>2)]=$611;
 label=159;break;
 case 146:
 var $661=HEAP32[(($640)>>2)];
 var $662=($I7_0_i|0)==31;
 if($662){var $667=0;label=148;break;}else{label=147;break;}
 case 147:
 var $664=$I7_0_i>>>1;
 var $665=(((25)-($664))|0);
 var $667=$665;label=148;break;
 case 148:
 var $667;
 var $668=(($661+4)|0);
 var $669=HEAP32[(($668)>>2)];
 var $670=$669&-8;
 var $671=($670|0)==($rsize_3_lcssa_i|0);
 if($671){var $T_0_lcssa_i=$661;label=155;break;}else{label=149;break;}
 case 149:
 var $672=$rsize_3_lcssa_i<<$667;
 var $T_028_i=$661;var $K12_029_i=$672;label=151;break;
 case 150:
 var $674=$K12_029_i<<1;
 var $675=(($682+4)|0);
 var $676=HEAP32[(($675)>>2)];
 var $677=$676&-8;
 var $678=($677|0)==($rsize_3_lcssa_i|0);
 if($678){var $T_0_lcssa_i=$682;label=155;break;}else{var $T_028_i=$682;var $K12_029_i=$674;label=151;break;}
 case 151:
 var $K12_029_i;
 var $T_028_i;
 var $680=$K12_029_i>>>31;
 var $681=(($T_028_i+16+($680<<2))|0);
 var $682=HEAP32[(($681)>>2)];
 var $683=($682|0)==0;
 if($683){label=152;break;}else{label=150;break;}
 case 152:
 var $685=$681;
 var $686=HEAP32[((1082208)>>2)];
 var $687=($685>>>0)<($686>>>0);
 if($687){label=154;break;}else{label=153;break;}
 case 153:
 HEAP32[(($681)>>2)]=$611;
 var $_sum12_i=((($348)+(24))|0);
 var $689=(($462+$_sum12_i)|0);
 var $690=$689;
 HEAP32[(($690)>>2)]=$T_028_i;
 var $_sum13_i=((($348)+(12))|0);
 var $691=(($462+$_sum13_i)|0);
 var $692=$691;
 HEAP32[(($692)>>2)]=$611;
 var $_sum14_i=((($348)+(8))|0);
 var $693=(($462+$_sum14_i)|0);
 var $694=$693;
 HEAP32[(($694)>>2)]=$611;
 label=159;break;
 case 154:
 _abort();
 throw "Reached an unreachable!";
 case 155:
 var $T_0_lcssa_i;
 var $696=(($T_0_lcssa_i+8)|0);
 var $697=HEAP32[(($696)>>2)];
 var $698=$T_0_lcssa_i;
 var $699=HEAP32[((1082208)>>2)];
 var $700=($698>>>0)>=($699>>>0);
 var $701=$697;
 var $702=($701>>>0)>=($699>>>0);
 var $or_cond26_i=$700&$702;
 if($or_cond26_i){label=156;break;}else{label=157;break;}
 case 156:
 var $704=(($697+12)|0);
 HEAP32[(($704)>>2)]=$611;
 HEAP32[(($696)>>2)]=$611;
 var $_sum9_i=((($348)+(8))|0);
 var $705=(($462+$_sum9_i)|0);
 var $706=$705;
 HEAP32[(($706)>>2)]=$697;
 var $_sum10_i=((($348)+(12))|0);
 var $707=(($462+$_sum10_i)|0);
 var $708=$707;
 HEAP32[(($708)>>2)]=$T_0_lcssa_i;
 var $_sum11_i=((($348)+(24))|0);
 var $709=(($462+$_sum11_i)|0);
 var $710=$709;
 HEAP32[(($710)>>2)]=0;
 label=159;break;
 case 157:
 _abort();
 throw "Reached an unreachable!";
 case 158:
 _abort();
 throw "Reached an unreachable!";
 case 159:
 var $712=(($v_3_lcssa_i+8)|0);
 var $713=$712;
 var $mem_0=$713;label=341;break;
 case 160:
 var $nb_0;
 var $714=HEAP32[((1082200)>>2)];
 var $715=($714>>>0)<($nb_0>>>0);
 if($715){label=165;break;}else{label=161;break;}
 case 161:
 var $717=((($714)-($nb_0))|0);
 var $718=HEAP32[((1082212)>>2)];
 var $719=($717>>>0)>15;
 if($719){label=162;break;}else{label=163;break;}
 case 162:
 var $721=$718;
 var $722=(($721+$nb_0)|0);
 var $723=$722;
 HEAP32[((1082212)>>2)]=$723;
 HEAP32[((1082200)>>2)]=$717;
 var $724=$717|1;
 var $_sum2=((($nb_0)+(4))|0);
 var $725=(($721+$_sum2)|0);
 var $726=$725;
 HEAP32[(($726)>>2)]=$724;
 var $727=(($721+$714)|0);
 var $728=$727;
 HEAP32[(($728)>>2)]=$717;
 var $729=$nb_0|3;
 var $730=(($718+4)|0);
 HEAP32[(($730)>>2)]=$729;
 label=164;break;
 case 163:
 HEAP32[((1082200)>>2)]=0;
 HEAP32[((1082212)>>2)]=0;
 var $732=$714|3;
 var $733=(($718+4)|0);
 HEAP32[(($733)>>2)]=$732;
 var $734=$718;
 var $_sum1=((($714)+(4))|0);
 var $735=(($734+$_sum1)|0);
 var $736=$735;
 var $737=HEAP32[(($736)>>2)];
 var $738=$737|1;
 HEAP32[(($736)>>2)]=$738;
 label=164;break;
 case 164:
 var $740=(($718+8)|0);
 var $741=$740;
 var $mem_0=$741;label=341;break;
 case 165:
 var $743=HEAP32[((1082204)>>2)];
 var $744=($743>>>0)>($nb_0>>>0);
 if($744){label=166;break;}else{label=167;break;}
 case 166:
 var $746=((($743)-($nb_0))|0);
 HEAP32[((1082204)>>2)]=$746;
 var $747=HEAP32[((1082216)>>2)];
 var $748=$747;
 var $749=(($748+$nb_0)|0);
 var $750=$749;
 HEAP32[((1082216)>>2)]=$750;
 var $751=$746|1;
 var $_sum=((($nb_0)+(4))|0);
 var $752=(($748+$_sum)|0);
 var $753=$752;
 HEAP32[(($753)>>2)]=$751;
 var $754=$nb_0|3;
 var $755=(($747+4)|0);
 HEAP32[(($755)>>2)]=$754;
 var $756=(($747+8)|0);
 var $757=$756;
 var $mem_0=$757;label=341;break;
 case 167:
 var $759=HEAP32[((80616)>>2)];
 var $760=($759|0)==0;
 if($760){label=168;break;}else{label=171;break;}
 case 168:
 var $762=_sysconf(30);
 var $763=((($762)-(1))|0);
 var $764=$763&$762;
 var $765=($764|0)==0;
 if($765){label=170;break;}else{label=169;break;}
 case 169:
 _abort();
 throw "Reached an unreachable!";
 case 170:
 HEAP32[((80624)>>2)]=$762;
 HEAP32[((80620)>>2)]=$762;
 HEAP32[((80628)>>2)]=-1;
 HEAP32[((80632)>>2)]=-1;
 HEAP32[((80636)>>2)]=0;
 HEAP32[((1082636)>>2)]=0;
 var $767=_time(0);
 var $768=$767&-16;
 var $769=$768^1431655768;
 HEAP32[((80616)>>2)]=$769;
 label=171;break;
 case 171:
 var $771=((($nb_0)+(48))|0);
 var $772=HEAP32[((80624)>>2)];
 var $773=((($nb_0)+(47))|0);
 var $774=((($772)+($773))|0);
 var $775=(((-$772))|0);
 var $776=$774&$775;
 var $777=($776>>>0)>($nb_0>>>0);
 if($777){label=172;break;}else{var $mem_0=0;label=341;break;}
 case 172:
 var $779=HEAP32[((1082632)>>2)];
 var $780=($779|0)==0;
 if($780){label=174;break;}else{label=173;break;}
 case 173:
 var $782=HEAP32[((1082624)>>2)];
 var $783=((($782)+($776))|0);
 var $784=($783>>>0)<=($782>>>0);
 var $785=($783>>>0)>($779>>>0);
 var $or_cond1_i=$784|$785;
 if($or_cond1_i){var $mem_0=0;label=341;break;}else{label=174;break;}
 case 174:
 var $787=HEAP32[((1082636)>>2)];
 var $788=$787&4;
 var $789=($788|0)==0;
 if($789){label=175;break;}else{var $tsize_1_i=0;label=198;break;}
 case 175:
 var $791=HEAP32[((1082216)>>2)];
 var $792=($791|0)==0;
 if($792){label=181;break;}else{label=176;break;}
 case 176:
 var $794=$791;
 var $sp_0_i_i=1082640;label=177;break;
 case 177:
 var $sp_0_i_i;
 var $796=(($sp_0_i_i)|0);
 var $797=HEAP32[(($796)>>2)];
 var $798=($797>>>0)>($794>>>0);
 if($798){label=179;break;}else{label=178;break;}
 case 178:
 var $800=(($sp_0_i_i+4)|0);
 var $801=HEAP32[(($800)>>2)];
 var $802=(($797+$801)|0);
 var $803=($802>>>0)>($794>>>0);
 if($803){label=180;break;}else{label=179;break;}
 case 179:
 var $805=(($sp_0_i_i+8)|0);
 var $806=HEAP32[(($805)>>2)];
 var $807=($806|0)==0;
 if($807){label=181;break;}else{var $sp_0_i_i=$806;label=177;break;}
 case 180:
 var $808=($sp_0_i_i|0)==0;
 if($808){label=181;break;}else{label=188;break;}
 case 181:
 var $809=_sbrk(0);
 var $810=($809|0)==-1;
 if($810){var $tsize_03141_i=0;label=197;break;}else{label=182;break;}
 case 182:
 var $812=$809;
 var $813=HEAP32[((80620)>>2)];
 var $814=((($813)-(1))|0);
 var $815=$814&$812;
 var $816=($815|0)==0;
 if($816){var $ssize_0_i=$776;label=184;break;}else{label=183;break;}
 case 183:
 var $818=((($814)+($812))|0);
 var $819=(((-$813))|0);
 var $820=$818&$819;
 var $821=((($776)-($812))|0);
 var $822=((($821)+($820))|0);
 var $ssize_0_i=$822;label=184;break;
 case 184:
 var $ssize_0_i;
 var $824=HEAP32[((1082624)>>2)];
 var $825=((($824)+($ssize_0_i))|0);
 var $826=($ssize_0_i>>>0)>($nb_0>>>0);
 var $827=($ssize_0_i>>>0)<2147483647;
 var $or_cond_i31=$826&$827;
 if($or_cond_i31){label=185;break;}else{var $tsize_03141_i=0;label=197;break;}
 case 185:
 var $829=HEAP32[((1082632)>>2)];
 var $830=($829|0)==0;
 if($830){label=187;break;}else{label=186;break;}
 case 186:
 var $832=($825>>>0)<=($824>>>0);
 var $833=($825>>>0)>($829>>>0);
 var $or_cond2_i=$832|$833;
 if($or_cond2_i){var $tsize_03141_i=0;label=197;break;}else{label=187;break;}
 case 187:
 var $835=_sbrk($ssize_0_i);
 var $836=($835|0)==($809|0);
 if($836){var $br_0_i=$809;var $ssize_1_i=$ssize_0_i;label=190;break;}else{var $ssize_129_i=$ssize_0_i;var $br_030_i=$835;label=191;break;}
 case 188:
 var $838=HEAP32[((1082204)>>2)];
 var $839=((($774)-($838))|0);
 var $840=$839&$775;
 var $841=($840>>>0)<2147483647;
 if($841){label=189;break;}else{var $tsize_03141_i=0;label=197;break;}
 case 189:
 var $843=_sbrk($840);
 var $844=HEAP32[(($796)>>2)];
 var $845=HEAP32[(($800)>>2)];
 var $846=(($844+$845)|0);
 var $847=($843|0)==($846|0);
 if($847){var $br_0_i=$843;var $ssize_1_i=$840;label=190;break;}else{var $ssize_129_i=$840;var $br_030_i=$843;label=191;break;}
 case 190:
 var $ssize_1_i;
 var $br_0_i;
 var $849=($br_0_i|0)==-1;
 if($849){var $tsize_03141_i=$ssize_1_i;label=197;break;}else{var $tsize_244_i=$ssize_1_i;var $tbase_245_i=$br_0_i;label=201;break;}
 case 191:
 var $br_030_i;
 var $ssize_129_i;
 var $850=(((-$ssize_129_i))|0);
 var $851=($br_030_i|0)!=-1;
 var $852=($ssize_129_i>>>0)<2147483647;
 var $or_cond5_i=$851&$852;
 var $853=($771>>>0)>($ssize_129_i>>>0);
 var $or_cond4_i=$or_cond5_i&$853;
 if($or_cond4_i){label=192;break;}else{var $ssize_2_i=$ssize_129_i;label=196;break;}
 case 192:
 var $855=HEAP32[((80624)>>2)];
 var $856=((($773)-($ssize_129_i))|0);
 var $857=((($856)+($855))|0);
 var $858=(((-$855))|0);
 var $859=$857&$858;
 var $860=($859>>>0)<2147483647;
 if($860){label=193;break;}else{var $ssize_2_i=$ssize_129_i;label=196;break;}
 case 193:
 var $862=_sbrk($859);
 var $863=($862|0)==-1;
 if($863){label=195;break;}else{label=194;break;}
 case 194:
 var $865=((($859)+($ssize_129_i))|0);
 var $ssize_2_i=$865;label=196;break;
 case 195:
 var $866=_sbrk($850);
 var $tsize_03141_i=0;label=197;break;
 case 196:
 var $ssize_2_i;
 var $868=($br_030_i|0)==-1;
 if($868){var $tsize_03141_i=0;label=197;break;}else{var $tsize_244_i=$ssize_2_i;var $tbase_245_i=$br_030_i;label=201;break;}
 case 197:
 var $tsize_03141_i;
 var $869=HEAP32[((1082636)>>2)];
 var $870=$869|4;
 HEAP32[((1082636)>>2)]=$870;
 var $tsize_1_i=$tsize_03141_i;label=198;break;
 case 198:
 var $tsize_1_i;
 var $872=($776>>>0)<2147483647;
 if($872){label=199;break;}else{label=340;break;}
 case 199:
 var $874=_sbrk($776);
 var $875=_sbrk(0);
 var $876=($874|0)!=-1;
 var $877=($875|0)!=-1;
 var $or_cond3_i=$876&$877;
 var $878=($874>>>0)<($875>>>0);
 var $or_cond6_i=$or_cond3_i&$878;
 if($or_cond6_i){label=200;break;}else{label=340;break;}
 case 200:
 var $880=$875;
 var $881=$874;
 var $882=((($880)-($881))|0);
 var $883=((($nb_0)+(40))|0);
 var $884=($882>>>0)>($883>>>0);
 var $_tsize_1_i=($884?$882:$tsize_1_i);
 if($884){var $tsize_244_i=$_tsize_1_i;var $tbase_245_i=$874;label=201;break;}else{label=340;break;}
 case 201:
 var $tbase_245_i;
 var $tsize_244_i;
 var $885=HEAP32[((1082624)>>2)];
 var $886=((($885)+($tsize_244_i))|0);
 HEAP32[((1082624)>>2)]=$886;
 var $887=HEAP32[((1082628)>>2)];
 var $888=($886>>>0)>($887>>>0);
 if($888){label=202;break;}else{label=203;break;}
 case 202:
 HEAP32[((1082628)>>2)]=$886;
 label=203;break;
 case 203:
 var $891=HEAP32[((1082216)>>2)];
 var $892=($891|0)==0;
 if($892){label=204;break;}else{var $sp_073_i=1082640;label=211;break;}
 case 204:
 var $894=HEAP32[((1082208)>>2)];
 var $895=($894|0)==0;
 var $896=($tbase_245_i>>>0)<($894>>>0);
 var $or_cond8_i=$895|$896;
 if($or_cond8_i){label=205;break;}else{label=206;break;}
 case 205:
 HEAP32[((1082208)>>2)]=$tbase_245_i;
 label=206;break;
 case 206:
 HEAP32[((1082640)>>2)]=$tbase_245_i;
 HEAP32[((1082644)>>2)]=$tsize_244_i;
 HEAP32[((1082652)>>2)]=0;
 var $899=HEAP32[((80616)>>2)];
 HEAP32[((1082228)>>2)]=$899;
 HEAP32[((1082224)>>2)]=-1;
 var $i_02_i_i=0;label=207;break;
 case 207:
 var $i_02_i_i;
 var $901=$i_02_i_i<<1;
 var $902=((1082232+($901<<2))|0);
 var $903=$902;
 var $_sum_i_i=((($901)+(3))|0);
 var $904=((1082232+($_sum_i_i<<2))|0);
 HEAP32[(($904)>>2)]=$903;
 var $_sum1_i_i=((($901)+(2))|0);
 var $905=((1082232+($_sum1_i_i<<2))|0);
 HEAP32[(($905)>>2)]=$903;
 var $906=((($i_02_i_i)+(1))|0);
 var $907=($906>>>0)<32;
 if($907){var $i_02_i_i=$906;label=207;break;}else{label=208;break;}
 case 208:
 var $908=((($tsize_244_i)-(40))|0);
 var $909=(($tbase_245_i+8)|0);
 var $910=$909;
 var $911=$910&7;
 var $912=($911|0)==0;
 if($912){var $916=0;label=210;break;}else{label=209;break;}
 case 209:
 var $914=(((-$910))|0);
 var $915=$914&7;
 var $916=$915;label=210;break;
 case 210:
 var $916;
 var $917=(($tbase_245_i+$916)|0);
 var $918=$917;
 var $919=((($908)-($916))|0);
 HEAP32[((1082216)>>2)]=$918;
 HEAP32[((1082204)>>2)]=$919;
 var $920=$919|1;
 var $_sum_i12_i=((($916)+(4))|0);
 var $921=(($tbase_245_i+$_sum_i12_i)|0);
 var $922=$921;
 HEAP32[(($922)>>2)]=$920;
 var $_sum2_i_i=((($tsize_244_i)-(36))|0);
 var $923=(($tbase_245_i+$_sum2_i_i)|0);
 var $924=$923;
 HEAP32[(($924)>>2)]=40;
 var $925=HEAP32[((80632)>>2)];
 HEAP32[((1082220)>>2)]=$925;
 label=338;break;
 case 211:
 var $sp_073_i;
 var $926=(($sp_073_i)|0);
 var $927=HEAP32[(($926)>>2)];
 var $928=(($sp_073_i+4)|0);
 var $929=HEAP32[(($928)>>2)];
 var $930=(($927+$929)|0);
 var $931=($tbase_245_i|0)==($930|0);
 if($931){label=213;break;}else{label=212;break;}
 case 212:
 var $933=(($sp_073_i+8)|0);
 var $934=HEAP32[(($933)>>2)];
 var $935=($934|0)==0;
 if($935){label=218;break;}else{var $sp_073_i=$934;label=211;break;}
 case 213:
 var $936=(($sp_073_i+12)|0);
 var $937=HEAP32[(($936)>>2)];
 var $938=$937&8;
 var $939=($938|0)==0;
 if($939){label=214;break;}else{label=218;break;}
 case 214:
 var $941=$891;
 var $942=($941>>>0)>=($927>>>0);
 var $943=($941>>>0)<($tbase_245_i>>>0);
 var $or_cond47_i=$942&$943;
 if($or_cond47_i){label=215;break;}else{label=218;break;}
 case 215:
 var $945=((($929)+($tsize_244_i))|0);
 HEAP32[(($928)>>2)]=$945;
 var $946=HEAP32[((1082216)>>2)];
 var $947=HEAP32[((1082204)>>2)];
 var $948=((($947)+($tsize_244_i))|0);
 var $949=$946;
 var $950=(($946+8)|0);
 var $951=$950;
 var $952=$951&7;
 var $953=($952|0)==0;
 if($953){var $957=0;label=217;break;}else{label=216;break;}
 case 216:
 var $955=(((-$951))|0);
 var $956=$955&7;
 var $957=$956;label=217;break;
 case 217:
 var $957;
 var $958=(($949+$957)|0);
 var $959=$958;
 var $960=((($948)-($957))|0);
 HEAP32[((1082216)>>2)]=$959;
 HEAP32[((1082204)>>2)]=$960;
 var $961=$960|1;
 var $_sum_i16_i=((($957)+(4))|0);
 var $962=(($949+$_sum_i16_i)|0);
 var $963=$962;
 HEAP32[(($963)>>2)]=$961;
 var $_sum2_i17_i=((($948)+(4))|0);
 var $964=(($949+$_sum2_i17_i)|0);
 var $965=$964;
 HEAP32[(($965)>>2)]=40;
 var $966=HEAP32[((80632)>>2)];
 HEAP32[((1082220)>>2)]=$966;
 label=338;break;
 case 218:
 var $967=HEAP32[((1082208)>>2)];
 var $968=($tbase_245_i>>>0)<($967>>>0);
 if($968){label=219;break;}else{label=220;break;}
 case 219:
 HEAP32[((1082208)>>2)]=$tbase_245_i;
 label=220;break;
 case 220:
 var $970=(($tbase_245_i+$tsize_244_i)|0);
 var $sp_166_i=1082640;label=221;break;
 case 221:
 var $sp_166_i;
 var $972=(($sp_166_i)|0);
 var $973=HEAP32[(($972)>>2)];
 var $974=($973|0)==($970|0);
 if($974){label=223;break;}else{label=222;break;}
 case 222:
 var $976=(($sp_166_i+8)|0);
 var $977=HEAP32[(($976)>>2)];
 var $978=($977|0)==0;
 if($978){label=304;break;}else{var $sp_166_i=$977;label=221;break;}
 case 223:
 var $979=(($sp_166_i+12)|0);
 var $980=HEAP32[(($979)>>2)];
 var $981=$980&8;
 var $982=($981|0)==0;
 if($982){label=224;break;}else{label=304;break;}
 case 224:
 HEAP32[(($972)>>2)]=$tbase_245_i;
 var $984=(($sp_166_i+4)|0);
 var $985=HEAP32[(($984)>>2)];
 var $986=((($985)+($tsize_244_i))|0);
 HEAP32[(($984)>>2)]=$986;
 var $987=(($tbase_245_i+8)|0);
 var $988=$987;
 var $989=$988&7;
 var $990=($989|0)==0;
 if($990){var $995=0;label=226;break;}else{label=225;break;}
 case 225:
 var $992=(((-$988))|0);
 var $993=$992&7;
 var $995=$993;label=226;break;
 case 226:
 var $995;
 var $996=(($tbase_245_i+$995)|0);
 var $_sum102_i=((($tsize_244_i)+(8))|0);
 var $997=(($tbase_245_i+$_sum102_i)|0);
 var $998=$997;
 var $999=$998&7;
 var $1000=($999|0)==0;
 if($1000){var $1005=0;label=228;break;}else{label=227;break;}
 case 227:
 var $1002=(((-$998))|0);
 var $1003=$1002&7;
 var $1005=$1003;label=228;break;
 case 228:
 var $1005;
 var $_sum103_i=((($1005)+($tsize_244_i))|0);
 var $1006=(($tbase_245_i+$_sum103_i)|0);
 var $1007=$1006;
 var $1008=$1006;
 var $1009=$996;
 var $1010=((($1008)-($1009))|0);
 var $_sum_i19_i=((($995)+($nb_0))|0);
 var $1011=(($tbase_245_i+$_sum_i19_i)|0);
 var $1012=$1011;
 var $1013=((($1010)-($nb_0))|0);
 var $1014=$nb_0|3;
 var $_sum1_i20_i=((($995)+(4))|0);
 var $1015=(($tbase_245_i+$_sum1_i20_i)|0);
 var $1016=$1015;
 HEAP32[(($1016)>>2)]=$1014;
 var $1017=HEAP32[((1082216)>>2)];
 var $1018=($1007|0)==($1017|0);
 if($1018){label=229;break;}else{label=230;break;}
 case 229:
 var $1020=HEAP32[((1082204)>>2)];
 var $1021=((($1020)+($1013))|0);
 HEAP32[((1082204)>>2)]=$1021;
 HEAP32[((1082216)>>2)]=$1012;
 var $1022=$1021|1;
 var $_sum46_i_i=((($_sum_i19_i)+(4))|0);
 var $1023=(($tbase_245_i+$_sum46_i_i)|0);
 var $1024=$1023;
 HEAP32[(($1024)>>2)]=$1022;
 label=303;break;
 case 230:
 var $1026=HEAP32[((1082212)>>2)];
 var $1027=($1007|0)==($1026|0);
 if($1027){label=231;break;}else{label=232;break;}
 case 231:
 var $1029=HEAP32[((1082200)>>2)];
 var $1030=((($1029)+($1013))|0);
 HEAP32[((1082200)>>2)]=$1030;
 HEAP32[((1082212)>>2)]=$1012;
 var $1031=$1030|1;
 var $_sum44_i_i=((($_sum_i19_i)+(4))|0);
 var $1032=(($tbase_245_i+$_sum44_i_i)|0);
 var $1033=$1032;
 HEAP32[(($1033)>>2)]=$1031;
 var $_sum45_i_i=((($1030)+($_sum_i19_i))|0);
 var $1034=(($tbase_245_i+$_sum45_i_i)|0);
 var $1035=$1034;
 HEAP32[(($1035)>>2)]=$1030;
 label=303;break;
 case 232:
 var $_sum2_i21_i=((($tsize_244_i)+(4))|0);
 var $_sum104_i=((($_sum2_i21_i)+($1005))|0);
 var $1037=(($tbase_245_i+$_sum104_i)|0);
 var $1038=$1037;
 var $1039=HEAP32[(($1038)>>2)];
 var $1040=$1039&3;
 var $1041=($1040|0)==1;
 if($1041){label=233;break;}else{var $oldfirst_0_i_i=$1007;var $qsize_0_i_i=$1013;label=280;break;}
 case 233:
 var $1043=$1039&-8;
 var $1044=$1039>>>3;
 var $1045=($1039>>>0)<256;
 if($1045){label=234;break;}else{label=246;break;}
 case 234:
 var $_sum3940_i_i=$1005|8;
 var $_sum114_i=((($_sum3940_i_i)+($tsize_244_i))|0);
 var $1047=(($tbase_245_i+$_sum114_i)|0);
 var $1048=$1047;
 var $1049=HEAP32[(($1048)>>2)];
 var $_sum41_i_i=((($tsize_244_i)+(12))|0);
 var $_sum115_i=((($_sum41_i_i)+($1005))|0);
 var $1050=(($tbase_245_i+$_sum115_i)|0);
 var $1051=$1050;
 var $1052=HEAP32[(($1051)>>2)];
 var $1053=$1044<<1;
 var $1054=((1082232+($1053<<2))|0);
 var $1055=$1054;
 var $1056=($1049|0)==($1055|0);
 if($1056){label=237;break;}else{label=235;break;}
 case 235:
 var $1058=$1049;
 var $1059=HEAP32[((1082208)>>2)];
 var $1060=($1058>>>0)<($1059>>>0);
 if($1060){label=245;break;}else{label=236;break;}
 case 236:
 var $1062=(($1049+12)|0);
 var $1063=HEAP32[(($1062)>>2)];
 var $1064=($1063|0)==($1007|0);
 if($1064){label=237;break;}else{label=245;break;}
 case 237:
 var $1065=($1052|0)==($1049|0);
 if($1065){label=238;break;}else{label=239;break;}
 case 238:
 var $1067=1<<$1044;
 var $1068=$1067^-1;
 var $1069=HEAP32[((1082192)>>2)];
 var $1070=$1069&$1068;
 HEAP32[((1082192)>>2)]=$1070;
 label=279;break;
 case 239:
 var $1072=($1052|0)==($1055|0);
 if($1072){label=240;break;}else{label=241;break;}
 case 240:
 var $_pre62_i_i=(($1052+8)|0);
 var $_pre_phi63_i_i=$_pre62_i_i;label=243;break;
 case 241:
 var $1074=$1052;
 var $1075=HEAP32[((1082208)>>2)];
 var $1076=($1074>>>0)<($1075>>>0);
 if($1076){label=244;break;}else{label=242;break;}
 case 242:
 var $1078=(($1052+8)|0);
 var $1079=HEAP32[(($1078)>>2)];
 var $1080=($1079|0)==($1007|0);
 if($1080){var $_pre_phi63_i_i=$1078;label=243;break;}else{label=244;break;}
 case 243:
 var $_pre_phi63_i_i;
 var $1081=(($1049+12)|0);
 HEAP32[(($1081)>>2)]=$1052;
 HEAP32[(($_pre_phi63_i_i)>>2)]=$1049;
 label=279;break;
 case 244:
 _abort();
 throw "Reached an unreachable!";
 case 245:
 _abort();
 throw "Reached an unreachable!";
 case 246:
 var $1083=$1006;
 var $_sum34_i_i=$1005|24;
 var $_sum105_i=((($_sum34_i_i)+($tsize_244_i))|0);
 var $1084=(($tbase_245_i+$_sum105_i)|0);
 var $1085=$1084;
 var $1086=HEAP32[(($1085)>>2)];
 var $_sum5_i_i=((($tsize_244_i)+(12))|0);
 var $_sum106_i=((($_sum5_i_i)+($1005))|0);
 var $1087=(($tbase_245_i+$_sum106_i)|0);
 var $1088=$1087;
 var $1089=HEAP32[(($1088)>>2)];
 var $1090=($1089|0)==($1083|0);
 if($1090){label=252;break;}else{label=247;break;}
 case 247:
 var $_sum3637_i_i=$1005|8;
 var $_sum107_i=((($_sum3637_i_i)+($tsize_244_i))|0);
 var $1092=(($tbase_245_i+$_sum107_i)|0);
 var $1093=$1092;
 var $1094=HEAP32[(($1093)>>2)];
 var $1095=$1094;
 var $1096=HEAP32[((1082208)>>2)];
 var $1097=($1095>>>0)<($1096>>>0);
 if($1097){label=251;break;}else{label=248;break;}
 case 248:
 var $1099=(($1094+12)|0);
 var $1100=HEAP32[(($1099)>>2)];
 var $1101=($1100|0)==($1083|0);
 if($1101){label=249;break;}else{label=251;break;}
 case 249:
 var $1103=(($1089+8)|0);
 var $1104=HEAP32[(($1103)>>2)];
 var $1105=($1104|0)==($1083|0);
 if($1105){label=250;break;}else{label=251;break;}
 case 250:
 HEAP32[(($1099)>>2)]=$1089;
 HEAP32[(($1103)>>2)]=$1094;
 var $R_1_i_i=$1089;label=259;break;
 case 251:
 _abort();
 throw "Reached an unreachable!";
 case 252:
 var $_sum67_i_i=$1005|16;
 var $_sum112_i=((($_sum2_i21_i)+($_sum67_i_i))|0);
 var $1108=(($tbase_245_i+$_sum112_i)|0);
 var $1109=$1108;
 var $1110=HEAP32[(($1109)>>2)];
 var $1111=($1110|0)==0;
 if($1111){label=253;break;}else{var $R_0_i_i=$1110;var $RP_0_i_i=$1109;label=254;break;}
 case 253:
 var $_sum113_i=((($_sum67_i_i)+($tsize_244_i))|0);
 var $1113=(($tbase_245_i+$_sum113_i)|0);
 var $1114=$1113;
 var $1115=HEAP32[(($1114)>>2)];
 var $1116=($1115|0)==0;
 if($1116){var $R_1_i_i=0;label=259;break;}else{var $R_0_i_i=$1115;var $RP_0_i_i=$1114;label=254;break;}
 case 254:
 var $RP_0_i_i;
 var $R_0_i_i;
 var $1117=(($R_0_i_i+20)|0);
 var $1118=HEAP32[(($1117)>>2)];
 var $1119=($1118|0)==0;
 if($1119){label=255;break;}else{var $R_0_i_i=$1118;var $RP_0_i_i=$1117;label=254;break;}
 case 255:
 var $1121=(($R_0_i_i+16)|0);
 var $1122=HEAP32[(($1121)>>2)];
 var $1123=($1122|0)==0;
 if($1123){label=256;break;}else{var $R_0_i_i=$1122;var $RP_0_i_i=$1121;label=254;break;}
 case 256:
 var $1125=$RP_0_i_i;
 var $1126=HEAP32[((1082208)>>2)];
 var $1127=($1125>>>0)<($1126>>>0);
 if($1127){label=258;break;}else{label=257;break;}
 case 257:
 HEAP32[(($RP_0_i_i)>>2)]=0;
 var $R_1_i_i=$R_0_i_i;label=259;break;
 case 258:
 _abort();
 throw "Reached an unreachable!";
 case 259:
 var $R_1_i_i;
 var $1131=($1086|0)==0;
 if($1131){label=279;break;}else{label=260;break;}
 case 260:
 var $_sum31_i_i=((($tsize_244_i)+(28))|0);
 var $_sum108_i=((($_sum31_i_i)+($1005))|0);
 var $1133=(($tbase_245_i+$_sum108_i)|0);
 var $1134=$1133;
 var $1135=HEAP32[(($1134)>>2)];
 var $1136=((1082496+($1135<<2))|0);
 var $1137=HEAP32[(($1136)>>2)];
 var $1138=($1083|0)==($1137|0);
 if($1138){label=261;break;}else{label=263;break;}
 case 261:
 HEAP32[(($1136)>>2)]=$R_1_i_i;
 var $cond_i_i=($R_1_i_i|0)==0;
 if($cond_i_i){label=262;break;}else{label=269;break;}
 case 262:
 var $1140=HEAP32[(($1134)>>2)];
 var $1141=1<<$1140;
 var $1142=$1141^-1;
 var $1143=HEAP32[((1082196)>>2)];
 var $1144=$1143&$1142;
 HEAP32[((1082196)>>2)]=$1144;
 label=279;break;
 case 263:
 var $1146=$1086;
 var $1147=HEAP32[((1082208)>>2)];
 var $1148=($1146>>>0)<($1147>>>0);
 if($1148){label=267;break;}else{label=264;break;}
 case 264:
 var $1150=(($1086+16)|0);
 var $1151=HEAP32[(($1150)>>2)];
 var $1152=($1151|0)==($1083|0);
 if($1152){label=265;break;}else{label=266;break;}
 case 265:
 HEAP32[(($1150)>>2)]=$R_1_i_i;
 label=268;break;
 case 266:
 var $1155=(($1086+20)|0);
 HEAP32[(($1155)>>2)]=$R_1_i_i;
 label=268;break;
 case 267:
 _abort();
 throw "Reached an unreachable!";
 case 268:
 var $1158=($R_1_i_i|0)==0;
 if($1158){label=279;break;}else{label=269;break;}
 case 269:
 var $1160=$R_1_i_i;
 var $1161=HEAP32[((1082208)>>2)];
 var $1162=($1160>>>0)<($1161>>>0);
 if($1162){label=278;break;}else{label=270;break;}
 case 270:
 var $1164=(($R_1_i_i+24)|0);
 HEAP32[(($1164)>>2)]=$1086;
 var $_sum3233_i_i=$1005|16;
 var $_sum109_i=((($_sum3233_i_i)+($tsize_244_i))|0);
 var $1165=(($tbase_245_i+$_sum109_i)|0);
 var $1166=$1165;
 var $1167=HEAP32[(($1166)>>2)];
 var $1168=($1167|0)==0;
 if($1168){label=274;break;}else{label=271;break;}
 case 271:
 var $1170=$1167;
 var $1171=HEAP32[((1082208)>>2)];
 var $1172=($1170>>>0)<($1171>>>0);
 if($1172){label=273;break;}else{label=272;break;}
 case 272:
 var $1174=(($R_1_i_i+16)|0);
 HEAP32[(($1174)>>2)]=$1167;
 var $1175=(($1167+24)|0);
 HEAP32[(($1175)>>2)]=$R_1_i_i;
 label=274;break;
 case 273:
 _abort();
 throw "Reached an unreachable!";
 case 274:
 var $_sum110_i=((($_sum2_i21_i)+($_sum3233_i_i))|0);
 var $1178=(($tbase_245_i+$_sum110_i)|0);
 var $1179=$1178;
 var $1180=HEAP32[(($1179)>>2)];
 var $1181=($1180|0)==0;
 if($1181){label=279;break;}else{label=275;break;}
 case 275:
 var $1183=$1180;
 var $1184=HEAP32[((1082208)>>2)];
 var $1185=($1183>>>0)<($1184>>>0);
 if($1185){label=277;break;}else{label=276;break;}
 case 276:
 var $1187=(($R_1_i_i+20)|0);
 HEAP32[(($1187)>>2)]=$1180;
 var $1188=(($1180+24)|0);
 HEAP32[(($1188)>>2)]=$R_1_i_i;
 label=279;break;
 case 277:
 _abort();
 throw "Reached an unreachable!";
 case 278:
 _abort();
 throw "Reached an unreachable!";
 case 279:
 var $_sum9_i_i=$1043|$1005;
 var $_sum111_i=((($_sum9_i_i)+($tsize_244_i))|0);
 var $1192=(($tbase_245_i+$_sum111_i)|0);
 var $1193=$1192;
 var $1194=((($1043)+($1013))|0);
 var $oldfirst_0_i_i=$1193;var $qsize_0_i_i=$1194;label=280;break;
 case 280:
 var $qsize_0_i_i;
 var $oldfirst_0_i_i;
 var $1196=(($oldfirst_0_i_i+4)|0);
 var $1197=HEAP32[(($1196)>>2)];
 var $1198=$1197&-2;
 HEAP32[(($1196)>>2)]=$1198;
 var $1199=$qsize_0_i_i|1;
 var $_sum10_i_i=((($_sum_i19_i)+(4))|0);
 var $1200=(($tbase_245_i+$_sum10_i_i)|0);
 var $1201=$1200;
 HEAP32[(($1201)>>2)]=$1199;
 var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i19_i))|0);
 var $1202=(($tbase_245_i+$_sum11_i_i)|0);
 var $1203=$1202;
 HEAP32[(($1203)>>2)]=$qsize_0_i_i;
 var $1204=$qsize_0_i_i>>>3;
 var $1205=($qsize_0_i_i>>>0)<256;
 if($1205){label=281;break;}else{label=286;break;}
 case 281:
 var $1207=$1204<<1;
 var $1208=((1082232+($1207<<2))|0);
 var $1209=$1208;
 var $1210=HEAP32[((1082192)>>2)];
 var $1211=1<<$1204;
 var $1212=$1210&$1211;
 var $1213=($1212|0)==0;
 if($1213){label=282;break;}else{label=283;break;}
 case 282:
 var $1215=$1210|$1211;
 HEAP32[((1082192)>>2)]=$1215;
 var $_sum27_pre_i_i=((($1207)+(2))|0);
 var $_pre_i22_i=((1082232+($_sum27_pre_i_i<<2))|0);
 var $F4_0_i_i=$1209;var $_pre_phi_i23_i=$_pre_i22_i;label=285;break;
 case 283:
 var $_sum30_i_i=((($1207)+(2))|0);
 var $1217=((1082232+($_sum30_i_i<<2))|0);
 var $1218=HEAP32[(($1217)>>2)];
 var $1219=$1218;
 var $1220=HEAP32[((1082208)>>2)];
 var $1221=($1219>>>0)<($1220>>>0);
 if($1221){label=284;break;}else{var $F4_0_i_i=$1218;var $_pre_phi_i23_i=$1217;label=285;break;}
 case 284:
 _abort();
 throw "Reached an unreachable!";
 case 285:
 var $_pre_phi_i23_i;
 var $F4_0_i_i;
 HEAP32[(($_pre_phi_i23_i)>>2)]=$1012;
 var $1224=(($F4_0_i_i+12)|0);
 HEAP32[(($1224)>>2)]=$1012;
 var $_sum28_i_i=((($_sum_i19_i)+(8))|0);
 var $1225=(($tbase_245_i+$_sum28_i_i)|0);
 var $1226=$1225;
 HEAP32[(($1226)>>2)]=$F4_0_i_i;
 var $_sum29_i_i=((($_sum_i19_i)+(12))|0);
 var $1227=(($tbase_245_i+$_sum29_i_i)|0);
 var $1228=$1227;
 HEAP32[(($1228)>>2)]=$1209;
 label=303;break;
 case 286:
 var $1230=$1011;
 var $1231=$qsize_0_i_i>>>8;
 var $1232=($1231|0)==0;
 if($1232){var $I7_0_i_i=0;label=289;break;}else{label=287;break;}
 case 287:
 var $1234=($qsize_0_i_i>>>0)>16777215;
 if($1234){var $I7_0_i_i=31;label=289;break;}else{label=288;break;}
 case 288:
 var $1236=((($1231)+(1048320))|0);
 var $1237=$1236>>>16;
 var $1238=$1237&8;
 var $1239=$1231<<$1238;
 var $1240=((($1239)+(520192))|0);
 var $1241=$1240>>>16;
 var $1242=$1241&4;
 var $1243=$1242|$1238;
 var $1244=$1239<<$1242;
 var $1245=((($1244)+(245760))|0);
 var $1246=$1245>>>16;
 var $1247=$1246&2;
 var $1248=$1243|$1247;
 var $1249=(((14)-($1248))|0);
 var $1250=$1244<<$1247;
 var $1251=$1250>>>15;
 var $1252=((($1249)+($1251))|0);
 var $1253=$1252<<1;
 var $1254=((($1252)+(7))|0);
 var $1255=$qsize_0_i_i>>>($1254>>>0);
 var $1256=$1255&1;
 var $1257=$1256|$1253;
 var $I7_0_i_i=$1257;label=289;break;
 case 289:
 var $I7_0_i_i;
 var $1259=((1082496+($I7_0_i_i<<2))|0);
 var $_sum12_i24_i=((($_sum_i19_i)+(28))|0);
 var $1260=(($tbase_245_i+$_sum12_i24_i)|0);
 var $1261=$1260;
 HEAP32[(($1261)>>2)]=$I7_0_i_i;
 var $_sum13_i_i=((($_sum_i19_i)+(16))|0);
 var $1262=(($tbase_245_i+$_sum13_i_i)|0);
 var $_sum14_i_i=((($_sum_i19_i)+(20))|0);
 var $1263=(($tbase_245_i+$_sum14_i_i)|0);
 var $1264=$1263;
 HEAP32[(($1264)>>2)]=0;
 var $1265=$1262;
 HEAP32[(($1265)>>2)]=0;
 var $1266=HEAP32[((1082196)>>2)];
 var $1267=1<<$I7_0_i_i;
 var $1268=$1266&$1267;
 var $1269=($1268|0)==0;
 if($1269){label=290;break;}else{label=291;break;}
 case 290:
 var $1271=$1266|$1267;
 HEAP32[((1082196)>>2)]=$1271;
 HEAP32[(($1259)>>2)]=$1230;
 var $1272=$1259;
 var $_sum15_i_i=((($_sum_i19_i)+(24))|0);
 var $1273=(($tbase_245_i+$_sum15_i_i)|0);
 var $1274=$1273;
 HEAP32[(($1274)>>2)]=$1272;
 var $_sum16_i_i=((($_sum_i19_i)+(12))|0);
 var $1275=(($tbase_245_i+$_sum16_i_i)|0);
 var $1276=$1275;
 HEAP32[(($1276)>>2)]=$1230;
 var $_sum17_i_i=((($_sum_i19_i)+(8))|0);
 var $1277=(($tbase_245_i+$_sum17_i_i)|0);
 var $1278=$1277;
 HEAP32[(($1278)>>2)]=$1230;
 label=303;break;
 case 291:
 var $1280=HEAP32[(($1259)>>2)];
 var $1281=($I7_0_i_i|0)==31;
 if($1281){var $1286=0;label=293;break;}else{label=292;break;}
 case 292:
 var $1283=$I7_0_i_i>>>1;
 var $1284=(((25)-($1283))|0);
 var $1286=$1284;label=293;break;
 case 293:
 var $1286;
 var $1287=(($1280+4)|0);
 var $1288=HEAP32[(($1287)>>2)];
 var $1289=$1288&-8;
 var $1290=($1289|0)==($qsize_0_i_i|0);
 if($1290){var $T_0_lcssa_i26_i=$1280;label=300;break;}else{label=294;break;}
 case 294:
 var $1291=$qsize_0_i_i<<$1286;
 var $T_056_i_i=$1280;var $K8_057_i_i=$1291;label=296;break;
 case 295:
 var $1293=$K8_057_i_i<<1;
 var $1294=(($1301+4)|0);
 var $1295=HEAP32[(($1294)>>2)];
 var $1296=$1295&-8;
 var $1297=($1296|0)==($qsize_0_i_i|0);
 if($1297){var $T_0_lcssa_i26_i=$1301;label=300;break;}else{var $T_056_i_i=$1301;var $K8_057_i_i=$1293;label=296;break;}
 case 296:
 var $K8_057_i_i;
 var $T_056_i_i;
 var $1299=$K8_057_i_i>>>31;
 var $1300=(($T_056_i_i+16+($1299<<2))|0);
 var $1301=HEAP32[(($1300)>>2)];
 var $1302=($1301|0)==0;
 if($1302){label=297;break;}else{label=295;break;}
 case 297:
 var $1304=$1300;
 var $1305=HEAP32[((1082208)>>2)];
 var $1306=($1304>>>0)<($1305>>>0);
 if($1306){label=299;break;}else{label=298;break;}
 case 298:
 HEAP32[(($1300)>>2)]=$1230;
 var $_sum24_i_i=((($_sum_i19_i)+(24))|0);
 var $1308=(($tbase_245_i+$_sum24_i_i)|0);
 var $1309=$1308;
 HEAP32[(($1309)>>2)]=$T_056_i_i;
 var $_sum25_i_i=((($_sum_i19_i)+(12))|0);
 var $1310=(($tbase_245_i+$_sum25_i_i)|0);
 var $1311=$1310;
 HEAP32[(($1311)>>2)]=$1230;
 var $_sum26_i_i=((($_sum_i19_i)+(8))|0);
 var $1312=(($tbase_245_i+$_sum26_i_i)|0);
 var $1313=$1312;
 HEAP32[(($1313)>>2)]=$1230;
 label=303;break;
 case 299:
 _abort();
 throw "Reached an unreachable!";
 case 300:
 var $T_0_lcssa_i26_i;
 var $1315=(($T_0_lcssa_i26_i+8)|0);
 var $1316=HEAP32[(($1315)>>2)];
 var $1317=$T_0_lcssa_i26_i;
 var $1318=HEAP32[((1082208)>>2)];
 var $1319=($1317>>>0)>=($1318>>>0);
 var $1320=$1316;
 var $1321=($1320>>>0)>=($1318>>>0);
 var $or_cond_i27_i=$1319&$1321;
 if($or_cond_i27_i){label=301;break;}else{label=302;break;}
 case 301:
 var $1323=(($1316+12)|0);
 HEAP32[(($1323)>>2)]=$1230;
 HEAP32[(($1315)>>2)]=$1230;
 var $_sum21_i_i=((($_sum_i19_i)+(8))|0);
 var $1324=(($tbase_245_i+$_sum21_i_i)|0);
 var $1325=$1324;
 HEAP32[(($1325)>>2)]=$1316;
 var $_sum22_i_i=((($_sum_i19_i)+(12))|0);
 var $1326=(($tbase_245_i+$_sum22_i_i)|0);
 var $1327=$1326;
 HEAP32[(($1327)>>2)]=$T_0_lcssa_i26_i;
 var $_sum23_i_i=((($_sum_i19_i)+(24))|0);
 var $1328=(($tbase_245_i+$_sum23_i_i)|0);
 var $1329=$1328;
 HEAP32[(($1329)>>2)]=0;
 label=303;break;
 case 302:
 _abort();
 throw "Reached an unreachable!";
 case 303:
 var $_sum1819_i_i=$995|8;
 var $1330=(($tbase_245_i+$_sum1819_i_i)|0);
 var $mem_0=$1330;label=341;break;
 case 304:
 var $1331=$891;
 var $sp_0_i_i_i=1082640;label=305;break;
 case 305:
 var $sp_0_i_i_i;
 var $1333=(($sp_0_i_i_i)|0);
 var $1334=HEAP32[(($1333)>>2)];
 var $1335=($1334>>>0)>($1331>>>0);
 if($1335){label=307;break;}else{label=306;break;}
 case 306:
 var $1337=(($sp_0_i_i_i+4)|0);
 var $1338=HEAP32[(($1337)>>2)];
 var $1339=(($1334+$1338)|0);
 var $1340=($1339>>>0)>($1331>>>0);
 if($1340){label=308;break;}else{label=307;break;}
 case 307:
 var $1342=(($sp_0_i_i_i+8)|0);
 var $1343=HEAP32[(($1342)>>2)];
 var $sp_0_i_i_i=$1343;label=305;break;
 case 308:
 var $_sum_i13_i=((($1338)-(47))|0);
 var $_sum1_i14_i=((($1338)-(39))|0);
 var $1344=(($1334+$_sum1_i14_i)|0);
 var $1345=$1344;
 var $1346=$1345&7;
 var $1347=($1346|0)==0;
 if($1347){var $1352=0;label=310;break;}else{label=309;break;}
 case 309:
 var $1349=(((-$1345))|0);
 var $1350=$1349&7;
 var $1352=$1350;label=310;break;
 case 310:
 var $1352;
 var $_sum2_i15_i=((($_sum_i13_i)+($1352))|0);
 var $1353=(($1334+$_sum2_i15_i)|0);
 var $1354=(($891+16)|0);
 var $1355=$1354;
 var $1356=($1353>>>0)<($1355>>>0);
 var $1357=($1356?$1331:$1353);
 var $1358=(($1357+8)|0);
 var $1359=$1358;
 var $1360=((($tsize_244_i)-(40))|0);
 var $1361=(($tbase_245_i+8)|0);
 var $1362=$1361;
 var $1363=$1362&7;
 var $1364=($1363|0)==0;
 if($1364){var $1368=0;label=312;break;}else{label=311;break;}
 case 311:
 var $1366=(((-$1362))|0);
 var $1367=$1366&7;
 var $1368=$1367;label=312;break;
 case 312:
 var $1368;
 var $1369=(($tbase_245_i+$1368)|0);
 var $1370=$1369;
 var $1371=((($1360)-($1368))|0);
 HEAP32[((1082216)>>2)]=$1370;
 HEAP32[((1082204)>>2)]=$1371;
 var $1372=$1371|1;
 var $_sum_i_i_i=((($1368)+(4))|0);
 var $1373=(($tbase_245_i+$_sum_i_i_i)|0);
 var $1374=$1373;
 HEAP32[(($1374)>>2)]=$1372;
 var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
 var $1375=(($tbase_245_i+$_sum2_i_i_i)|0);
 var $1376=$1375;
 HEAP32[(($1376)>>2)]=40;
 var $1377=HEAP32[((80632)>>2)];
 HEAP32[((1082220)>>2)]=$1377;
 var $1378=(($1357+4)|0);
 var $1379=$1378;
 HEAP32[(($1379)>>2)]=27;
 assert(16 % 1 === 0);HEAP32[(($1358)>>2)]=HEAP32[((1082640)>>2)];HEAP32[((($1358)+(4))>>2)]=HEAP32[((1082644)>>2)];HEAP32[((($1358)+(8))>>2)]=HEAP32[((1082648)>>2)];HEAP32[((($1358)+(12))>>2)]=HEAP32[((1082652)>>2)];
 HEAP32[((1082640)>>2)]=$tbase_245_i;
 HEAP32[((1082644)>>2)]=$tsize_244_i;
 HEAP32[((1082652)>>2)]=0;
 HEAP32[((1082648)>>2)]=$1359;
 var $1380=(($1357+28)|0);
 var $1381=$1380;
 HEAP32[(($1381)>>2)]=7;
 var $1382=(($1357+32)|0);
 var $1383=($1382>>>0)<($1339>>>0);
 if($1383){var $1384=$1381;label=313;break;}else{label=314;break;}
 case 313:
 var $1384;
 var $1385=(($1384+4)|0);
 HEAP32[(($1385)>>2)]=7;
 var $1386=(($1384+8)|0);
 var $1387=$1386;
 var $1388=($1387>>>0)<($1339>>>0);
 if($1388){var $1384=$1385;label=313;break;}else{label=314;break;}
 case 314:
 var $1389=($1357|0)==($1331|0);
 if($1389){label=338;break;}else{label=315;break;}
 case 315:
 var $1391=$1357;
 var $1392=$891;
 var $1393=((($1391)-($1392))|0);
 var $1394=(($1331+$1393)|0);
 var $_sum3_i_i=((($1393)+(4))|0);
 var $1395=(($1331+$_sum3_i_i)|0);
 var $1396=$1395;
 var $1397=HEAP32[(($1396)>>2)];
 var $1398=$1397&-2;
 HEAP32[(($1396)>>2)]=$1398;
 var $1399=$1393|1;
 var $1400=(($891+4)|0);
 HEAP32[(($1400)>>2)]=$1399;
 var $1401=$1394;
 HEAP32[(($1401)>>2)]=$1393;
 var $1402=$1393>>>3;
 var $1403=($1393>>>0)<256;
 if($1403){label=316;break;}else{label=321;break;}
 case 316:
 var $1405=$1402<<1;
 var $1406=((1082232+($1405<<2))|0);
 var $1407=$1406;
 var $1408=HEAP32[((1082192)>>2)];
 var $1409=1<<$1402;
 var $1410=$1408&$1409;
 var $1411=($1410|0)==0;
 if($1411){label=317;break;}else{label=318;break;}
 case 317:
 var $1413=$1408|$1409;
 HEAP32[((1082192)>>2)]=$1413;
 var $_sum11_pre_i_i=((($1405)+(2))|0);
 var $_pre_i_i=((1082232+($_sum11_pre_i_i<<2))|0);
 var $F_0_i_i=$1407;var $_pre_phi_i_i=$_pre_i_i;label=320;break;
 case 318:
 var $_sum12_i_i=((($1405)+(2))|0);
 var $1415=((1082232+($_sum12_i_i<<2))|0);
 var $1416=HEAP32[(($1415)>>2)];
 var $1417=$1416;
 var $1418=HEAP32[((1082208)>>2)];
 var $1419=($1417>>>0)<($1418>>>0);
 if($1419){label=319;break;}else{var $F_0_i_i=$1416;var $_pre_phi_i_i=$1415;label=320;break;}
 case 319:
 _abort();
 throw "Reached an unreachable!";
 case 320:
 var $_pre_phi_i_i;
 var $F_0_i_i;
 HEAP32[(($_pre_phi_i_i)>>2)]=$891;
 var $1422=(($F_0_i_i+12)|0);
 HEAP32[(($1422)>>2)]=$891;
 var $1423=(($891+8)|0);
 HEAP32[(($1423)>>2)]=$F_0_i_i;
 var $1424=(($891+12)|0);
 HEAP32[(($1424)>>2)]=$1407;
 label=338;break;
 case 321:
 var $1426=$891;
 var $1427=$1393>>>8;
 var $1428=($1427|0)==0;
 if($1428){var $I1_0_i_i=0;label=324;break;}else{label=322;break;}
 case 322:
 var $1430=($1393>>>0)>16777215;
 if($1430){var $I1_0_i_i=31;label=324;break;}else{label=323;break;}
 case 323:
 var $1432=((($1427)+(1048320))|0);
 var $1433=$1432>>>16;
 var $1434=$1433&8;
 var $1435=$1427<<$1434;
 var $1436=((($1435)+(520192))|0);
 var $1437=$1436>>>16;
 var $1438=$1437&4;
 var $1439=$1438|$1434;
 var $1440=$1435<<$1438;
 var $1441=((($1440)+(245760))|0);
 var $1442=$1441>>>16;
 var $1443=$1442&2;
 var $1444=$1439|$1443;
 var $1445=(((14)-($1444))|0);
 var $1446=$1440<<$1443;
 var $1447=$1446>>>15;
 var $1448=((($1445)+($1447))|0);
 var $1449=$1448<<1;
 var $1450=((($1448)+(7))|0);
 var $1451=$1393>>>($1450>>>0);
 var $1452=$1451&1;
 var $1453=$1452|$1449;
 var $I1_0_i_i=$1453;label=324;break;
 case 324:
 var $I1_0_i_i;
 var $1455=((1082496+($I1_0_i_i<<2))|0);
 var $1456=(($891+28)|0);
 var $I1_0_c_i_i=$I1_0_i_i;
 HEAP32[(($1456)>>2)]=$I1_0_c_i_i;
 var $1457=(($891+20)|0);
 HEAP32[(($1457)>>2)]=0;
 var $1458=(($891+16)|0);
 HEAP32[(($1458)>>2)]=0;
 var $1459=HEAP32[((1082196)>>2)];
 var $1460=1<<$I1_0_i_i;
 var $1461=$1459&$1460;
 var $1462=($1461|0)==0;
 if($1462){label=325;break;}else{label=326;break;}
 case 325:
 var $1464=$1459|$1460;
 HEAP32[((1082196)>>2)]=$1464;
 HEAP32[(($1455)>>2)]=$1426;
 var $1465=(($891+24)|0);
 var $_c_i_i=$1455;
 HEAP32[(($1465)>>2)]=$_c_i_i;
 var $1466=(($891+12)|0);
 HEAP32[(($1466)>>2)]=$891;
 var $1467=(($891+8)|0);
 HEAP32[(($1467)>>2)]=$891;
 label=338;break;
 case 326:
 var $1469=HEAP32[(($1455)>>2)];
 var $1470=($I1_0_i_i|0)==31;
 if($1470){var $1475=0;label=328;break;}else{label=327;break;}
 case 327:
 var $1472=$I1_0_i_i>>>1;
 var $1473=(((25)-($1472))|0);
 var $1475=$1473;label=328;break;
 case 328:
 var $1475;
 var $1476=(($1469+4)|0);
 var $1477=HEAP32[(($1476)>>2)];
 var $1478=$1477&-8;
 var $1479=($1478|0)==($1393|0);
 if($1479){var $T_0_lcssa_i_i=$1469;label=335;break;}else{label=329;break;}
 case 329:
 var $1480=$1393<<$1475;
 var $T_015_i_i=$1469;var $K2_016_i_i=$1480;label=331;break;
 case 330:
 var $1482=$K2_016_i_i<<1;
 var $1483=(($1490+4)|0);
 var $1484=HEAP32[(($1483)>>2)];
 var $1485=$1484&-8;
 var $1486=($1485|0)==($1393|0);
 if($1486){var $T_0_lcssa_i_i=$1490;label=335;break;}else{var $T_015_i_i=$1490;var $K2_016_i_i=$1482;label=331;break;}
 case 331:
 var $K2_016_i_i;
 var $T_015_i_i;
 var $1488=$K2_016_i_i>>>31;
 var $1489=(($T_015_i_i+16+($1488<<2))|0);
 var $1490=HEAP32[(($1489)>>2)];
 var $1491=($1490|0)==0;
 if($1491){label=332;break;}else{label=330;break;}
 case 332:
 var $1493=$1489;
 var $1494=HEAP32[((1082208)>>2)];
 var $1495=($1493>>>0)<($1494>>>0);
 if($1495){label=334;break;}else{label=333;break;}
 case 333:
 HEAP32[(($1489)>>2)]=$1426;
 var $1497=(($891+24)|0);
 var $T_0_c8_i_i=$T_015_i_i;
 HEAP32[(($1497)>>2)]=$T_0_c8_i_i;
 var $1498=(($891+12)|0);
 HEAP32[(($1498)>>2)]=$891;
 var $1499=(($891+8)|0);
 HEAP32[(($1499)>>2)]=$891;
 label=338;break;
 case 334:
 _abort();
 throw "Reached an unreachable!";
 case 335:
 var $T_0_lcssa_i_i;
 var $1501=(($T_0_lcssa_i_i+8)|0);
 var $1502=HEAP32[(($1501)>>2)];
 var $1503=$T_0_lcssa_i_i;
 var $1504=HEAP32[((1082208)>>2)];
 var $1505=($1503>>>0)>=($1504>>>0);
 var $1506=$1502;
 var $1507=($1506>>>0)>=($1504>>>0);
 var $or_cond_i_i=$1505&$1507;
 if($or_cond_i_i){label=336;break;}else{label=337;break;}
 case 336:
 var $1509=(($1502+12)|0);
 HEAP32[(($1509)>>2)]=$1426;
 HEAP32[(($1501)>>2)]=$1426;
 var $1510=(($891+8)|0);
 var $_c7_i_i=$1502;
 HEAP32[(($1510)>>2)]=$_c7_i_i;
 var $1511=(($891+12)|0);
 var $T_0_c_i_i=$T_0_lcssa_i_i;
 HEAP32[(($1511)>>2)]=$T_0_c_i_i;
 var $1512=(($891+24)|0);
 HEAP32[(($1512)>>2)]=0;
 label=338;break;
 case 337:
 _abort();
 throw "Reached an unreachable!";
 case 338:
 var $1513=HEAP32[((1082204)>>2)];
 var $1514=($1513>>>0)>($nb_0>>>0);
 if($1514){label=339;break;}else{label=340;break;}
 case 339:
 var $1516=((($1513)-($nb_0))|0);
 HEAP32[((1082204)>>2)]=$1516;
 var $1517=HEAP32[((1082216)>>2)];
 var $1518=$1517;
 var $1519=(($1518+$nb_0)|0);
 var $1520=$1519;
 HEAP32[((1082216)>>2)]=$1520;
 var $1521=$1516|1;
 var $_sum_i34=((($nb_0)+(4))|0);
 var $1522=(($1518+$_sum_i34)|0);
 var $1523=$1522;
 HEAP32[(($1523)>>2)]=$1521;
 var $1524=$nb_0|3;
 var $1525=(($1517+4)|0);
 HEAP32[(($1525)>>2)]=$1524;
 var $1526=(($1517+8)|0);
 var $1527=$1526;
 var $mem_0=$1527;label=341;break;
 case 340:
 var $1528=___errno_location();
 HEAP32[(($1528)>>2)]=12;
 var $mem_0=0;label=341;break;
 case 341:
 var $mem_0;
 return $mem_0;
  default: assert(0, "bad label: " + label);
 }

}
Module["_malloc"] = _malloc;

function _free($mem){
 var label=0;

 label = 1;
 while(1)switch(label){
 case 1:
 var $1=($mem|0)==0;
 if($1){label=140;break;}else{label=2;break;}
 case 2:
 var $3=((($mem)-(8))|0);
 var $4=$3;
 var $5=HEAP32[((1082208)>>2)];
 var $6=($3>>>0)<($5>>>0);
 if($6){label=139;break;}else{label=3;break;}
 case 3:
 var $8=((($mem)-(4))|0);
 var $9=$8;
 var $10=HEAP32[(($9)>>2)];
 var $11=$10&3;
 var $12=($11|0)==1;
 if($12){label=139;break;}else{label=4;break;}
 case 4:
 var $14=$10&-8;
 var $_sum=((($14)-(8))|0);
 var $15=(($mem+$_sum)|0);
 var $16=$15;
 var $17=$10&1;
 var $18=($17|0)==0;
 if($18){label=5;break;}else{var $p_0=$4;var $psize_0=$14;label=56;break;}
 case 5:
 var $20=$3;
 var $21=HEAP32[(($20)>>2)];
 var $22=($11|0)==0;
 if($22){label=140;break;}else{label=6;break;}
 case 6:
 var $_sum3=(((-8)-($21))|0);
 var $24=(($mem+$_sum3)|0);
 var $25=$24;
 var $26=((($21)+($14))|0);
 var $27=($24>>>0)<($5>>>0);
 if($27){label=139;break;}else{label=7;break;}
 case 7:
 var $29=HEAP32[((1082212)>>2)];
 var $30=($25|0)==($29|0);
 if($30){label=54;break;}else{label=8;break;}
 case 8:
 var $32=$21>>>3;
 var $33=($21>>>0)<256;
 if($33){label=9;break;}else{label=21;break;}
 case 9:
 var $_sum47=((($_sum3)+(8))|0);
 var $35=(($mem+$_sum47)|0);
 var $36=$35;
 var $37=HEAP32[(($36)>>2)];
 var $_sum48=((($_sum3)+(12))|0);
 var $38=(($mem+$_sum48)|0);
 var $39=$38;
 var $40=HEAP32[(($39)>>2)];
 var $41=$32<<1;
 var $42=((1082232+($41<<2))|0);
 var $43=$42;
 var $44=($37|0)==($43|0);
 if($44){label=12;break;}else{label=10;break;}
 case 10:
 var $46=$37;
 var $47=($46>>>0)<($5>>>0);
 if($47){label=20;break;}else{label=11;break;}
 case 11:
 var $49=(($37+12)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=($50|0)==($25|0);
 if($51){label=12;break;}else{label=20;break;}
 case 12:
 var $52=($40|0)==($37|0);
 if($52){label=13;break;}else{label=14;break;}
 case 13:
 var $54=1<<$32;
 var $55=$54^-1;
 var $56=HEAP32[((1082192)>>2)];
 var $57=$56&$55;
 HEAP32[((1082192)>>2)]=$57;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 14:
 var $59=($40|0)==($43|0);
 if($59){label=15;break;}else{label=16;break;}
 case 15:
 var $_pre82=(($40+8)|0);
 var $_pre_phi83=$_pre82;label=18;break;
 case 16:
 var $61=$40;
 var $62=($61>>>0)<($5>>>0);
 if($62){label=19;break;}else{label=17;break;}
 case 17:
 var $64=(($40+8)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=($65|0)==($25|0);
 if($66){var $_pre_phi83=$64;label=18;break;}else{label=19;break;}
 case 18:
 var $_pre_phi83;
 var $67=(($37+12)|0);
 HEAP32[(($67)>>2)]=$40;
 HEAP32[(($_pre_phi83)>>2)]=$37;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 19:
 _abort();
 throw "Reached an unreachable!";
 case 20:
 _abort();
 throw "Reached an unreachable!";
 case 21:
 var $69=$24;
 var $_sum37=((($_sum3)+(24))|0);
 var $70=(($mem+$_sum37)|0);
 var $71=$70;
 var $72=HEAP32[(($71)>>2)];
 var $_sum38=((($_sum3)+(12))|0);
 var $73=(($mem+$_sum38)|0);
 var $74=$73;
 var $75=HEAP32[(($74)>>2)];
 var $76=($75|0)==($69|0);
 if($76){label=27;break;}else{label=22;break;}
 case 22:
 var $_sum44=((($_sum3)+(8))|0);
 var $78=(($mem+$_sum44)|0);
 var $79=$78;
 var $80=HEAP32[(($79)>>2)];
 var $81=$80;
 var $82=($81>>>0)<($5>>>0);
 if($82){label=26;break;}else{label=23;break;}
 case 23:
 var $84=(($80+12)|0);
 var $85=HEAP32[(($84)>>2)];
 var $86=($85|0)==($69|0);
 if($86){label=24;break;}else{label=26;break;}
 case 24:
 var $88=(($75+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($89|0)==($69|0);
 if($90){label=25;break;}else{label=26;break;}
 case 25:
 HEAP32[(($84)>>2)]=$75;
 HEAP32[(($88)>>2)]=$80;
 var $R_1=$75;label=34;break;
 case 26:
 _abort();
 throw "Reached an unreachable!";
 case 27:
 var $_sum40=((($_sum3)+(20))|0);
 var $93=(($mem+$_sum40)|0);
 var $94=$93;
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=28;break;}else{var $R_0=$95;var $RP_0=$94;label=29;break;}
 case 28:
 var $_sum39=((($_sum3)+(16))|0);
 var $98=(($mem+$_sum39)|0);
 var $99=$98;
 var $100=HEAP32[(($99)>>2)];
 var $101=($100|0)==0;
 if($101){var $R_1=0;label=34;break;}else{var $R_0=$100;var $RP_0=$99;label=29;break;}
 case 29:
 var $RP_0;
 var $R_0;
 var $102=(($R_0+20)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=($103|0)==0;
 if($104){label=30;break;}else{var $R_0=$103;var $RP_0=$102;label=29;break;}
 case 30:
 var $106=(($R_0+16)|0);
 var $107=HEAP32[(($106)>>2)];
 var $108=($107|0)==0;
 if($108){label=31;break;}else{var $R_0=$107;var $RP_0=$106;label=29;break;}
 case 31:
 var $110=$RP_0;
 var $111=($110>>>0)<($5>>>0);
 if($111){label=33;break;}else{label=32;break;}
 case 32:
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=34;break;
 case 33:
 _abort();
 throw "Reached an unreachable!";
 case 34:
 var $R_1;
 var $115=($72|0)==0;
 if($115){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=35;break;}
 case 35:
 var $_sum41=((($_sum3)+(28))|0);
 var $117=(($mem+$_sum41)|0);
 var $118=$117;
 var $119=HEAP32[(($118)>>2)];
 var $120=((1082496+($119<<2))|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=($69|0)==($121|0);
 if($122){label=36;break;}else{label=38;break;}
 case 36:
 HEAP32[(($120)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=37;break;}else{label=44;break;}
 case 37:
 var $124=HEAP32[(($118)>>2)];
 var $125=1<<$124;
 var $126=$125^-1;
 var $127=HEAP32[((1082196)>>2)];
 var $128=$127&$126;
 HEAP32[((1082196)>>2)]=$128;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 38:
 var $130=$72;
 var $131=HEAP32[((1082208)>>2)];
 var $132=($130>>>0)<($131>>>0);
 if($132){label=42;break;}else{label=39;break;}
 case 39:
 var $134=(($72+16)|0);
 var $135=HEAP32[(($134)>>2)];
 var $136=($135|0)==($69|0);
 if($136){label=40;break;}else{label=41;break;}
 case 40:
 HEAP32[(($134)>>2)]=$R_1;
 label=43;break;
 case 41:
 var $139=(($72+20)|0);
 HEAP32[(($139)>>2)]=$R_1;
 label=43;break;
 case 42:
 _abort();
 throw "Reached an unreachable!";
 case 43:
 var $142=($R_1|0)==0;
 if($142){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=44;break;}
 case 44:
 var $144=$R_1;
 var $145=HEAP32[((1082208)>>2)];
 var $146=($144>>>0)<($145>>>0);
 if($146){label=53;break;}else{label=45;break;}
 case 45:
 var $148=(($R_1+24)|0);
 HEAP32[(($148)>>2)]=$72;
 var $_sum42=((($_sum3)+(16))|0);
 var $149=(($mem+$_sum42)|0);
 var $150=$149;
 var $151=HEAP32[(($150)>>2)];
 var $152=($151|0)==0;
 if($152){label=49;break;}else{label=46;break;}
 case 46:
 var $154=$151;
 var $155=HEAP32[((1082208)>>2)];
 var $156=($154>>>0)<($155>>>0);
 if($156){label=48;break;}else{label=47;break;}
 case 47:
 var $158=(($R_1+16)|0);
 HEAP32[(($158)>>2)]=$151;
 var $159=(($151+24)|0);
 HEAP32[(($159)>>2)]=$R_1;
 label=49;break;
 case 48:
 _abort();
 throw "Reached an unreachable!";
 case 49:
 var $_sum43=((($_sum3)+(20))|0);
 var $162=(($mem+$_sum43)|0);
 var $163=$162;
 var $164=HEAP32[(($163)>>2)];
 var $165=($164|0)==0;
 if($165){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=50;break;}
 case 50:
 var $167=$164;
 var $168=HEAP32[((1082208)>>2)];
 var $169=($167>>>0)<($168>>>0);
 if($169){label=52;break;}else{label=51;break;}
 case 51:
 var $171=(($R_1+20)|0);
 HEAP32[(($171)>>2)]=$164;
 var $172=(($164+24)|0);
 HEAP32[(($172)>>2)]=$R_1;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 52:
 _abort();
 throw "Reached an unreachable!";
 case 53:
 _abort();
 throw "Reached an unreachable!";
 case 54:
 var $_sum4=((($14)-(4))|0);
 var $176=(($mem+$_sum4)|0);
 var $177=$176;
 var $178=HEAP32[(($177)>>2)];
 var $179=$178&3;
 var $180=($179|0)==3;
 if($180){label=55;break;}else{var $p_0=$25;var $psize_0=$26;label=56;break;}
 case 55:
 HEAP32[((1082200)>>2)]=$26;
 var $182=HEAP32[(($177)>>2)];
 var $183=$182&-2;
 HEAP32[(($177)>>2)]=$183;
 var $184=$26|1;
 var $_sum35=((($_sum3)+(4))|0);
 var $185=(($mem+$_sum35)|0);
 var $186=$185;
 HEAP32[(($186)>>2)]=$184;
 var $187=$15;
 HEAP32[(($187)>>2)]=$26;
 label=140;break;
 case 56:
 var $psize_0;
 var $p_0;
 var $189=$p_0;
 var $190=($189>>>0)<($15>>>0);
 if($190){label=57;break;}else{label=139;break;}
 case 57:
 var $_sum34=((($14)-(4))|0);
 var $192=(($mem+$_sum34)|0);
 var $193=$192;
 var $194=HEAP32[(($193)>>2)];
 var $195=$194&1;
 var $phitmp=($195|0)==0;
 if($phitmp){label=139;break;}else{label=58;break;}
 case 58:
 var $197=$194&2;
 var $198=($197|0)==0;
 if($198){label=59;break;}else{label=112;break;}
 case 59:
 var $200=HEAP32[((1082216)>>2)];
 var $201=($16|0)==($200|0);
 if($201){label=60;break;}else{label=62;break;}
 case 60:
 var $203=HEAP32[((1082204)>>2)];
 var $204=((($203)+($psize_0))|0);
 HEAP32[((1082204)>>2)]=$204;
 HEAP32[((1082216)>>2)]=$p_0;
 var $205=$204|1;
 var $206=(($p_0+4)|0);
 HEAP32[(($206)>>2)]=$205;
 var $207=HEAP32[((1082212)>>2)];
 var $208=($p_0|0)==($207|0);
 if($208){label=61;break;}else{label=140;break;}
 case 61:
 HEAP32[((1082212)>>2)]=0;
 HEAP32[((1082200)>>2)]=0;
 label=140;break;
 case 62:
 var $211=HEAP32[((1082212)>>2)];
 var $212=($16|0)==($211|0);
 if($212){label=63;break;}else{label=64;break;}
 case 63:
 var $214=HEAP32[((1082200)>>2)];
 var $215=((($214)+($psize_0))|0);
 HEAP32[((1082200)>>2)]=$215;
 HEAP32[((1082212)>>2)]=$p_0;
 var $216=$215|1;
 var $217=(($p_0+4)|0);
 HEAP32[(($217)>>2)]=$216;
 var $218=(($189+$215)|0);
 var $219=$218;
 HEAP32[(($219)>>2)]=$215;
 label=140;break;
 case 64:
 var $221=$194&-8;
 var $222=((($221)+($psize_0))|0);
 var $223=$194>>>3;
 var $224=($194>>>0)<256;
 if($224){label=65;break;}else{label=77;break;}
 case 65:
 var $226=(($mem+$14)|0);
 var $227=$226;
 var $228=HEAP32[(($227)>>2)];
 var $_sum2829=$14|4;
 var $229=(($mem+$_sum2829)|0);
 var $230=$229;
 var $231=HEAP32[(($230)>>2)];
 var $232=$223<<1;
 var $233=((1082232+($232<<2))|0);
 var $234=$233;
 var $235=($228|0)==($234|0);
 if($235){label=68;break;}else{label=66;break;}
 case 66:
 var $237=$228;
 var $238=HEAP32[((1082208)>>2)];
 var $239=($237>>>0)<($238>>>0);
 if($239){label=76;break;}else{label=67;break;}
 case 67:
 var $241=(($228+12)|0);
 var $242=HEAP32[(($241)>>2)];
 var $243=($242|0)==($16|0);
 if($243){label=68;break;}else{label=76;break;}
 case 68:
 var $244=($231|0)==($228|0);
 if($244){label=69;break;}else{label=70;break;}
 case 69:
 var $246=1<<$223;
 var $247=$246^-1;
 var $248=HEAP32[((1082192)>>2)];
 var $249=$248&$247;
 HEAP32[((1082192)>>2)]=$249;
 label=110;break;
 case 70:
 var $251=($231|0)==($234|0);
 if($251){label=71;break;}else{label=72;break;}
 case 71:
 var $_pre80=(($231+8)|0);
 var $_pre_phi81=$_pre80;label=74;break;
 case 72:
 var $253=$231;
 var $254=HEAP32[((1082208)>>2)];
 var $255=($253>>>0)<($254>>>0);
 if($255){label=75;break;}else{label=73;break;}
 case 73:
 var $257=(($231+8)|0);
 var $258=HEAP32[(($257)>>2)];
 var $259=($258|0)==($16|0);
 if($259){var $_pre_phi81=$257;label=74;break;}else{label=75;break;}
 case 74:
 var $_pre_phi81;
 var $260=(($228+12)|0);
 HEAP32[(($260)>>2)]=$231;
 HEAP32[(($_pre_phi81)>>2)]=$228;
 label=110;break;
 case 75:
 _abort();
 throw "Reached an unreachable!";
 case 76:
 _abort();
 throw "Reached an unreachable!";
 case 77:
 var $262=$15;
 var $_sum6=((($14)+(16))|0);
 var $263=(($mem+$_sum6)|0);
 var $264=$263;
 var $265=HEAP32[(($264)>>2)];
 var $_sum78=$14|4;
 var $266=(($mem+$_sum78)|0);
 var $267=$266;
 var $268=HEAP32[(($267)>>2)];
 var $269=($268|0)==($262|0);
 if($269){label=83;break;}else{label=78;break;}
 case 78:
 var $271=(($mem+$14)|0);
 var $272=$271;
 var $273=HEAP32[(($272)>>2)];
 var $274=$273;
 var $275=HEAP32[((1082208)>>2)];
 var $276=($274>>>0)<($275>>>0);
 if($276){label=82;break;}else{label=79;break;}
 case 79:
 var $278=(($273+12)|0);
 var $279=HEAP32[(($278)>>2)];
 var $280=($279|0)==($262|0);
 if($280){label=80;break;}else{label=82;break;}
 case 80:
 var $282=(($268+8)|0);
 var $283=HEAP32[(($282)>>2)];
 var $284=($283|0)==($262|0);
 if($284){label=81;break;}else{label=82;break;}
 case 81:
 HEAP32[(($278)>>2)]=$268;
 HEAP32[(($282)>>2)]=$273;
 var $R7_1=$268;label=90;break;
 case 82:
 _abort();
 throw "Reached an unreachable!";
 case 83:
 var $_sum10=((($14)+(12))|0);
 var $287=(($mem+$_sum10)|0);
 var $288=$287;
 var $289=HEAP32[(($288)>>2)];
 var $290=($289|0)==0;
 if($290){label=84;break;}else{var $R7_0=$289;var $RP9_0=$288;label=85;break;}
 case 84:
 var $_sum9=((($14)+(8))|0);
 var $292=(($mem+$_sum9)|0);
 var $293=$292;
 var $294=HEAP32[(($293)>>2)];
 var $295=($294|0)==0;
 if($295){var $R7_1=0;label=90;break;}else{var $R7_0=$294;var $RP9_0=$293;label=85;break;}
 case 85:
 var $RP9_0;
 var $R7_0;
 var $296=(($R7_0+20)|0);
 var $297=HEAP32[(($296)>>2)];
 var $298=($297|0)==0;
 if($298){label=86;break;}else{var $R7_0=$297;var $RP9_0=$296;label=85;break;}
 case 86:
 var $300=(($R7_0+16)|0);
 var $301=HEAP32[(($300)>>2)];
 var $302=($301|0)==0;
 if($302){label=87;break;}else{var $R7_0=$301;var $RP9_0=$300;label=85;break;}
 case 87:
 var $304=$RP9_0;
 var $305=HEAP32[((1082208)>>2)];
 var $306=($304>>>0)<($305>>>0);
 if($306){label=89;break;}else{label=88;break;}
 case 88:
 HEAP32[(($RP9_0)>>2)]=0;
 var $R7_1=$R7_0;label=90;break;
 case 89:
 _abort();
 throw "Reached an unreachable!";
 case 90:
 var $R7_1;
 var $310=($265|0)==0;
 if($310){label=110;break;}else{label=91;break;}
 case 91:
 var $_sum21=((($14)+(20))|0);
 var $312=(($mem+$_sum21)|0);
 var $313=$312;
 var $314=HEAP32[(($313)>>2)];
 var $315=((1082496+($314<<2))|0);
 var $316=HEAP32[(($315)>>2)];
 var $317=($262|0)==($316|0);
 if($317){label=92;break;}else{label=94;break;}
 case 92:
 HEAP32[(($315)>>2)]=$R7_1;
 var $cond69=($R7_1|0)==0;
 if($cond69){label=93;break;}else{label=100;break;}
 case 93:
 var $319=HEAP32[(($313)>>2)];
 var $320=1<<$319;
 var $321=$320^-1;
 var $322=HEAP32[((1082196)>>2)];
 var $323=$322&$321;
 HEAP32[((1082196)>>2)]=$323;
 label=110;break;
 case 94:
 var $325=$265;
 var $326=HEAP32[((1082208)>>2)];
 var $327=($325>>>0)<($326>>>0);
 if($327){label=98;break;}else{label=95;break;}
 case 95:
 var $329=(($265+16)|0);
 var $330=HEAP32[(($329)>>2)];
 var $331=($330|0)==($262|0);
 if($331){label=96;break;}else{label=97;break;}
 case 96:
 HEAP32[(($329)>>2)]=$R7_1;
 label=99;break;
 case 97:
 var $334=(($265+20)|0);
 HEAP32[(($334)>>2)]=$R7_1;
 label=99;break;
 case 98:
 _abort();
 throw "Reached an unreachable!";
 case 99:
 var $337=($R7_1|0)==0;
 if($337){label=110;break;}else{label=100;break;}
 case 100:
 var $339=$R7_1;
 var $340=HEAP32[((1082208)>>2)];
 var $341=($339>>>0)<($340>>>0);
 if($341){label=109;break;}else{label=101;break;}
 case 101:
 var $343=(($R7_1+24)|0);
 HEAP32[(($343)>>2)]=$265;
 var $_sum22=((($14)+(8))|0);
 var $344=(($mem+$_sum22)|0);
 var $345=$344;
 var $346=HEAP32[(($345)>>2)];
 var $347=($346|0)==0;
 if($347){label=105;break;}else{label=102;break;}
 case 102:
 var $349=$346;
 var $350=HEAP32[((1082208)>>2)];
 var $351=($349>>>0)<($350>>>0);
 if($351){label=104;break;}else{label=103;break;}
 case 103:
 var $353=(($R7_1+16)|0);
 HEAP32[(($353)>>2)]=$346;
 var $354=(($346+24)|0);
 HEAP32[(($354)>>2)]=$R7_1;
 label=105;break;
 case 104:
 _abort();
 throw "Reached an unreachable!";
 case 105:
 var $_sum23=((($14)+(12))|0);
 var $357=(($mem+$_sum23)|0);
 var $358=$357;
 var $359=HEAP32[(($358)>>2)];
 var $360=($359|0)==0;
 if($360){label=110;break;}else{label=106;break;}
 case 106:
 var $362=$359;
 var $363=HEAP32[((1082208)>>2)];
 var $364=($362>>>0)<($363>>>0);
 if($364){label=108;break;}else{label=107;break;}
 case 107:
 var $366=(($R7_1+20)|0);
 HEAP32[(($366)>>2)]=$359;
 var $367=(($359+24)|0);
 HEAP32[(($367)>>2)]=$R7_1;
 label=110;break;
 case 108:
 _abort();
 throw "Reached an unreachable!";
 case 109:
 _abort();
 throw "Reached an unreachable!";
 case 110:
 var $371=$222|1;
 var $372=(($p_0+4)|0);
 HEAP32[(($372)>>2)]=$371;
 var $373=(($189+$222)|0);
 var $374=$373;
 HEAP32[(($374)>>2)]=$222;
 var $375=HEAP32[((1082212)>>2)];
 var $376=($p_0|0)==($375|0);
 if($376){label=111;break;}else{var $psize_1=$222;label=113;break;}
 case 111:
 HEAP32[((1082200)>>2)]=$222;
 label=140;break;
 case 112:
 var $379=$194&-2;
 HEAP32[(($193)>>2)]=$379;
 var $380=$psize_0|1;
 var $381=(($p_0+4)|0);
 HEAP32[(($381)>>2)]=$380;
 var $382=(($189+$psize_0)|0);
 var $383=$382;
 HEAP32[(($383)>>2)]=$psize_0;
 var $psize_1=$psize_0;label=113;break;
 case 113:
 var $psize_1;
 var $385=$psize_1>>>3;
 var $386=($psize_1>>>0)<256;
 if($386){label=114;break;}else{label=119;break;}
 case 114:
 var $388=$385<<1;
 var $389=((1082232+($388<<2))|0);
 var $390=$389;
 var $391=HEAP32[((1082192)>>2)];
 var $392=1<<$385;
 var $393=$391&$392;
 var $394=($393|0)==0;
 if($394){label=115;break;}else{label=116;break;}
 case 115:
 var $396=$391|$392;
 HEAP32[((1082192)>>2)]=$396;
 var $_sum19_pre=((($388)+(2))|0);
 var $_pre=((1082232+($_sum19_pre<<2))|0);
 var $F16_0=$390;var $_pre_phi=$_pre;label=118;break;
 case 116:
 var $_sum20=((($388)+(2))|0);
 var $398=((1082232+($_sum20<<2))|0);
 var $399=HEAP32[(($398)>>2)];
 var $400=$399;
 var $401=HEAP32[((1082208)>>2)];
 var $402=($400>>>0)<($401>>>0);
 if($402){label=117;break;}else{var $F16_0=$399;var $_pre_phi=$398;label=118;break;}
 case 117:
 _abort();
 throw "Reached an unreachable!";
 case 118:
 var $_pre_phi;
 var $F16_0;
 HEAP32[(($_pre_phi)>>2)]=$p_0;
 var $405=(($F16_0+12)|0);
 HEAP32[(($405)>>2)]=$p_0;
 var $406=(($p_0+8)|0);
 HEAP32[(($406)>>2)]=$F16_0;
 var $407=(($p_0+12)|0);
 HEAP32[(($407)>>2)]=$390;
 label=140;break;
 case 119:
 var $409=$p_0;
 var $410=$psize_1>>>8;
 var $411=($410|0)==0;
 if($411){var $I18_0=0;label=122;break;}else{label=120;break;}
 case 120:
 var $413=($psize_1>>>0)>16777215;
 if($413){var $I18_0=31;label=122;break;}else{label=121;break;}
 case 121:
 var $415=((($410)+(1048320))|0);
 var $416=$415>>>16;
 var $417=$416&8;
 var $418=$410<<$417;
 var $419=((($418)+(520192))|0);
 var $420=$419>>>16;
 var $421=$420&4;
 var $422=$421|$417;
 var $423=$418<<$421;
 var $424=((($423)+(245760))|0);
 var $425=$424>>>16;
 var $426=$425&2;
 var $427=$422|$426;
 var $428=(((14)-($427))|0);
 var $429=$423<<$426;
 var $430=$429>>>15;
 var $431=((($428)+($430))|0);
 var $432=$431<<1;
 var $433=((($431)+(7))|0);
 var $434=$psize_1>>>($433>>>0);
 var $435=$434&1;
 var $436=$435|$432;
 var $I18_0=$436;label=122;break;
 case 122:
 var $I18_0;
 var $438=((1082496+($I18_0<<2))|0);
 var $439=(($p_0+28)|0);
 var $I18_0_c=$I18_0;
 HEAP32[(($439)>>2)]=$I18_0_c;
 var $440=(($p_0+20)|0);
 HEAP32[(($440)>>2)]=0;
 var $441=(($p_0+16)|0);
 HEAP32[(($441)>>2)]=0;
 var $442=HEAP32[((1082196)>>2)];
 var $443=1<<$I18_0;
 var $444=$442&$443;
 var $445=($444|0)==0;
 if($445){label=123;break;}else{label=124;break;}
 case 123:
 var $447=$442|$443;
 HEAP32[((1082196)>>2)]=$447;
 HEAP32[(($438)>>2)]=$409;
 var $448=(($p_0+24)|0);
 var $_c=$438;
 HEAP32[(($448)>>2)]=$_c;
 var $449=(($p_0+12)|0);
 HEAP32[(($449)>>2)]=$p_0;
 var $450=(($p_0+8)|0);
 HEAP32[(($450)>>2)]=$p_0;
 label=136;break;
 case 124:
 var $452=HEAP32[(($438)>>2)];
 var $453=($I18_0|0)==31;
 if($453){var $458=0;label=126;break;}else{label=125;break;}
 case 125:
 var $455=$I18_0>>>1;
 var $456=(((25)-($455))|0);
 var $458=$456;label=126;break;
 case 126:
 var $458;
 var $459=(($452+4)|0);
 var $460=HEAP32[(($459)>>2)];
 var $461=$460&-8;
 var $462=($461|0)==($psize_1|0);
 if($462){var $T_0_lcssa=$452;label=133;break;}else{label=127;break;}
 case 127:
 var $463=$psize_1<<$458;
 var $T_072=$452;var $K19_073=$463;label=129;break;
 case 128:
 var $465=$K19_073<<1;
 var $466=(($473+4)|0);
 var $467=HEAP32[(($466)>>2)];
 var $468=$467&-8;
 var $469=($468|0)==($psize_1|0);
 if($469){var $T_0_lcssa=$473;label=133;break;}else{var $T_072=$473;var $K19_073=$465;label=129;break;}
 case 129:
 var $K19_073;
 var $T_072;
 var $471=$K19_073>>>31;
 var $472=(($T_072+16+($471<<2))|0);
 var $473=HEAP32[(($472)>>2)];
 var $474=($473|0)==0;
 if($474){label=130;break;}else{label=128;break;}
 case 130:
 var $476=$472;
 var $477=HEAP32[((1082208)>>2)];
 var $478=($476>>>0)<($477>>>0);
 if($478){label=132;break;}else{label=131;break;}
 case 131:
 HEAP32[(($472)>>2)]=$409;
 var $480=(($p_0+24)|0);
 var $T_0_c16=$T_072;
 HEAP32[(($480)>>2)]=$T_0_c16;
 var $481=(($p_0+12)|0);
 HEAP32[(($481)>>2)]=$p_0;
 var $482=(($p_0+8)|0);
 HEAP32[(($482)>>2)]=$p_0;
 label=136;break;
 case 132:
 _abort();
 throw "Reached an unreachable!";
 case 133:
 var $T_0_lcssa;
 var $484=(($T_0_lcssa+8)|0);
 var $485=HEAP32[(($484)>>2)];
 var $486=$T_0_lcssa;
 var $487=HEAP32[((1082208)>>2)];
 var $488=($486>>>0)>=($487>>>0);
 var $489=$485;
 var $490=($489>>>0)>=($487>>>0);
 var $or_cond=$488&$490;
 if($or_cond){label=134;break;}else{label=135;break;}
 case 134:
 var $492=(($485+12)|0);
 HEAP32[(($492)>>2)]=$409;
 HEAP32[(($484)>>2)]=$409;
 var $493=(($p_0+8)|0);
 var $_c15=$485;
 HEAP32[(($493)>>2)]=$_c15;
 var $494=(($p_0+12)|0);
 var $T_0_c=$T_0_lcssa;
 HEAP32[(($494)>>2)]=$T_0_c;
 var $495=(($p_0+24)|0);
 HEAP32[(($495)>>2)]=0;
 label=136;break;
 case 135:
 _abort();
 throw "Reached an unreachable!";
 case 136:
 var $497=HEAP32[((1082224)>>2)];
 var $498=((($497)-(1))|0);
 HEAP32[((1082224)>>2)]=$498;
 var $499=($498|0)==0;
 if($499){var $sp_0_in_i=1082648;label=137;break;}else{label=140;break;}
 case 137:
 var $sp_0_in_i;
 var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
 var $500=($sp_0_i|0)==0;
 var $501=(($sp_0_i+8)|0);
 if($500){label=138;break;}else{var $sp_0_in_i=$501;label=137;break;}
 case 138:
 HEAP32[((1082224)>>2)]=-1;
 label=140;break;
 case 139:
 _abort();
 throw "Reached an unreachable!";
 case 140:
 return;
  default: assert(0, "bad label: " + label);
 }

}
Module["_free"] = _free;


// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}

	Module["FS"] = FS;
	return Module;
};