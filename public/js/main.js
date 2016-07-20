$(document).ready(function(){
			// 登陆按钮，用户名密码判断	
			
			var thisUser;
			var thisAuth;

			function setCookie(c_name,value,expiredays){
				var exdate=new Date()
				exdate.setDate(exdate.getDate()+expiredays)
				document.cookie=c_name+ "=" +escape(value)+
				((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
			}

			function getCookie(c_name){
				if (document.cookie.length>0)
				  {
				  c_start=document.cookie.indexOf(c_name + "=")
				  if (c_start!=-1)
				    { 
				    c_start=c_start + c_name.length+1 
				    c_end=document.cookie.indexOf(";",c_start)
				    if (c_end==-1) c_end=document.cookie.length
				    return unescape(document.cookie.substring(c_start,c_end))
				    } 
				  }
				return ""
			}

			function checkCookie(){
				username=getCookie('library')
				if (username!=null && username!=""){
					// alert('Welcome again '+username+'!');
					thisUser=username.split(',')[0];
					thisAuth=username.split(',')[1];
					$('#main').hide();
					$('#library').show();
					libraryInit();
					if(thisAuth == 'admin'){
							$('#admin').show();
							adminInit();
						}
				}
			}

			checkCookie();

			$('#login').click(function(){
				var userName=$('[name=userName]').val();
				var password=$('[name=password]').val();
				var data={};
				data.userName=userName;
				data.password=password;

					$.ajax({
						url:'/login',
						data:data,
						success:function(data){
							if(data[0]=='1'){
								thisUser=userName;
								thisAuth=data.slice(1);
								alert('欢迎来到图书馆 '+thisUser);
								$('#main').hide();
								$('#library').show();
								libraryInit();
								if(thisAuth == 'admin'){
									$('#admin').show();
									adminInit();
								}
								setCookie('library',[thisUser,thisAuth],1);

							} else {
								alert(data);
							}
						}
					});				
			});

			// 注册按钮，显示注册页面
			$('#register').click(function(){
				$('#main').hide();
				$('#enroll').show();
			});

			// 注册确认按钮，确保输入的信息有效，并存入数据库
			// 有效性条件：1.不为空，2.两个密码一致，3.后台无此用户名,4.lenovo邮箱
			$('#sure').click(function(){
				var userName=$('[name=userNameEnroll]').val();
				var password=$('[name=passwordEnroll]').val();
				var rePassword=$('[name=rePasswordEnroll]').val();
				var email=$('[name=email]').val();
				var emailReg=/.+@lenovo.com$/;

				if(userName.length>0){
					if(emailReg.test(email)){
						if(userName.length ==0 || password.length ==0){
							alert('不能为空');
						} else if(password != rePassword){
							alert('密码不一致');
						} else {
							// 都填对了
							var data={};
							data.userName=userName;
							data.password=password;
							data.email=email;
							$.ajax({
								url:'/register',
								data:data,
								success:function(data){
									if(data=='1'){
										$('#enroll').hide();
										$('#main').show();
									} else {
										alert(data);
									}
								}
							});	
						}
					} else {
						alert("请输入lenovo邮箱");
					}
				} else {
					alert("请输入用户名");
				}
			});

			// 图书馆初始化
			function libraryInit(){
				$.ajax({
					url:'/library',
					success:function(data){
						for(var i=0;i<data.length;i++){
							if(data[i].available == 1){
								var str='<div class="ui toggle checkbox label"><input type="checkbox" class="select"><label>'+data[i].book+'</label></div>';
								$('#available').append(str);
							}
						}
					}
				});
				$.ajax({
					url:'/return',
					data:{'user':thisUser},
					success:function(data){
						for(var i=0;i<data.length;i++){
							var str='<div class="ui toggle checkbox label"><input type="checkbox" class="reSelect"><label>'+data[i].book+'</label></div>';
								$('#inavailable').append(str);
						}
					}
				});
			}

			// 管理员初始化
			function adminInit(){
				$.ajax({
					url:'/apply',
					success:function(data){
						for(var i=0;i<data.length;i++){
							if(data[i].how=='borrow'){
								// 借书申请
								var userName=data[i].user;
								var book=data[i].book;
								var time=new Date(data[i].time);
								var showtime=(time.getMonth()+1)+'月'+time.getDate()+'日';
								var str='<div class="label"><span>'+userName+'</span><span>'+book+'</span><span>'+showtime+'</span><span><button class="agree">同意</button><button class="disagree">不同意</button></span></div>';
								$('#applyBorrow').append(str);
							} else {
								//还书申请
								var userName=data[i].user;
								var book=data[i].book;
								var time=new Date(data[i].time);
								var showtime=(time.getMonth()+1)+'月'+time.getDate()+'日';
								var str='<div class="label"><span>'+userName+'</span><span>'+book+'</span><span>'+showtime+'</span><span><button class="agree">同意</button><button class="disagree">不同意</button></span></div>';
								$('#applyReturn').append(str);
							}
						}
						// 提交申请
						applySubmit();
					}
				});
			}

			function applySubmit(){
				var $applyBorrowAgree=$('#applyBorrow .agree');
				var $applyBorrowDisagree=$('#applyBorrow .disagree');
				var $applyReturnAgree=$('#applyReturn .agree');
				var $applyReturnDisagree=$('#applyReturn .disagree');
				$applyBorrowAgree.each(function(){
					$(this).click(function(){
						var $this=$(this);
						var data={};
						data.userName=$(this).parent().prev().prev().prev().text();
						data.book=$(this).parent().prev().prev().text();
						data.how='borrow';
						data.agree='true';
						// 可以post
						$.ajax({
							url:'answerApply',
							data:data,
							success:function(err,datas){
								if(datas=='success'){
									$this.parent().parent().hide();
								} else {
									alert('something wrong, retry');
								}
							}
						});
					});
				});
				$applyBorrowDisagree.each(function(){
					$(this).click(function(){
						var $this=$(this);
						var data={};
						data.userName=$(this).parent().prev().prev().prev().text();
						data.book=$(this).parent().prev().prev().text();
						data.how='borrow';
						data.agree='false';
						// 可以post
						$.ajax({
							url:'answerApply',
							data:data,
							success:function(err,datas){
								if(datas=='success'){
									$this.parent().parent().hide();
								} else {
									alert('something wrong, retry');
								}
							}
						});
					});
				});
				$applyReturnAgree.each(function(){
					$(this).click(function(){
						var $this=$(this);
						var data={};
						data.userName=$(this).parent().prev().prev().prev().text();
						data.book=$(this).parent().prev().prev().text();
						data.how='back';
						data.agree='true';
						// 可以post
						$.ajax({
							url:'answerApply',
							data:data,
							success:function(err,datas){
								if(datas=='success'){
									$this.parent().parent().hide();
								} else {
									alert('something wrong, retry');
								}
							}
						});
					});
				});
				$applyReturnDisagree.each(function(){
					$(this).click(function(){
						var $this=$(this);
						var data={};
						data.userName=$(this).parent().prev().prev().prev().text();
						data.book=$(this).parent().prev().prev().text();
						data.how='back';
						data.agree='false';
						// 可以post
						$.ajax({
							url:'answerApply',
							data:data,
							success:function(err,datas){
								if(datas=='success'){
									$this.parent().parent().hide();
								} else {
									alert('something wrong, retry');
								}
							}
						});
					});
				});
			}

			// 确认借书
			$('#borrow').click(function(){
				var selected=$('.select:checked');
				var books=[];
				if(selected.length>0){
					selected.each(function(){
						var book=$(this).next().text();
						books.push(book);
					});
				}
				alert('确认要借：'+books);
				var postData={'user':thisUser,'books':books};
				$.ajax({
					url:'/borrow',
					data:postData,
					success:function(data){
						if(data[0]=='1'){
							alert('借书成功，请前往9A024取书');
							selected.each(function(){
								$(this).parent().hide();
							});
						} else {
							alert('借书失败，请稍后重试');
						}
					}
				});
			});

			// 确认还书
			$('#resend').click(function(){
				var selected=$('.reSelect:checked');
				var books=[];
				if(selected.length>0){
					selected.each(function(){
						var book=$(this).next().text();
						books.push(book);
					});
				}
				alert('确认要还：'+books);
				var postData={'user':thisUser,'books':books};
				$.ajax({
					url:'/back',
					data:postData,
					success:function(data){
						if(data[0]=='1'){
							alert('还书成功，请送完9A024');
							selected.each(function(){
								$(this).parent().hide();
							});
						} else {
							alert('还书失败，请稍后重试');
						}
					}
				});
			});
	});
