
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var response = require('./routes/response');
var http = require('http');
var path = require('path');
var db = require('./model/db');
var socketio = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.getUsers);
app.get('/adduser', user.viewAddUser);
app.post('/adduser', user.addUser);
app.post('/', routes.indexPost);
app.post('/move', response.move);
app.get("/chat", function(req, res){
    res.render("chat");
});
app.get("/game", function(req, res){
    res.render("game");
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

socketio.listen(server).on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to nodescrabble'});
    socket.on('send', function (data) {
        socket.emit('message', data);
        socket.broadcast.emit('message', data);
    });
});
