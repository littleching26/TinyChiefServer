var assert = require('assert');
var express = require('express');
var mongodb = require('mongodb');
var myParser = require('body-parser');//這是新加的
var app = express();
var mongodbURL = 'mongodb://LIChing:justtheway402@ds021731.mlab.com:21731/tiny_chief';
var myDB;
var acceptac,acceptwd,acceptEmail,acceptNickname;
var acceptPic;
var acceptMt;
var acceptSt;
var nodemailer = require('nodemailer');
var rand;
var mailOptions;
var cookBookNumber;
var myCookBook;
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


app.use(myParser.urlencoded({extended : true}));	


app.post('/login', function(request, response){
	acceptac = request.body.User;
	acceptwd = request.body.Password;
    console.log(acceptac);
	console.log(acceptwd);
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

app.post('/register', function(request, response){
	acceptac = request.body.User;
	acceptwd = request.body.Password;
	acceptEmail = request.body.myEmail;
	acceptNickname = request.body.nickName;
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
	collection.insertMany([{user : acceptac,password : acceptwd,email : acceptEmail,checkEmail:"NO",nickname:acceptNickname}], function(err, result) {
	assert.equal(err, null);
	assert.equal(1, result.result.n);
	assert.equal(1, result.ops.length);
	});
}

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://clownheart5221%40gmail.com:justtheway402@smtp.gmail.com');

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
	collection.insertMany([{count:0,title:cookBookTitle,ingredients:arrIngredients,steps:arrStep,image:cookBookImage}], function(err, result) {
	assert.equal(err, null);
	assert.equal(1, result.result.n);
	assert.equal(1, result.ops.length);
	});
});

app.post('/cookbook/detail', function(request, response){
	var collection = myDB.collection('cook_book');
	var id=mongodb.ObjectID(request.body.id);
	
	collection.findOne({'_id': id},function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
		}
	});
});

app.post('/cookbook/simple', function(request, response){
	var collection = myDB.collection('cook_book');
	cursor = collection.find({},{_id:true,"author.name":true,title:true,image:true})
							.sort({"count":-1})
							.skip(parseInt(request.body.SkipCount)*10)
							.limit(10);
	cursor.toArray(function(err, docs) {
		if (err) {			
			console.log(err);
			response.status(406).end();
		} else {	
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
		}
	});	
});

app.post('/upload/cookbook', function(request, response) {	
	var collection = myDB.collection('cook_book');
    console.log(request.body); 
	collection.insert(request.body,function(err, doc) {
		console.log(request.body);
		if(err) throw err;
		response.end();
	});
});

app.post('/getCookBook', function(request, response){
	//cookBookNumber用來跳過剛剛顯示過的資料
	cookBookNumber = request.body.Count;
	detailCookBook = request.body.DetailCookBook;
	console.log(cookBookNumber);
});

app.get('/getCookBook', function(request, response){
	var collection = myDB.collection('cook_book');
	//找前5大的資料 //skip是略過
	collection.find().sort({"count":-1}).skip(parseInt(cookBookNumber)).limit(5).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
		}
	});
});	

app.post('/upload/comment', function(request, response) {
	collection.update({'_id':mongodb.ObjectID(request.body.id_cb)},
                      {$push : { comment : { name : request.body.name,
                                            id : request.body.id_usr, 
                                            rate : parseInt(request.body.rate, 10), 
                                            message : request.body.msg}}},
                      function(err,doc){
                          if (err) {
                              console.log(err);
                              response.status(406).send(err);
                              response.end();
                          }
                          else{
                              console.log("ggggg");
                              setAvgRate(request.body.id_cb);
                              response.status(200).send("success");
                              response.end();                              
                          }
                      });
});

var setAvgRate = function(id){
    var total = 0;
    cursor = collection.find({'_id':mongodb.ObjectID(id)},
                                {'comment.rate':true});
    cursor.forEach(function(docs){
        for(var i=0;i<docs.comment.length;i++){
            total+=docs.comment[i].rate;
            console.log(total);
        }
        collection.update({'_id':mongodb.ObjectID(id)},
                            { $set : {rate_avg : total/docs.comment.length}},
                            { upsert : true});
    });
};
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});