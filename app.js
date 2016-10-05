//引用 nodemailer
var nodemailer = require('nodemailer');

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

//發送信件方法
transporter.sendMail(options, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('訊息發送: ' + info.response);
    }
});