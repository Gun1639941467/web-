function ChatFriend(username){
	this.userData = {};
	this.username = username;
	this.friends = null;
	this.friendId=null;
	this.friendName=null;
	this.baseServer = 'http://192.168.1.120:8080';
	//获取用户信息
	this.userDataUrl = this.baseServer + '/user/userlist';
	//查找好友
	this.findFriendUrl = this.baseServer + '/chat/friend/findUser';
	//添加好友
	this.addFriendUrl = this.baseServer + '/chat/friend/add';
	//同意好友申请
	this.agreeFriendApplyUrl = this.baseServer + '/chat/friend/agree';
	//拒绝好友申请
	this.disagreeFriendApplyUrl = this.baseServer + '/chat/friend/disagree';
	//忽略好友申请
	this.ignoreFriendApplyUrl = this.baseServer + '/chat/friend/ignore';
	//查询我的好友
	this.myFriendUrl = this.baseServer + '/chat/friend/myFriend';
	//获取好友申请
	this.friendApplyUrl = this.baseServer + '/chat/friend/getApplyList';
	//获取我的好友申请回复
	this.myFriendApplyResponseUrl = this.baseServer + '/chat/friend/getApplyOptMsgNotRead';
	//设置我的好友申请回复信息为已读
	this.setMyFriendApplyResponseReadUrl = this.baseServer + '/chat/friend/setApplyOptMsgRead';
	//设置删除好友
	this.deleteFriendUrl=this.baseServer+'/chat/friend/delete';
}

ChatFriend.prototype.loadData = function() {
	this.loadUserDatas();
	this.loadFriend();
	this.loadFriendApply();
	this.loadMyFriendApplyResponse();
}

