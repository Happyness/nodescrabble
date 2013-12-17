exports.socketindex = function(req, res) {
  res.render('sockettest', { title: 'Test socket' });
};

exports.socketPost = function(req, res) {
    console.log("try to connect");

    if(req.body.message == null || req.body.jsonData == null) {
        res.statusCode = 404;
        return res.send('Error 404: You need to specify both command and uri');
    }

    var io = require('socket.io-client');
    var socket = io.connect('http://localhost:3000');

    socket.on('connect', function(data) {
        socket.on('message', function (data) {
            console.log("socket connected");
            //res.render('sockettest', {title: 'Test socket', response: JSON.stringify(data)});

            var listenOn = req.body.message + '-response';
            socket.on(listenOn, function (data) {
                console.log("Got response");
                console.log(JSON.stringify(data));
                res.render('sockettest', { title: 'Express', response: JSON.stringify(data)});
            });
            socket.emit(req.body.message, req.body.jsonData);
        });
    });
};