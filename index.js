var assert = require('assert');
var express = require('express');
var mongodb = require('mongodb');
var myParser = require('body-parser');//這是新加的
var app = express();
var mongodbURL = 'mongodb://LIChing:justtheway402@ds021731.mlab.com:21731/tiny_chief';
var myDB;
var acceptac,acceptwd,acceptEmail;
var acceptPic;
var acceptMt;
var acceptSt;
var nodemailer = require('nodemailer');
var rand;
var mailOptions;
var cookBookNumber;
app.set('port', (process.env.PORT || 5000));

//提高上傳限制
app.use(myParser({limit: '50mb'}));

mongodb.MongoClient.connect(mongodbURL, function(err, db) {
	if (err) {
		console.log(err);
	} else {
		myDB = db;
		console.log('connection success');
	}
});

app.get('/', function(request, response) {
	var collection = myDB.collection('cook_book');
	collection.find({"name":"涼拌洋葱鮪魚沙拉"}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
		}
	});
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
	acceptEmail = request.body.myEmail;
    console.log(acceptac);
	console.log(acceptwd);
	console.log(acceptEmail);
	var collection = myDB.collection('user_account');
	collection.find({"user":acceptac}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			if(JSON.stringify(docs)=="[]"){
				insertDocuments(myDB, function() {
				});
			}
			else{
			}
		}
	});
});

var insertDocuments = function(myDB){
	var collection = myDB.collection('user_account');
	collection.insertMany([{user : acceptac,password : acceptwd,email : acceptEmail,checkEmail:"NO"}], function(err, result) {
	assert.equal(err, null);
	assert.equal(1, result.result.n);
	assert.equal(1, result.ops.length);
	});
}

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://clownheart5221%40gmail.com:esogoodx06@smtp.gmail.com');

app.get('/send',function(req,res){
    rand=Math.floor((Math.random() * 100) + 54);
	var collection = myDB.collection('user_account');
	collection.update({user:acceptac}, {$set: {randNumber:rand}});
	host=req.get('host');
	link="http://"+req.get('host')+"/verify?id="+rand;
	mailOptions={
		from: '"hahaha 👥" <clownheart5221@gmail.com>', 
		to : acceptEmail,
		subject : "Please confirm your Email account",
		html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
	}
	console.log(mailOptions);
	transporter.sendMail(mailOptions, function(error, response){
   	 if(error){
        	console.log(error);
		res.end("error");
	 }else{
        	console.log("Message sent: " + response.message);
		res.end("sent");
    	 }
	});
});

app.get('/verify',function(req,res){
	console.log(req.protocol+":/"+req.get('host'));
	if((req.protocol+"://"+req.get('host'))==("http://"+host))
	{
		console.log("Domain is matched. Information is from Authentic email");
		if(req.query.id==rand)
		{
			console.log("email is verified");
			res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
			var collection = myDB.collection('user_account');
			collection.update({randNumber:rand}, {$set: {checkEmail:"OK"}});
		}
		else
		{
			console.log("email is not verified");
			res.end("<h1>Bad Request</h1>");
		}
	}
	else
	{
		res.end("<h1>Request is from unknown source");
	}
});

transporter.sendMail(mailOptions, function(error, info){
	if(error){
		return console.log(error);
	}
	console.log('Message sent: ' + info.response);
});

app.use(myParser.urlencoded({extended : true}));
app.post('/createCookBook', function(request, response){
	console.log(request.body); 
	  //下面那兩個是步驟和食材的陣列
	  var cookBookTitle = request.body.title;
	  var arrIngredients = request.body.Ingredients.split("|");
	  var arrStep = request.body.Step.split("|");
	  var cookBookImage = request.body.image;
	  //顯示
	  console.log(request.body.title);
	  console.log(arrIngredients);
	  console.log(arrStep);
      response.end();
	var collection = myDB.collection('cook_book');
	collection.insertMany([{title:cookBookTitle,ingredients:arrIngredients,steps:arrStep,image:cookBookImage}], function(err, result) {
	assert.equal(err, null);
	assert.equal(1, result.result.n);
	assert.equal(1, result.ops.length);
	});
});

app.post('/getCookBook', function(request, response){
	cookBookNumber = request.body.Count;
});

app.get('/getCookBook', function(request, response){
		var collection = myDB.collection('cook_book');
		collection.find({"count":cookBookNumber}).toArray(function(err, docs) {
			if (err) {
				response.status(406).end();
			} else {
				response.type('application/json');
				response.status(200).send(docs);
				response.end();
			}
		});
	});	
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});