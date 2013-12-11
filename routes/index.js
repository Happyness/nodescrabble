
var express = require('express');
var app = express();

var io = require('socket.io-client'),
socket = io.connect('localhost', {port: app.get('port')});

socket.on('connect', function () { console.log("socket connected"); });
socket.emit('private message', { user: 'me', msg: 'whazzzup?' });
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Express' });
};

exports.indexPost = function(req, res) {
    if(req.body.uri == null || req.body.jsonData == null) {
        res.statusCode = 404;
        return res.send('Error 404: You need to specify both data and uri');
    }

    socket.emit(req.body.uri, req.body.jsonData);
    socket.on(req.body.uri, function (data) {
        console.log(data);
        res.render('index', { title: 'Express', response: data});
        return;
    });

    var request = require("request");
    var url = req.protocol + '://' + req.headers.host;

    if (req.port != null) {
        url += ':' + req.port;
    }

    url += '/' + req.body.uri;
    console.log("Sending data " + req.body.jsonData + " to url " + url);

    request.post({url: url, form: {"data" : req.body.jsonData}}, function(e, r, body) {
        console.log("Received data: " + body);
        if (!e && r.statusCode == 200)
            res.render('index', { title: 'Express', response: body});
    });
};