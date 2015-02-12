// /////////////////////////////////////////////////////////////////////////////
// playback part
// 

var MJ = MJ || {};
MJ.playback = MJ.playback || function(){};

var is_pause = true;
var user_obj = {username:'s1', course_id: 0, is_pause: false, role: 'student'};
var is_start_playback = false;
//var file_info = {};
//var course_cache = {};
var video_duration = 0;
var interval_ms = 40;
var interval_handler = null;
var interval_handler_ui = null;
var mj_ajax = new CallBackObject();

var interval_function_ui = function () {
	var current_time = Number(document.getElementById("video1").currentTime)
			.toFixed(1);
	var duration = Number(document.getElementById("video1").duration)
			.toFixed(1);
	video_duration = duration;
	var whiteboard_container = document.getElementById('whiteboard_container');
	document.getElementById("curr_pos").innerHTML = get_time_str(current_time);
	document.getElementById("seek_bar_2").style.left = current_time / duration
			* (whiteboard_container.clientWidth) + 'px';

	if (document.getElementById("video1").ended) {
		clearInterval(interval_handler_ui);
		interval_handler_ui = null;
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
        control_pause_resume_playback();

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

			document.getElementById("video1").src = global_info.playback_addr;
			document.getElementById("video1").pause();
		} else {
            control_pause_resume_playback();
		}

		document.getElementById("video1").play();
		interval_handler_ui = setInterval(interval_function_ui, 1000);
	}
}

MJ.playback.prototype.can_play = function () {
	document.getElementById("range").innerHTML = get_time_str(Math.round(document
			.getElementById("video1").duration));

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

        mj_playback.start_playback_server();
        control_start_playback( global_info.course_id,total);
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

            control_seek_playback(pos*1000);
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
MJ.playback.prototype.start_playback_server = function (){
    var interval_function = function() {

        if (user_obj.is_playback && !user_obj.is_pause) {
            user_obj.curr_ms += interval_ms;

            for (; user_obj.playback_index < user_obj.playback_data.length; user_obj.playback_index++) {
                var data_ = user_obj.playback_data[user_obj.playback_index];

                var data_temp = data_.split(':');

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
                } else {
                    break;
                }
            }

            for (; user_obj.playback_index1 < user_obj.playback_data1.length; user_obj.playback_index1++) {
                var data1_ = user_obj.playback_data1[user_obj.playback_index1];
                var data_temp = data1_.split(':');
                if (data_temp[1] <= user_obj.curr_ms) {
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
    };

    if (interval_handler == null) {
        interval_handler = setInterval(interval_function, interval_ms);
    }
}

var stop_playback_server = function () {
    if (interval_handler != null) {
        clearInterval(interval_handler);
        interval_handler = null;
    }
}

var control_start_playback = function(course_id,total) {

    console.log('start_playback', course_id);
    document.getElementById('historyMsg').innerHTML = '';

    user_obj.playback_index = 0;
    user_obj.playback_index1 = 0;
    user_obj.curr_ms = 0;
    user_obj.course_id = course_id;

    var course_id = user_obj.course_id;

    if(user_obj.playback_data !== undefined) {
        /*user_obj.playback_data = course_cache.playback_data;
        user_obj.playback_data1 = course_cache.playback_data1;
        user_obj.total_ms = course_cache.total_ms;*/
        user_obj.is_playback = true;
        user_obj.is_pause = false;
        return;
    }

    var path = "data/" + course_id ;
    user_obj.file = path + '/' +course_id + '_0.json';
    user_obj.file1 = path + '/' +course_id + '_1.json';
    user_obj.file2 = path + '/' +course_id + '_2.mp4';

    // if no cache
    //course_cache = {};
    var total0_ms = 0;
    var total1_ms = 0;
    var total2_ms = total;
    var file = user_obj.file;
    var file1 = user_obj.file1;
    var file2 = user_obj.file2;

    console.log('readfile', file);
    console.log('readfile1', file1);

    readFile(file, function(err, obj) { // read file
        if(err) {
            return;
        }

        user_obj.playback_data = obj;

        if(obj.length > 0) {
            total0_ms = obj[obj.length - 2].split(':')[1];
        }else{
            total0_ms = 0;
        }

        readFile(file1, function(err, obj) { // read file1
            if(err) {
                return;
            }

            user_obj.playback_data1 = obj;

            if(obj.length > 1) {
                total1_ms = obj[obj.length - 2].split(':')[1];
            }else{
                total1_ms = 0;
            }

            user_obj.total_ms = total0_ms > total1_ms ? total0_ms : total1_ms;
            user_obj.total_ms = total2_ms > user_obj.total_ms ? total2_ms : user_obj.total_ms;

            /*user_obj.playback_data = course_cache.playback_data;
            user_obj.playback_data1 = course_cache.playback_data1;
            user_obj.total_ms = course_cache.total_ms;*/
            user_obj.is_playback = true;
            user_obj.is_pause = false;

            console.log('all total:', total0_ms, total1_ms, total2_ms, user_obj.total_ms);
        });
    });
}

function readFile(file, cb) {
    function createRequest()
    {
        var cbo = new CallBackObject();
        cbo.OnComplete = Cbo_Complete;
        cbo.onError = Cbo_Error;
        cbo.DoCallBack(file);
    }

    function Cbo_Complete(responseText, responseXML)
    {
        cb(null,responseText.split('\n'));
    }

    function Cbo_Error(status, statusText, responseText)
    {
        cb(status, null);
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

var control_pause_resume_playback = function() {

    console.log('pause_resume_playback', user_obj.is_pause);

    user_obj.is_pause = is_pause;

}

var control_seek_playback = function(pos) {
    console.log('seek_playback', pos);

    reset_draw_ppt();

    if(!user_obj.is_playback) {
        return;
    }

    user_obj.is_playback = false;

    var seek_pos = parseInt(pos);
    var ppt_index = 0;
    var whiteboard_index = 0;
    var whiteboard_ts = 0;

    var chat_index = 0;
    var chat_ts = 0;

    for(var i=0; i < user_obj.playback_data.length; i++){
        var playback_data = user_obj.playback_data[i].split(':');
        var type = playback_data[0];
        var ts = playback_data[1];

        if(ts >= seek_pos){
            whiteboard_index = i;
            whiteboard_ts = ts;
            break;
        }

        if(type === 'prev' || type === 'next') {
            ppt_index = i;
            console.log('type:', type, 'ppt_index:', ppt_index);
        }
    }

    for(var i=0; i < user_obj.playback_data1.length; i++){
        var playback_data1 = user_obj.playback_data1[i].split(':');
        var ts = playback_data1[1];

        if(ts >= seek_pos){
            chat_index = i;
            chat_ts = ts;
            break;
        }
    }

    console.log('ppt_index:', ppt_index, 'whiteboard_index:', whiteboard_index, 'chat_index:', chat_index);

    user_obj.curr_ms = seek_pos;
    user_obj.playback_index = ppt_index;
    user_obj.playback_index1 = chat_index;
    user_obj.is_playback = true;

    document.getElementById('historyMsg').innerHTML = '';
}


var mj_playback = new MJ.playback();

mj_playback.init_play_back();

