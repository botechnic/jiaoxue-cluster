var chatRemote = require('../remote/chatRemote');
//var mj_record = require('./mj_record');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session, next) {
	var rid = session.get('rid');
	var username = session.uid.split('*')[0];
	var channelService = this.app.get('channelService');
	var param = {
		msg: msg.content,
		from: username,
		target: msg.target,
		cmd: msg.cmd
	};
	channel = channelService.getChannel(rid, false);

	console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
	test_session(this.app, msg, username);

	if(msg.cmd === 'record') {
		if(msg.content === 'true') {
			record_start();
		} else {
			record_stop();
		}
	} else {
		//the target is all users
    	if(msg.target == '*') {
    		channel.pushMessage('onChat', param);
    	}
    	//the target is specific user
    	else {
    		var tuid = msg.target + '*' + rid;
    		var tsid = channel.getMember(tuid)['sid'];
    		channelService.pushMessageByUids('onChat', param, [{
    			uid: tuid,
    			sid: tsid
    		}]);
    	}

    	record_data_0();
        record_data_1();
	}

	next(null, {
		route: msg.route
	});
};

function test_session(app, msg, username) {
	var prev_msg = app.get(username);
	console.log('prev_msg:', prev_msg);
	app.set(username, msg);
}

function record_start() {
	console.log('record_start');
	//mj_record.control_start_record();
	record_data_0_start();
	record_data_1_start();
	record_data_2_start();
}

function record_stop() {
	console.log('record_stop');
	//mj_record.control_stop_record();
	record_data_2_stop();
	record_data_1_stop();
	record_data_0_stop();
}

function record_data_0_start() {
}

function record_data_0_stop() {
}

function record_data_0() {
}

function record_data_1_start() {
}

function record_data_1_stop() {
}

function record_data_1() {
}

function record_data_2_start() {
}

function record_data_2_stop() {
}