function Chat(username){
	this.username = username;
	this.chatFriend = new ChatFriend(username);
	this.chatSingle = null;
	this.chatGroup = new ChatGroup(username);
	this.currentChat = null;
	this.currentChatRoom=null;
	this.chatRoom=null;
}
Chat.prototype.initChatSingle = function() {
	var parent=this;
	this.chatSingle = [];
	$.each(this.chatFriend.friends,function(index,value){
		parent.chatSingle.push(new ChatSingle(this.username,value.friend));
		
	});
}
Chat.prototype.initChatRoom=function(){
	var parent=this;
	this.chatRoom=[];
	$.each(this.chatGroup.group,function(index,value){
		parent.chatRoom.push(new ChatRoom(parent.username,value.roomId));
	});
}
Chat.prototype.soloChat=function(friendId){
	var parent=this;
	//获取聊天室好友姓名
	var friendname=this.chatFriend.userData[friendId];
	//如果单人聊天为空 进行初始化
	if(this.chatSingle == null) {
		this.initChatSingle();
	}
	//如果当前有聊天界面 进行判断
	//如果要打开的聊天界面和当前的界面是同一个好友 直接return
	if(this.currentChat!=null){
		chat.chatFriend.msgBox(0,11);
		if(friendId == parent.currentChat.friend){
			return;
		}
	}
	$.each(this.chatSingle,function(index,value){
		if(friendId == value.friend){
			chat.chatFriend.msgBox(1,5);
			document.getElementById("chatfriend").innerHTML=friendname;
			if(parent.currentChat!=null){
				parent.currentChat.hide();
			}
			parent.currentChat = value;
			parent.currentChat.show();
		}
	});
}
Chat.prototype.openRoom=function(roomId){
	var parent=this;
	chat.chatGroup.groupId=roomId;
	chat.chatGroup.openChatRoom();
	if(this.chatRoom == null) {
		this.initChatRoom();
	}
	if(this.currentChat!=null){
		chat.chatFriend.msgBox(0,5);
		if(roomId == parent.currentChat.roomId){
			return;
		}
	}
	$.each(this.chatRoom,function(index,value){
		if(roomId == value.roomId){
			chat.chatFriend.msgBox(1,11);
			if(parent.currentChat!=null){
				parent.currentChat.hide();
			}
			parent.currentChat = value;
			parent.currentChat.show();
			console.log(parent.currentChat.isshow);
		}
	});
	
}

Chat.prototype.sendMessage = function() {
	var format="text";
	var typemsg=document.getElementById("typemsg");
	var message=typemsg.value+"";
	this.currentChat.sendmsg(format,message);
	message={"message":message};
	this.currentChat.showrightmsg(format,message);
}
Chat.prototype.sendroommsg=function(){
	var parent=this;
	var format="text";
	var typemsg=document.getElementById("chatroommsg");
	var message=typemsg.value+"";
	this.currentChat.sendChatRoommsg(format,message);
}
Chat.prototype.sendImg=function(imgBytes){
	var format="image";
	var message={"message":imgBytes};
	this.currentChat.showrightmsg(format,message);
	this.currentChat.sendmsg(format,imgBytes);
}
Chat.prototype.sendroomImg=function(imgBytes){
	var format="image";
	var message={"message":imgBytes};
	this.currentChat.showrightmsg(format,message);
	this.currentChat.sendChatRoommsg(format,imgBytes);
}
Chat.prototype.init = function() {
	this.chatFriend.loadData();
	this.chatGroup.loadData();
	this.initChatSingle();
	this.initChatRoom();
	var instance = this;
	this.webSocket = new WebSocket('ws://192.168.1.120:8080/websocket/chat/' + this.username);
	this.webSocket.open = function() {
		//使用send方法发送数据
		web.send();

	};
	this.webSocket.onmessage = function(event) {
		var result = JSON.parse(event.data);
		console.log(result);
		var type=result.type;
		var msg = result.message;
		var format = result.format;
		var sender=result.sender;
		var receiver=result.receiver;
		if(type=="single"){
			$.each(instance.chatSingle,function(index,chatSingle){
				chatSingle.receivemsg(result);
			});
		}else if(type=="applyFriend"){
			if(msg=="apply"){
				chat.chatFriend.msgBox(1,2);
				chat.chatFriend.friendRequest(result);
			}else if(msg=="remove"){
				chat.chatFriend.refreshFriendList();
			}else {
				chat.chatFriend.msgBox(1,4);
				chat.chatFriend.friendRequestReslut(result);
			}
		}else if(type=="group"){
			if(result.subtype=="addUser"){
				chat.chatGroup.reFreshGroupList();
			}
			if(result.subtype=="group"){
				$.each(instance.chatRoom,function(index,chatRoom){
					chatRoom.receivemsg(result);
					console.log("这边调用了");
				});
			}
			if(result.subtype=="removeUser"){
				chat.chatGroup.reFreshRoomMember();
			}
		}
	};
	this.webSocket.onclose = function() {
		console.log("链接已关闭");
	};
}
Chat.prototype.upLoadVedio=function(){
	var parent=this;
	var format='vedio';
	var file=document.getElementById("uploadvedio").files[0];
	var r = new FileReader(); //本地预览
	r.readAsDataURL(file); //Base64
	r.onload = function() {
		var vedio=r.result;
		parent.currentChat.sendmsg(format,vedio);
		
	}
}
