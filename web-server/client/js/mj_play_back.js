// /////////////////////////////////////////////////////////////////////////////
// playback part
// 

var MJ = MJ || {};
MJ.playback = MJ.playback || function(){};

var is_pause = true;
var usernames = {};
var user_obj = {};
user_obj.username = 's1';
//user_obj.socket = socket;
user_obj.course_id = 0;
user_obj.is_pause = false;
user_obj.role = 'student';
usernames[user_obj.username] = user_obj;
var is_start_playback = false;

var file_db = {};
var course_cache = {};

var interval_ms = 40;
var interval_handler = null;
var interval_handler_client = null;

var mj_ajax = new CallBackObject();

var interval_function_client = function () {
	var current_time = Number(document.getElementById("video1").currentTime)
			.toFixed(1);
	var duration = Number(document.getElementById("video1").duration)
			.toFixed(1);
	var whiteboard_container = document.getElementById('whiteboard_container');
	document.getElementById("curr_pos").innerHTML = get_time_str(current_time);
	document.getElementById("seek_bar_2").style.left = current_time / duration
			* (whiteboard_container.clientWidth) + 'px';

	if (document.getElementById("video1").ended) {
		clearInterval(interval_handler_client);
		interval_handler_client = null;
		console.log('ended');

		document.getElementById("seek_bar_2").style.left = 0 + 'px';
		seek_bar_2.style.display = 'block';
		document.getElementById('play_pause').src = 'img/play.png';

		is_pause = true;
		is_start_playback = false;
	}
}

MJ.playback.prototype.play_pause = function () {
	var course_id = global_info.course_id;
	var play_pause = document.getElementById('play_pause');

	if (!is_pause) {
		play_pause.src = 'img/play.png';
		is_pause = true;
        control_pause_resume_playback(is_pause,user_obj);
//		socket.emit('pause_resume_playback', {
//			is_pause : is_pause
//		});*/
		document.getElementById("video1").pause();
	} else {

		play_pause.src = 'img/pause.png';
		is_pause = false;

		var seek_bar_ele = document.getElementById("seek_bar_2");
		var seek_bar_value = seek_bar_ele.style.left;
		console.log('seek_bar_left', seek_bar_value);
		if (seek_bar_value === '0px') {

			pageNum = 1;
			queueRenderPage(pageNum);

			/*
			 * var pos = 0; socket.emit('seek_playback', { pos : pos });
			 */
			document.getElementById("video1").src = global_info.playback_addr;
			document.getElementById("video1").pause();
			document.getElementById("video1").play();
			interval_handler_client = setInterval(interval_function_client, 1000);
		} else {
//			socket.emit('pause_resume_playback', {
//				is_pause : is_pause
//			});
            control_pause_resume_playback(is_pause,user_obj);
			document.getElementById("video1").play();
		}
	}
}

MJ.playback.prototype.can_play = function () {
	document.getElementById("range").innerHTML = get_time_str(Math.round(document
			.getElementById("video1").duration));

	// var volume = document.getElementById('video1').volume;
	document.getElementById('video1').volume = playback_volume;

	var volume_bar_bg = document.getElementById('volume_bar_bg');
	var volume_bar_1 = document.getElementById('volume_bar_1');
	var volume_bar_2 = document.getElementById('volume_bar_2');
	volume_bar_1.style.width = volume_bar_bg.clientWidth
			* playback_volume + 'px';
	volume_bar_2.style.left = volume_bar_1.clientWidth - 5 + 'px';

	onActivityLevel(playback_volume * 100);

	if (!is_start_playback) {
		var total = (document.getElementById("video1").duration * 1000)
				.toFixed(0);
//		socket.emit('start_playback', {
//			course_id : global_info.course_id,
//			total : total
//		});
        control_start_playback( global_info.course_id,total,user_obj);
		is_start_playback = true;
	}
}

