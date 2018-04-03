var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sanitizeHtml = require('sanitize-html');

var mensagens = [];

var sanitize = function(data) {
    return sanitizeHtml(data, {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'mark', 'small', 'del', 'ins', 'sub', 'sup', 'a' ],
        allowedAttributes: {
            'a': [ 'href' ]
        },
        allowedIframeHostnames: ['www.youtube.com']
    });
};

var sendOldMessages = function(socket) {
    mensagens.forEach(element => {
        socket.emit('chat message', element);
    });
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    sendOldMessages(socket);
    socket.on('login', function(nick) {
        if (nick) {
            io.emit('login', nick);
        }
    });
    socket.on('chat message', function(msg){
        msg.mensagem = sanitize(msg.mensagem);
        msg.nick = sanitize(msg.nick);
        if (msg.mensagem && msg.nick) {
            io.emit('chat message', msg);
            mensagens.push(msg);
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});