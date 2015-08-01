var http = require('http');
var fs = require('fs');
var exec = require('child_process').exec;

// konvertiert HTML nach markdown mit Hilfe von Pandoc
function html2md(html, callback) {
    var pandoc = exec('pandoc -t markdown -f html', function(error, stdout, stderr) {
        setImmediate(callback, stdout);
    });
    pandoc.stdin.end(html); 
}

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

fs.readFile('./flauschiversum-posts.json', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    // Remove comments at the beginning
    data = data.replace(/\/\*.*\n*.*\n*.*\n*.*\*\//m, "");
    data = data.replace(/\/\/.*/g, "");

    var posts = JSON.parse(data);
    filterPosts(posts);
});

function filename(url) {
    return url.substring(url.lastIndexOf('/')+1);
}

function filterPosts(posts) {
    posts.forEach(function(post) {
        post = {
            "type": post.post_type,
            "title": post.post_title,
            "html": localImages(post.post_content),
            "date": post.post_date,
            "excerpt": post.post_excerpt,
            "slug": slugify(post.post_title),
            "images": getLinkedImg(post.post_content)
        };
        if(post.html) {
            var convert = function() {
                try {
                    html2md(post.html, function(md) {
                        post.content = md;
                        if(post.type == "post") {
                            //console.log(post.title);
                            if(!post.content) post.content = "Hier gibt es nichts.";
                            writePost(post);
                        }
                    });
                }
                catch(e) {
                    // zu viele Dateien offen
                    if(e.errno == 'EMFILE') {
                        // spaeter nochmal probieren
                        setTimeout(convert, 1000);
                    }
                    else
                        console.log(e);
                }
            };
            convert();
        }
    }) ;
}

// entfernt alle img urls auf entfernte Server und ersetzt sie mit lokalen Verweisen
function localImages(html) {
    var matches = html.match(/http:\/\/[^ "]*\.jpg/g)
    matches && matches.forEach(function(url) {
        html = html.replace(url, filename(url));
    });
    return html;
}
// gibt eine Liste der verlinkten Bilder in einem beitrag
function getLinkedImg(html) {
    var img_re = /<img[^>]+src="([^">]+)[^>]*>/g;
    var imgs = []
    var matches = html.match(img_re);
    for (i in matches) {
        var img = matches[i];
        src = img.match(/src="[^"]+/)[0].substring(5);
        imgs.push(src);
    }
    return imgs;
}

// erzeugt einen statischen Post in ./contents/articles/
var postPath = "./contents/articles/";
function writePost(post) {
    var path = postPath + post.slug;

    var content = "---\n"
     + "title: \"" + post.title.replace(/"/g, "") + "\"\n"
     + "author: Ermeline\n"
     + "date: " + post.date + "\n"
     + "template: article.jade\n"
     + (post.images[0] ? "image: " + filename(post.images[0]) + "\n" : "")
     + "excerpt: " + JSON.stringify(post.excerpt) + "\n"
     + "---\n\n" + post.content


    fs.mkdir(path, function(e){
        if(!e || e.code === 'EEXIST') {
            
            fs.writeFile(path + "/index.md", content, function(err) {
                if(err) { return console.log(err); }
            }); 

            // alle zugehoerigen Bilder laden
            
            post.images.forEach(function(url) {
                try {
                    var filename = url.substring(url.lastIndexOf('/')+1);
                    var file = fs.createWriteStream(path + "/" + filename);
                    var request = http.get(url, function(response, err) {
                      response.pipe(file);
                    });
                } catch(e) {console.log(e);}
            });
        } else { console.log(e); }
    });
}
