var chatRemote = require('../remote/chatRemote');

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
	}

	next(null, {
		route: msg.route
	});
};

function record_start() {
	console.log('record_start');
}

function record_stop() {
	console.log('record_stop');
}