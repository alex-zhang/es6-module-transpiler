import ScriptBuilder from './script_builder';

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

export default CoffeeScriptBuilder;
