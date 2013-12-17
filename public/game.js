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


    // Keep track of tiles, letters, session and id
    player = new Player();

    // Keep track of game board
    board = [];

    // Connect to server
    socket = io.connect('http://localhost:3000');

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
    socket.on("joingame-response", onJoinedGameResponse);

    // Socket disconnection
    socket.on("disconnect", onSocketDisconnect);

    // On get games response
    socket.on("games-response", onGetGamesResponse);

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
}

function onClickSendButton() {
    // TODO: Send move to server
    console.log("sendButton.onClick")
    var board = moveToJson;
    console.log(JSON.stringify(board));
}

// Socket connection successful
function onSocketConnected() {
    console.log("Connected to socket");
}

// On init game response
function onInitGameResponse(data) {
    console.log("Init game response");

    if(data.result == "SUCCESS") {
        player.setId(data.userid);
        player.setSession(data.sessionid);
    }
    else {
        alert(data.message);
    }
}

// On game joined
function onJoinedGameResponse(data) {
    console.log("Joined game response");

    if(data.result == "SUCCESS") {
        player.setId(data.id);
        player.setSession(data.sessionid);

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

// On get games response
function onGetGamesResponse(data) {
    console.log("Get game list response");

    // TODO: show list of games
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
}

// On move response
function onMoveResponse(data) {
    console.log("Move response");

    tileUpdates = data.tileUpdate;
    if (data.result == "SUCCESS") {
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
    board;
    console.log(JSON.stringify(board));
};

// On game ended
function onGameEnded(data) {
    console.log("Game ended");

    // TODO: game ended
}

// Server message
function onServerMessage() {
    console.log("Server message");

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
