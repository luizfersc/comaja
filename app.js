
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var async = require('async');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect('mongodb://localhost/comaja');

var ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category_id: {type:String, ref: 'Categories'}
});

var CategorySchema = new mongoose.Schema({
  _id: String,
  name: String
});

var Products = mongoose.model('Products', ProductSchema);
var Categories = mongoose.model('Categories', CategorySchema);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/users', user.list);

app.get('/product/new', function(req, res) {
  var query = Categories.find();

  async.parallel([
    function(callback) {
      query.exec(function (err, results) {
        callback(null, results);
      });
    }
  ], function(err, results) {
    res.render("new_product.jade", {categories:results[0]});
  });
});

app.post('/product/create', function(req, res) {
  var b = req.body;
  new Products({
    name: b.name,
    price: b.price,
    description: b.description
  }).save( function(err, product) {
    if (err) res.json(err);
    else res.send('Produto criado.');
  });
});


app.get('/products', function(req, res) {
  res.render("products.jade", {nome:"Danilo Horta"});
});

app.get('/users/:userId', function(req, res) {
  res.send("Recebi isso aqui: "+req.params.userId);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
