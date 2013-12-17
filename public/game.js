/**************************************************
 ** GAME VARIABLES
 **************************************************/
var socket;
var player;
var board;

/**************************************************
 ** GAME INITIALISATION
 **************************************************/
function init() {

    // Keep track of tiles, letters, session and id
    player = new Player();

    // Keep track of game board
    board = new Board();

    // Connect to server
    socket = io.connect('http://localhost:3000');

    setEventHandlers();
}

/**************************************************
 ** GAME EVENT HANDLERS
 **************************************************/
var setEventHandlers = function() {

    // Socket connection successful
    socket.on("connect", onSocketConnected);

    // On init game response
    socket.on("init game response", onInitGameResponse);

    // On game joined
    socket.on("joined game response", onJoinedGameResponse);

    // Socket disconnection
    socket.on("disconnect", onSocketDisconnect);

    // On get games response
    socket.on("get games response", onGetGamesResponse);

    // On get scores
    socket.on("get scores response", onGetScoresResponse);

    // On get board
    socket.on("get board response", onGetBoardResponse);

    // On get tile
    socket.on("get tile response", onGetTileResponse);

    // On error
    socket.on("error", onErrorMessage);

    // Game started
    socket.on("game started", onGameStarted);

    // On move response
    socket.on("move response", onMoveResponse);

    // On game board update
    socket.on("update board", onUpdateBoard);

    // Game ended
    socket.on("game ended", onGameEnded);
};

// Socket connection successful
function onSocketConnected() {
    console.log("Connected to socket");
};

// On init game response
function onInitGameResponse(data) {
    console.log("Init game response");

    if(data.result == "SUCCESS") {
        player.id = data.id;
        player.session = data.session;
    }
    else {
        alert(data.message);
    }
};

// On game joined
function onJoinedGameResponse(data) {
    console.log("Joined game response");

    if(data.result == "SUCCESS") {
        player.id = data.id;
        player.session = data.session;

        // TODO: tell server we're ready for game?
    }
    else {
        alert(data.message);
    }
};

// Socket disconnection
function onSocketDisconnect() {
    console.log("Socket disconnect");
};

// On get games response
function onGetGamesResponse(data) {
    console.log("Get game list response");

    // TODO: show list of games
};

// On get scores
function onGetScoresResponse(data) {
    console.log("Get scores");

    // TODO: update scores
};

// On get board
function onGetBoardResponse(data) {
    console.log("Get board");
    // TODO: update board
};

// On get tile
function onGetTileResponse(data) {
    console.log("Get Tile");
    // TODO: update tile?
};

// On error
function onErrorMessage(data) {
    console.log("Error message")

    alert(data.message);
};

// Game started
function onGameStarted(data) {
    console.log("Games started");

    player.turn = data.turn;
    player.letters = data.letters;
    board = data.board;
};

// On move response
function onMoveResponse(data) {
    console.log("Move response");

    if (data.result == "SUCCESS") {
        // TODO: change turn, update board
    }
    else {
        // TODO: make a new move
    }
};





window.onload = function() {
    var messages = [];
    var socket = io.connect('http://localhost:3000');
    var gameTable = document.getElementById("gameTable");
    var sendButton = document.getElementById("sendButton");

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