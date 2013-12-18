/**************************************************
 ** GAME VARIABLES
 **************************************************/
var socket;
var player;
var board;
var tiles;
var sendButton;
var passButton;
var swapButton;
var gameTable;

/**************************************************
 ** GAME INITIALISATION
 **************************************************/
function init() {

    console.log("Init");

    // Init ui
    // sendButton = document.getElementById("sendButton");
    // passButton = document.getElementById("passButton");
    // swapButton = document.getElementById("swapButton");
    // joinButton = document.getElementById("joinButton");
    // createGameButton = document.getElementById("createGameButton");

    // Keep track of tiles, letters, session and id
    player = new Player();

    // Keep track of game board
    board = [];

    // Connect to server
    socket = io.connect('http://nodescrabbler.herokuapp.com/');

    setEventHandlers();
}

/**************************************************
 ** GAME EVENT HANDLERS
 **************************************************/
var setEventHandlers = function() {

    console.log("setEventHandlers");

    // Socket connection successful
    socket.on("connect", onSocketConnected);

    // On init game response
    socket.on("initgame-response", onInitGameResponse);

    // On game joined
    socket.on("joingame-response", onJoinGameResponse);

    // Socket disconnection
    socket.on("disconnect", onSocketDisconnect);

    // On get scores
    socket.on("scores-response", onGetScoresResponse);

    // On get board
    socket.on("board-response", onGetBoardResponse);

    // On get tile
    socket.on("tile-response", onGetTileResponse);

    // On error
    socket.on("error", onErrorMessage);

    // Game started
    socket.on("game-started", onGameStarted);

    // On move response
    socket.on("move-response", onMoveResponse);

    // On game board update
    socket.on("update-board", onUpdateBoard);

    // Game ended
    socket.on("game-ended", onGameEnded);

    // Server message
    socket.on("message", onServerMessage);

    // Update from server
    socket.on("update", onUpdate);

}

/**************************************************
 ** UPDATES FROM SERVER
 **************************************************/
function onUpdate(data) {
    console.log("On Update");

    // TODO: check for type of update and calculate next move
    switch(data.type) {
        case 'gamelist':
            updateGameList(data);
            break;
        default :
            break;
    }
};

function updateGameList(data) {
    console.log("updateGameList()")
    var gamesSelect = document.getElementById("gamesSelect");
    gamesSelect.options.length = 0;
    var games = JSON.parse(data.games);
    for (var i = 0; i < games.length; i++) {
        var value = games[i].sessionid;
        gamesSelect.options.add(new Option(value, value))
    }
}





/**************************************************
 ** ON SOCKET EVENTS
 **************************************************/

// Socket connection successful
function onSocketConnected() {
    console.log("Connected to socket");
}

// On init game response
function onInitGameResponse(data) {
    console.log("Init game response");

    if(data.result == "success") {
        player.setId(data.playerid);
        player.setSession(data.sessionid);

        var header = document.getElementById('header');
        var controls = document.getElementById('controls');
        var select = document.getElementById('select');
        var joinButton = document.getElementById('joinButton');
        var createGameButton = document.getElementById('createGameButton');
        var gamesSelect = document.getElementById('gamesSelect');

        header.innerHTML = "Waiting for player...";

        select.removeChild(gamesSelect);
        controls.removeChild(joinButton);
        controls.removeChild(createGameButton);


        console.log("Player id: " + player.getId());
        console.log("Session id: " + player.getSession());
    }
    else {
        alert(data.message);
    }
}

// On game joined
function onJoinGameResponse(data) {
    console.log("Joined game response");

    if(data.result == "success") {
        player.setId(data.id);
        player.setSession(data.sessionid);

        var header = document.getElementById('header');
        var controls = document.getElementById('controls');
        var select = document.getElementById('select');
        var joinButton = document.getElementById('joinButton');
        var createGameButton = document.getElementById('createGameButton');
        var gamesSelect = document.getElementById('gamesSelect');

        header.innerHTML = "Joined game, waiting for server to start game...";

        select.removeChild(gamesSelect);
        controls.removeChild(joinButton);
        controls.removeChild(createGameButton);


        console.log("Player id: " + player.getId());
        console.log("Session id: " + player.getSession());

        // TODO: tell server we're ready for game?
    }
    else {
        alert(data.message);
    }
}

