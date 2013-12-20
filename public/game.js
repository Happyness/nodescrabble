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
var turn;
var currentTile = 1;

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
    board = [[]];


    // Connect to server
    var dev = true;
    var address = (dev != true) ? 'http://nodescrabbler.herokuapp.com' : 'http://localhost:3000';
    socket = io.connect(address);

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
    socket.on("playmove-response", onMoveResponse);

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
        case 'newtiles' :
            addUnplayedTiles(data.tiles);
            break;
        case 'tiles' :
            updateBoard(data);
            updateGameBoard();
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

function addUnplayedTiles(tiles)
{
    var tileHolder = document.getElementById('tiles');

    for (i in tiles) {
        var div = document.createElement('div');
        div.innerHTML = tiles[i].letter + "<sub>"+ tiles[i].score +"</sub>";
        div.setAttribute('class', "tile");
        div.setAttribute('draggable', "true");
        div.setAttribute('ondragstart', "drag(event)");
        div.setAttribute('id', "tile"+currentTile);
        tileHolder.appendChild(div);

        currentTile++;
    }
}

function updateTiles()
{
    console.log("Updating tiles ...");
    var tiles = player.letters;
    var moveTiles = document.querySelectorAll('.tile');
    console.log(moveTiles);

        for (var i = 0; i < moveTiles.length; i++) {
            if (typeof tiles[i] != 'undefined' && tiles[i] != null) {
                moveTiles[i].innerHTML = tiles[i].letter + "<sub>" + tiles[i].score + "</sub>";
            }
        }
}

function updateBoard() {
    console.log("Updating board ...");
    var gameTable = document.getElementById('gameTable');
    var trs = gameTable.getElementsByTagName('tr');
    console.log("trs.lenght() " + trs.length);
    for (var i = 0; i < trs.length; i++) {
        var tds = trs[i].getElementsByTagName('td');
        console.log("tds.lenght() " + tds.length);
        for (var j = 0; j < tds.length; j++) {
            //console.log("update tile " + i + "," + j);
            if (board[i][j] != null && board[i][j] != "") {
                if (tds[j].innerHTML == "") {
                    var div = document.createElement('div');
                    div.innerHTML = data[i].letter;
                    div.setAttribute('class', "played-tile");
                    tds[j].appendChild(div);
                }
            }
        }
    }
}

function playMove(){
    //if (turn == player.getId()) {
        // TODO: Send move to server
        console.log("sendButton.onClick");
        var moveTiles = document.querySelectorAll('.move-tile');
        console.log("moveTiles.length " + moveTiles.length);
        var moveList = [];
        for (var i = 0; i < moveTiles.length; i++) {
            var noHtmlString = moveTiles[i].innerHTML.replace(/<(?:.|\n)*?>/gm, '');
            var value = noHtmlString.replace(/[0-9]/g, '');

            moveList.push({letter: value, x: moveTiles[i].parentNode.id, y: moveTiles[i].parentNode.parentNode.id});
        }

        socket.emit('playmove',{playerid: player.getId(), sessionid: player.getSession(), move: moveList});
        console.log({move: moveList});
    //}
    //else {
    //    alert("You'll have to wait for your turn");
    //}
}

function playPass() {
    if (turn == player.getId()) {

        console.log("passButton.onClick");
        socket.emit("playpass");
    }
    else {
        alert("You'll have to wait for your turn");
    }
}

// Game started
function onGameStarted(data) {
    console.log("Games started");

    console.log(JSON.stringify(data));

    turn = data.turn;
    player.letters = data.tiles;
    board = data.board;

    addUnplayedTiles(data.tiles);

    var turnString = (player.getId() == turn) ? "your turn" : "opponent turn";

    header.innerHTML = "Game is now started, it is " + turnString;

    updateBoard();
    //updateTiles();
}

// On move response
function onMoveResponse(data) {
    console.log("Move response");
    var response = document.getElementById('response');

    if (data.result == "success") {
        response.innerHTML = "You got score point: " + data.score;
        console.log(JSON.stringify(data));

        var moved = document.querySelectorAll('.move-tile');

        for (var i in moved) {
            moved[i].className = 'played-tile';
        }
    }
    else {
        response.innerHTML = data.message;
        console.log(JSON.stringify(data));
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
