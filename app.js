//引用 nodemailer
var nodemailer = require('nodemailer');
var express = require('express');
var myParser = require('body-parser');//這是新加的
var app = express();
var mongodb = require('mongodb');
var express = require('express');
var mongodbURL = 'mongodb://LIChing:justtheway402@ds021731.mlab.com:21731/tiny_chief';
var myDB;
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
//宣告發信物件
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'clownheart5221@gmail.com',
        pass: 'justtheway402'
    }
});

var options = {
    //寄件者
    from: 'clownheart5221@gmail.com',
    //收件者
    to: 'littleching26@gmail.com', 
    
    //主旨
    subject: '這是 node.js 發送的測試信件', // Subject line
    //純文字
    text: 'Hello world2', // plaintext body
    
};

app.post('/send',function(req,res){
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