
var socket = require('socket.io-client').connect('http://localhost:3000');

socket.on('connect', function(data) {
    console.log("connected");
});

exports.socketindex = function(req, res) {
  res.render('sockettest', { title: 'Test socket' });
};

exports.socketPost = function(req, res) {
    console.log("try to connect");

    if(req.body.message == null || req.body.jsonData == null) {
        res.statusCode = 404;
        return res.send('Error 404: You need to specify both command and uri');
    }

    socket.removeAllListeners();

            var listenOn = req.body.message + '-response';
            socket.on(listenOn, function (data) {
                console.log("Got response");
                res.render('sockettest', { title: 'Express', response: JSON.stringify(data)});
            });
            console.log(req.body.jsonData);
            socket.emit(req.body.message, JSON.parse(req.body.jsonData));
};