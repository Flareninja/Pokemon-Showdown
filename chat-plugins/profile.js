/* Profile chat-plugin 
 * by jd, modified by panpawn
 */
var serverIp = '167.114.155.242';
var http = require('http');

exports.commands = {
	profile: function(target, room, user) {
		console.log('boop');
		if (!target) target = user.name;
		if (toId(target).length > 19) return this.sendReply("Usernames may not be more than 19 characters long.");
		if (toId(target).length < 1) return this.sendReply(target + " is not a valid username.");
		if (!this.canBroadcast()) return;
		
		var targetUser = Users.get(target);
		console.log('boop2');
		
		if (!targetUser) {
			var username = target;
			var userid = toId(target);
			var online = false;
			var avatar = (Config.customavatars[userid] ? "http://" + serverIp + ":" + Config.port + "/avatars/" + Config.customavatars[userid] : "http://play.pokemonshowdown.com/sprites/trainers/167.png");
			console.log('boop3');
		} else {
			var username = targetUser.name;
			var userid = targetUser.userid;
			var online = targetUser.connected;
			var avatar = (isNaN(targetUser.avatar) ? "http://" + serverIp + ":" + Config.port + "/avatars/" + targetUser.avatar : "http://play.pokemonshowdown.com/sprites/trainers/" + targetUser.avatar + ".png");
			console.log('boop4');
		}

    	if (Users.usergroups[userid]) {
			var userGroup = Users.usergroups[userid].substr(0,1);
			if (Config.groups[userGroup]) userGroup = Config.groups[userGroup].name; 
		} else {
			var userGroup = 'Regular User';
		}
		console.log('boop5');

		var self = this;
		var bucks = economy.readMoney(userid)
			console.log('boop6');
			var options = {
				host: "pokemonshowdown.com",
				port: 80,
				path: "/users/" + userid
			};

			var content = "";
			var req = http.request(options, function(res) {
				console.log('boop7');

				res.setEncoding("utf8");
				res.on("data", function (chunk) {
					content += chunk;
				});
				res.on("end", function () {
					content = content.split("<em");
					if (content[1]) {
						content = content[1].split("</p>");
						if (content[0]) {
							content = content[0].split("</em>");
							if (content[1]) {
								regdate = content[1].trim();
								console.log('boop8');
								showProfile();
							}
						}
					} else {
						console.log('boop9');
						regdate = '(Unregistered)';
						showProfile();
					}
				});
			});
			req.end();

			function showProfile() {
				console.log('boop10');
				var seenOutput = '';
				if (!Gold.seenData[userid]) seenOutput = "Never";
				var date = new Date(Gold.seenData[userid]);
				if (Gold.seenData[userid]) {
					seenOutput = date.toUTCString() + " ";
					var seconds = Math.floor(((Date.now() - Gold.seenData[userid]) / 1000));
					var minutes = Math.floor((seconds / 60));
					var hours = Math.floor((minutes / 60));
					var days = Math.floor((hours / 24));

					var secondsWord = (((seconds % 60) > 1 || (seconds % 60) == 0) ? 'seconds' : 'second');
					var minutesWord = (((minutes % 60) > 1 || (minutes % 60) == 0) ? 'minutes' : 'minute');
					var hoursWord = ((hours > 1 || hours == 0) ? 'hours' : 'hour');
					var daysWord = ((days === 1) ? 'day' : 'days');

					if (minutes < 1) {
						seenOutput += " (" + seconds + " " + secondsWord + " ago)";
					}
					if (minutes > 0 && minutes < 60) {
						seenOutput += " (" + minutes + " " + minutesWord + " ago)";
					}
					if (hours > 0 && days < 1) {
						seenOutput += " (" + hours + " " + hoursWord + " " + (minutes % 60) + " " + minutesWord + " ago)";
					}
					if (days > 0) {
						seenOutput += " (" + days + " " + daysWord + " ago)";
					}
		
				}
					
				var profile = '';
				profile += '<img src="' + avatar + '" height=80 width=80 align=left>';
				profile += '&nbsp;<font color=#24678d><b>Name: </font><b><font color="' + Gold.hashColor(toId(username)) + '">' + Tools.escapeHTML(username) + '</font></b><br />';
				profile += '&nbsp;<font color=#24678d><b>Registered: </font></b>' + regdate + '<br />';
				if (!Gold.hasBadge(userid,'vip')) profile += '&nbsp;<font color=#24678d><b>Rank: </font></b>' + userGroup + '<br />';
				if (Gold.hasBadge(userid,'vip')) profile += '&nbsp;<font color=#24568d><b>Rank: </font></b>' + userGroup + ' (<font color=#6390F0><b>VIP User</b></font>)<br />';
				if (bucks) profile += '&nbsp;<font color=#24678d><b>Bucks: </font></b>' + bucks + '<br />';
				if (online) profile += '&nbsp;<font color=#24678d><b>Last Online: </font></b><font color=green>Currently Online</font><br />';
				if (!online) profile += '&nbsp;<font color=#24678d><b>Last Online: </font></b>' + seenOutput + '<br />';
				profile += '<br clear="all">';
				self.sendReplyBox(profile);
				room.update();
			}
	},
};