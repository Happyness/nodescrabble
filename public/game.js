var client = require('clientstate');

window.onload = function() {
    var messages = [];
    var socket = io.connect('http://localhost:3000');
    var gameTable = document.getElementById("gameTable");
    var sendButton = document.getElementById("sendButton");
    var content = document.getElementById("content");

    client.onleaveSTOPPED = function (event, oldState, newState) {
        // ...
    };

    client.onenterSTOPPED = function (event, oldState, newState) {
        // ...
    };

    client.onPLAYING = function (event, oldState, newState) {
        console.log("now playing radio");
    };

    client.onPAUSED = function (event, oldState, newState) {
        // ...
    };

    client.play();

    socket.on('message', function(data){
        if(data.message) {
            messages.push(data.message);
            var html = '';
            for (var i= 0; i < messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    sendButton.onclick = function(){
        var text = field.value;
        socket.emit('send', { message: text});
    };
};