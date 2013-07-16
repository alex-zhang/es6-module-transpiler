(function(){function require(e,t){for(var n=[],r=e.split("/"),i,s,o=0;(s=r[o++])!=null;)".."==s?n.pop():"."!=s&&n.push(s);n=n.join("/"),o=require,s=o.m[t||0],i=s[n+".js"]||s[n+"/index.js"]||s[n],r='Cannot require("'+n+'")';if(!i)throw Error(r);if(s=i.c)i=o.m[t=s][e=i.m];if(!i)throw Error(r);return i.exports||i(i,i.exports={},function(n){return o("."!=n.charAt(0)?n:e+"/../"+n,t)}),i.exports};
require.m = [];
require.m[0] = { "abstract_compiler.js": function(module, exports, require){"use strict";
var CompileError = require("./compile_error");
var JavaScriptBuilder = require("./java_script_builder");
var CoffeeScriptBuilder = require("./coffee_script_builder");
var isEmpty = require("./utils").isEmpty;

var AbstractCompiler,
  __hasProp = {}.hasOwnProperty,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

AbstractCompiler = (function() {
  function AbstractCompiler(compiler, options) {
    var name, _ref, _ref1;
    this.compiler = compiler;
    this.exports = compiler.exports;
    this.exportDefault = compiler.exportDefault;
    this.imports = compiler.imports;
    this.importDefault = compiler.importDefault;
    this.moduleName = compiler.moduleName;
    this.lines = compiler.lines;
    this.options = options;
    this.dependencyNames = [];
    _ref = this.imports;
    for (name in _ref) {
      if (!__hasProp.call(_ref, name)) continue;
      if (__indexOf.call(this.dependencyNames, name) < 0) {
        this.dependencyNames.push(name);
      }
    }
    _ref1 = this.importDefault;
    for (name in _ref1) {
      if (!__hasProp.call(_ref1, name)) continue;
      if (__indexOf.call(this.dependencyNames, name) < 0) {
        this.dependencyNames.push(name);
      }
    }
    this.assertValid();
  }

  AbstractCompiler.prototype.assertValid = function() {
    if (this.exportDefault && !isEmpty(this.exports)) {
      throw new CompileError("You cannot use both `export default` and `export` in the same module");
    }
  };

  AbstractCompiler.prototype.buildPreamble = function(names) {
    var args, preamble,
      _this = this;
    args = [];
    preamble = this.build(function(s) {
      var dependency, deps, name, number, _i, _len, _results;
      number = 0;
      deps = s.unique('dependency');
      _results = [];
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        if (name in _this.importDefault) {
          _results.push(args.push(_this.importDefault[name]));
        } else {
          dependency = deps.next();
          args.push(dependency);
          _results.push(_this.buildImportsForPreamble(s, _this.imports[name], dependency));
        }
      }
      return _results;
    });
    return [args, preamble];
  };

  AbstractCompiler.prototype.build = function(fn) {
    var builder;
    if (this.options.coffee) {
      builder = new CoffeeScriptBuilder();
    } else {
      builder = new JavaScriptBuilder();
    }
    fn(builder);
    return builder.toString();
  };

  AbstractCompiler.prototype.buildImportsForPreamble = function(builder, imports_, dependencyName) {
    var alias, name, _results;
    _results = [];
    for (name in imports_) {
      if (!__hasProp.call(imports_, name)) continue;
      alias = imports_[name];
      _results.push(builder["var"](alias, function() {
        return builder.prop(dependencyName, name);
      }));
    }
    return _results;
  };

  return AbstractCompiler;

})();



module.exports = AbstractCompiler;},
"amd_compiler.js": function(module, exports, require){"use strict";
var AbstractCompiler = require("./abstract_compiler");
var path = require("path");
var isEmpty = require("./utils").isEmpty;

var AMDCompiler, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AMDCompiler = (function(_super) {
  __extends(AMDCompiler, _super);

  function AMDCompiler() {
    _ref = AMDCompiler.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  AMDCompiler.prototype.stringify = function() {
    var _this = this;
    return this.build(function(s) {
      var dependency, i, preamble, wrapperArgs, _ref1;
      _ref1 = _this.buildPreamble(_this.dependencyNames), wrapperArgs = _ref1[0], preamble = _ref1[1];
      if (!isEmpty(_this.exports)) {
        _this.dependencyNames.push('exports');
        wrapperArgs.push('__exports__');
      }
      for (i in _this.dependencyNames) {
        dependency = _this.dependencyNames[i];
        if (/^\./.test(dependency)) {
          _this.dependencyNames[i] = path.join(_this.moduleName, '..', dependency).replace(/[\\]/g, '/');
        }
      }
      return s.line(function() {
        return s.call('define', function(arg) {
          if (_this.moduleName) {
            arg(s.print(_this.moduleName));
          }
          arg(s["break"]);
          arg(s.print(_this.dependencyNames));
          arg(s["break"]);
          return arg(function() {
            return s["function"](wrapperArgs, function() {
              var exportName, exportValue, _ref2;
              s.useStrict();
              if (preamble) {
                s.append(preamble);
              }
              s.append.apply(s, _this.lines);
              _ref2 = _this.exports;
              for (exportName in _ref2) {
                exportValue = _ref2[exportName];
                s.line("__exports__." + exportName + " = " + exportValue);
              }
              if (_this.exportDefault) {
                return s.line("return " + _this.exportDefault);
              }
            });
          });
        });
      });
    });
  };

  return AMDCompiler;

})(AbstractCompiler);


module.exports = AMDCompiler;},
"cjs_compiler.js": function(module, exports, require){"use strict";
var AbstractCompiler = require("./abstract_compiler");

var CJSCompiler, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CJSCompiler = (function(_super) {
  __extends(CJSCompiler, _super);

  function CJSCompiler() {
    _ref = CJSCompiler.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  CJSCompiler.prototype.stringify = function() {
    var _this = this;
    return this.build(function(s) {
      var alias, dependency, deps, doImport, exportName, exportValue, import_, name, variables, _ref1, _ref2, _ref3, _results;
      doImport = function(name, import_, prop) {
        var req, rhs;
        if (prop == null) {
          prop = null;
        }
        req = function() {
          return s.call('require', [s.print(import_)]);
        };
        rhs = prop ? (function() {
          return s.prop(req, prop);
        }) : req;
        return s["var"](name, rhs);
      };
      s.useStrict();
      deps = s.unique('dependency');
      _ref1 = _this.importDefault;
      for (import_ in _ref1) {
        if (!__hasProp.call(_ref1, import_)) continue;
        name = _ref1[import_];
        doImport(name, import_);
      }
      _ref2 = _this.imports;
      for (import_ in _ref2) {
        if (!__hasProp.call(_ref2, import_)) continue;
        variables = _ref2[import_];
        if (Object.keys(variables).length === 1) {
          name = Object.keys(variables)[0];
          doImport(variables[name], import_, name);
        } else {
          dependency = deps.next();
          doImport(dependency, import_);
          for (name in variables) {
            if (!__hasProp.call(variables, name)) continue;
            alias = variables[name];
            if (name === 'default') {
              s["var"](alias, "" + dependency);
            } else {
              s["var"](alias, "" + dependency + "." + name);
            }
          }
        }
      }
      s.append.apply(s, _this.lines);
      if (_this.exportDefault) {
        s.line("module.exports = " + _this.exportDefault);
      }
      _ref3 = _this.exports;
      _results = [];
      for (exportName in _ref3) {
        exportValue = _ref3[exportName];
        _results.push(s.line("exports." + exportName + " = " + exportValue));
      }
      return _results;
    });
  };

  return CJSCompiler;

})(AbstractCompiler);


module.exports = CJSCompiler;},
"cli.js": function(module, exports, require){"use strict";
var optimist = require("optimist");
var fs = require("fs");
var path = require("path");
var Compiler = require("./compiler");

var CLI;

CLI = (function() {
  CLI.start = function(argv, stdin, stdout, fs_) {
    if (stdin == null) {
      stdin = process.stdin;
    }
    if (stdout == null) {
      stdout = process.stdout;
    }
    if (fs_ == null) {
      fs_ = fs;
    }
    return new this(stdin, stdout, fs_).start(argv);
  };

  function CLI(stdin, stdout, fs_) {
    this.stdin = stdin != null ? stdin : process.stdin;
    this.stdout = stdout != null ? stdout : process.stdout;
    this.fs = fs_ != null ? fs_ : fs;
  }

  CLI.prototype.start = function(argv) {
    var filename, options, _i, _len, _ref;
    options = this.parseArgs(argv);
    if (options.help) {
      this.argParser(argv).showHelp();
      return;
    }
    if (options.stdio) {
      this.processStdio(options);
    } else {
      _ref = options._;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        filename = _ref[_i];
        this.processPath(filename, options);
      }
    }
    return null;
  };

  CLI.prototype.parseArgs = function(argv) {
    var args, global, imports, pair, requirePath, _i, _len, _ref, _ref1;
    args = this.argParser(argv).argv;
    if (args.imports) {
      imports = {};
      _ref = args.imports.split(',');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pair = _ref[_i];
        _ref1 = pair.split(':'), requirePath = _ref1[0], global = _ref1[1];
        imports[requirePath] = global;
      }
      args.imports = imports;
    }
    if (args.global) {
      args.into = args.global;
    }
    return args;
  };

  CLI.prototype.argParser = function(argv) {
    return optimist(argv).usage('compile-modules usage:\n\n  Using files:\n    compile-modules INPUT --to DIR [--anonymous] [--type TYPE] [--imports PATH:GLOBAL]\n\n  Using stdio:\n    compile-modules --stdio [--coffee] [--type TYPE] [--imports PATH:GLOBAL] (--module-name MOD|--anonymous)').options({
      type: {
        "default": 'amd',
        describe: 'The type of output (one of "amd", "cjs", or "globals")'
      },
      to: {
        describe: 'A directory in which to write the resulting files'
      },
      imports: {
        describe: 'A list of path:global pairs, comma separated (e.g. jquery:$,ember:Ember)'
      },
      anonymous: {
        "default": false,
        type: 'boolean',
        describe: 'Do not include a module name'
      },
      'module-name': {
        describe: 'The name of the outputted module',
        alias: 'm'
      },
      stdio: {
        "default": false,
        type: 'boolean',
        alias: 's',
        describe: 'Use stdin and stdout to process a file'
      },
      coffee: {
        "default": false,
        type: 'boolean',
        describe: 'Process stdin as CoffeeScript (requires --stdio)'
      },
      global: {
        describe: 'When the type is `globals`, the name of the global to export into'
      },
      help: {
        "default": false,
        type: 'boolean',
        alias: 'h',
        describe: 'Shows this help message'
      }
    }).check(function(args) {
      var _ref;
      return (_ref = args.type) === 'amd' || _ref === 'cjs' || _ref === 'globals';
    }).check(function(args) {
      return !(args.anonymous && args.m);
    }).check(function(args) {
      if (args.stdio && args.type === 'amd') {
        return args.anonymous || args.m || false;
      } else {
        return true;
      }
    }).check(function(args) {
      return !(args.coffee && !args.stdio);
    }).check(function(args) {
      return args.stdio || args.to || args.help;
    }).check(function(args) {
      if (args.imports) {
        return args.type === 'globals';
      } else {
        return true;
      }
    });
  };

  CLI.prototype.processStdio = function(options) {
    var input,
      _this = this;
    input = '';
    this.stdin.resume();
    this.stdin.setEncoding('utf8');
    this.stdin.on('data', function(data) {
      return input += data;
    });
    return this.stdin.on('end', function() {
      var output;
      output = _this._compile(input, options.m, options.type, options);
      return _this.stdout.write(output);
    });
  };

  CLI.prototype.processPath = function(filename, options) {
    var _this = this;
    return this.fs.stat(filename, function(err, stat) {
      if (err) {
        console.error(err.message);
        return process.exit(1);
      } else if (stat.isDirectory()) {
        return _this.processDirectory(filename, options);
      } else {
        return _this.processFile(filename, options);
      }
    });
  };

  CLI.prototype.processDirectory = function(dirname, options) {
    var _this = this;
    return this.fs.readdir(dirname, function(err, children) {
      var child, _i, _len, _results;
      if (err) {
        console.error(err.message);
        process.exit(1);
      }
      _results = [];
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        child = children[_i];
        _results.push(_this.processPath(path.join(dirname, child), options));
      }
      return _results;
    });
  };

  CLI.prototype.processFile = function(filename, options) {
    var _this = this;
    return this.fs.readFile(filename, 'utf8', function(err, input) {
      var ext, moduleName, output, outputFilename;
      ext = path.extname(filename);
      if (!options.anonymous) {
        moduleName = path.join(path.dirname(filename), path.basename(filename, ext)).replace(/[\\]/g, '/');
      }
      output = _this._compile(input, moduleName, options.type, {
        coffee: ext === '.coffee',
        imports: options.imports
      });
      outputFilename = path.join(options.to, filename).replace(/[\\]/g, '/');
      _this._mkdirp(path.dirname(outputFilename));
      return _this.fs.writeFile(outputFilename, output, 'utf8', function(err) {
        if (err) {
          console.error(err.message);
          return process.exit(1);
        }
      });
    });
  };

  CLI.prototype._compile = function(input, moduleName, type, options) {
    var compiler, method;
    type = {
      amd: 'AMD',
      cjs: 'CJS',
      globals: 'Globals'
    }[type];
    compiler = new Compiler(input, moduleName, options);
    method = "to" + type;
    return compiler[method]();
  };

  CLI.prototype._mkdirp = function(directory) {
    var prefix;
    if (this.fs.existsSync(directory)) {
      return;
    }
    prefix = path.dirname(directory);
    if (prefix !== '.' && prefix !== '/') {
      this._mkdirp(prefix);
    }
    return this.fs.mkdirSync(directory);
  };

  return CLI;

})();



module.exports = CLI;},
"coffee_script_builder.js": function(module, exports, require){"use strict";
var ScriptBuilder = require("./script_builder");

var CoffeeScriptBuilder, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CoffeeScriptBuilder = (function(_super) {
  __extends(CoffeeScriptBuilder, _super);

  function CoffeeScriptBuilder() {
    _ref = CoffeeScriptBuilder.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  CoffeeScriptBuilder.prototype.eol = '';

  CoffeeScriptBuilder.prototype["var"] = function(lhs, rhs) {
    this.set(lhs, rhs);
  };

  CoffeeScriptBuilder.prototype._prepareArgsForCall = function(args) {
    var arg, _i, _len;
    args = CoffeeScriptBuilder.__super__._prepareArgsForCall.call(this, args).slice();
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      if (arg === this["break"]) {
        if (args[args.length - 1] !== this["break"]) {
          args.push(this["break"]);
        }
        break;
      }
    }
    return args;
  };

  CoffeeScriptBuilder.prototype._functionHeader = function(args) {
    if (args.length) {
      return "(" + (args.join(', ')) + ") ->";
    } else {
      return '->';
    }
  };

  return CoffeeScriptBuilder;

})(ScriptBuilder);


module.exports = CoffeeScriptBuilder;},
"compile_error.js": function(module, exports, require){"use strict";
var CompileError, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CompileError = (function(_super) {
  __extends(CompileError, _super);

  function CompileError() {
    _ref = CompileError.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return CompileError;

})(Error);


module.exports = CompileError;},
"compiler.js": function(module, exports, require){"use strict";
var AMDCompiler = require("./amd_compiler");
var CJSCompiler = require("./cjs_compiler");
var GlobalsCompiler = require("./globals_compiler");
var Unique = require("./utils").Unique;

var EXPORT = /^\s*export\s+(.*?)\s*(;)?\s*$/;
var EXPORT_DEFAULT = /^\s*export\s*default\s*(.*?)\s*(;)?\s*$/;
var EXPORT_FUNCTION = /^\s*export\s+function\s+(\w+)\s*(\(.*)$/;
var EXPORT_VAR = /^\s*export\s+var\s+(\w+)\s*=\s*(.*)$/;

var IMPORT = /^\s*import\s+(.*)\s+from\s+(?:"([^"]+?)"|'([^']+?)')\s*(;)?\s*$/;
var IMPORT_AS = /^\s*(.*)\s+as\s+(.*)\s*$/;

var RE_EXPORT = /^export\s+({.*})\s+from\s+(?:"([^"]+?)"|'([^']+?)')\s*(;)?\s*$/;

var COMMENT_START = new RegExp("/\\*");
var COMMENT_END = new RegExp("\\*/");

// naively-handled block comments: only look for ### at start of line
// avoids having to track state, since would want to avoid entering comment
// state on ### in other comments (like this one) and in strings
var COMMENT_CS_TOGGLE = /^###/;

function getNames(string) {
  var name, _i, _len, _ref, _results;
  if (string[0] === '{' && string[string.length - 1] === '}') {
    return string.slice(1, -1).split(',').map(function(name) {
      return name.trim();
    });
  } else {
    return [string.trim()];
  }
}

function Compiler(string, moduleName, options) {
  if (moduleName == null) {
    moduleName = null;
  }

  if (options == null) {
    options = {};
  }

  this.string = string;
  this.moduleName = moduleName;
  this.options = options;

  this.imports = {};
  this.importDefault = {};
  this.exports = {};
  this.exportDefault = null;
  this.lines = [];
  this.id = 0;

  this.inBlockComment = false;
  this.reExportUnique = new Unique('reexport');

  if (!this.options.coffee) {
    this.commentStart = COMMENT_START;
    this.commentEnd = COMMENT_END;
  } else {
    this.commentStart = COMMENT_CS_TOGGLE;
    this.commentEnd = COMMENT_CS_TOGGLE;
  }

  this.parse();
}

Compiler.prototype.parse = function() {
  this.string.split('\n').forEach(this.parseLine.bind(this));
};

Compiler.prototype.parseLine = function(line) {
  var match;

  if (!this.inBlockComment) {
    if (match = this.matchLine(line, EXPORT_DEFAULT)) {
      this.processExportDefault(match);
    } else if (match = this.matchLine(line, EXPORT_FUNCTION)) {
      this.processExportFunction(match);
    } else if (match = this.matchLine(line, EXPORT_VAR)) {
      this.processExportVar(match);
    } else if (match = this.matchLine(line, RE_EXPORT)) {
      this.processReexport(match);
    } else if (match = this.matchLine(line, EXPORT)) {
      this.processExport(match);
    } else if (match = this.matchLine(line, IMPORT)) {
      this.processImport(match);
    } else if (match = this.matchLine(line, this.commentStart)) {
      this.processEnterComment(line);
    } else {
      this.processLine(line);
    }
  } else {
    if (match = this.matchLine(line, this.commentEnd)) {
      this.processExitComment(line);
    } else {
      this.processLine(line);
    }
  }
};

Compiler.prototype.matchLine = function(line, pattern) {
  var match = line.match(pattern);

  // if not CoffeeScript then we need the semi-colon
  if (match && !this.options.coffee && !match[match.length - 1]) {
    return null;
  }

  return match;
};

Compiler.prototype.processExportDefault = function(match) {
  this.exportDefault = match[1];
};

Compiler.prototype.processExport = function(match) {
  var self = this;
  getNames(match[1]).forEach(function(ex) {
    self.exports[ex] = ex;
  });
};

Compiler.prototype.processExportFunction = function(match) {
  var body, name;
  name = match[1];
  body = match[2];

  this.lines.push('function ' + name + body);
  this.exports[name] = name;
};

Compiler.prototype.processExportVar = function(match) {
  var name, value;
  name = match[1];
  value = match[2];

  this.lines.push('var ' + name + ' = ' + value);
  this.exports[name] = name;
};

Compiler.prototype.processImport = function(match) {
  var asMatch, importSpecifiers, imports, name, pattern;
  pattern = match[1];
  if (pattern[0] === '{' && pattern[pattern.length - 1] === '}') {
    pattern = pattern.slice(1, -1);
    importSpecifiers = pattern.split(/\s*,\s*/).map(function(name) {
      return name.trim();
    });
    imports = {};
    importSpecifiers.forEach(function(name) {
      if (asMatch = name.match(IMPORT_AS)) {
        imports[asMatch[1]] = asMatch[2];
      } else {
        imports[name] = name;
      }
    });
    this.imports[match[2] || match[3]] = imports;
  } else {
    this.importDefault[match[2] || match[3]] = match[1];
  }
};

Compiler.prototype.processReexport = function(match) {
  var names = getNames(match[1]),
      importPath = match[2] || match[3],
      importLocal = this.reExportUnique.next(),
      self = this;

  this.importDefault[importPath] = importLocal;
  names.forEach(function(name) {
    self.exports[name] = "" + importLocal + "." + name;
  });
};

Compiler.prototype.processLine = function(line) {
  this.lines.push(line);
};

Compiler.prototype.processEnterComment = function(line) {
  if (!this.matchLine(line, COMMENT_END)) {
    this.inBlockComment = true;
  }
  this.lines.push(line);
};

Compiler.prototype.processExitComment = function(line) {
  this.inBlockComment = false;
  this.lines.push(line);
};

Compiler.prototype.toAMD = function() {
  return new AMDCompiler(this, this.options).stringify();
};

Compiler.prototype.toCJS = function() {
  return new CJSCompiler(this, this.options).stringify();
};

Compiler.prototype.toGlobals = function() {
  return new GlobalsCompiler(this, this.options).stringify();
};


module.exports = Compiler;},
"globals_compiler.js": function(module, exports, require){"use strict";
var AbstractCompiler = require("./abstract_compiler");
var isEmpty = require("./utils").isEmpty;

var GlobalsCompiler,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

GlobalsCompiler = (function(_super) {

  __extends(GlobalsCompiler, _super);

  function GlobalsCompiler() {
    return GlobalsCompiler.__super__.constructor.apply(this, arguments);
  }

  GlobalsCompiler.prototype.stringify = function() {
    var _this = this;
    return this.build(function(s) {
      var alias, args, globalImport, into, locals, name, passedArgs, receivedArgs, wrapper, _i, _len, _ref, _ref1;
      passedArgs = [];
      receivedArgs = [];
      locals = {};
      into = _this.options.into || _this.exportDefault;
      if (!isEmpty(_this.exports) || _this.exportDefault) {
        passedArgs.push(_this.exportDefault ? s.global : into ? "" + s.global + "." + into + " = {}" : s.global);
        receivedArgs.push('exports');
      }
      _ref = _this.dependencyNames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        globalImport = _this.options.imports[name];
        passedArgs.push("" + s.global + "." + globalImport);
        if (name in _this.importDefault) {
          receivedArgs.push(_this.importDefault[name]);
        } else {
          receivedArgs.push(globalImport);
          _ref1 = _this.imports[name];
          for (name in _ref1) {
            if (!__hasProp.call(_ref1, name)) continue;
            alias = _ref1[name];
            locals[alias] = "" + globalImport + "." + name;
          }
        }
      }
      wrapper = function() {
        return s["function"](receivedArgs, function() {
          var exportName, exportValue, lhs, rhs, _ref2, _results;
          s.useStrict();
          for (lhs in locals) {
            if (!__hasProp.call(locals, lhs)) continue;
            rhs = locals[lhs];
            s["var"](lhs, rhs);
          }
          s.append.apply(s, _this.lines);
          if (_this.exportDefault) {
            return s.set("exports." + into, _this.exportDefault);
          } else {
            _ref2 = _this.exports;
            _results = [];
            for (exportName in _ref2) {
              exportValue = _ref2[exportName];
              _results.push(s.set("exports." + exportName, exportValue));
            }
            return _results;
          }
        });
      };
      args = function(arg) {
        var passedArg, _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = passedArgs.length; _j < _len1; _j++) {
          passedArg = passedArgs[_j];
          _results.push(arg(passedArg));
        }
        return _results;
      };
      return s.line(function() {
        return s.call(wrapper, args);
      });
    });
  };

  return GlobalsCompiler;

})(AbstractCompiler);