// Socket disconnection
function onSocketDisconnect() {
    console.log("Socket disconnect");
}

// On get scores
function onGetScoresResponse(data) {
    console.log("Get scores");

    // TODO: update scores
}

// On get board
function onGetBoardResponse(data) {
    console.log("Get board");
    // TODO: update board
}

// On get tile
function onGetTileResponse(data) {
    console.log("Get Tile");
    // TODO: update tile?
}

// On error
function onErrorMessage(data) {
    console.log("Error message")

    alert(data.message);
}

// Game started
function onGameStarted(data) {
    console.log("Games started");

    player.turn = data.turn;
    player.letters = data.letters;
    board = data.board;

    window.location = "/game";

}

// On move response
function onMoveResponse(data) {
    console.log("Move response");

    tileUpdates = data.tileUpdate;
    if (data.result == "success") {
        // TODO: change turn, update board
        for (var i = 0; i < tileUpdates.length; i++) {
            board.push( {letter: tileUpdates[i].letter, pos: tileUpdate[i].pos} );
        }

        player.turn = data.turn;

        onUpdateBoard(board);
        console.log(JSON.stringify(board));
    }
    else {
        // TODO: make a new move
    }
}

// On game board update
function onUpdateBoard(data) {
    console.log("Update board");
    gameTable = document.getElementById("gameTable");
    for (var i = 0; i < data.length; i++) {
        if(document.getElementById(data[i].pos).innerHTML == "") {
            console.log("DEBUG");
            board.push({letter: data[i].letter, pos: data[i].pos});
            var div = document.createElement('div');
            div.innerHTML = data[i].letter;
            div.setAttribute('class', "played-tile");
            var td = document.getElementById(data[i].pos);
            td.appendChild(div);
        }
        else {
            console.log("tile already set");
        }
    }
    console.log(JSON.stringify(board));
};

// On game ended
function onGameEnded(data) {
    console.log("Game ended");

    // TODO: game ended
}

// Server message
function onServerMessage(data) {
    console.log(data.message);

    //TODO: show server message
};

// Make a move
function play() {
    console.log("play()");
    if (true) {
        sendButton.onClick = function() {
            // TODO: Send move to server
            console.log("sendButton.onClick")
            var board = moveToJson;
            console.log(JSON.stringify(board));
        }
        passButton.onClick = function() {
            // TODO: Send pass to server
        }
        swapButton.onClick = function() {
            // TODO: Send swap to server
        }
    }
}

function joinGame() {
    console.log("joinButton");
    var gamesSelect = document.getElementById('gamesSelect');
    var sessionid = gamesSelect.options[gamesSelect.selectedIndex].value;
    socket.emit('joingame', {sessionid: sessionid});
    console.log(sessionid);
}

function createGame() {
    console.log("createGame");
    socket.emit('initgame', {language: "swe", dictionary: "default"});
}

function moveToJson() {
    console.log("moveToJson()");
    tempMove = [];
    var moveTiles = document.querySelector('.move-tile');
    for (var i = 0; i < moveTiles.length; i++) {
        var pos = moveTiles[i].parentNode.cellIndex;
        var value = moveTiles[i].innerHTML;

        tempMove.push({letter: value,
                    pos: pos});
    }
    return tempMove;
}




/*
window.onload = function() {
    var messages = [];
    var socket = io.connect('http://localhost:3000');
    var gameTable = document.getElementById("gameTable");
    var sendButton = document.getElementById("sendButton");
    var jsonBoard;

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
*/
