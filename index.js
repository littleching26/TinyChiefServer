var assert = require('assert');
var express = require('express');
var mongodb = require('mongodb');
var myParser = require('body-parser');//這是新加的
var app = express();
var mongodbURL = 'mongodb://LIChing:justtheway402@ds021731.mlab.com:21731/tiny_chief';
var myDB;
var acceptac,acceptwd;
app.set('port', (process.env.PORT || 5000));

mongodb.MongoClient.connect(mongodbURL, function(err, db) {
	if (err) {
		console.log(err);
	} else {
		myDB = db;
		console.log('connection success');
	}
});

app.get('/', function(request, response) {
	response.status(200).send('<html><body><H1>Hello World</H1></body></html>');
	response.end();
	});

app.use(myParser.urlencoded({extended : true}));	

app.get('/api/test', function(request, response) {
	var collection = myDB.collection('user_account');
	collection.find({"user":acceptac,"password":acceptwd}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			acceptac = null;
			acceptwd = null;
		}
	});
});

app.post('/api/test', function(request, response){
	acceptac = request.body.User;
	acceptwd = request.body.Password;
    console.log(acceptac);
	console.log(acceptwd);	
});

app.post('/register', function(request, response){
	acceptac = request.body.User;
	acceptwd = request.body.Password;
    console.log(acceptac);
	console.log(acceptwd);
	collection.find({"user":acceptac}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			acceptac = null;
			acceptwd = null;
		}
	});
	var collection = myDB.collection('user_account');
	collection.insertMany([{user : acceptac,password : acceptwd}], function(err, result) {
		assert.equal(err, null);
		assert.equal(2, result.result.n);
		assert.equal(2, result.ops.length);
	});
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});