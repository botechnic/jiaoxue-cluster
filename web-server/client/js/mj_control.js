///////////////////////////////////////////////////////////////////////////////
// login part
// 
//var username;
//var connected = false;


//var socket = io.connect(global_info.socketio_addr);

/*function set_user_name() {
	if (username) {
		if (global_info.role === 'teacher') {
			socket.emit('add user', {
				role : 'teacher',
				username : username
			});
		} else {
			socket.emit('add user', {
				role : 'student',
				username : username
			});
		}
	}
}

function add_user() {
	var username_ = global_info.userid;
	username = username_;
	set_user_name();
}*/

/*socket.on('connect', function() {
	console.log('connected');

	add_user();

	if (global_info.biz_type === 'live' || global_info.biz_type === 'record') {
		mj_live.start_playlive();
	}
});*/

/*socket.on('login', function(data) {
	connected = true;
});*/

/*socket.on('user number change', function(data) {
	var numUsers = data.numUsers;
	console.log('user number change', data);
	document.getElementById('number_users').textContent = numUsers;
});*/

/*socket.on('new message', function(data) {
	console.log('new message');
	//_displayNewMsg(data.username, data.message);
});*/

var pp = false;

function user_number_handler(user_number) {
	console.log('user number change', user_number);
	document.getElementById('number_users').textContent = user_number;
}

function prev_handler(msg) {
	var e = {};
	e.pageNum = parseInt(msg);
	console.log('prev', e.pageNum);
	var pageNum = e.pageNum;
	queueRenderPage(pageNum);
}

function next_handler(msg) {
	var e = {};
	e.pageNum = parseInt(msg);
	console.log('next', e.pageNum);
	var pageNum = e.pageNum;
	queueRenderPage(pageNum);
}

function mousedown_handler(msg) {
	console.log('mousedown');

	if(delay_handler('mousedown', msg)) {
    	return;
    }

	var e = {};
	var drawinfo = msg.split("|");
	e.mouseX = parseInt(drawinfo[0]);
	e.mouseY = parseInt(drawinfo[1]);
	e.pp;
	if(drawinfo[2] === "true") {
		e.pp = true;
	} else {
		e.pp = false;
	}
	pp = true;
	var mouseX = e.mouseX;
	var mouseY = e.mouseY;
	ctx.moveTo(mouseX, mouseY);
}

function mouseup_handler(msg) {
	console.log('mouseup');

	if(delay_handler('mouseup', msg)) {
    		return;
    }

	var e = {};
	var drawinfo = msg.split("|");
	e.mouseX = parseInt(drawinfo[0]);
	e.mouseY = parseInt(drawinfo[1]);
	e.pp;
	if(drawinfo[2] === "true") {
		e.pp = true;
	} else {
		e.pp = false;
	}
	pp = e.pp;
}

function mousemove_handler(msg) {
	console.log('mousemove');

	if(delay_handler('mousemove', msg)) {
		return;
	}

	var e = {};
	var drawinfo = msg.split("|");
	e.mouseX = parseInt(drawinfo[0]);
	e.mouseY = parseInt(drawinfo[1]);
	e.pp;
	if(drawinfo[2] === "true") {
		e.pp = true;
	} else {
		e.pp = false;
	}
	var mouseX = e.mouseX;
	var mouseY = e.mouseY;
	pp = e.pp;
	if (pp) {
		ctx.lineTo(mouseX, mouseY);
		ctx.stroke();
	}
}

var delay_cmd = [];
var is_delay = true;

function delay_handler(cmd, msg) {
	console.log('delay_handler', is_delay);
	if(is_delay) {
		var cmd_obj = {};
		cmd_obj.cmd = cmd;
		cmd_obj.msg = msg;

		delay_cmd.push(cmd_obj);

		return true;
	} else {
		return false;
	}
	return false;
}

function reset_draw_ppt() {
	is_delay = true;
    delay_cmd = [];
}

function delay_dispatch() {
	console.log('delay_dispatch');
	is_delay = false;

	for(var cmd_index in delay_cmd) {
		var cmd_obj = delay_cmd[cmd_index];
		switch(cmd_obj.cmd) {
		case 'mousemove':
			mousemove_handler(cmd_obj.msg);
			break;
		case 'mouseup':
			mouseup_handler(cmd_obj.msg);
			break;
        case 'mousedown':
			mousedown_handler(cmd_obj.msg);
			break;
		}
	}

	delay_cmd = [];
}


/*socket.on('prev', prev_handler);
socket.on('next', next_handler);
socket.on('mousedown', mousedown_handler);
socket.on('mouseup', mouseup_handler);
socket.on('mousemove', mousemove_handler);*/


