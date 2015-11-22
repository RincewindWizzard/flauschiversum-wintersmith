var fs = require('fs');
var moment = require('moment')
/**
 * Erzeugt eine Ordnerstruktur für die Blogartikel, welche sich an dem Datum orientiert.
 */

module.exports = function(env, callback) {

    var PostImage = function(filepath, content) { 
      var post = fs.readFileSync(filepath.full.substring(0, filepath.full.search(/[^\/]*$/)) + 'index.md','utf8')
      var m = /date: (.*)/.exec(post)
      if(m) {
        var date = moment(m[1]).format('/YYYY/MM/')
      }
      filepath.relative = date + filepath.relative.substr(filepath.relative.search(/[^\/]*\/[^\/]*$/))
      this.filepath = filepath
      this.content = content
    }
    PostImage.prototype = new env.ContentPlugin()
    PostImage.prototype.constructor = PostImage
    PostImage.prototype.getFilename = function() {
        return this.filepath.relative;
    }
    PostImage.prototype.getView = function() {
      return function(env, locals, contents, templates, callback) {
        return callback(null, this.content);
      }
    }

    PostImage.fromFile = function(filepath, callback) {
      return fs.readFile(filepath.full, function(error, buffer) {
        if (error) {
          return callback(error);
        } else {
          return callback(null, new PostImage(filepath, buffer));
        }
      });
    };

    env.registerContentPlugin('Postimages', 'articles/*/*.jpg', PostImage);
    env.registerContentPlugin('Postimages', 'articles/*/*.JPG', PostImage);
    //env.registerContentPlugin('Markdown', 'articles/*/index.md', BlogPost);
    return callback();
}
