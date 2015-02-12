var chatRemote = require('../remote/chatRemote');
//var mj_record = require('./mj_record');
var path = require('path');
var fs = require("fs");
var config = require('./config');
var course_id = 0;

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
	course_id = rid;
	var username = session.uid.split('*')[0];
	var channelService = this.app.get('channelService');
	var param = {
		msg: msg.content,
		from: username,
		target: msg.target,
		cmd: msg.cmd
	};
	channel = channelService.getChannel(rid, false);

	/*console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
	test_session(this.app, msg, username);*/

	if(msg.cmd === 'record') {
		if(msg.content === 'true') {
			record_start(this.app, username);
		} else {
			record_stop(this.app, username);
		}

	} else {
		//the target is all users
    	if(msg.target == '*') {
    		channel.pushMessage('onChat', param);
    	}
    	//the target is specific user
    	/*else {
    		var tuid = msg.target + '*' + rid;
    		var tsid = channel.getMember(tuid)['sid'];
    		channelService.pushMessageByUids('onChat', param, [{
    			uid: tuid,
    			sid: tsid
    		}]);
    	}*/

        var user_info = this.app.get(username);
        //console.log('user_info:', user_info);
        if(user_info !== undefined && user_info.is_recording !== undefined && user_info.is_recording) {
            if(msg.cmd === 'chat') {
                record_data_1(this.app, msg, user_info,username);
            } else {
                record_data_0(this.app, msg, user_info);
            }
        }

	}

	next(null, {
		route: msg.route
	});
};

/*function test_session(app, msg, username) {
	var prev_msg = app.get(username);
	console.log('prev_msg:', prev_msg);
	app.set(username, msg);
}*/

/*function file_fd(app, msg, fd0) {
    var prev_msg = app.get(file_db);
    console.log('prev_msg:', prev_msg);
    app.set(file_db[course_id].fd0, fd0);
}*/

function record_start(app, key) {
	console.log('record_start');

	var user_info = {};

	record_data_0_start(app, user_info);
	record_data_1_start(app, user_info);
	record_data_2_start(app, user_info);

    user_info.base_timestamp = new Date().getTime();
	user_info.is_recording = true;
	user_info.username = key;

	app.set(key, user_info);
}

function record_stop(app, key) {
	console.log('record_stop');

	var user_info = app.get(key);
	if(user_info !== undefined) {
	    record_data_2_stop(app, user_info);
    	record_data_1_stop(app, user_info);
    	record_data_0_stop(app, user_info);

    	user_info.is_recording = false;
	}
}

function mkdirsSync(dirname, mode){
    console.log(dirname);
    if(fs.existsSync(dirname)){
        return true;
    }else{
        if(mkdirsSync(path.dirname(dirname), mode)){
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
}

function record_data_0_start(app, user_info) {

    var path = config.prev_path + course_id;
    var file_path = path + '/' +course_id + '_0.json';

	mkdirsSync(path, null);

    fs.open(file_path, 'w', function(err,fd0){
        if(err){
            console.log('open file error:',err);
        }
        user_info.fd0 = fd0;

        var msg_ = {};
        msg_.cmd = 'next';
        msg_.content = '1';
        record_data_0(app, msg_, user_info);
    })
}

function record_data_0_stop(app, user_info) {
    var fd0 = user_info.fd0;
    fs.close(fd0, function() {
        console.log('record_data_0_stop');
    });
}

function record_data_0(app, msg, user_info) {
    var fd = user_info.fd0;

    var curr_timestamp = new Date().getTime();
    var curr_offset = curr_timestamp - user_info.base_timestamp;

    var content = msg.cmd + ':' + curr_offset + ':'+ msg.content ;
    content = content.replace('\n','');
    content = content +'\n';

    writefile(fd,content);
}

function record_data_1_start(app, user_info) {
    var path = config.prev_path + course_id;
    var file_path = path + '/' +course_id + '_1.json';

    mkdirsSync(path, null);

    fs.open(file_path, 'w', function(err,fd1){
        if(err){
            console.log('open file error:',err);
        }
        user_info.fd1 = fd1;
    })
}

function record_data_1_stop(app, user_info) {
    var fd1 = user_info.fd1;
    fs.close(fd1, function() {
        console.log('record_data_1_stop');
    });
}

function record_data_1(app, msg, user_info,username) {
    var fd = user_info.fd1;

    var curr_timestamp = new Date().getTime();
    var curr_offset = curr_timestamp - user_info.base_timestamp;

    var content = msg.cmd + ':' + curr_offset + ':'+ msg.content +':'+username;
    content = content.replace('\n','');
    content = content +'\n';

    writefile(fd,content);
}

function record_data_2_start(app, user_info) {
    var path = config.prev_path + course_id;
    var file_path = path + '/' +course_id + '_2.mp4';

    mkdirsSync(path, null);

    var spawn = require('child_process').spawn;
    var live_addr = config.live_addr + '/' + course_id;
    var ffmpeg_process = spawn(config.ffmpeg_path,
        ['-i', live_addr, '-vn', '-c:a', 'libaacplus', '-b:a', '40000', '-ar', '44100', '-ac', '2', '-f', 'mp4', '-y',file_path]);

    ffmpeg_process.stdout.on('data', function (data) {
        //console.log('stdout: ' + data);
    });

    ffmpeg_process.stderr.on('data', function (data) {
        //console.log('stderr: ' + data);
    });

    ffmpeg_process.on('close', function (code) {
        console.log('child process exited with code ' + code);
    });

    user_info.ffmpeg_process = ffmpeg_process;
}

function record_data_2_stop(app, user_info) {
    var ffmpeg_process = user_info.ffmpeg_process;
    ffmpeg_process.kill('SIGTERM');
    console.log('record_data_2_stop');
}

function writefile(fd,content){
    var buf = new Buffer(content);
    fs.write(fd, buf, 0, buf.length, null, function(err, written, buffer) {
        if(err) throw err;
        console.log(err, written, buffer);
    });
}