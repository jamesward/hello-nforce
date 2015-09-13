var express = require('express');
var path = require('path');
var Promise = require('bluebird');
var nforce = require('nforce');
require('./lib/hbsHelpers');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  var redirectUrl = 'http://localhost:5000/';
  if (req.headers.host.indexOf("localhost:5000") == -1) {
    redirectUrl = 'https://' + req.headers.host + "/";
  }

  var org = nforce.createConnection({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: redirectUrl,
    mode: 'single'
  });

  if (req.query.code !== undefined) {
    org.authenticate(req.query, function(err) {
      if (!err) {
        org.query({ query: 'Select Id, Name, Type, Industry, Rating From Account Order By LastModifiedDate DESC' }, function(err, results) {
          if (!err) {
            res.render('index', {records: results.records});
          }
          else {
            res.send(err.message);
          }
        });
      }
      else {
        res.send(err.message);
      }
    });
  }
  else {
    res.redirect(org.getAuthUri());
  }

});

app.listen(process.env.PORT || 5000);