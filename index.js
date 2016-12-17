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

//登入
app.post('/login', function(request, response){
	//接收使用者帳號
	acceptac = request.body.User;
	//接收使用者密碼
	acceptwd = request.body.Password;
    console.log(acceptac);
	console.log(acceptwd);
	//宣告user_account
	var collection = myDB.collection('user_account');
	//找到對應的帳號密碼
	collection.find({"user":acceptac,"password":acceptwd}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			//找到後回傳
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			//將之設為空
			acceptac = null;
			acceptwd = null;
		}
	});
});
//註冊
app.post('/register', function(request, response){
	//接收帳號
	acceptac = request.body.User;
	//接收密碼
	acceptwd = request.body.Password;
	//接收EMAIL
	acceptEmail = request.body.myEmail;
	//接收暱稱
	acceptNickname = request.body.nickName;
    console.log(acceptac);
	console.log(acceptwd);
	console.log(acceptEmail);
	//宣告user_account
	var collection = myDB.collection('user_account');
	//找到對應的user
	collection.find({"user":acceptac}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
			//若找不到代表此帳號無人使用 如此此帳號可使用
			if(JSON.stringify(docs)=="[]"){
				insertDocuments(myDB, function() {
				});
			}
			else{
			}
		}
	});
});
//插入使用者資料
var insertDocuments = function(myDB){
	var collection = myDB.collection('user_account');
	collection.insertMany([{user : acceptac,password : acceptwd,email : acceptEmail,checkEmail:"NO",nickname:acceptNickname}], function(err, result) {
	assert.equal(err, null);
	assert.equal(1, result.result.n);
	assert.equal(1, result.ops.length);
	});
}
//宣告發信物件
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'clownheart5221@gmail.com',
        pass: 'esogoodx06justtheway526'
    }
});
//送信
app.post('/send',function(req,res){
	//宣告一個亂數
    rand=Math.floor((Math.random() * 1000) + 54);
	//宣告資料庫user_account的資料表
	var collection = myDB.collection('user_account');
	//將亂數加入指定user以便日後認證
	collection.update({user:acceptac}, {$set: {randNumber:rand}});
	//取得host address
	host=req.get('host');
	//鏈結網址
	link="http://"+req.get('host')+"/verify?id="+rand;
	//寄信內容
	mailOptions={
		from: '"智慧料理小當家" <clownheart5221@gmail.com>', 
		to : acceptEmail,
		subject : "請認證您的信箱",
		html : "<br> 請點擊連結以認證信箱！<br><a href="+link+">前去認證</a>"	
	}
	console.log(mailOptions);
	//發送郵件
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
//認證
app.get('/verify',function(req,res){
	console.log(req.protocol+":/"+req.get('host'));
	//確認信箱的人是否與申請者的host相同
	if((req.protocol+"://"+req.get('host'))==("http://"+host))
	{
		console.log("Domain is matched. Information is from Authentic email");
		//若亂數相同
		if(req.query.id==rand)
		{
			console.log("email is verified");
			//show出網頁的內容
			res.end("<h1> "+mailOptions.to+" 已成功認證囉！<br>現在您可以開始享受您最輕鬆上手的APP-智慧料理小當家");
			var collection = myDB.collection('user_account');
			//更改資料表中對應rand之帳號的checkEmail
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

app.post('/cookbook/detail', function(request, response){
	var id=mongodb.ObjectID(request.body.id);
	var collection = myDB.collection('cook_book');
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
							.sort({"rate_avg":-1})
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
	collection.insert(request.body,function(err, doc) {
		if (err) {			
            console.log(err);
            response.status(406).send(err);
            response.end();
		} 
        else {
	        var str = '{"response" : "success"}';
            var obj = JSON.parse(str);
            response.type('application/json');
			response.status(200).send(obj);
			response.end();
		}
	});
});

app.post('/upload/comment', function(request, response) {
	var collection = myDB.collection('cook_book');
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
//查詢食譜
app.post('/search/result', function(request, response){
	//接收查詢string
	var acceptSearchTitle= request.body.SearchTitle;
    console.log(acceptSearchTitle);
	//宣告cook_book這table
	var collection = myDB.collection('cook_book');
	//搜尋關鍵字並有模糊搜尋的功能 之後將搜尋之結果按照rate_avg之數遞減排列
	collection.find({"title":{'$regex': acceptSearchTitle, $options: 'i'}}).sort({"rate_avg":-1}).toArray(function(err, docs) {
		if (err) {
			response.status(406).end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
		}
	});
});

app.get('/get/price', function(request, response) {    
    cursor = myDB.collection('meat_price').find();
	cursor.toArray(function(err, docs) {
		if (err) {			
			console.log(err);
			response.status(406).end();
		} else {	
			response.type('application/json');
			response.status(200).send(docs[0]);
			response.end();
		}
	});
});
//將臉書登入之帳號及名稱加入資料庫
app.post('/inserFBInfo', function(request, response){
	//接收使用者ID
	var acceptUSERID = request.body.UserID;
	//接收臉書名稱
	var acceptFBName = request.body.FBName;
	console.log(acceptUSERID);
	console.log(acceptFBName);
	//宣告user_account此table
	var collection = myDB.collection('user_account');
	//插入使用者資料
	collection.insert({"nickname":acceptFBName},function(err, doc) {
		if (err) {			
            console.log(err);
            response.status(406).send(err);
            response.end();
		} 
        else {
			//新的id
			var newid;
			//舊的id
			var origid;
			console.log(doc.insertedIds[0]);
			//id在doc.insertedIds陣列裡是第一筆資料
			origid = doc.insertedIds[0];
			//在table中找到剛剛插入那筆資料的_id
			newid = collection.findOne({'_id':origid});
			//將新的id設成剛剛接收到的使用者ID
			newid._id = acceptUSERID;
			//將新的id之nickname設成剛剛接收到的使用者名稱
			newid.nickname = acceptFBName;
			console.log(newid);
			//插入資料表
			collection.insert(newid,function(err,doc){
				if(err) {
					console.log(err);
					response.status(406).send(err);
					response.end();
				}
				else{
					response.type('application/json');
					response.status(200).send("success");
					response.end();
				}
			});
			//將舊的id那筆資料刪掉
			collection.remove({'_id':origid})
		}
	});
});

app.post('/calendar/upload', function(request, response) {
    var year = request.body.year;
    var month = request.body.month;
    var day = request.body.day;
    var strID;
    
    if(checkAccountFB(request.body.id_usr))
        strID = request.body.id_usr;    
    else
        strID = mongodb.ObjectID(request.body.id_usr);

	myDB.collection('user_account').update({'_id':strID},
                      {$push : { calendar : { date : new Date(year,month,day), 
                                              time : request.body.time,
                                              title : request.body.title,
                                              id : request.body.id_cb}}},
                      function(err,doc){
                          if (err) {
                              console.log(err);
                              response.status(406).send(err);
                              response.end();
                          }
                          else{
                              response.status(200).send("success");
                              response.end();                              
                          }
                      });
});

app.post('/calendar/get', function(request, response) {
    var strID;    
    
    if(checkAccountFB(request.body.id))
        strID = request.body.id;    
    else
        strID = mongodb.ObjectID(request.body.id);
    
    cursor = myDB.collection('user_account').findOne({'_id':strID},
            {_id : false, calendar : true},function(err, docs) {
                if (err) {        
                    response.send(err);
                    response.end();
                } else {
                    response.type('application/json');
                    response.status(200).send(docs.calendar);
                    response.end();
                }
            });
});

var checkAccountFB = function(id){
    var strID = id;
    if(id.length == 16)
        return true;
    else
        return false;
}

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});