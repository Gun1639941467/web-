function ChatGroup(username){
	this.username = username;
	this.groupId=null;
	this.group=null;
	this.friendlist=null;
	this.chatRoomList=null;
	this.restfriend=[];
	this.selfriend;
	this.baseServer = 'http://192.168.1.120:8080';
	//加载好友列表地址
	this.myFriendUrl = this.baseServer + '/chat/friend/myFriend';
	//创建群聊地址
	this.createChatgroup=this.baseServer+'/chat/addRoom';
	//加载我的群聊列表地址
	this.myChatRoomUrl=this.baseServer+'/chat/myRoom';
	//加载群聊成员的地址
	
}
ChatGroup.prototype.loadData=function(){
	var parent=this;
	parent.loadMyChatGroup();
}
//页面一开始加载时加载群聊列表
ChatGroup.prototype.loadMyChatGroup=function(){
	var parent=this;
	$.ajax({
		type : 'POST',
		data : {
				"username" : parent.username
			},
		dataType : 'json',
		async : false,
		url :parent.myChatRoomUrl,
		success : function(data) {
			parent.group=data.data;
			var chatGroupList=data.data;
			parent.chatRoomList=chatGroupList;
			$.each(chatGroupList,function(index,roominfo){
				$("#chatGroupList").append('<li id='+
						roominfo.roomId+'>'+ roominfo.roomName+'</li>');
				document.getElementById(roominfo.roomId).onclick=function(){
					parent.groupId=roominfo.roomId;
					//parent.openChatRoom();
					chat.openRoom(roominfo.roomId);
				}
				document.getElementById(roominfo.roomId).oncontextmenu = function(e) {
					e.preventDefault();
					var pageX=e.pageX;
					var pageY=e.pageY;
					document.getElementById("deletechatgroup").style.top=pageY+"px";
					document.getElementById("deletechatgroup").style.left=pageX+"px";
					document.getElementById("exitchatgroup").style.top=pageY+"px";
					document.getElementById("exitchatgroup").style.left=pageX+"px";
				}
				document.getElementById(roominfo.roomId).onmouseup = function(oEvent) {
					if (!oEvent)
						oEvent = window.event;
					if (oEvent.button == 2) {
						if(parent.username==roominfo.creator){
							var other=document.getElementById("exitchatgroup");
							var delfriend=document.getElementById("deletefriendbtn");
							if(other.style.display=="block"){
								other.style.display="none";
							}
							if(delfriend.style.display=="block"){
								console.log("这边进行判断")
								delfriend.style.display="none";
							}
							chat.chatFriend.msgBox(1,9);
							document.getElementById("overlay").onclick=function(){
								var test=document.getElementById("deletechatgroup");
								if(test.style.display=="block"){
									test.style.display="none";
								}
							}
							parent.groupId=roominfo.roomId;
						}else {
							var delfriend=document.getElementById("deletefriendbtn");
							if(delfriend.style.display=="block"){
								console.log("这边进行判断")
								delfriend.style.display="none";
							}
							var test=document.getElementById("deletechatgroup");
							if(test.style.display=="block"){
								test.style.display="none";
							}
							chat.chatFriend.msgBox(1,10);
							document.getElementById("overlay").onclick=function(){
								var test=document.getElementById("exitchatgroup");
								if(test.style.display=="block"){
									test.style.display="none";
								}
							}
							parent.groupId=roominfo.roomId
						}
					}
				}
			});
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {
				alert("数据发送失败");
			}
		});
}
ChatGroup.prototype.showChatRoomMember=function(){
	var parent=this;
	$.ajax({
		type:'POST',
		data:{
			"username":parent.username,
		},
		dataType : 'json',
		url:parent.myChatRoomUrl,
		success:function(data){
			var chatGroupList=data.data;
			$.each(chatGroupList,function(index,roominfo){
				if(roominfo.roomId==parent.groupId){
					var chatroommembers=roominfo.users;
					$.each(chatroommembers,function(key,value){
						var friendPetName=key;
						var friendRealname=value;
						$("#roomMembers").append('<li id='+friendPetName+'>'+friendRealname+'</li>');
						document.getElementById(friendPetName).oncontextmenu = function(e) {
							e.preventDefault();
							var pageX=e.pageX;
							var pageY=e.pageY;
							document.getElementById("delChatRoomMember").style.top=pageY+"px";
							document.getElementById("delChatRoomMember").style.left=pageX+"px";
							document.getElementById(friendPetName).style.background="#d9d9d9";
							
						}
						document.getElementById(friendPetName).onmouseup = function(oEvent) {
							if (!oEvent)
								oEvent = window.event;
							if (oEvent.button == 2) {
								chat.chatFriend.msgBox(1,13);
								parent.selfriend=friendPetName;
							}
						}
					})
				}
			});
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
ChatGroup.prototype.delChatRoomMember=function(){
	var parent=this
	$.ajax({
		type:'POST',
		data:{
			"username":parent.username,
			"delUser":parent.selfriend,
			"roomId":parent.groupId,
		},
		url:'http://192.168.1.120:8080/chat/removeUser',
		success:function(data){
			chat.chatFriend.msgBox(0,13);
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
//打开群聊的界面
ChatGroup.prototype.openChatRoom=function(){
	var clear=document.getElementById("roomMembers");
	clear.innerHTML="";
	chat.chatFriend.msgBox(1,11);
	var parent=this;
	parent.showChatRoomMember();
}

//退出群聊
ChatGroup.prototype.exitChatGroup=function(){
	var parent=this;
	$.ajax({
	  type:'POST',
	  data:{
		  "username":parent.username,
		  "roomId":parent.groupId,
		  "delUser":parent.username
	  },
	  url:'http://192.168.1.120:8080/chat/removeUser',
	  success:function(data){
		  parent.reFreshGroupList();
		  chat.chatFriend.msgBox(0,10);
		  chat.chatGroup.closechatroom();
	  },
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
//删除群聊
ChatGroup.prototype.deleteChatGroup=function(){
	var parent=this;
	$.ajax({
		type:'POST',
		data:{
			"username":parent.username,
			"roomId":parent.groupId,
		},
		url:'http://192.168.1.120:8080/chat/deleteRoom',
		success:function(){
			parent.reFreshGroupList();
			chat.chatFriend.msgBox(0,9);
			chat.chatFriend.closechatroom();
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
//重新刷新群聊列表
ChatGroup.prototype.reFreshGroupList=function(){
	var parent=this;
	var groupList=document.getElementById("chatGroupList");
	groupList.innerHTML="";
	parent.loadMyChatGroup();
	chat.initChatRoom();
}
//点击创建群聊时 加载好友 并将所有的好友遍历 显示在左边
ChatGroup.prototype.loadFriendList = function(){
	var parent=this;
	$.ajax({
		type : 'POST',
		data : {
			"username" : parent.username
		},
		async : false,
		url : parent.myFriendUrl,
		success:function(data){
		    parent.friendlist=JSON.parse(data).data;
			$.each(parent.friendlist,function(index,friendinfo){
				var location="left";
				var friendname=chat.chatFriend.userData[friendinfo.friend];
				$("#leftSelect").append('<option value="'+friendinfo.friend+'" '  
						+'id="'+friendinfo.id+'"  ">'+friendname+'</option>');
				document.getElementById(friendinfo.id).ondblclick=function(){
					parent.addorRemove(friendinfo.id,location);
				}
			});
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}


//实现用户的双击左右移动功能
ChatGroup.prototype.addorRemove=function(id,location) {
	var parent=this;
	if(location=="left"){
		location="right";
		$("#rightSelect").append($("#"+id));
		document.getElementById(id).ondblclick=function(){
			parent.addorRemove(id,location);
		}
	}else if(location=="right"){
		location="left";
		$("#leftSelect").append($("#"+id));
		document.getElementById(id).ondblclick=function(){
			parent.addorRemove(id,location);
		}
	}
}
//打开创建群聊的界面
ChatGroup.prototype.openCreateChatGroup=function(){
	var parent=this;
	parent.loadFriendList();
	chat.chatFriend.msgBox(1,8);
	
}
//关闭创建群聊的界面
ChatGroup.prototype.closeCreateChatGroup=function(){
	chat.chatFriend.msgBox(0,8);
	//关闭的时候将添加用户到群聊里的那些用户信息清楚掉
	var clearFriendList=document.getElementById("leftSelect");
	clearFriendList.innerHTML="";
	var clearRight=document.getElementById("rightSelect");
	clearRight.innerHTML="";
}
//新建群聊点击确定之后创建群聊
ChatGroup.prototype.createChatGroup=function(){
	var parent=this;
	//获取输入框中的信息 作为群聊的名称
	var groupname=document.getElementById("groupname");
	groupname=groupname.value;
	var  members=[];
	var optionlist=$("#rightSelect option");
	$.each(optionlist,function(index,option){
		members.push(option.value);
	})
	$.ajax({
		type:'POST',
		data:{
			"username":parent.username,
			"roomName":groupname,
			"member":members
		},
		url:'http://192.168.1.120:8080/chat/addRoom',
		success:function(data){
			parent.closeCreateChatGroup();
			parent.reFreshGroupList();
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
//提交添加好友到群聊
ChatGroup.prototype.confirmAddFriends=function(){
	var parent=this;
	var  members=[];
	var optionlist=$("#addfriends_rightSelect option");
	//获取所有在右边需要添加到群聊的人的信息
	$.each(optionlist,function(index,option){
		members.push(option.value);
	})
	$.ajax({
		type:'POST',
		data:{
			"username":parent.username,
			"roomId":parent.groupId,
			"member":members
		},
		url:'http://192.168.1.120:8080/chat/addUser',
		success:function(data){
			parent.closeAddFriends();
			parent.reFreshRoomMember();
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
//刷新群聊的用户 重新显示出来
ChatGroup.prototype.reFreshRoomMember=function(){
	var parent=this;
	var clear=document.getElementById("roomMembers");
	clear.innerHTML="";
	parent.showChatRoomMember();
}
//关闭群聊的聊天界面 并把里面的好友清空 否则重复打开时候会一直将群聊里的好友添加进去
ChatGroup.prototype.closechatroom=function(){
	chat.chatFriend.msgBox(0,11);
	var clear=document.getElementById("roomMembers");
	clear.innerHTML="";
}
//打开添加好友到群聊的界面
ChatGroup.prototype.openAddFriends=function(){
	var parent=this;
	chat.chatFriend.msgBox(1,12);
	parent.ergodicMyfriends();
}
//关闭添加好友到群聊里的界面
ChatGroup.prototype.closeAddFriends=function(){
	var clearleft=document.getElementById("addfriends_leftSelect");
	clearleft.innerHTML="";
	var clearright=document.getElementById("addfriends_rightSelect");
	clearright.innerHTML="";
	chat.chatFriend.msgBox(0,12);
}
//获取所有我的不在所点击的群里里的好友
ChatGroup.prototype.ergodicMyfriends=function(){
	var parent=this;
	//用于存放当前群聊里的成员
	//防止每次调用的时候都往restfriend里面加 需要每次调用之前先清空
	parent.restfriend=[];
	var currentRoomMembers=[];
	
	$.ajax({
		type : 'POST',
		data : {
			"username" : parent.username
		},
		async : false,
		url : parent.myFriendUrl,
		success:function(data){
			//将我所有的好友存放到全局变量里
		    parent.friendlist=JSON.parse(data).data;
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
	
	//遍历所有的群聊信息 与当前群聊进行比对 获取当前群聊信息
	//并将当前得到的群聊的中的用户赋值给currentRoomMembers
	$.ajax({
		type : 'POST',
		data : {
				"username" : parent.username
			},
		dataType : 'json',
		async : false,
		url :parent.myChatRoomUrl,
		success : function(data) {
			parent.chatRoomList=data.data;
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
	console.log(parent.chatRoomList);
	
	$.each(parent.chatRoomList,function(index,chatRoomInfo){
		console.log("chatRoomInfo",chatRoomInfo);
		console.log("groupid",parent.groupId,chatRoomInfo.roomId==parent.groupId,chatRoomInfo.roomId);
		if(chatRoomInfo.roomId==parent.groupId){
			
			currentRoomMembers.push(chatRoomInfo.users);
			console.log("currentRoomMember",currentRoomMembers);
			return  false;
		}
	});
	console.log(currentRoomMembers);
	//用于存放用户的昵称
    var friendPetName=[];
    //遍历所有好友的信息
    $.each(parent.friendlist,function(index,friendinfo){
    	friendPetName.push(friendinfo);
    });
    //用于存放不在群里里的好友信息
    var restfriendlist=[];
    //由于当前群聊的成员是数组变量 且只有一条 所以直接把第一条信息提取出来
    
    var members=currentRoomMembers[0];
    var roomMembers=[];
    //将提取出来的所有群组用户进行遍历 放到roomMembers用于之后的indexof查询
    $.each(members,function(key,value){
    	roomMembers.push(key);
    });
    //遍历我所有的好友信息
	for(var i=0;i<friendPetName.length;i++){
		//利用indexof函数查找是否当前群聊里面已经有该用户
		var number=roomMembers.indexOf(friendPetName[i].friend);
        //如果没有该用户则将这个 用户存放到restfriend里 
		if(number==-1){
			parent.restfriend.push(friendPetName[i]);
		}
	}
	
	//调用listrestfriend方法
	parent.listRestFriend();
}
ChatGroup.prototype.listRestFriend=function(){
	var parent=this;
	//遍历所有不在当前群聊的好友 并将之显示在添加好友到群聊的框里
	$.each(parent.restfriend,function(index,friendinfo){
		var location="left";
		var friendname=chat.chatFriend.userData[friendinfo.friend];
		$("#addfriends_leftSelect").append('<option value="'+friendinfo.friend+'" '  
				+'id="'+friendinfo.id+'"  ">'+friendname+'</option>');
		document.getElementById(friendinfo.id).ondblclick=function(){
			parent.leftorright(friendinfo.id,location);
		}
	});
}
ChatGroup.prototype.leftorright=function(id,location) {
	var parent=this;
	if(location=="left"){
		location="right";
		$("#addfriends_rightSelect").append($("#"+id));
		document.getElementById(id).ondblclick=function(){
			parent.addorRemove(id,location);
		}
	}else if(location=="right"){
		location="left";
		$("#addfriends_leftSelect").append($("#"+id));
		document.getElementById(id).ondblclick=function(){
			parent.addorRemove(id,location);
		}
	}
}