MJ.playback.prototype.init_play_back = function () {
	document.getElementById("video1").addEventListener("canplay", this.can_play);
	document.getElementById('play_pause').addEventListener('click', this.play_pause);

	// seek_bar seek
	if (global_info.biz_type === 'playback' || global_info.biz_type === 'live'
			|| global_info.biz_type === 'record') {

		function seek_bar_mouse_down(e) {
			console.log(e);
			seek_bar_2.style.left = e.offsetX - 5 + 'px';
			seek_bar_2.style.display = 'block';
			send_seek(e.offsetX - 5);
		}

		function seek_bar_mouse_up(e) {
			console.log(e);
			seek_bar_2.style.display = 'block';
			seek_bar_2.style.left = e.offsetX - 5 + 'px';
		}

		function send_seek(e) {
			var curr_x = e;
			var total = document.getElementById("video1").duration;
			var bili = curr_x
					/ document.getElementById('whiteboard_container').clientWidth;
			var pos = (total * bili).toFixed(0);
			console.log('pos', pos);
//			socket.emit('seek_playback', {
//				pos : pos * 1000
//			});
            control_seek_playback(pos*1000,user_obj);
			document.getElementById("curr_pos").innerHTML = get_time_str(Number(pos));
			document.getElementById("video1").currentTime = pos;
		}

		document.getElementById('seek_bar_bg').addEventListener('mousedown',
				seek_bar_mouse_down);
		document.getElementById('seek_bar_bg').addEventListener('mouseup',
				seek_bar_mouse_up);
		document.getElementById('seek_bar_1').addEventListener('mousedown',
				seek_bar_mouse_down);
		document.getElementById('seek_bar_1').addEventListener('mouseup',
				seek_bar_mouse_up);

		function volume_bar_mouse_down(e) {
			console.log(e);
			volume_bar_2.style.left = e.offsetX - 5 + 'px';
			volume_bar_2.style.display = 'block';
			send_volume_seek(e.offsetX - 5);
		}

		function volume_bar_mouse_up(e) {
			console.log(e);
			volume_bar_2.style.display = 'block';
			volume_bar_2.style.left = e.offsetX - 5 + 'px';
		}

		function send_volume_seek(e) {
			var curr_x = e;
			document.getElementById("volume_bar_1").style.width = curr_x + 'px';

			var total = 1.0;
			var seek_bar_bg_w = document.getElementById('volume_bar_bg').clientWidth;
			var bili = Number((curr_x / seek_bar_bg_w).toFixed(1));
			var pos = Number((total * bili).toFixed(2));

			if (global_info.biz_type === 'record') {
				// var rtmpLiveEncoder = document.getElementById('RtmpLiveEncoder');
				// rtmpLiveEncoder.set_volume(pos);
			} else if (global_info.biz_type === 'playback') {
				var video = document.getElementById('video1');
				playback_volume = pos;
				video.volume = pos;
				onActivityLevel(pos * 100);
			} else if (global_info.biz_type === 'live') {
				var player_id = document.getElementById('player_id');
				player_id.set_volume(bili);
				// console.log(total, seek_bar_bg_w, curr_x, bili, pos);
				onActivityLevel(pos * 100);
			}

		}

		document.getElementById('volume_bar_bg').addEventListener('mousedown',
				volume_bar_mouse_down);
		document.getElementById('volume_bar_bg').addEventListener('mouseup',
				volume_bar_mouse_up);
		document.getElementById('volume_bar_1').addEventListener('mousedown',
				volume_bar_mouse_down);
		document.getElementById('volume_bar_1').addEventListener('mouseup',
				volume_bar_mouse_up);
	}
}

