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

function prev_handler(e) {
	console.log('prev', e.pageNum);
	var pageNum = e.pageNum;
	queueRenderPage(pageNum);
}

function next_handler(e) {
	console.log('next', e.pageNum);
	var pageNum = e.pageNum;
	queueRenderPage(pageNum);
}

function mousedown_handler(e) {
	console.log('mousedown');
	pp = true;
	var mouseX = e.mouseX;
	var mouseY = e.mouseY;
	ctx.moveTo(mouseX, mouseY);
}

function mouseup_handler(e) {
	console.log('mouseup');
	pp = e.pp;
}

function mousemove_handler(e) {
	console.log('mousemove');
	var mouseX = e.mouseX;
	var mouseY = e.mouseY;
	pp = e.pp;
	if (pp) {
		ctx.lineTo(mouseX, mouseY);
		ctx.stroke();
	}
}

/*socket.on('prev', prev_handler);
socket.on('next', next_handler);
socket.on('mousedown', mousedown_handler);
socket.on('mouseup', mouseup_handler);
socket.on('mousemove', mousemove_handler);*/


