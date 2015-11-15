var moment = require('moment')
module.exports = function(env, callback) {


  function movePage(page, dst) {
    var copied = new env.plugins.Page()
    copied.getFilename = () => dst
    copied.getView = () => function(env, locals, contents, templates, callback) { 
      console.log(page.getHtml())
      callback(null, new Buffer(page.getHtml()))
    }
    return copied
  }


  env.registerGenerator('html', function(contents, callback) {
    articles = contents.articles
    permalinks = {}
    for(var article_name in articles) {
      var article = articles[article_name]
      var date = moment(article.index.metadata.date)
      var year = date.format('YYYY'), month = date.format('MM')

      /*for(var basename in article) {
        var file = article[basename]
        file.getFilename = () => '/' + year + '/' + month + '/' + article_name + '/' + basename
        console.log(file)
      }*/

      if(!permalinks[year]) permalinks[year] = {}
      if(!permalinks[year][month]) permalinks[year][month] = {}
      permalinks[year][month][article_name] = movePage(article.index, '/' + year + '/' + month + '/' + article_name + '/index.html')
    }

    callback(null, permalinks)
  })
  return callback()
};
