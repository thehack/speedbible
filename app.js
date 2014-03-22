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
app.listen(process.env.PORT || 3000);

// simple logger
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

// This gets the scripture from Bibles.org's API
// Problem: It doesn't run before the GET request is complete, so it doesn't work until the second go.
// the only way I could get the text variable available to the request was to make it global.
// I realize this will not work if it's not ready soon enough and bleeds over to other requests.
// **************** What is the correct way to do this? ****************************************
var getScripture = function(options, callback) {
  var url = 'https://91DDd6iI5setSs3FoU7u7ZKiR4OIltI7HBCthKZ6:X@bibles.org/v2/passages.js?q[]='+options.book+'+'+options.nums+'&version=eng-CEV';
  var req = https.request(url, function(res) {

      // prematurely sends chunk as whole
      res.on('data', function(chunk) {
        callback(JSON.parse(chunk));
      })
  });
  req.end()
  req.on('error', function(e) {
    console.error(e);
  })
};

// An AJAX from index.ejs call will pull in scripture with local JSON request
// The JSON will be decoded like so: JSON.parse(d).response.search.result.passages[0].text
// The scripture will be displayed in a Spritz-like speed-reader.
app.get('/', function(req, res) {
  res.render('index.ejs', {info: "variables can be called in here" } )
})

// A client request might look like http://localhost:3000/john/1-5
app.get('/:book/:nums', function(req, res){
  getScripture({book: req.params.book, nums: req.params.nums}, function(d){
    res.type('json');
    res.send(d)
  })

})
