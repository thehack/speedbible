var express = require('express');
var app = express();
var ejs = require('ejs');
var https = require('follow-redirects').https;

//public directory
app.use('/public', express.static(__dirname + '/public'));

app.locals({
  title: 'Bible Speed Reader'
});

// activate server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

// simple logger
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

/* 
The following works in the new api:

curl --request GET --url https://api.scripture.api.bible/v1/bibles/06125adad2d5898a-01/passages/gen --header 'api-key: e214f4d5c3207dc1a1dd2ac840e1a307'

*/
var getScripture = function(options, callback) {

//  var url = 'https://91DDd6iI5setSs3FoU7u7ZKiR4OIltI7HBCthKZ6:X@bibles.org/v2/passages.js?q[]='+options.book+'+'+options.nums+'&version=eng-CEV';

  var results = ""
  
  const reqOptions = {
    hostname: 'api.scripture.api.bible',
    path: '/v1/bibles/555fef9a6cb31151/search?query='+options.book+ '.'+ options.nums, 
    headers: {
        'api-key': 'e214f4d5c3207dc1a1dd2ac840e1a307'
    }
  }
  https.get(reqOptions, function(res) {
      console.log("getting url: " + reqOptions.hostname + reqOptions.path)
      // a chunk may or not be a whole JSON record, so we can't process it until it is concatenated
      res.on('data', function(chunk) {
        results += chunk;
        console.log("chunking...")
      })
      res.on('end', function() {
        callback(JSON.parse(results))

      })
      res.on('error', function(e){
        console.error(e);
      })
  })
};

app.get('/', function(req, res) {
  res.render('index.ejs', {info: "variables can be called in here" } )
})

// A client request might look like http://localhost:3000/john/1-5
app.get('/:book/:nums', function(req, res){
  getScripture({book: req.params.book, nums: req.params.nums}, function(d){
    res.type('json');
    res.send(d);
  })

})