
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var socketRoute = require('./routes/socket');
var response = require('./routes/response');
var http = require('http');
var path = require('path');
var db = require('./model/db');
var socketio = require('socket.io');
var Stately = require('stately.js');
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

var clientstate = Stately.machine({
    'CONNECTED': {
        'creategame': 'WAITING',
        'joingame': 'INGAME'
    },
    'WAITING': {
        'playerjoined': 'INGAME'
    },
    'INGAME': {
        'yourturn': 'WAITMOVE',
        'gameended': 'ENDGAME'
    },
    'ENDGAME': {
        'playerquit': 'CONNECTED'
    },
    'WAITMOVE': {
        'play': 'INGAME'
    }
});

app.get("/game", function(req, res) {
    //req.session.clientstate = clientstate;
    res.render("game");
});

app.get("/socket", socketRoute.socketindex);
app.post("/socket", socketRoute.socketPost);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = socketio.listen(server);

io.configure(function() {
    // Restrict log output
    io.set("log level", 2);
});

ServerController = require('./ServerController').ServerController;
var controller = new ServerController();

io.sockets.on('connection', function (client) {
    console.log("Got connection from client");

    // Socket disconnection
    client.on("disconnect", function(data) {
        controller.clientDisconnected(client);
    });

    if ('development' != app.get('env')) {
        client.emit('message', { message: 'welcome to nodescrabble'});
    }

    client.on('quit', function (data) {
        controller.quitGame(data);
    });

    client.on('playmove', function(data) {
        controller.makeMove(client, data);
    });

    client.on('startgame', function (data) {
        console.log('Try to start game');
        controller.startGame(client, data);
    });

    client.on('games', function (data) {
        controller.getGames(client, data);
    });

    client.on('initgame', function(data) {
        console.log('Try to init game');
        controller.initGame(client, data);
    });
    client.on('joingame', function(data) {
        console.log('Try to join game');
        var session = controller.joinGame(client, data);

        if (session != false) {
            var state = session.getState();
            state.completeSession();
            state.onINGAME = function (event, oldState, newState) {

            }
        }
    });
});