// ///////////////////////////////////////////////////////////////////////////
//
// server
//
MJ.playback.prototype.start_playback_server = function (usernames){
    var interval_function = function() {
        for ( var key in usernames) {
            var user_obj = usernames[key];

            if (user_obj.is_playback && !user_obj.is_pause) {
                user_obj.curr_ms += interval_ms;

                for (; user_obj.playback_index < user_obj.playback_data.length; user_obj.playback_index++) {
                    var data_ = user_obj.playback_data[user_obj.playback_index];

                    var data_temp = data_.split(':');

                    // console.log(data_.ts, user_obj.curr_ms);
                    if (data_temp[1] <= user_obj.curr_ms) {
                        switch (data_temp[0]){
                            case "prev":
                                prev_handler(data_temp[2]);
                                break;
                            case "next":
                                next_handler(data_temp[2]);
                                break;
                            case "mousemove":
                                mousemove_handler(data_temp[2]);
                                break;
                            case "mouseup":
                                mouseup_handler(data_temp[2]);
                                break;
                            case "mousedown":
                                mousedown_handler(data_temp[2]);
                                break;
                        }
//                        user_obj.socket.emit(data_.type, data_.data);
                    } else {
                        break;
                    }
                }

                for (; user_obj.playback_index1 < user_obj.playback_data1.length; user_obj.playback_index1++) {
                    var data1_ = user_obj.playback_data1[user_obj.playback_index1];
                    var data_temp = data1_.split(':');
                    if (data_temp[1] <= user_obj.curr_ms) {
//                        user_obj.socket.emit('new message', data1_.data);
                        //new_message( data1_.data);
                        _displayNewMsg(data_temp[3], data_temp[2]);
                    } else {
                        break;
                    }
                }

                if (user_obj.curr_ms >= user_obj.total_ms) {
                    user_obj.is_playback = false;
                    user_obj.playback_index = 0;
                    user_obj.playback_index1 = 0;
                    user_obj.curr_ms = 0;
                }

            } // if
        } // for
    };

    if (interval_handler == null) {
        interval_handler = setInterval(interval_function, interval_ms);
    }
}

var new_message = function(e){
    console.log('new message');
    _displayNewMsg(e.username, e.message);
}
var prev = function(e){
    console.log('prev', e.pageNum);
    var pageNum = e.pageNum;
    queueRenderPage(pageNum);
}
var next = function(e){
    console.log('next', e.pageNum);
    var pageNum = e.pageNum;
    queueRenderPage(pageNum);
}

var mousedown = function(e){
    console.log('mousedown');
    pp = true;
    var mouseX = e.mouseX;
    var mouseY = e.mouseY;
    ctx.moveTo(mouseX, mouseY);
}

var mouseup = function(e){
    console.log('mouseup');
    pp = e.pp;
}

var mousemove = function(e){
    console.log('mousemove');
    var mouseX = e.mouseX;
    var mouseY = e.mouseY;
    pp = e.pp;
    if (pp) {
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
    }
}


var stop_playback_server = function () {
    if (interval_handler != null) {
        clearInterval(interval_handler);
        interval_handler = null;
    }
}

var control_start_playback = function(course_id,total,user_obj) {

    console.log('start_playback', course_id);
    var user_obj =user_obj;

    if(user_obj === undefined) {
        return ;
    }

    user_obj.playback_index = 0;
    user_obj.playback_index1 = 0;
    user_obj.curr_ms = 0;
    user_obj.course_id = course_id;

    var course_id = user_obj.course_id;

    if(course_cache[course_id] !== undefined) {
        user_obj.playback_data = course_cache[course_id].playback_data;
        user_obj.playback_data1 = course_cache[course_id].playback_data1;
        user_obj.total_ms = course_cache[course_id].total_ms;
        user_obj.is_playback = true;
        user_obj.is_pause = false;
        return;
    }

    file_db[course_id] = {};
    var path = "data/" + course_id ;
    file_db[course_id].file = path + '/' +course_id + '_0.json';
    file_db[course_id].file1 = path + '/' +course_id + '_1.json';
    file_db[course_id].file2 = path + '/' +course_id + '_2.mp4';

    // if no cache
    course_cache[course_id] = {};
    var total0_ms = 0;
    var total1_ms = 0;
    var total2_ms = total;
    var file = file_db[course_id].file;
    var file1 = file_db[course_id].file1;
    var file2 = file_db[course_id].file2;

    console.log('readfile', file);
    console.log('readfile1', file1);

    readFile(file, function(err, obj) { // read file
        if(err) {
            return;
        }

        course_cache[course_id].playback_data = obj;

        if(obj.length > 0) {
            total0_ms = obj[obj.length - 1].ts;
        }

        readFile(file1, function(err, obj) { // read file1
            if(err) {
                return;
            }

            course_cache[course_id].playback_data1 = obj;

            if(obj.length > 0) {
                total1_ms = obj[obj.length - 1].ts;
            }

            course_cache[course_id].total_ms = total0_ms > total1_ms ? total0_ms : total1_ms;
            course_cache[course_id].total_ms = total2_ms > course_cache[course_id].total_ms ? total2_ms : course_cache[course_id].total_ms;

            user_obj.playback_data = course_cache[course_id].playback_data;
            user_obj.playback_data1 = course_cache[course_id].playback_data1;
            user_obj.total_ms = course_cache[course_id].total_ms;
            user_obj.is_playback = true;
            user_obj.is_pause = false;

            console.log('all total:', total0_ms, total1_ms, total2_ms, user_obj.total_ms);
        });
    });
}

