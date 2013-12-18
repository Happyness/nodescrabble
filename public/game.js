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
    socket = io.connect('http://localhost:3000');

    setEventHandlers();
}

/**************************************************
 ** GAME EVENT HANDLERS
 **************************************************/
var setEventHandlers = function() {

    console.log("setEventHandlers");

    // Update from server
    socket.on("update", onUpdate);

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

        sendReady();
    }
    else {
        console.log(data);
        alert(data.message);
    }
}

// On game joined
function onJoinGameResponse(data) {
    console.log("Joined game response");

    if (data.result == "success") {
        console.log(JSON.stringify(data));
        player.setId(data.playerid);

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

        sendReady();
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
    console.log("Error message" + data);

    alert(data.message);
}

function updateTiles()
{
    console.log("Updating tiles ...");
    var tiles = player.letters;
    var moveTiles = document.querySelectorAll('.tile');
    console.log(moveTiles);

        for (var i = 0; i < moveTiles.length; i++) {
            if (typeof tiles[i] != 'undefined' && tiles[i] != null) {
                moveTiles[i].innerHTML = tiles[i] + "<sub>3</sub>";
            }
        }
}

function playMove()
{
        // TODO: Send move to server
        console.log("sendButton.onClick")
        var board = moveToJson();
        console.log(JSON.stringify(board));
}

// Game started
function onGameStarted(data) {
    console.log("Games started");

    console.log(JSON.stringify(data));
    /*
    passButton.onClick = function() {
        // TODO: Send pass to server
    }
    swapButton.onClick = function() {
        // TODO: Send swap to server
    }*/

    player.turn = data.turn;
    player.letters = data.tiles;
    board = data.board;

    turn = (player.getId() == player.turn) ? "your turn" : "opponent turn";

    header.innerHTML = "Game is now started, it is " + turn;

    updateTiles();
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

function sendReady()
{
    console.log("send Ready message to server");
    socket.emit('startgame', {
        "playerid": player.getId(),
        "sessionid": player.getSession()
    });
}

function joinGame() {
    console.log("joinButton");
    var gamesSelect = document.getElementById('gamesSelect');
    var sessionid = gamesSelect.options[gamesSelect.selectedIndex].value;
    player.setSession(sessionid);
    socket.emit('joingame', {sessionid: sessionid});
}

function createGame() {
    console.log("createGame");
    socket.emit('initgame', {language: "sv", dictionary: "default"});
}

function moveToJson() {
    console.log("moveToJson()");
    tempMove = [];
    var moveTiles = document.querySelectorAll('.move-tile');
    for (var i = 0; i < moveTiles.length; i++) {
        var pos = moveTiles[i].parentNode.cellIndex;
        var value = moveTiles[i].innerHTML;

        tempMove.push({letter: value,
                    pos: pos});
    }
    return tempMove;
}

window.onload = function() {
    init();
};
