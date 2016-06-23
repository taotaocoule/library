$(document).ready(function(){
			$('#login').click(function(){
				var userName=$('[name=userName]').val();
				var password=$('[name=password]').val();
				var data={};
				data.userName=userName;
				data.password=password;
				alert(JSON.stringify(data));
			});

			$('#register').click(function(){
				$('#main').hide();
				$('#enroll').show();
			});

			$('#sure').click(function(){
				var userName=$('[name=userNameEnroll]').val();
				var password=$('[name=passwordEnroll]').val();
				var rePassword=$('[name=rePasswordEnroll]').val();
				if(userName.length ==0 || password.length ==0){
					alert('不能为空');
				} else if(password != rePassword){
					alert('密码不一致');
				} else {
					$('#main').show();
					$('#enroll').hide();
				}
			});
	});