//加载用户数据
ChatFriend.prototype.loadUserDatas = function() {
	var parent = this;
	$.ajax({
		type : 'POST',
		url : parent.userDataUrl,
		async : false,
		success : function(data) {
			parent.userData = JSON.parse(data).data;
		

		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
ChatFriend.prototype.refreshFriendList = function(){
	var friendlist=document.getElementById("friends");
	friendlist.innerHTML="";
	this.loadFriend();
	chat.initChatSingle();
}
//加载我的好友列表
ChatFriend.prototype.loadFriend = function() {
	var parent = this;
	$.ajax({
		type : 'POST',
		data : {
			"username" : parent.username
		},
		async : false,
		url : parent.myFriendUrl,
		success : function(data) {
			parent.friends = JSON.parse(data).data;
			$.each(parent.friends,function(index, user) {
				var friendname = parent.userData[user.friend];
				var userId = user.id;
				$("#friends").append('<li id="'+
						userId+'" onclick="chat.soloChat(\''+user.friend+'\')">'+ friendname+'</a></li>');
		
				document.getElementById(userId).oncontextmenu = function(e) {
					e.preventDefault();
					var pageX=e.pageX;
					var pageY=e.pageY;
					document.getElementById("deletefriendbtn").style.top=pageY+"px";
					document.getElementById("deletefriendbtn").style.left=pageX+"px";
				}
				document.getElementById(userId).onmouseup = function(oEvent) {
					if (!oEvent)
						oEvent = window.event;
					if (oEvent.button == 2) {
						//暂时是右击的时候直接删除 
						//parent.msgBox(1,7);
						var other=document.getElementById("exitchatgroup");
						if(other.style.display=="block"){
							other.style.display="none";
						}
						var test=document.getElementById("deletechatgroup");
						if(test.style.display=="block"){
							test.style.display="none";
						}
						
						parent.msgBox(1,6);
						document.getElementById("overlay").onclick=function(){
							var test=document.getElementById("deletefriendbtn");
							if(test.style.display=="block"){
								test.style.display="none";
							}
						}
						var deletefriend_info=document.getElementById("delete_friend_info");
						var friendrealname=parent.userData[user.friend];
						deletefriend_info.innerHTML=friendrealname+"("+userId+")";
						parent.friendId=userId;
						parent.friendName=user.friend;
					}
				}
			});
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}

//加载我收到的好友申请
ChatFriend.prototype.loadFriendApply = function() {
	var parent = this;
	$.ajax({
		type : 'POST',
		data : {
			"username" : parent.username
		},
		async : false,
		url : parent.friendApplyUrl,
		success : function(data) {
			var friendrequest = JSON.parse(data);
			var FriendApplyDatas = friendrequest.data;
			if (FriendApplyDatas.length == 0) {
				return;
			} else {
				chat.chatFriend.msgBox(1, 2);
				$.each(FriendApplyDatas,function(key, value) {
					var friend=parent.userData[value.username]+"";
					
					$("#friendsinvitation").append('<div class="content">'
						+ '<img src="head.png" class="friend_head">'
						+ '<span class="username" >'
						+ friend+ '</span>'+ '<span >'
						+ value.id+ '</span> '+ '<span >加你为好友</span>'
						+ '<button class="cancel" onclick="chat.chatFriend.agreeFriendApply(\''
						+ value.username+ '\','+ value.id+ ')">同意</button>'
						+ '<button class="confirm" onclick="chat.chatFriend.disagreeFriendApply(\''
						+ value.username+ '\','+ value.id+ ')">拒绝</button>'
						+ '<button class="confirm" onclick="chat.chatFriend.ignoreFriendApply(\''
						+ value.username+ '\','+ value.id+ ')">忽略</button>'+ '</div>');
				
				});
			} 
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	})
}

//加载我的好友申请回复信息
ChatFriend.prototype.loadMyFriendApplyResponse = function() {
	var parent = this;
	$.ajax({
		type : 'POST',
		data : {
			"username" : parent.username
		},
		async : false,
		url : parent.myFriendApplyResponseUrl,
		success : function(data) {
			var responsedata = JSON.parse(data).data;
			if (responsedata.length == 0) {
				return;
			} else {
				chat.chatFriend.msgBox(1,4);
				$.each(responsedata, function(index, response) {
					var status = response.status;
					var result;
					var id=response.id;
					var friendId=response.friend;
					var friendrealname=parent.userData[friendId];
					if(status==1){
						 result="已拒绝您的好友请求";
					}else if(status==2){
						 result="已通过您的好友请求";
					}
					$("#friendresponse").append('<div class="notice">'
					      +'<div class="result"><img src="head.png" class="res_friend_head"><br>'
						  +'<span id="friendname">'+friendrealname+'</span><br>'
						  +'<span id="friendId">'+friendId+'</span> </div><div class="friend_invitation">'
					       +'<img src="ok.png"><span style="font-size:14px;color:#009788">'+friendrealname+'</span>'
					       +'<span style="font-size:14px;">'+result+'</span>'
						   +'<button class="finish" onclick="chat.chatFriend.deleteresponse('+id+')">确认</button></div>'+
					  '</div>');
				});
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
ChatFriend.prototype.friendRequestReslut=function(result){
	var sender=result.sender;
	var friendname=this.userData[sender];
	var ending;
	if(result.message =="agree"){
		ending="已同意了您的好友请求";
	}else if(result.message =="disagree"){
		ending="已拒绝您的好友请求";
	}
	$("#friendresponse").append('<div class="notice">'
		      +'<div class="result"><img src="head.png" class="res_friend_head"><br>'
			  +'<span id="friendname">'+friendname+'</span><br>'
			  +'<span id="friendId">'+sender+'</span> </div><div class="friend_invitation">'
		       +'<img src="ok.png"><span style="font-size:14px;color:#009788">'+friendname+'</span>'
		       +'<span style="font-size:14px;">'+ending+'</span>'
			   +'<button class="finish" onclick="chat.chatFriend.deleteresponse('+result.id+')">确认</button></div>'+
		  '</div>');
	chat.chatFriend.refreshFriendList();
	
}

ChatFriend.prototype.friendRequest = function(message){
	
	var friend=message.sender;
	var friendname=this.userData[friend];
	var id=message.id
	$("#friendsinvitation").append('<div class="content">'
			+ '<img src="head.png" class="friend_head">'
			+ '<span class="username" >'
			+ friendname+ '</span>'+ '<span >'
			+ friend+ '</span> '+ '<span >加你为好友</span>'
			+ '<button class="cancel" onclick="chat.chatFriend.agreeFriendApply(\''
			+ friend+ '\','+ id+ ')">同意</button>'
			+ '<button class="confirm" onclick="chat.chatFriend.disagreeFriendApply(\''
			+ friend+ '\','+ id+ ')">拒绝</button>'
			+ '<button class="confirm" onclick="chat.chatFriend.ignoreFriendApply(\''
			+ friend+ '\','+ id+ ')">忽略</button>'+ '</div>');
	}

//设置我的好友申请回复信息为已读
ChatFriend.prototype.deleteresponse = function(id) {
	var parent = this;
	$.ajax({
		type : 'POST',
		data : {
			"id":id,
			"username" : parent.username
		},
		url : parent.setMyFriendApplyResponseReadUrl,
		success : function(data) {
			chat.chatFriend.msgBox(0,4);
			
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}

//查找好友
ChatFriend.prototype.findFriend = function(friend) {
	var parent = this;
	$.ajax({
		 type:'POST',
		 data:{
			 "username":parent.username,
			 "friend":friend
		 },
		async:false,
		url:parent.findFriendUrl,
		success : function(data) {
			var userId=document.getElementById("userid");
			var friendAccount=document.getElementById("realname");
			var friend=JSON.parse(data);
			var account=document.getElementById("accinfo");
			var friendPetName=account.value;
			$("#add_friend_account").append(friendPetName);
			if(friend.result=="error"){
				userId.innerHTML="用户不存在";
				return;
			}
		    var friend_info=JSON.parse(friend.data);
		    var username=friend_info.username;
			var realname=friend_info.realname;
		    var head=document.getElementById("head_sculpture");
			userId.innerHTML=username;
			friendAccount.innerHTML=realname;
			var picture=friend_info.picture;
			var search_acc=document.getElementById("add_friend_account");
			search_acc.innerHTML=username;
			if(picture==""){
				head.src="head.png"
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}

//添加好友，发送好友申请
ChatFriend.prototype.addFriend = function(friend) {
	var parent = this;
	$.ajax({
		type : 'POST',
		data : {
			"username" : parent.username,
			"friend" : friend
		},
		url : parent.addFriendUrl,
		success : function(data)  {
			var result=JSON.parse(data).result;
			if(result=="error"){
				alert("您已经有该用户好友");
				chat.chatFriend.msgBox(0, 1);
				return;
			}else if(result=="ok"){
				chat.chatFriend.msgBox(0, 1);
				chat.chatFriend.msgBox(1, 3);
				friendname.innerHTML = parent.userData[accinfo.value];
				friendId.innerHTML = accinfo.value;
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
//删除我的好友
ChatFriend.prototype.deleteFriend = function() {
	var parent = this;
	$.ajax({
		type : 'POST',
		data : {
			"username" : parent.username,
			"friend" : parent.friendName,
			"id" : parent.friendId
		},
		url : parent.deleteFriendUrl,
		success : function(data) {
			parent.msgBox(0,7);
			parent.refreshFriendList();
			//chat.chatFriend.setMyFriendApplyResponseRead(recordId);

		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
//同意好友申请
ChatFriend.prototype.agreeFriendApply = function(friend,recordId) {
	var parent = this;
	var flag=true;
	$.ajax({
		type : 'POST',
		data : {
			"id" : recordId,
			"username" :parent.username,
			"friend" : friend
		},
		url : parent.agreeFriendApplyUrl,
		success : function(data) {
			chat.chatFriend.msgBox(0,2);
		    parent.refreshFriendList();
		    
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}

//拒绝好友申请
ChatFriend.prototype.disagreeFriendApply = function(recordId,friend) {
	var parent = this;
	$.ajax({
		type : 'POST',
		data : {
			"id" : recordId,
			"username" :parent.username,
			"friend" : friend
		},
		url : parent.disagreeFriendApplyUrl,
		success : function(data) {
			chat.chatFriend.msgBox(0,2);
			chat.chatFriend.setMyFriendApplyResponseRead(recordId);

		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}
//忽略好友申请
ChatFriend.prototype.ignoreFriendApply = function(recordId,friend) {
	var parent = this;
	$.ajax({
		type : 'POST',
		data : {
			"id" : recordId,
			"username" :parent.username,
			"friend" : friend
		},
		url : parent.ignoreFriendApplyUrl,
		success : function(data) {
			msgbox(0, 2);
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("数据发送失败");
		}
	});
}

ChatFriend.prototype.msgBox = function(n,location) {
	if (location == 1) {
		//打开添加好友的界面框
		document.getElementById("addfriends").style.display = n ? 'block'
				: 'none'; /* 点击按钮打开/关闭 对话框 */
	} else if (location == 2) {
		//打开或关闭确认好友邀请的界面框
		document.getElementById("confirmfriendrequest").style.display = n ? 'block'
				: 'none';
	} else if (location == 3) {
		//打开或关闭发送好友请求的界面框
		document.getElementById("sendfriendrequest").style.display = n ? 'block'
				: 'none';
	} else if (location == 4) {
		//打开或关闭添加好友请求回应的界面
		document.getElementById("addfriendreponse").style.display = n ? 'block'
				: 'none';
	}else if  (location == 5)  {
		//打开或关闭担任聊天的界面框
		document.getElementById("solochat").style.display = n ? 'block'
				: 'none';
	}else if (location == 6){
		document.getElementById("deletefriendbtn").style.display=n?'block':'none';
	}else if(location==7){
		document.getElementById("deleteFriendPanel").style.display=n?'block':'none';
	}else if(location==8){
		//打开或关闭创建群聊
		document.getElementById("createChatGroup").style.display=n?'block':'none';
	}else if(location==9){
		document.getElementById("deletechatgroup").style.display=n?'block':'none';

	}else if(location==10){
		document.getElementById("exitchatgroup").style.display=n?'block':'none';

	}else if(location==11){
		//打开或关闭群聊的界面
		document.getElementById("chatroomPanel").style.display=n?'block':'none';
	}else if(location==12){
		document.getElementById("addfriendstochatroom").style.display=n?'block':'none';
	}else if(location==13){
		document.getElementById("delChatRoomMember").style.display=n?'block':'none';
	}
	
}
