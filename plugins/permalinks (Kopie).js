(function() {
  var fs,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs');

  module.exports = function(env, callback) {
    var MyPlugin;
    MyPlugin = (function(superClass) {
      extend(MyPlugin, superClass);


      /* Prepends 'Wintersmith is awesome' to text files. */

      function MyPlugin(filepath1, text) {
        this.filepath = filepath1;
        this.text = 'Wintersmith is awesome!\n' + text;
      }

      MyPlugin.prototype.getFilename = function() {
        return this.filepath.relative;
      };

      MyPlugin.prototype.getView = function() {
        return function(env, locals, contents, templates, callback) {
          return callback(null, new Buffer(this.text));
        };
      };

      return MyPlugin;

    })(env.ContentPlugin);
    MyPlugin.fromFile = function(filepath, callback) {
      return fs.readFile(filepath.full, function(error, result) {
        var plugin;
        if (error == null) {
          plugin = new MyPlugin(filepath, result.toString());
        }
        return callback(error, plugin);
      });
    };
    env.registerContentPlugin('text', '**/*.*(txt|text)', MyPlugin);
    return callback();
  };

}).call(this);
