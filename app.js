var express = require('express');
var path = require('path');
var Promise = require('bluebird');
var nforce = require('nforce');
require('./lib/hbsHelpers');

var org = nforce.createConnection({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: 'http://localhost:5000/',
  mode: 'single'
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  if (req.query.code !== undefined) {
    org.authenticate({ code: req.query.code }, function(err, resp){
      if (!err) {
        org.query({ query: 'Select Id, Name, Type, Industry, Rating From Account Order By LastModifiedDate DESC' })
          .then(function(results) {
            res.render('index', { records: results.records });
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