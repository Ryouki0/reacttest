/* eslint-disable no-undef */
/* eslint-disable  no-restricted-globals */
/* eslint-disable import/no-amd */
var Module = (() => {
	var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
	if (typeof __filename != 'undefined') _scriptName ||= __filename;
	return (
		function(moduleArg = {}) {
			var moduleRtn;

			// include: shell.js
			// The Module object: Our interface to the outside world. We import
			// and export values on it. There are various ways Module can be used:
			// 1. Not defined. We create it here
			// 2. A function parameter, function(moduleArg) => Promise<Module>
			// 3. pre-run appended it, var Module = {}; ..generated code..
			// 4. External script tag defines var Module.
			// We need to check if Module already exists (e.g. case 3 above).
			// Substitution will be replaced with actual code on later stage of the build,
			// this way Closure Compiler will not mangle it (e.g. case 4. above).
			// Note that if you want to run closure, and also to use Module
			// after the generated code, you will need to define   var Module = {};
			// before the code. Then that object will be used in the code, and you
			// can continue to use Module afterwards as well.
			var Module = moduleArg;

			// Set up the promise that indicates the Module is initialized
			var readyPromiseResolve, readyPromiseReject;
			var readyPromise = new Promise((resolve, reject) => {
				readyPromiseResolve = resolve;
				readyPromiseReject = reject;
			});
			["_hello_react","_process_data","_malloc","_free","_print_number","_get_global_var","_memory","___indirect_function_table","onRuntimeInitialized"].forEach((prop) => {
				if (!Object.getOwnPropertyDescriptor(readyPromise, prop)) {
					Object.defineProperty(readyPromise, prop, {
						get: () => abort('You are getting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
						set: () => abort('You are setting ' + prop + ' on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js'),
					});
				}
			});

			// Determine the runtime environment we are in. You can customize this by
			// setting the ENVIRONMENT setting at compile time (see settings.js).

			// Attempt to auto-detect the environment
			var ENVIRONMENT_IS_WEB = typeof window == 'object';
			var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
			// N.b. Electron.js environment is simultaneously a NODE-environment, but
			// also a web environment.
			var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
			var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

			if (Module['ENVIRONMENT']) {
				throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
			}

			if (ENVIRONMENT_IS_NODE) {
				// `require()` is no-op in an ESM module, use `createRequire()` to construct
				// the require()` function.  This is only necessary for multi-environment
				// builds, `-sENVIRONMENT=node` emits a static import declaration instead.
				// TODO: Swap all `require()`'s with `import()`'s?

			}

			// --pre-jses are emitted after the Module integration code, so that they can
			// refer to Module (if they choose; they can also define Module)


			// Sometimes an existing Module object exists with properties
			// meant to overwrite the default module functionality. Here
			// we collect those properties and reapply _after_ we configure
			// the current environment's defaults to avoid having to be so
			// defensive during initialization.
			var moduleOverrides = Object.assign({}, Module);

			var arguments_ = [];
			var thisProgram = './this.program';
			var quit_ = (status, toThrow) => {
				throw toThrow;
			};

			// `/` should be present at the end if `scriptDirectory` is not empty
			var scriptDirectory = '';
			function locateFile(path) {
				if (Module['locateFile']) {
					return Module['locateFile'](path, scriptDirectory);
				}
				return scriptDirectory + path;
			}

			// Hooks that are implemented differently in different runtime environments.
			var read_,
				readAsync,
				readBinary;

			if (ENVIRONMENT_IS_NODE) {
				if (typeof process == 'undefined' || !process.release || process.release.name !== 'node') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

				var nodeVersion = process.versions.node;
				var numericVersion = nodeVersion.split('.').slice(0, 3);
				numericVersion = (numericVersion[0] * 10000) + (numericVersion[1] * 100) + (numericVersion[2].split('-')[0] * 1);
				var minVersion = 160000;
				if (numericVersion < 160000) {
					throw new Error('This emscripten-generated code requires node v16.0.0 (detected v' + nodeVersion + ')');
				}

				// These modules will usually be used on Node.js. Load them eagerly to avoid
				// the complexity of lazy-loading.
				var fs = require('fs');
				var nodePath = require('path');

				scriptDirectory = __dirname + '/';

				// include: node_shell_read.js
				read_ = (filename, binary) => {
					// We need to re-wrap `file://` strings to URLs. Normalizing isn't
					// necessary in that case, the path should already be absolute.
					filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
					return fs.readFileSync(filename, binary ? undefined : 'utf8');
				};

				readBinary = (filename) => {
					var ret = read_(filename, true);
					if (!ret.buffer) {
						ret = new Uint8Array(ret);
					}
					assert(ret.buffer);
					return ret;
				};

				readAsync = (filename, onload, onerror, binary = true) => {
					// See the comment in the `read_` function.
					filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
					fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
						if (err) onerror(err);
						else onload(binary ? data.buffer : data);
					});
				};
				// end include: node_shell_read.js
				if (!Module['thisProgram'] && process.argv.length > 1) {
					thisProgram = process.argv[1].replace(/\\/g, '/');
				}

				arguments_ = process.argv.slice(2);

				// MODULARIZE will export the module in the proper place outside, we don't need to export here

				quit_ = (status, toThrow) => {
					process.exitCode = status;
					throw toThrow;
				};

			} else
				if (ENVIRONMENT_IS_SHELL) {

					if ((typeof process == 'object' && typeof require === 'function') || typeof window == 'object' || typeof importScripts == 'function') throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

				} else

				// Note that this includes Node.js workers when relevant (pthreads is enabled).
				// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
				// ENVIRONMENT_IS_NODE.
					if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
						if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
							scriptDirectory = self.location.href;
						} else if (typeof document != 'undefined' && document.currentScript) { // web
							scriptDirectory = document.currentScript.src;
						}
						// When MODULARIZE, this JS may be executed later, after document.currentScript
						// is gone, so we saved it, and we use it here instead of any other info.
						if (_scriptName) {
							scriptDirectory = _scriptName;
						}
						// blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
						// otherwise, slice off the final part of the url to find the script directory.
						// if scriptDirectory does not contain a slash, lastIndexOf will return -1,
						// and scriptDirectory will correctly be replaced with an empty string.
						// If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
						// they are removed because they could contain a slash.
						if (scriptDirectory.startsWith('blob:')) {
							scriptDirectory = '';
						} else {
							scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/')+1);
						}

						if (!(typeof window == 'object' || typeof importScripts == 'function')) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

						{
							// include: web_or_worker_shell_read.js
							read_ = (url) => {
								var xhr = new XMLHttpRequest();
								xhr.open('GET', url, false);
								xhr.send(null);
								return xhr.responseText;
							};

							if (ENVIRONMENT_IS_WORKER) {
								readBinary = (url) => {
									var xhr = new XMLHttpRequest();
									xhr.open('GET', url, false);
									xhr.responseType = 'arraybuffer';
									xhr.send(null);
									return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
								};
							}

							readAsync = (url, onload, onerror) => {
								// Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
								// See https://github.com/github/fetch/pull/92#issuecomment-140665932
								// Cordova or Electron apps are typically loaded from a file:// url.
								// So use XHR on webview if URL is a file URL.
								if (isFileURI(url)) {
									var xhr = new XMLHttpRequest();
									xhr.open('GET', url, true);
									xhr.responseType = 'arraybuffer';
									xhr.onload = () => {
										if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
											onload(xhr.response);
											return;
										}
										onerror();
									};
									xhr.onerror = onerror;
									xhr.send(null);
									return;
								}
								fetch(url, { credentials: 'same-origin' })
									.then((response) => {
										if (response.ok) {
											return response.arrayBuffer();
										}
										return Promise.reject(new Error(response.status + ' : ' + response.url));
									})
									.then(onload, onerror);
							};
							// end include: web_or_worker_shell_read.js
						}
					} else
					{
						throw new Error('environment detection error');
					}

			var out = Module['print'] || console.log.bind(console);
			var err = Module['printErr'] || console.error.bind(console);

			// Merge back in the overrides
			Object.assign(Module, moduleOverrides);
			// Free the object hierarchy contained in the overrides, this lets the GC
			// reclaim data used.
			moduleOverrides = null;
			checkIncomingModuleAPI();

			// Emit code to handle expected values on the Module object. This applies Module.x
			// to the proper local x. This has two benefits: first, we only emit it if it is
			// expected to arrive, and second, by using a local everywhere else that can be
			// minified.

			if (Module['arguments']) arguments_ = Module['arguments'];legacyModuleProp('arguments', 'arguments_');

			if (Module['thisProgram']) thisProgram = Module['thisProgram'];legacyModuleProp('thisProgram', 'thisProgram');

			if (Module['quit']) quit_ = Module['quit'];legacyModuleProp('quit', 'quit_');

			// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
			// Assertions on removed incoming Module JS APIs.
			assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
			assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
			assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
			assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
			assert(typeof Module['read'] == 'undefined', 'Module.read option was removed (modify read_ in JS)');
			assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
			assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
			assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)');
			assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
			legacyModuleProp('asm', 'wasmExports');
			legacyModuleProp('read', 'read_');
			legacyModuleProp('readAsync', 'readAsync');
			legacyModuleProp('readBinary', 'readBinary');
			legacyModuleProp('setWindowTitle', 'setWindowTitle');
			var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
			var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
			var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
			var FETCHFS = 'FETCHFS is no longer included by default; build with -lfetchfs.js';
			var ICASEFS = 'ICASEFS is no longer included by default; build with -licasefs.js';
			var JSFILEFS = 'JSFILEFS is no longer included by default; build with -ljsfilefs.js';
			var OPFS = 'OPFS is no longer included by default; build with -lopfs.js';

			var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

			assert(!ENVIRONMENT_IS_SHELL, 'shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.');

			// end include: shell.js

			// include: preamble.js
			// === Preamble library stuff ===

			// Documentation for the public APIs defined in this file must be updated in:
			//    site/source/docs/api_reference/preamble.js.rst
			// A prebuilt local version of the documentation is available at:
			//    site/build/text/docs/api_reference/preamble.js.txt
			// You can also build docs locally as HTML or other formats in site/
			// An online HTML version (which may be of a different version of Emscripten)
			//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

			var wasmBinary; 
			if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];legacyModuleProp('wasmBinary', 'wasmBinary');

			if (typeof WebAssembly != 'object') {
				err('no native wasm support detected');
			}

			// include: base64Utils.js
			// Converts a string of base64 into a byte array (Uint8Array).
			function intArrayFromBase64(s) {
				if (typeof ENVIRONMENT_IS_NODE != 'undefined' && ENVIRONMENT_IS_NODE) {
					var buf = Buffer.from(s, 'base64');
					return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
				}

				var decoded = atob(s);
				var bytes = new Uint8Array(decoded.length);
				for (var i = 0 ; i < decoded.length ; ++i) {
					bytes[i] = decoded.charCodeAt(i);
				}
				return bytes;
			}

			// If filename is a base64 data URI, parses and returns data (Buffer on node,
			// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
			function tryParseAsDataURI(filename) {
				if (!isDataURI(filename)) {
					return;
				}

				return intArrayFromBase64(filename.slice(dataURIPrefix.length));
			}
			// end include: base64Utils.js
			// Wasm globals

			var wasmMemory;

			//========================================
			// Runtime essentials
			//========================================

			// whether we are quitting the application. no code should run after this.
			// set in exit() and abort()
			var ABORT = false;

			// set by exit() and abort().  Passed to 'onExit' handler.
			// NOTE: This is also used as the process return code code in shell environments
			// but only when noExitRuntime is false.
			var EXITSTATUS;

			// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
			// don't define it at all in release modes.  This matches the behaviour of
			// MINIMAL_RUNTIME.
			// TODO(sbc): Make this the default even without STRICT enabled.
			/** @type {function(*, string=)} */
			function assert(condition, text) {
				if (!condition) {
					abort('Assertion failed' + (text ? ': ' + text : ''));
				}
			}

			// We used to include malloc/free by default in the past. Show a helpful error in
			// builds with assertions.

			// Memory management

			var HEAP,
				/** @type {!Int8Array} */
				HEAP8,
				/** @type {!Uint8Array} */
				HEAPU8,
				/** @type {!Int16Array} */
				HEAP16,
				/** @type {!Uint16Array} */
				HEAPU16,
				/** @type {!Int32Array} */
				HEAP32,
				/** @type {!Uint32Array} */
				HEAPU32,
				/** @type {!Float32Array} */
				HEAPF32,
				/** @type {!Float64Array} */
				HEAPF64;

			// include: runtime_shared.js
			function updateMemoryViews() {
				var b = wasmMemory.buffer;
				Module['HEAP8'] = HEAP8 = new Int8Array(b);
				Module['HEAP16'] = HEAP16 = new Int16Array(b);
				Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
				Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
				Module['HEAP32'] = HEAP32 = new Int32Array(b);
				Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
				Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
				Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
			}
			// end include: runtime_shared.js
			assert(!Module['STACK_SIZE'], 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time');

			assert(typeof Int32Array != 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
				'JS engine does not provide full typed array support');

			// If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
			assert(!Module['wasmMemory'], 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
			assert(!Module['INITIAL_MEMORY'], 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');

			// include: runtime_stack_check.js
			// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
			function writeStackCookie() {
				var max = _emscripten_stack_get_end();
				assert((max & 3) == 0);
				// If the stack ends at address zero we write our cookies 4 bytes into the
				// stack.  This prevents interference with SAFE_HEAP and ASAN which also
				// monitor writes to address zero.
				if (max == 0) {
					max += 4;
				}
				// The stack grow downwards towards _emscripten_stack_get_end.
				// We write cookies to the final two words in the stack and detect if they are
				// ever overwritten.
				HEAPU32[((max)>>2)] = 0x02135467;
				HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
				// Also test the global address 0 for integrity.
				HEAPU32[((0)>>2)] = 1668509029;
			}

			function checkStackCookie() {
				if (ABORT) return;
				var max = _emscripten_stack_get_end();
				// See writeStackCookie().
				if (max == 0) {
					max += 4;
				}
				var cookie1 = HEAPU32[((max)>>2)];
				var cookie2 = HEAPU32[(((max)+(4))>>2)];
				if (cookie1 != 0x02135467 || cookie2 != 0x89BACDFE) {
					abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
				}
				// Also test the global address 0 for integrity.
				if (HEAPU32[((0)>>2)] != 0x63736d65 /* 'emsc' */) {
					abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
				}
			}
			// end include: runtime_stack_check.js
			// include: runtime_assertions.js
			// Endianness check
			(function() {
				var h16 = new Int16Array(1);
				var h8 = new Int8Array(h16.buffer);
				h16[0] = 0x6373;
				if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
			})();

			// end include: runtime_assertions.js
			var __ATPRERUN__  = []; // functions called before the runtime is initialized
			var __ATINIT__    = []; // functions called during startup
			var __ATEXIT__    = []; // functions called during shutdown
			var __ATPOSTRUN__ = []; // functions called after the main() is called

			var runtimeInitialized = false;

			function preRun() {
				if (Module['preRun']) {
					if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
					while (Module['preRun'].length) {
						addOnPreRun(Module['preRun'].shift());
					}
				}
				callRuntimeCallbacks(__ATPRERUN__);
			}

			function initRuntime() {
				assert(!runtimeInitialized);
				runtimeInitialized = true;

				checkStackCookie();

  
				callRuntimeCallbacks(__ATINIT__);
			}

			function postRun() {
				checkStackCookie();

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

			function addOnInit(cb) {
				__ATINIT__.unshift(cb);
			}

			function addOnExit(cb) {
			}

			function addOnPostRun(cb) {
				__ATPOSTRUN__.unshift(cb);
			}

			// include: runtime_math.js
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

			assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
			assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
			assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
			assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
			// end include: runtime_math.js
			// A counter of dependencies for calling run(). If we need to
			// do asynchronous work before running, increment this and
			// decrement it. Incrementing must happen in a place like
			// Module.preRun (used by emcc to add file preloading).
			// Note that you can add dependencies in preRun, even though
			// it happens right before run - run will be postponed until
			// the dependencies are met.
			var runDependencies = 0;
			var runDependencyWatcher = null;
			var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
			var runDependencyTracking = {};

			function getUniqueRunDependency(id) {
				var orig = id;
				while (1) {
					if (!runDependencyTracking[id]) return id;
					id = orig + Math.random();
				}
			}

			function addRunDependency(id) {
				runDependencies++;

				Module['monitorRunDependencies']?.(runDependencies);

				if (id) {
					assert(!runDependencyTracking[id]);
					runDependencyTracking[id] = 1;
					if (runDependencyWatcher === null && typeof setInterval != 'undefined') {
						// Check for missing dependencies every few seconds
						runDependencyWatcher = setInterval(() => {
							if (ABORT) {
								clearInterval(runDependencyWatcher);
								runDependencyWatcher = null;
								return;
							}
							var shown = false;
							for (var dep in runDependencyTracking) {
								if (!shown) {
									shown = true;
									err('still waiting on run dependencies:');
								}
								err(`dependency: ${dep}`);
							}
							if (shown) {
								err('(end of list)');
							}
						}, 10000);
					}
				} else {
					err('warning: run dependency added without ID');
				}
			}

			function removeRunDependency(id) {
				runDependencies--;

				Module['monitorRunDependencies']?.(runDependencies);

				if (id) {
					assert(runDependencyTracking[id]);
					delete runDependencyTracking[id];
				} else {
					err('warning: run dependency removed without ID');
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

			/** @param {string|number=} what */
			function abort(what) {
				Module['onAbort']?.(what);

				what = 'Aborted(' + what + ')';
				// TODO(sbc): Should we remove printing and leave it up to whoever
				// catches the exception?
				err(what);

				ABORT = true;
				EXITSTATUS = 1;

				// Use a wasm runtime error, because a JS error might be seen as a foreign
				// exception, which means we'd run destructors on it. We need the error to
				// simply make the program stop.
				// FIXME This approach does not work in Wasm EH because it currently does not assume
				// all RuntimeErrors are from traps; it decides whether a RuntimeError is from
				// a trap or not based on a hidden field within the object. So at the moment
				// we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
				// allows this in the wasm spec.

				// Suppress closure compiler warning here. Closure compiler's builtin extern
				// definition for WebAssembly.RuntimeError claims it takes no arguments even
				// though it can.
				// TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
				/** @suppress {checkTypes} */
				var e = new WebAssembly.RuntimeError(what);

				readyPromiseReject(e);
				// Throw the error whether or not MODULARIZE is set because abort is used
				// in code paths apart from instantiation where an exception is expected
				// to be thrown when abort is called.
				throw e;
			}

			// include: memoryprofiler.js
			// end include: memoryprofiler.js
			// show errors on likely calls to FS when it was not included
			var FS = {
				error() {
					abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM');
				},
				init() { FS.error(); },
				createDataFile() { FS.error(); },
				createPreloadedFile() { FS.error(); },
				createLazyFile() { FS.error(); },
				open() { FS.error(); },
				mkdev() { FS.error(); },
				registerDevice() { FS.error(); },
				analyzePath() { FS.error(); },

				ErrnoError() { FS.error(); },
			};
			Module['FS_createDataFile'] = FS.createDataFile;
			Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

			// include: URIUtils.js
			// Prefix of data URIs emitted by SINGLE_FILE and related options.
			var dataURIPrefix = 'data:application/octet-stream;base64,';

			/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */
			var isDataURI = (filename) => filename.startsWith(dataURIPrefix);

			/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
			var isFileURI = (filename) => filename.startsWith('file://');
			// end include: URIUtils.js
			function createExportWrapper(name, nargs) {
				return (...args) => {
					assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
					var f = wasmExports[name];
					assert(f, `exported native function \`${name}\` not found`);
					// Only assert for too many arguments. Too few can be valid since the missing arguments will be zero filled.
					assert(args.length <= nargs, `native function \`${name}\` called with ${args.length} args but expects ${nargs}`);
					return f(...args);
				};
			}

			// include: runtime_exceptions.js
			// end include: runtime_exceptions.js
			function findWasmBinary() {
				var f = 'data:application/octet-stream;base64,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';
				return f;
			}

			var wasmBinaryFile;

			function getBinarySync(file) {
				if (file == wasmBinaryFile && wasmBinary) {
					return new Uint8Array(wasmBinary);
				}
				var binary = tryParseAsDataURI(file);
				if (binary) {
					return binary;
				}
				if (readBinary) {
					return readBinary(file);
				}
				throw 'both async and sync fetching of the wasm failed';
			}

			function getBinaryPromise(binaryFile) {

				// Otherwise, getBinarySync should be able to get it synchronously
				return Promise.resolve().then(() => getBinarySync(binaryFile));
			}

			function instantiateArrayBuffer(binaryFile, imports, receiver) {
				return getBinaryPromise(binaryFile).then((binary) => {
					return WebAssembly.instantiate(binary, imports);
				}).then(receiver, (reason) => {
					err(`failed to asynchronously prepare wasm: ${reason}`);

					// Warn on some common problems.
					if (isFileURI(wasmBinaryFile)) {
						err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
					}
					abort(reason);
				});
			}

			function instantiateAsync(binary, binaryFile, imports, callback) {
				return instantiateArrayBuffer(binaryFile, imports, callback);
			}

			function getWasmImports() {
				// prepare imports
				return {
					'env': wasmImports,
					'wasi_snapshot_preview1': wasmImports,
				};
			}

			// Create the wasm instance.
			// Receives the wasm imports, returns the exports.
			function createWasm() {
				var info = getWasmImports();
				// Load the wasm module and create an instance of using native support in the JS engine.
				// handle a generated wasm instance, receiving its exports and
				// performing other necessary setup
				/** @param {WebAssembly.Module=} module*/
				function receiveInstance(instance, module) {
					wasmExports = instance.exports;

    

					wasmMemory = wasmExports['memory'];
    
					assert(wasmMemory, 'memory not found in wasm exports');
					updateMemoryViews();

					addOnInit(wasmExports['__wasm_call_ctors']);

					removeRunDependency('wasm-instantiate');
					return wasmExports;
				}
				// wait for the pthread pool (if any)
				addRunDependency('wasm-instantiate');

				// Prefer streaming instantiation if available.
				// Async compilation can be confusing when an error on the page overwrites Module
				// (for example, if the order of elements is wrong, and the one defining Module is
				// later), so we save Module and check it later.
				var trueModule = Module;
				function receiveInstantiationResult(result) {
					// 'result' is a ResultObject object which has both the module and instance.
					// receiveInstance() will swap in the exports (to Module.asm) so they can be called
					assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
					trueModule = null;
					// TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
					// When the regression is fixed, can restore the above PTHREADS-enabled path.
					receiveInstance(result['instance']);
				}

				// User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
				// to manually instantiate the Wasm module themselves. This allows pages to
				// run the instantiation parallel to any other async startup actions they are
				// performing.
				// Also pthreads and wasm workers initialize the wasm instance through this
				// path.
				if (Module['instantiateWasm']) {
					try {
						return Module['instantiateWasm'](info, receiveInstance);
					} catch(e) {
						err(`Module.instantiateWasm callback failed with error: ${e}`);
						// If instantiation fails, reject the module ready promise.
						readyPromiseReject(e);
					}
				}

				if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();

				// If instantiation fails, reject the module ready promise.
				instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
				return {}; // no exports yet; we'll fill them in later
			}

			// Globals used by JS i64 conversions (see makeSetValue)
			var tempDouble;
			var tempI64;

			// include: runtime_debug.js
			function legacyModuleProp(prop, newName, incoming=true) {
				if (!Object.getOwnPropertyDescriptor(Module, prop)) {
					Object.defineProperty(Module, prop, {
						configurable: true,
						get() {
							let extra = incoming ? ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)' : '';
							abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);

						}
					});
				}
			}

			function ignoredModuleProp(prop) {
				if (Object.getOwnPropertyDescriptor(Module, prop)) {
					abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
				}
			}

			// forcing the filesystem exports a few things by default
			function isExportedByForceFilesystem(name) {
				return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
			}

			function missingGlobal(sym, msg) {
				if (typeof globalThis != 'undefined') {
					Object.defineProperty(globalThis, sym, {
						configurable: true,
						get() {
							warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
							return undefined;
						}
					});
				}
			}

			missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');
			missingGlobal('asm', 'Please use wasmExports instead');

			function missingLibrarySymbol(sym) {
				if (typeof globalThis != 'undefined' && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
					Object.defineProperty(globalThis, sym, {
						configurable: true,
						get() {
							// Can't `abort()` here because it would break code that does runtime
							// checks.  e.g. `if (typeof SDL === 'undefined')`.
							var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
							// DEFAULT_LIBRARY_FUNCS_TO_INCLUDE requires the name as it appears in
							// library.js, which means $name for a JS name with no prefix, or name
							// for a JS name like _name.
							var librarySymbol = sym;
							if (!librarySymbol.startsWith('_')) {
								librarySymbol = '$' + sym;
							}
							msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
							if (isExportedByForceFilesystem(sym)) {
								msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
							}
							warnOnce(msg);
							return undefined;
						}
					});
				}
				// Any symbol that is not included from the JS library is also (by definition)
				// not exported on the Module object.
				unexportedRuntimeSymbol(sym);
			}

			function unexportedRuntimeSymbol(sym) {
				if (!Object.getOwnPropertyDescriptor(Module, sym)) {
					Object.defineProperty(Module, sym, {
						configurable: true,
						get() {
							var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
							if (isExportedByForceFilesystem(sym)) {
								msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
							}
							abort(msg);
						}
					});
				}
			}

			// Used by XXXXX_DEBUG settings to output debug messages.
			function dbg(...args) {
				// TODO(sbc): Make this configurable somehow.  Its not always convenient for
				// logging to show up as warnings.
				console.warn(...args);
			}
			// end include: runtime_debug.js
			// === Body ===
			// end include: preamble.js


			/** @constructor */
			function ExitStatus(status) {
				this.name = 'ExitStatus';
				this.message = `Program terminated with exit(${status})`;
				this.status = status;
			}

			var callRuntimeCallbacks = (callbacks) => {
				while (callbacks.length > 0) {
					// Pass the module as the first argument.
					callbacks.shift()(Module);
				}
			};

  
			/**
     * @param {number} ptr
     * @param {string} type
     */
			function getValue(ptr, type = 'i8') {
				if (type.endsWith('*')) type = '*';
				switch (type) {
				case 'i1': return HEAP8[ptr];
				case 'i8': return HEAP8[ptr];
				case 'i16': return HEAP16[((ptr)>>1)];
				case 'i32': return HEAP32[((ptr)>>2)];
				case 'i64': abort('to do getValue(i64) use WASM_BIGINT');
				case 'float': return HEAPF32[((ptr)>>2)];
				case 'double': return HEAPF64[((ptr)>>3)];
				case '*': return HEAPU32[((ptr)>>2)];
				default: abort(`invalid type for getValue: ${type}`);
				}
			}

			var noExitRuntime = Module['noExitRuntime'] || true;

			var ptrToString = (ptr) => {
				assert(typeof ptr === 'number');
				// With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
				ptr >>>= 0;
				return '0x' + ptr.toString(16).padStart(8, '0');
			};

  
			/**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
			function setValue(ptr, value, type = 'i8') {
				if (type.endsWith('*')) type = '*';
				switch (type) {
				case 'i1': HEAP8[ptr] = value; break;
				case 'i8': HEAP8[ptr] = value; break;
				case 'i16': HEAP16[((ptr)>>1)] = value; break;
				case 'i32': HEAP32[((ptr)>>2)] = value; break;
				case 'i64': abort('to do setValue(i64) use WASM_BIGINT');
				case 'float': HEAPF32[((ptr)>>2)] = value; break;
				case 'double': HEAPF64[((ptr)>>3)] = value; break;
				case '*': HEAPU32[((ptr)>>2)] = value; break;
				default: abort(`invalid type for setValue: ${type}`);
				}
			}

			var stackRestore = (val) => __emscripten_stack_restore(val);

			var stackSave = () => _emscripten_stack_get_current();

			var warnOnce = (text) => {
				warnOnce.shown ||= {};
				if (!warnOnce.shown[text]) {
					warnOnce.shown[text] = 1;
					if (ENVIRONMENT_IS_NODE) text = 'warning: ' + text;
					err(text);
				}
			};

			var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);

			var getHeapMax = () =>
				HEAPU8.length;
  
			var abortOnCannotGrowMemory = (requestedSize) => {
				abort(`Cannot enlarge memory arrays to size ${requestedSize} bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ${HEAP8.length}, (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0`);
			};
			var _emscripten_resize_heap = (requestedSize) => {
				var oldSize = HEAPU8.length;
				// With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
				requestedSize >>>= 0;
				abortOnCannotGrowMemory(requestedSize);
			};

			var printCharBuffers = [null,[],[]];
  
			var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
  
			/**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
			var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
				var endIdx = idx + maxBytesToRead;
				var endPtr = idx;
				// TextDecoder needs to know the byte length in advance, it doesn't stop on
				// null terminator by itself.  Also, use the length info to avoid running tiny
				// strings through TextDecoder, since .subarray() allocates garbage.
				// (As a tiny code save trick, compare endPtr against endIdx using a negation,
				// so that undefined means Infinity)
				while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  
				if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
					return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
				}
				var str = '';
				// If building with TextDecoder, we have already computed the string length
				// above, so test loop end condition against that
				while (idx < endPtr) {
					// For UTF8 byte structure, see:
					// http://en.wikipedia.org/wiki/UTF-8#Description
					// https://www.ietf.org/rfc/rfc2279.txt
					// https://tools.ietf.org/html/rfc3629
					var u0 = heapOrArray[idx++];
					if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
					var u1 = heapOrArray[idx++] & 63;
					if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
					var u2 = heapOrArray[idx++] & 63;
					if ((u0 & 0xF0) == 0xE0) {
						u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
					} else {
						if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
						u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
					}
  
					if (u0 < 0x10000) {
						str += String.fromCharCode(u0);
					} else {
						var ch = u0 - 0x10000;
						str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
					}
				}
				return str;
			};
			var printChar = (stream, curr) => {
				var buffer = printCharBuffers[stream];
				assert(buffer);
				if (curr === 0 || curr === 10) {
					(stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
					buffer.length = 0;
				} else {
					buffer.push(curr);
				}
			};
  
			var flush_NO_FILESYSTEM = () => {
				// flush anything remaining in the buffers during shutdown
				_fflush(0);
				if (printCharBuffers[1].length) printChar(1, 10);
				if (printCharBuffers[2].length) printChar(2, 10);
			};
  
  
  
			/**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
			var UTF8ToString = (ptr, maxBytesToRead) => {
				assert(typeof ptr == 'number', `UTF8ToString expects a number (got ${typeof ptr})`);
				return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
			};
			var SYSCALLS = {
				varargs:undefined,
				getStr(ptr) {
					var ret = UTF8ToString(ptr);
					return ret;
				},
			};
			var _fd_write = (fd, iov, iovcnt, pnum) => {
				// hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
				var num = 0;
				for (var i = 0; i < iovcnt; i++) {
					var ptr = HEAPU32[((iov)>>2)];
					var len = HEAPU32[(((iov)+(4))>>2)];
					iov += 8;
					for (var j = 0; j < len; j++) {
						printChar(fd, HEAPU8[ptr+j]);
					}
					num += len;
				}
				HEAPU32[((pnum)>>2)] = num;
				return 0;
			};

			var getCFunc = (ident) => {
				var func = Module['_' + ident]; // closure exported function
				assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
				return func;
			};
  
			var writeArrayToMemory = (array, buffer) => {
				assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)');
				HEAP8.set(array, buffer);
			};
  
			var lengthBytesUTF8 = (str) => {
				var len = 0;
				for (var i = 0; i < str.length; ++i) {
					// Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
					// unit, not a Unicode code point of the character! So decode
					// UTF16->UTF32->UTF8.
					// See http://unicode.org/faq/utf_bom.html#utf16-3
					var c = str.charCodeAt(i); // possibly a lead surrogate
					if (c <= 0x7F) {
						len++;
					} else if (c <= 0x7FF) {
						len += 2;
					} else if (c >= 0xD800 && c <= 0xDFFF) {
						len += 4; ++i;
					} else {
						len += 3;
					}
				}
				return len;
			};
  
			var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
				assert(typeof str === 'string', `stringToUTF8Array expects a string (got ${typeof str})`);
				// Parameter maxBytesToWrite is not optional. Negative values, 0, null,
				// undefined and false each don't write out any bytes.
				if (!(maxBytesToWrite > 0))
					return 0;
  
				var startIdx = outIdx;
				var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
				for (var i = 0; i < str.length; ++i) {
					// Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
					// unit, not a Unicode code point of the character! So decode
					// UTF16->UTF32->UTF8.
					// See http://unicode.org/faq/utf_bom.html#utf16-3
					// For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
					// and https://www.ietf.org/rfc/rfc2279.txt
					// and https://tools.ietf.org/html/rfc3629
					var u = str.charCodeAt(i); // possibly a lead surrogate
					if (u >= 0xD800 && u <= 0xDFFF) {
						var u1 = str.charCodeAt(++i);
						u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
					}
					if (u <= 0x7F) {
						if (outIdx >= endIdx) break;
						heap[outIdx++] = u;
					} else if (u <= 0x7FF) {
						if (outIdx + 1 >= endIdx) break;
						heap[outIdx++] = 0xC0 | (u >> 6);
						heap[outIdx++] = 0x80 | (u & 63);
					} else if (u <= 0xFFFF) {
						if (outIdx + 2 >= endIdx) break;
						heap[outIdx++] = 0xE0 | (u >> 12);
						heap[outIdx++] = 0x80 | ((u >> 6) & 63);
						heap[outIdx++] = 0x80 | (u & 63);
					} else {
						if (outIdx + 3 >= endIdx) break;
						if (u > 0x10FFFF) warnOnce('Invalid Unicode code point ' + ptrToString(u) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
						heap[outIdx++] = 0xF0 | (u >> 18);
						heap[outIdx++] = 0x80 | ((u >> 12) & 63);
						heap[outIdx++] = 0x80 | ((u >> 6) & 63);
						heap[outIdx++] = 0x80 | (u & 63);
					}
				}
				// Null-terminate the pointer to the buffer.
				heap[outIdx] = 0;
				return outIdx - startIdx;
			};
			var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
				assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
				return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
			};
  
			var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
			var stringToUTF8OnStack = (str) => {
				var size = lengthBytesUTF8(str) + 1;
				var ret = stackAlloc(size);
				stringToUTF8(str, ret, size);
				return ret;
			};
  
  
  
  
  
			/**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */
			var ccall = (ident, returnType, argTypes, args, opts) => {
				// For fast lookup of conversion functions
				var toC = {
					'string': (str) => {
						var ret = 0;
						if (str !== null && str !== undefined && str !== 0) { // null string
							// at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
							ret = stringToUTF8OnStack(str);
						}
						return ret;
					},
					'array': (arr) => {
						var ret = stackAlloc(arr.length);
						writeArrayToMemory(arr, ret);
						return ret;
					}
				};
  
				function convertReturnValue(ret) {
					if (returnType === 'string') {
          
						return UTF8ToString(ret);
					}
					if (returnType === 'boolean') return Boolean(ret);
					return ret;
				}
  
				var func = getCFunc(ident);
				var cArgs = [];
				var stack = 0;
				assert(returnType !== 'array', 'Return type should not be "array".');
				if (args) {
					for (var i = 0; i < args.length; i++) {
						var converter = toC[argTypes[i]];
						if (converter) {
							if (stack === 0) stack = stackSave();
							cArgs[i] = converter(args[i]);
						} else {
							cArgs[i] = args[i];
						}
					}
				}
				var ret = func(...cArgs);
				function onDone(ret) {
					if (stack !== 0) stackRestore(stack);
					return convertReturnValue(ret);
				}
  
				ret = onDone(ret);
				return ret;
			};

  
  
			/**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
			var cwrap = (ident, returnType, argTypes, opts) => {
				return (...args) => ccall(ident, returnType, argTypes, args, opts);
			};
			function checkIncomingModuleAPI() {
				ignoredModuleProp('fetchSettings');
			}
			var wasmImports = {
				/** @export */
				_emscripten_memcpy_js: __emscripten_memcpy_js,
				/** @export */
				emscripten_resize_heap: _emscripten_resize_heap,
				/** @export */
				fd_write: _fd_write
			};
			var wasmExports = createWasm();
			var ___wasm_call_ctors = createExportWrapper('__wasm_call_ctors', 0);
			var _hello_react = Module['_hello_react'] = createExportWrapper('hello_react', 0);
			var _process_data = Module['_process_data'] = createExportWrapper('process_data', 3);
			var _print_number = Module['_print_number'] = createExportWrapper('print_number', 1);
			var _get_global_var = Module['_get_global_var'] = createExportWrapper('get_global_var', 0);
			var _fflush = createExportWrapper('fflush', 1);
			var _malloc = Module['_malloc'] = createExportWrapper('malloc', 1);
			var _free = Module['_free'] = createExportWrapper('free', 1);
			var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports['emscripten_stack_init'])();
			var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'])();
			var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports['emscripten_stack_get_base'])();
			var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports['emscripten_stack_get_end'])();
			var __emscripten_stack_restore = (a0) => (__emscripten_stack_restore = wasmExports['_emscripten_stack_restore'])(a0);
			var __emscripten_stack_alloc = (a0) => (__emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'])(a0);
			var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'])();
			var dynCall_jiji = Module['dynCall_jiji'] = createExportWrapper('dynCall_jiji', 5);


			// include: postamble.js
			// === Auto-generated postamble setup entry stuff ===

			Module['ccall'] = ccall;
			Module['cwrap'] = cwrap;
			var missingLibrarySymbols = [
				'writeI53ToI64',
				'writeI53ToI64Clamped',
				'writeI53ToI64Signaling',
				'writeI53ToU64Clamped',
				'writeI53ToU64Signaling',
				'readI53FromI64',
				'readI53FromU64',
				'convertI32PairToI53',
				'convertI32PairToI53Checked',
				'convertU32PairToI53',
				'getTempRet0',
				'setTempRet0',
				'zeroMemory',
				'exitJS',
				'growMemory',
				'isLeapYear',
				'ydayFromDate',
				'arraySum',
				'addDays',
				'inetPton4',
				'inetNtop4',
				'inetPton6',
				'inetNtop6',
				'readSockaddr',
				'writeSockaddr',
				'initRandomFill',
				'randomFill',
				'emscriptenLog',
				'readEmAsmArgs',
				'jstoi_q',
				'getExecutableName',
				'listenOnce',
				'autoResumeAudioContext',
				'dynCallLegacy',
				'getDynCaller',
				'dynCall',
				'handleException',
				'keepRuntimeAlive',
				'runtimeKeepalivePush',
				'runtimeKeepalivePop',
				'callUserCallback',
				'maybeExit',
				'asmjsMangle',
				'asyncLoad',
				'alignMemory',
				'mmapAlloc',
				'HandleAllocator',
				'getNativeTypeSize',
				'STACK_SIZE',
				'STACK_ALIGN',
				'POINTER_SIZE',
				'ASSERTIONS',
				'uleb128Encode',
				'sigToWasmTypes',
				'generateFuncType',
				'convertJsFunctionToWasm',
				'getEmptyTableSlot',
				'updateTableMap',
				'getFunctionAddress',
				'addFunction',
				'removeFunction',
				'reallyNegative',
				'unSign',
				'strLen',
				'reSign',
				'formatString',
				'intArrayFromString',
				'intArrayToString',
				'AsciiToString',
				'stringToAscii',
				'UTF16ToString',
				'stringToUTF16',
				'lengthBytesUTF16',
				'UTF32ToString',
				'stringToUTF32',
				'lengthBytesUTF32',
				'stringToNewUTF8',
				'registerKeyEventCallback',
				'maybeCStringToJsString',
				'findEventTarget',
				'getBoundingClientRect',
				'fillMouseEventData',
				'registerMouseEventCallback',
				'registerWheelEventCallback',
				'registerUiEventCallback',
				'registerFocusEventCallback',
				'fillDeviceOrientationEventData',
				'registerDeviceOrientationEventCallback',
				'fillDeviceMotionEventData',
				'registerDeviceMotionEventCallback',
				'screenOrientation',
				'fillOrientationChangeEventData',
				'registerOrientationChangeEventCallback',
				'fillFullscreenChangeEventData',
				'registerFullscreenChangeEventCallback',
				'JSEvents_requestFullscreen',
				'JSEvents_resizeCanvasForFullscreen',
				'registerRestoreOldStyle',
				'hideEverythingExceptGivenElement',
				'restoreHiddenElements',
				'setLetterbox',
				'softFullscreenResizeWebGLRenderTarget',
				'doRequestFullscreen',
				'fillPointerlockChangeEventData',
				'registerPointerlockChangeEventCallback',
				'registerPointerlockErrorEventCallback',
				'requestPointerLock',
				'fillVisibilityChangeEventData',
				'registerVisibilityChangeEventCallback',
				'registerTouchEventCallback',
				'fillGamepadEventData',
				'registerGamepadEventCallback',
				'registerBeforeUnloadEventCallback',
				'fillBatteryEventData',
				'battery',
				'registerBatteryEventCallback',
				'setCanvasElementSize',
				'getCanvasElementSize',
				'jsStackTrace',
				'getCallstack',
				'convertPCtoSourceLocation',
				'getEnvStrings',
				'checkWasiClock',
				'wasiRightsToMuslOFlags',
				'wasiOFlagsToMuslOFlags',
				'createDyncallWrapper',
				'safeSetTimeout',
				'setImmediateWrapped',
				'clearImmediateWrapped',
				'polyfillSetImmediate',
				'getPromise',
				'makePromise',
				'idsToPromises',
				'makePromiseCallback',
				'ExceptionInfo',
				'findMatchingCatch',
				'Browser_asyncPrepareDataCounter',
				'setMainLoop',
				'getSocketFromFD',
				'getSocketAddress',
				'FS_createPreloadedFile',
				'FS_modeStringToFlags',
				'FS_getMode',
				'FS_stdin_getChar',
				'FS_unlink',
				'FS_createDataFile',
				'FS_mkdirTree',
				'_setNetworkCallback',
				'heapObjectForWebGLType',
				'toTypedArrayIndex',
				'webgl_enable_ANGLE_instanced_arrays',
				'webgl_enable_OES_vertex_array_object',
				'webgl_enable_WEBGL_draw_buffers',
				'webgl_enable_WEBGL_multi_draw',
				'emscriptenWebGLGet',
				'computeUnpackAlignedImageSize',
				'colorChannelsInGlTextureFormat',
				'emscriptenWebGLGetTexPixelData',
				'emscriptenWebGLGetUniform',
				'webglGetUniformLocation',
				'webglPrepareUniformLocationsBeforeFirstUse',
				'webglGetLeftBracePos',
				'emscriptenWebGLGetVertexAttrib',
				'__glGetActiveAttribOrUniform',
				'writeGLArray',
				'registerWebGlEventCallback',
				'runAndAbortIfError',
				'ALLOC_NORMAL',
				'ALLOC_STACK',
				'allocate',
				'writeStringToMemory',
				'writeAsciiToMemory',
				'setErrNo',
				'demangle',
				'stackTrace',
			];
			missingLibrarySymbols.forEach(missingLibrarySymbol);

			var unexportedSymbols = [
				'run',
				'addOnPreRun',
				'addOnInit',
				'addOnPreMain',
				'addOnExit',
				'addOnPostRun',
				'addRunDependency',
				'removeRunDependency',
				'out',
				'err',
				'callMain',
				'abort',
				'wasmMemory',
				'wasmExports',
				'writeStackCookie',
				'checkStackCookie',
				'intArrayFromBase64',
				'tryParseAsDataURI',
				'stackSave',
				'stackRestore',
				'stackAlloc',
				'ptrToString',
				'getHeapMax',
				'abortOnCannotGrowMemory',
				'ENV',
				'MONTH_DAYS_REGULAR',
				'MONTH_DAYS_LEAP',
				'MONTH_DAYS_REGULAR_CUMULATIVE',
				'MONTH_DAYS_LEAP_CUMULATIVE',
				'ERRNO_CODES',
				'ERRNO_MESSAGES',
				'DNS',
				'Protocols',
				'Sockets',
				'timers',
				'warnOnce',
				'readEmAsmArgsArray',
				'jstoi_s',
				'wasmTable',
				'noExitRuntime',
				'getCFunc',
				'freeTableIndexes',
				'functionsInTableMap',
				'setValue',
				'getValue',
				'PATH',
				'PATH_FS',
				'UTF8Decoder',
				'UTF8ArrayToString',
				'UTF8ToString',
				'stringToUTF8Array',
				'stringToUTF8',
				'lengthBytesUTF8',
				'UTF16Decoder',
				'stringToUTF8OnStack',
				'writeArrayToMemory',
				'JSEvents',
				'specialHTMLTargets',
				'findCanvasEventTarget',
				'currentFullscreenStrategy',
				'restoreOldWindowedStyle',
				'UNWIND_CACHE',
				'ExitStatus',
				'flush_NO_FILESYSTEM',
				'promiseMap',
				'uncaughtExceptionCount',
				'exceptionLast',
				'exceptionCaught',
				'Browser',
				'getPreloadedImageData__data',
				'wget',
				'SYSCALLS',
				'preloadPlugins',
				'FS_stdin_getChar_buffer',
				'FS_createPath',
				'FS_createDevice',
				'FS_readFile',
				'FS',
				'FS_createLazyFile',
				'MEMFS',
				'TTY',
				'PIPEFS',
				'SOCKFS',
				'tempFixedLengthArray',
				'miniTempWebGLFloatBuffers',
				'miniTempWebGLIntBuffers',
				'GL',
				'AL',
				'GLUT',
				'EGL',
				'GLEW',
				'IDBStore',
				'SDL',
				'SDL_gfx',
				'allocateUTF8',
				'allocateUTF8OnStack',
				'print',
				'printErr',
			];
			unexportedSymbols.forEach(unexportedRuntimeSymbol);



			var calledRun;

			dependenciesFulfilled = function runCaller() {
				// If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
				if (!calledRun) run();
				if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
			};

			function stackCheckInit() {
				// This is normally called automatically during __wasm_call_ctors but need to
				// get these values before even running any of the ctors so we call it redundantly
				// here.
				_emscripten_stack_init();
				// TODO(sbc): Move writeStackCookie to native to to avoid this.
				writeStackCookie();
			}

			function run() {

				if (runDependencies > 0) {
					return;
				}

				stackCheckInit();

				preRun();

				// a preRun added a dependency, run will be called later
				if (runDependencies > 0) {
					return;
				}

				function doRun() {
					// run may have just been called through dependencies being fulfilled just in this very frame,
					// or while the async setStatus time below was happening
					if (calledRun) return;
					calledRun = true;
					Module['calledRun'] = true;

					if (ABORT) return;

					initRuntime();

					readyPromiseResolve(Module);
					if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

					assert(!Module['_main'], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');

					postRun();
				}

				if (Module['setStatus']) {
					Module['setStatus']('Running...');
					setTimeout(function() {
						setTimeout(function() {
							Module['setStatus']('');
						}, 1);
						doRun();
					}, 1);
				} else
				{
					doRun();
				}
				checkStackCookie();
			}

			function checkUnflushedContent() {
				// Compiler settings do not allow exiting the runtime, so flushing
				// the streams is not possible. but in ASSERTIONS mode we check
				// if there was something to flush, and if so tell the user they
				// should request that the runtime be exitable.
				// Normally we would not even include flush() at all, but in ASSERTIONS
				// builds we do so just for this check, and here we see if there is any
				// content to flush, that is, we check if there would have been
				// something a non-ASSERTIONS build would have not seen.
				// How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
				// mode (which has its own special function for this; otherwise, all
				// the code is inside libc)
				var oldOut = out;
				var oldErr = err;
				var has = false;
				out = err = (x) => {
					has = true;
				};
				try { // it doesn't matter if it fails
					flush_NO_FILESYSTEM();
				} catch(e) {}
				out = oldOut;
				err = oldErr;
				if (has) {
					warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.');
					warnOnce('(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)');
				}
			}

			if (Module['preInit']) {
				if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
				while (Module['preInit'].length > 0) {
					Module['preInit'].pop()();
				}
			}

			run();

			// end include: postamble.js

			// include: postamble_modularize.js
			// In MODULARIZE mode we wrap the generated code in a factory function
			// and return either the Module itself, or a promise of the module.
			//
			// We assign to the `moduleRtn` global here and configure closure to see
			// this as and extern so it won't get minified.

			moduleRtn = readyPromise;

			// Assertion for attempting to access module properties on the incoming
			// moduleArg.  In the past we used this object as the prototype of the module
			// and assigned properties to it, but now we return a distinct object.  This
			// keeps the instance private until it is ready (i.e the promise has been
			// resolved).
			for (const prop of Object.keys(Module)) {
				if (!(prop in moduleArg)) {
					Object.defineProperty(moduleArg, prop, {
						configurable: true,
						get() {
							abort(`Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
						}
					});
				}
			}
			// end include: postamble_modularize.js



			return moduleRtn;
		}
	);
})();
if (typeof exports === 'object' && typeof module === 'object')
	module.exports = Module;
else if (typeof define === 'function' && define['amd'])
	define([], () => Module);