function readFile(file, cb) {
    function createRequest()
    {
        //var name = escape(document.getElementById("name").value);
        var cbo = new CallBackObject();
        cbo.OnComplete = Cbo_Complete;
        cbo.onError = Cbo_Error;
        cbo.DoCallBack(file);
    }

    function Cbo_Complete(responseText, responseXML)
    {
        //cb(null, JSON.parse(responseText))
        cb(null,responseText.split('\n'));
        //alert(responseText);
    }

    function Cbo_Error(status, statusText, responseText)
    {
        cb(status, null);
        //alert(responseText);
    }

    createRequest();
}

/*var control_stop_playback = function(data, socket) {

    console.log('stop_playback', data);
    var user_obj = socket.user_obj;

    if(user_obj === undefined) {
        return;
    }

    user_obj.is_playback = false;
    user_obj.is_pause = false;
    user_obj.playback_index = 0;
    user_obj.playback_index1 = 0;
    user_obj.curr_ms = 0;

}*/

var control_pause_resume_playback = function(is_pause, user_obj) {

    console.log('pause_resume_playback', is_pause);
    var is_pause = is_pause;
    var user_obj = user_obj;

    if(user_obj === undefined) {
        return;
    }

    user_obj.is_pause = is_pause;

}

var control_seek_playback = function(pos, user_obj) {

    console.log('seek_playback', pos);
    var user_obj = user_obj;

    if(user_obj === undefined || !user_obj.is_playback) {
        return;
    }

    user_obj.is_playback = false;

    var seek_pos = parseInt(pos);
    //console.log('seek_pos', seek_pos);
    var old_ppt_index = 0;
    var old_whiteboard_index = 0;
    var whiteboard_ts = 0;
    var old_chat_index = 0;
    var chat_ts = 0;

    for(var i=0; i < user_obj.playback_data.length; i++){
        var ts = user_obj.playback_data[i].ts;
        var type = user_obj.playback_data[i].type;

        if(type === 'prev' || type === 'next') {
            old_ppt_index = i;
        }

        if(ts >= seek_pos){
            old_whiteboard_index = i;
            whiteboard_ts = user_obj.playback_data[i].ts;
            break;
        }
    }

    for(var i=0; i < user_obj.playback_data1.length; i++){
        var ts = user_obj.playback_data1[i].ts;

        if(ts >= seek_pos){
            old_chat_index = i;
            chat_ts = user_obj.playback_data1[i].ts;
            break;
        }
    }

    //user_obj.curr_ms = whiteboard_ts > chat_ts ? whiteboard_ts : chat_ts;
    user_obj.curr_ms = seek_pos;
    user_obj.playback_index = old_ppt_index;
    user_obj.playback_index1 = old_chat_index;
    user_obj.is_playback = true;

}


var mj_playback = new MJ.playback();

mj_playback.init_play_back();
mj_playback.start_playback_server(usernames);
