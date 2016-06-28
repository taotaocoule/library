var express = require('express');
var sqlite=require('sqlite3');
var app = express();
var db=new sqlite.Database('library.db');

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname+"/public/html/login.html");
});

// 登陆判断用户名和密码
app.get('/login', function(req, res){
  var userName=req.query.userName;
  var password=req.query.password;
  db.all('select * from user where user=?;',[userName],function(err,ress){
  if(ress.length ==1){
	  if(ress[0].password==password){
		  res.end('1'+ress[0].auth);	
		} else {
        	  res.end('password wrong');
      		}
      } else {
      res.end('no user');
    }
  });			
});

// 注册判断用户名和邮箱
app.get('/register',function(req,res){
	var userName=req.query.userName;
  	var password=req.query.password;
  	var email=req.query.email;
  	var sqluser='select * from user where user=?'+[userName];
  	var sqlemail='select * from user where email=?'+[email];
  	db.all('select * from user where user=?;',[userName],function(err,ress){
  		if(ress.length !=0){
  			res.end('userName is used');
  		} else {
  			db.all('select * from user where email=?;',[email],function(err,ress){
  				if(ress.length !=0){
  					res.end('email is used');
  				} else {
  					// 用户名和邮箱不存在，可以写入数据库
            db.run('insert into user (user,password,email,auth) values(?,?,?,?);',[userName,password,email,"user"],function(err){
              if(err){
                res.end('something wrong,retry');
              } else {
                res.end('1');
              }
            }); 
  				}
  			});
  		}
  	});
});

// 展示在前端的可选图书
app.get('/library',function(req,res){
  db.all('select * from books where use=?',['false'],function(err,data){
    res.send(data);
  });
});

// 展示在前端的当前用户可借图书
app.get('/return',function(req,res){
  var userName=req.query.user;
  db.all('select * from needReturn where user=? and isOK=? group by book',[userName,'no'],function(err,ress){
    res.send(ress);
  });
});

// 用户申请结束后写入log，并将图书改为不可见
app.get('/borrow',function(req,res){
  var userName=req.query.user;
  var books=req.query.books;
  var isOK=[];
  for(var i=0;i<books.length;i++){
    db.run('insert into log (user,book,time,how,isOK) values(?,?,?,?,?)',[userName,books[i],Date(),'borrow','no'],function(err,data){
      if(err){
        res.end('something wrong,retry');
      } else {
        isOK.push(true);
      }
    });
    db.run('update books set use=? where book=?',['true',books[i]],function(errs,datas){
          
    });
  }
  if(!isOK.sort()[0]){
    res.end('1');
  }
});

// 用户申请还书后写入log
app.get('/back',function(req,res){
  var userName=req.query.user;
  var books=req.query.books;
  var isOK=[];
  for(var i=0;i<books.length;i++){
    db.run('insert into log (user,book,time,how,isOK) values(?,?,?,?,?)',[userName,books[i],Date(),'back','no'],function(err,data){
      if(err){
        res.end('something wrong,retry');
      } else {
        isOK.push(true);
      }
    });
  }
  if(!isOK.sort()[0]){
    res.end('1');
  }
});

// 申请查看，管理员
app.get('/apply',function(req,res){
  db.all('select user,book,time,how,isOK from log where isOK=? group by book',['no'],function(err,data){
    res.send(data);
  });
});

// 管理员处理
app.get('/answerApply',function(req,res){
  var userName=req.query.userName;
  var book=req.query.book;
  var how=req.query.how;
  var agree=req.query.agree;
  if(how == 'borrow'){
    if(agree == 'true'){
      db.run('update log set isOK=? where user=? and book=? and how=?',['yes',userName,book,how]);
      db.run('insert into needReturn (user,book,isOK) values (?,?,?)',[userName,book,'no']);
      db.run('update books set available=? , use=? where book=?',[0,'false',book],function(err,ress){
        res.end('1');
      });
    } else {
      db.run('update log set isOK=? where user=? and book=? and how=?',['yes',userName,book,how]);
      db.run('update books set use=? where book=?',['false',book],function(err,ress){
        res.end('1');
      });
    }
  } else {
    if(agree == 'true'){
      db.run('update log set isOK=? where user=? and book=? and how=?',['yes',userName,book,how]);
      db.run('update needReturn set isOK=? where user=? and book=?',['yes',userName,book]);
      db.run('update books set available=? , use=? where book=?',[1,'false',book],function(err,ress){
        res.end('1');
      });
    } else {
      db.run('update log set isOK=? where user=? and book=? and how=?',['yes',userName,book,how],function(err,ress){
        res.end('1');
      });
    }
  }
});

app.listen(3000,function(){
  console.log('library starting');
});