module.exports = GlobalsCompiler;},
"index.js": function(module, exports, require){"use strict";
var Compiler = require("./compiler");


exports.Compiler = Compiler;},
"java_script_builder.js": function(module, exports, require){"use strict";
var ScriptBuilder = require("./script_builder");

var JavaScriptBuilder,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JavaScriptBuilder = (function(_super) {

  __extends(JavaScriptBuilder, _super);

  function JavaScriptBuilder() {
    return JavaScriptBuilder.__super__.constructor.apply(this, arguments);
  }

  JavaScriptBuilder.prototype.eol = ';';

  JavaScriptBuilder.prototype["var"] = function(lhs, rhs) {
    return this.line("var " + (this.capture(lhs)) + " = " + (this.capture(rhs)));
  };

  JavaScriptBuilder.prototype._functionHeader = function(args) {
    return "function(" + (args.join(', ')) + ") {";
  };

  JavaScriptBuilder.prototype._functionTail = function() {
    return '}';
  };

  return JavaScriptBuilder;

})(ScriptBuilder);


module.exports = JavaScriptBuilder;},
"require_support.js": function(module, exports, require){"use strict";
var vm = require("vm");
var fs = require("fs");
var path = require("path");
var Compiler = require("./compiler");
var compile = require("coffee-script").compile;

var defaultCoffeeHandler, defaultJSHandler, disable, enable, enabled, es6CoffeeRequireHandler, es6JSRequireHandler, loadES6Script;

enabled = false;

defaultJSHandler = require.extensions['.js'];

defaultCoffeeHandler = require.extensions['.coffee'];

enable = function() {
  if (enabled) {
    return;
  }
  enabled = true;
  require.extensions['.js'] = es6JSRequireHandler;
  return require.extensions['.coffee'] = es6CoffeeRequireHandler;
};

disable = function() {
  if (!enabled) {
    return;
  }
  enabled = false;
  require.extensions['.js'] = defaultJSHandler;
  return require.extensions['.coffee'] = defaultCoffeeHandler;
};

es6JSRequireHandler = function(module, filename) {
  return module._compile(loadES6Script(filename));
};

es6CoffeeRequireHandler = function(module, filename) {
  return module._compile(compile(loadES6Script(filename)));
};

loadES6Script = function(filename) {
  var content, extname;
  content = fs.readFileSync(filename, 'utf8');
  extname = path.extname(filename);
  return new Compiler(content, path.basename(filename, extname), {
    coffee: extname === '.coffee'
  }).toCJS();
};


exports.enable = enable;
exports.disable = disable;},
"script_builder.js": function(module, exports, require){"use strict";
var Unique = require("./utils").Unique;

var BREAK, INDENT, OUTDENT, ScriptBuilder,
  __slice = [].slice;

INDENT = {
  indent: true
};

OUTDENT = {
  outdent: true
};

BREAK = {
  "break": true
};

ScriptBuilder = (function() {

  ScriptBuilder.prototype["break"] = BREAK;

  ScriptBuilder.prototype.global = 'window';

  function ScriptBuilder() {
    this.buffer = [];
  }

  ScriptBuilder.prototype.useStrict = function() {
    return this.line('"use strict"');
  };

  ScriptBuilder.prototype.set = function(lhs, rhs) {
    return this.line("" + (this.capture(lhs)) + " = " + (this.capture(rhs)));
  };

  ScriptBuilder.prototype.call = function(fn, args) {
    var arg, end, i, indented, result, _i, _len;
    fn = this._wrapCallable(fn);
    args = this._prepareArgsForCall(args);
    end = args.length - 1;
    while (args[end] === BREAK) {
      end--;
    }
    result = "" + fn + "(";
    indented = false;
    for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
      arg = args[i];
      if (arg === BREAK) {
        this.append(result);
        if (!indented) {
          indented = true;
          this.indent();
        }
        result = '';
      } else {
        result += arg;
        if (i < end) {
          result += ',';
          if (args[i + 1] !== BREAK) {
            result += ' ';
          }
        }
      }
    }
    result += ')';
    this.append(result);
    if (indented) {
      return this.outdent();
    }
  };

  ScriptBuilder.prototype._prepareArgsForCall = function(args) {
    var result,
      _this = this;
    if (typeof args === 'function') {
      result = [];
      args(function(arg) {
        return result.push(_this.capture(arg));
      });
      args = result;
    }
    return args;
  };

  ScriptBuilder.prototype._wrapCallable = function(fn) {
    var functionCalled, functionImpl, result,
      _this = this;
    if (typeof fn !== 'function') {
      return fn;
    }
    functionImpl = this["function"];
    functionCalled = false;
    this["function"] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      functionCalled = true;
      return functionImpl.call.apply(functionImpl, [_this].concat(__slice.call(args)));
    };
    result = this.capture(fn);
    this["function"] = functionImpl;
    if (functionCalled) {
      result = "(" + result + (this._functionTail != null ? '' : '\n') + ")";
    }
    return result;
  };

  ScriptBuilder.prototype["function"] = function(args, body) {
    this.append(this._functionHeader(args));
    this.indent();
    body();
    this.outdent();
    if (this._functionTail != null) {
      return this.append(this._functionTail());
    }
  };

  ScriptBuilder.prototype.print = function(value) {
    return JSON.stringify(this.capture(value));
  };

  ScriptBuilder.prototype.prop = function(object, prop) {
    return this.append("" + (this.capture(object)) + "." + (this.capture(prop)));
  };

  ScriptBuilder.prototype.unique = function(prefix) {
    return new Unique(prefix);
  };

  ScriptBuilder.prototype.line = function(code) {
    return this.append(this.capture(code) + this.eol);
  };

  ScriptBuilder.prototype.append = function() {
    var code, _ref;
    code = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.buffer).push.apply(_ref, code);
  };

  ScriptBuilder.prototype.indent = function() {
    return this.buffer.push(INDENT);
  };

  ScriptBuilder.prototype.outdent = function() {
    return this.buffer.push(OUTDENT);
  };

  ScriptBuilder.prototype.capture = function(fn) {
    var buffer, result;
    if (typeof fn !== 'function') {
      return fn;
    }
    buffer = this.buffer;
    this.buffer = [];
    fn();
    result = this.toString();
    this.buffer = buffer;
    return result;
  };

  ScriptBuilder.prototype.toString = function() {
    var chunk, indent, line, result, _i, _j, _len, _len1, _ref, _ref1;
    indent = 0;
    result = [];
    _ref = this.buffer;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      chunk = _ref[_i];
      if (chunk === INDENT) {
        indent++;
      } else if (chunk === OUTDENT) {
        indent--;
      } else {
        _ref1 = chunk.split('\n');
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          line = _ref1[_j];
          if (/^\s*$/.test(line)) {
            result.push(line);
          } else {
            result.push((new Array(indent + 1)).join('  ') + line);
          }
        }
      }
    }
    return result.join('\n');
  };

  return ScriptBuilder;

})();


module.exports = ScriptBuilder;},
"utils.js": function(module, exports, require){"use strict";
function isEmpty(object) {
  for (var foo in object) {
    if (Object.prototype.hasOwnProperty.call(object, foo)) {
      return false;
    }
  }
  return true;
}

function Unique(prefix) {
  this.prefix = prefix;
  this.index = 1;
}

Unique.prototype.next = function() {
  return ['__', this.prefix, this.index++, '__'].join('');
};


exports.isEmpty = isEmpty;
exports.Unique = Unique;}};
ModuleTranspiler = require('index.js');
}());