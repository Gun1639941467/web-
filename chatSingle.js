function ChatSingle(username,friend){
	this.username = username;
	this.friend=friend;
	this.message=[];
	this.isshow=false;
	this.loadMessage();
}

ChatSingle.prototype.sendmsg=function (format,message) {
	var instance=this;
	console.log("sendmsg",message);
	var data={"type":"single","sender":instance.username,
			"receiver":instance.friend,"format":format,"message":message};
	instance.message.push(data);
	$.ajax({
		type : 'POST',
		data : {
			"receiver" : instance.friend,
			"sender" : instance.username,
			"message" : message,
			"format" : format
		},
		 processData:false,
		dataType : 'json',
		url : 'http://192.168.1.120:8080/chat/private/sendMessage',
		success : function(data) {
			console.log(data);
			var typemsg=document.getElementById("typemsg");
			typemsg.value="";
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
ChatSingle.prototype.loadMessage=function () {
	var instance=this;
	$.ajax({
		type : 'POST',
		data : {
			"receiver" : instance.friend,
			"sender" : instance.username,
		},
		dataType : 'json',
		url : 'http://192.168.1.120:8080/chat/private/getMessage',
		success : function(data) {
			
			$.each(data.data,function(index,soloChatMsg){
				instance.message.push(soloChatMsg);
			});
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
//从服务器端接收数据
ChatSingle.prototype.receivemsg=function (message){
	var sender=message.sender;
	var receiver=message.receiver;
	this.message.push(message);
	if(this.isshow==true){
		this.showleftmsg(message);
	}
}
//将消息显示在界面上
ChatSingle.prototype.show=function (){
	var parent=this;
	this.isshow=true;
	document.getElementById("showmsg").innerHTML="";
	var typemsg=document.getElementById("typemsg");
	typemsg.value="";
	$.each(this.message,function(index,pagemessage){
		if(pagemessage.sender==parent.friend){
			parent.showleftmsg(pagemessage);
		}else if(pagemessage.sender==parent.username){
			parent.showrightmsg(pagemessage.format,pagemessage);
		}
	});
}
ChatSingle.prototype.hide=function(){
	this.isshow=false;
}
//创建聊天
ChatSingle.prototype.createChat=function(friend){
	chat.chatFriend.msgBox(1,5);
	var parent=this;
	parent.friend=friend;
	
}
//将消息显示在左边
ChatSingle.prototype.showleftmsg=function (message) {
       var format=message.format;
       var sender=message.sender;
	   sender=chat.chatFriend.userData[sender];
	if (format == "image") {
		 var timestamp =(new Date()).valueOf();
		 var imgId=sender+timestamp;
			$("#showmsg").append('<div class="left"><div class="leftmessagesender">'+
					sender+'</div><div class="leftmessage"><img src="" id="'+imgId+'"class="img">'
					+'</div></div><br>');
		var img = document.getElementById(imgId);
		img.src = message.message;
	} else if (format == "text") {
		$("#showmsg").append('<div class="left"><div class="leftmessagesender">'+
				sender+'</div><div class="leftmessage">'+message.message+'</div></div><br>');	
	}
}
//将消息显示在右边
ChatSingle.prototype.showrightmsg=function(format,message){
	var username=this.username;
	username=chat.chatFriend.userData[username];
	console.log(message);
	if(format=="image"){
		var timestamp =(new Date()).valueOf();
		 var imgId=username+timestamp;
			$("#showmsg").append('<div class="right">'
					+'<img src="" id="'+imgId+'"class="img">'
					+username+'</div><br>');
		var img = document.getElementById(imgId);
		img.src = message.message;
	}else if(format=="text"){
		$("#showmsg").append('<div class="right"><div class="rightmessagesender">'+
				username+'</div><div class="rightmessage">'
				+message.message+'</div></div><br>');
	}
	var typemsg=document.getElementById("typemsg");
	typemsg.value="";
}
