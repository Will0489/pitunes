var Bot = require('slackbots');
var https = require('https');

var settings = {
    token : '',
    name : 'Pitunes'
}
var channel_name = 'djrazzberr-e';
var api_key = 'AIzaSyAUcjLbu9Nr1-0M4bEPegTUJ_yNJKWU1C8';

var keywords = ['add', 'remove', 'pause', 'play', 'help', 'list'];
var params = {
    icon_emoji : ':lunar:',
    unfurl_links : false,
    unfurl_media: false
}

var queue = [];


var bot = new Bot(settings);

bot.on('start', function() {
    bot.postMessageToChannel(channel_name, 'Hi there, I\'m ready to roll!', params);
});

bot.on('message', function(data) {
    switch(data.type) {
        case 'hello' :
            console.log('Received a hello event from Slack!');
            break;
        case 'reconnect_url' :
            console.log('Received a new reconnect url from Slack!');
            break;
        case 'presence_change' :
            console.log('Presence changed to ' + data.presence);
            break;
        default:
            console.log('Received an unknown message: ' + data.type);
            break;
    }

    if(data.type === 'message') {
        if (data.channel === 'C1QFGLU00') {
            console.log('Received message: ' + data.text);
            if (data.text.indexOf('@U1QF3N3HS') !== -1) {
                console.log('I was tagged!');
                var incoming = data.text;
                var message = incoming.split(" ");

                if (keywords.indexOf(message[1]) === -1) {
                    bot.postMessageToChannel(channel_name, 'I\'m sorry but I didn\'t get that. If you need help with my commands, you can view them by tagging me with help e.g. @pitunes help', params);
                } else {
                    console.log('Valid keyword ' + message[1]);
                    switch (message[1]) {
                        case 'help' :
                            bot.postMessageToChannel(channel_name, 'TODO: HELP MESSAGE', params);
                            break;
                        case 'list' :
                            var list = '';
                            if(queue.length > 0) {
                                list = 'Current playlist:\n';
                                queue.forEach(function (track, index) {
                                    var position = index + 1;
                                    list += (position + '. <' + track.url + '|' + track.title + '\n');
                                });
                            } else {
                               list = 'There a no tracks in queue right now';
                            }
                            bot.postMessageToChannel(channel_name, list, params);
                            break;
                        case 'pause' :
                            bot.postMessageToChannel(channel_name, 'Pausing the current track. Send @pitunes play to continue playing', params);
                            break;
                        case 'play' :
                            bot.postMessageToChannel(channel_name, 'Playing the current track!', params);
                            break;
                        case 'add' :
                            if (message[2].indexOf('youtube.com') !== -1) {
                                bot.postMessageToChannel(channel_name, 'Added your track to the queue', params);
                                var regex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

                                var id =  message[2].match(regex)[1];
                                id = id.replace(">", "");
                                console.log('Found the following ID ' + id);
                                var responseBody = [];
                                var request = https.get('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + id +'&key=' + api_key, function(response) {
                                    response.on('data', function(partial) {
                                        responseBody.push(partial);
                                    }).on('end', function() {
                                        var body = Buffer.concat(responseBody);
                                        body = JSON.parse(body.toString());
                                        queue.push({title : body.items[0].snippet.title, url : message[2], id : id});
                                    });
                                });

                                request.on('error', function(e) {
                                    console.log('Error: ' + e.message);
                                });
                            } else {
                                bot.postMessageToChannel(channel_name, 'The link you supplied is not a valid youtube url', params);
                            }
                            break;
                        case 'remove' :
                            if (!isNaN(parseInt(message[2]) && parseInt(message[2]) <= queue.length)) {
                                var index = parseInt(message[2]) - 1;
                                console.log(queue);
                                var removed = queue[index].title;
                                queue.splice(index, 1);
                                bot.postMessageToChannel(channel_name, 'Removed "' + removed + '" from the queue', params);
                            }
                    }
                }
            } else {
                console.log('I was not tagged in that message');
            }
        } else {
            console.log('Message was in a different channel, ignore');
        }
    }
});
