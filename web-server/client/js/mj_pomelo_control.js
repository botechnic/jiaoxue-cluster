var pomelo = window.pomelo;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";

var users = {};

$(document).ready(function() {
    console.log("jquery ready");
    var uid_ = global_info.userid;
    var room_ = ""+global_info.course_id;

    connect_gate(uid_, function(ip, port){
        console.log(ip, port);

        message_bind();

        //connect_connector(ip, port, room_);
        connect_connector('pano.botechnic.com', port, room_);
    })
});

function connect_gate(uid, callback){
    console.log("connect_gate");

    var route = 'gate.gateHandler.queryEntry';
	pomelo.init({
		host: window.location.hostname,
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			uid: uid
		}, function(data) {
			pomelo.disconnect();
			if(data.code === 500) {
				console.log(LOGIN_ERROR);
				return;
			}
			callback(data.host, data.port);
		});
	});
}

function message_bind() {
    console.log("message_bind");

    pomelo.on('onChat', function(data) {
        console.log("onChat", data);

        switch(data.cmd) {
        case "chat":
        	_displayNewMsg(data.from, data.msg);
        	break;
        case "prev":
            var e = {};
            e.pageNum = parseInt(data.msg);
            prev_handler(e);
            break;
        case "next":
            var e = {};
            e.pageNum = parseInt(data.msg);
            next_handler(e);
            break;
        case "mousemove":
            var e = {};
            var drawinfo = data.msg.split("|");
            e.mouseX = parseInt(drawinfo[0]);
            e.mouseY = parseInt(drawinfo[1]);
            e.pp;
            if(drawinfo[2] === "true") {
                e.pp = true;
            } else {
                e.pp = false;
            }
            mousemove_handler(e);
            break;
        case "mouseup":
            var e = {};
            var drawinfo = data.msg.split("|");
            e.mouseX = parseInt(drawinfo[0]);
            e.mouseY = parseInt(drawinfo[1]);
            e.pp;
            if(drawinfo[2] === "true") {
                e.pp = true;
            } else {
                e.pp = false;
            }
            mouseup_handler(e);
            break;
        case "mousedown":
            var e = {};
            var drawinfo = data.msg.split("|");
            e.mouseX = parseInt(drawinfo[0]);
            e.mouseY = parseInt(drawinfo[1]);
            e.pp;
            if(drawinfo[2] === "true") {
                e.pp = true;
            } else {
                e.pp = false;
            }
            mousedown_handler(e);
            break;
        }

	});

	//update user list
	pomelo.on('onAdd', function(data) {
		console.log("onAdd", data);
		users[data.user] = data.user;
		user_number_handler(Object.keys(users).length);
	});

	//update user list
	pomelo.on('onLeave', function(data) {
		console.log("onLeave", data);
		delete users[data.user];
		user_number_handler(Object.keys(users).length);
	});

	//handle disconect message, occours when the client is disconnect with servers
	pomelo.on('disconnect', function(reason) {
		console.log("disconnection", reason);
	});
}
function connect_connector(host, port, rid) {
    console.log("connect_connector");

    var username_ = global_info.userid;
    pomelo.init({
        host: host,
        port: port,
        log: true
    }, function() {
        var route = "connector.entryHandler.enter";
        pomelo.request(route, {
            username: username_,
            rid: rid
        }, function(data) {
            if(data.error) {
                //showError(DUPLICATE_ERROR);
                console.log(DUPLICATE_ERROR);
                return;
            }
            for(var i=0;i<data.users.length;i++) {
                users[data.users[i]] = data.users[i];
            }
            console.log("enter room", data);
            user_number_handler(Object.keys(users).length);

            if (global_info.biz_type === 'live' || global_info.biz_type === 'record') {
            		mj_live.start_playlive();
            }
        });
    });
}

function send_message(rid, msg, username, target, cmd){
    var route = "chat.chatHandler.send";

    pomelo.request(route, {
        rid: rid,
        content: msg,
        from: username,
        target: target,
        cmd: cmd
    }, function(data) {
        if(target != '*' && target != username) {
            console.log(data);
        }
    });
}
