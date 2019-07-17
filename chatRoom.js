function ChatRoom(username,roomId){
	this.username = username;
	this.roomId=roomId;
	this.message=[];
	this.isshow=false;
	//this.loadMessage();
	this.loadRoomMessage();
}
ChatRoom.prototype.hide=function(){
	this.isshow=false;
}
ChatRoom.prototype.show=function (){
	var parent=this;
	parent.isshow=true;
	document.getElementById("showroommsg").innerHTML="";
	var typemsg=document.getElementById("chatroommsg");
	typemsg.value="";
	console.log(parent.message);
	$.each(this.message,function(index,pagemessage){
		if(pagemessage.from!=parent.username){
			parent.showleftmsg(pagemessage);
		}else {
			parent.showrightmsg(pagemessage);
		}
	});
}
ChatRoom.prototype.showrightmsg=function(message){
	var username=this.username;
	console.log(message);
	var format=message.format;
	username=chat.chatFriend.userData[username];
	if(format=="image"){
		var timestamp =(new Date()).valueOf();
		 var imgId=username+timestamp;
			$("#showroommsg").append('<div class="right"><div class="rightmessagesender">'+
					username+'</div><div class="rightmessage"><img src="" id="'+imgId+'"class="img">'
					+'</div></div><br>');
		var img = document.getElementById(imgId);
		img.src = message.message;
	}else if(format=="text"){
		console.log("text");
		$("#showroommsg").append('<div class="right"><div class="rightmessagesender">'+
				username+'</div><div class="rightmessage">'
				+message.message+'</div></div><br>');
	}
	var typemsg=document.getElementById("chatroommsg");
	typemsg.value="";
}
ChatRoom.prototype.showleftmsg=function (message) {
    var format=message.format;
    var sender=message.from;
	   sender=chat.chatFriend.userData[sender];
	if (format == "image") {
		 var timestamp =(new Date()).valueOf();
		 var imgId=sender+timestamp;
			$("#showroommsg").append('<div class="left"><div class="leftmessagesender">'+
					sender+'</div><div class="leftmessage"><img src="" id="'+imgId+'"class="img">'
					+'</div></div><br>');
		var img = document.getElementById(imgId);
		img.src = message.message;
	} else if (format == "text") {
		$("#showroommsg").append('<div class="left"><div class="leftmessagesender">'+
				sender+'</div><div class="leftmessage">'+message.message+'</div></div><br>');
	}
}
ChatRoom.prototype.sendChatRoommsg=function (format,message) {
	var parent=this;
	console.log(parent.message);
	$.ajax({
		type : 'POST',
		data : {
			"roomId" : parent.roomId,
			"username" : parent.username,
			"message" : message,
			"format" : format
		},
		dataType : 'json',
		url : 'http://192.168.1.120:8080/chat/room/sendMessage',
		success : function(data) {
			var typemsg=document.getElementById("chatroommsg");
			typemsg.value="";
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
ChatRoom.prototype.receivemsg=function (message){
	var parent=this;
	console.log(message)
	this.message.push(message);
	console.log(parent.isshow);
	if(parent.isshow==true){
		if(parent.username==message.from){
			parent.showrightmsg(message);
		}else{
		    parent.showleftmsg(message);
		}
	}
	
}
ChatRoom.prototype.loadRoomMessage=function () {
	var parent=this;
	$.ajax({
		type : 'POST',
		data : {
			"roomId" : parent.roomId,
		},
		dataType : 'json',
		url : 'http://192.168.1.120:8080/chat/room/getMessage',
		success : function(data) {
			console.log(data);
			$.each(data.data,function(index,chatRoomMsg){
				parent.message.push(chatRoomMsg);
			});
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}