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
var dev = true;
var swapMode = false;
var viewState = 'chooseGame';

/**************************************************
 ** GAME INITIALISATION
 **************************************************/
function init() {

    console.log("Init");

    // Keep track of tiles, letters, session and id
    player = new Player();

    // Keep track of game board
    board = [[]];

    // Connect to server
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
    console.log(JSON.stringify(data));

    // TODO: check for type of update and calculate next move
    switch(data.type) {
        case 'gamelist':
            updateGameList(data);
            break;
        case 'move':
            turn = data.turn;
            var response = document.getElementById('response');
            response.innerHTML = getTurn();
            break;
        case 'playable-tiles' :
            if (data.tiles && viewState == 'ingame') {
                addUnplayedTiles(data.tiles);
            }
            break;
        case 'played-tiles' :
            console.log(JSON.stringify(data));
            if (data.tiles && data.turn  && viewState == 'ingame') {
                updateBoard(data.tiles);

                turn = data.turn;
                var response = document.getElementById('response');
                response.innerHTML = getTurn();
            }
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

function createElement(tag, value, attributes)
{
    var element = document.createElement(tag);
    element.innerHTML = value;

    for (var i in attributes) {
        element.setAttribute(attributes[i].key, attributes[i].value);
    }

    return element;
}

function switchToView(view)
{
    if (viewState == view) {
        return;
    }
    switch (view) {
        case 'choosegame' :
            var inGame = document.getElementById("inGame");
            while (inGame.firstChild) {
                inGame.removeChild(inGame.firstChild);
            }
            var chooseGame = document.getElementById("chooseGame");
            var header = createElement('h1', 'NodeScrabble', [{key: 'id', value: 'header'}]);
            var selectList = createElement('div', '', [{key: 'id', value: 'select'}]);
            var lister = createElement('select', '', [{key: 'id', value: 'gamesSelect'}]);
            selectList.appendChild(lister);

            var controls = createElement('div', '', [{key: 'id', value: 'controls'}]);
            controls.appendChild(createElement('input', '', [
                {key: 'type', value: 'button'},
                {key: 'value', value: 'Join Game'},
                {key: 'id', value: 'joinButton'},
                {key: 'onclick', value: 'joinGame()'}
            ]));
            controls.appendChild(createElement('input', '', [
                {key: 'type', value: 'button'},
                {key: 'value', value: 'Create Game'},
                {key: 'id', value: 'createGameButton'},
                {key: 'onclick', value: 'createGame()'}
            ]));
            selectList.appendChild(controls);

            chooseGame.appendChild(header);
            chooseGame.appendChild(selectList);

            socket.emit('games', {playerid: player.getId()});
            break;
        case 'ingame' :
            var chooseGame = document.getElementById("chooseGame");
            while (chooseGame.firstChild) {
                chooseGame.removeChild(chooseGame.firstChild);
            }
            var inGame = document.getElementById("inGame");
            var boardDiv = createElement('div', '', [{key: 'id', value: 'boardDiv'}]);
            var tilesBoard = createElement('div', '', [{key: 'id', value: 'tilesBoard'}]);
            var controlsDiv = createElement('div', '', [{key: 'id', value: 'inGameControls'}]);
            var response = createElement('h2', '', [{key: 'id', value: 'response'}]);

            createGameBoard(boardDiv);
            createTilesBoard(tilesBoard);
            createButtons(controlsDiv);

            inGame.appendChild(controlsDiv);
            inGame.appendChild(response);
            inGame.appendChild(tilesBoard);
            inGame.appendChild(boardDiv);
            break;
    }
    viewState = view;
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



function isBoardTileEmpty(y, x)
{
    return (board[y][x] == null || board[y][x] == "");
}

function updateBoard(tiles) {
    console.log("Updating board ...");

    var gameTable = document.getElementById('gameTable');
    var trs = gameTable.getElementsByTagName('tr');
    for (var i = 0; i < trs.length; i++) {
        var tds = trs[i].getElementsByTagName('td');

        for (var j = 0; j < tds.length; j++) {
            for (var t in tiles) {
                x = tiles[t].x - 1;
                y = tiles[t].y - 1;

                if (isBoardTileEmpty(y, x) && x == j && y == i) {
                    board[y][x] = tiles[t].letter;

                    console.log("update tile " + i + "," + j);
                    var div = document.createElement('div');
                    div.innerHTML = tiles[t].letter + "<sub>" + tiles[t].score + "</sub>";
                    div.setAttribute('class', "played-tile");

                    if (tds[j].innerHTML == "") {
                        tds[j].appendChild(div);
                    } else {
                        var moveTile = tds[j].getElementsByTagName('div');
                        if (moveTile.length > 0) {
                            var tileHolder = document.getElementById('tiles');
                            tileHolder.appendChild(moveTile[0]);
                        }
                        tds[j].appendChild(div);
                    }
                }
            }
        }
    }
}

function viewGameList()
{
    switchToView('choosegame');
}

function playMove(){
    if (turn == player.getId() && swapMode != true) {
        // Send move to server
        console.log("sendButton.onClick");
        var moveTiles = document.getElementsByClassName('move-tile');
        console.log("moveTiles.length " + moveTiles.length);
        var moveList = [];
        for (var i = 0; i < moveTiles.length; i++) {
            var noHtmlString = moveTiles[i].innerHTML.replace(/<(?:.|\n)*?>/gm, '');
            var value = noHtmlString.replace(/[0-9]/g, '');
            var pos = moveTiles[i].parentNode.id.split('-');

            console.log(JSON.stringify(pos));

            moveList.push({letter: value, x: pos[1], y: pos[0]});
        }

        if (moveList.length > 0) {
            socket.emit('playmove',{playerid: player.getId(), sessionid: player.getSession(), move: moveList});
            console.log({move: moveList});
        }
    }
    else {
        alert("You'll have to wait for your turn");
    }
}

function playPass() {
    if (turn == player.getId() && swapMode != true) {
        // Send pass to server
        console.log("passButton.onClick");
        socket.emit("playmove", {move: "pass", sessionid: player.getSession(), playerid: player.getId()});
    }
    else {
        alert("You'll have to wait for your turn");
    }
}

function playSwap() {
    if (turn == player.getId() && swapMode == true) {
        // Send swap to server
        console.log("playSwap.onClick");
        var swapTiles = document.querySelectorAll('.swap');
        var tilesDiv = document.getElementById('tiles');
        var swapList = [];
        if (swapTiles != null) {
            for (var i = 0; i < swapTiles.length; i++) {
                var noHtmlString = swapTiles[i].innerHTML.replace(/<(?:.|\n)*?>/gm, '');
                var value = noHtmlString.replace(/[0-9]/g, '');

                swapList.push(value);
                tilesDiv.removeChild(swapTiles[i]);

            }
            socket.emit("playmove", {move: 'swap', sessionid: player.getSession(), playerid: player.getId(), tiles: swapList});
            stopSwap();
        }
    }
    else {
        alert("You'll have to wait for your turn");
    }
}

function stopSwap() {
    var button = document.getElementById('swapButton');
    button.setAttribute('onClick', 'startSwap()');

    var tilesDivs = document.querySelectorAll('.tile');

    for (var i = 0; i < tilesDivs.length; i++) {
        tilesDivs[i].removeAttribute('onClick');
    }

    var controlsDiv = document.getElementById('inGameControls');
    controlsDiv.removeChild(document.getElementById('cancelButton'));
    swapMode = false;
}

function startSwap() {
    if (turn == player.getId()) {
        swapMode = true;
        console.log("startSwap.onClick");
        var tilesDivs = document.querySelectorAll('.tile');
        console.log(tilesDivs);
        for (var i = 0; i < tilesDivs.length; i++) {
            tilesDivs[i].setAttribute('onClick', 'toggleSwapClass(event)');
        }
        var updateButton = document.getElementById('swapButton');
        updateButton.setAttribute('onClick', 'playSwap()');

        var controlsDiv = document.getElementById('inGameControls');
        var cancelButton = createButton('Cancel', 'stopSwap()', 'cancelButton');
        controlsDiv.appendChild(cancelButton);

    }
    else {
        alert("You'll have to wait for your turn");
    }
}

function toggleSwapClass(ev) {
    console.log(ev);
    var element = ev.target || ev.srcElement;

    if (element.className == "tile") {
        element.className = "swap";
    }
    else if (element.classnName == "swap") {
        element.className = "tile";
    }
}

function getTurn()
{
    return (player.getId() == turn) ? "your turn" : "opponent turn";
}

// Game started
function onGameStarted(data) {
    console.log("Games started");
    console.log(JSON.stringify(data));

    if (viewState == 'ingame') {
        return;
    }

    turn = data.turn;
    player.letters = data.tiles;
    board = data.board;


    switchToView('ingame');
        updateBoard(data.playedTiles);
        addUnplayedTiles(data.tiles);

    var response = document.getElementById('response');
    response.innerHTML = "Game is now started, it is " + getTurn();
}

function createButton(value, ev, id)
{
    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', value);
    button.setAttribute('id', id);
    button.setAttribute('onClick', ev);

    return button;
}

function createButtons(controlsDiv) {
    var gameListButton = createButton('Back to gamelist', 'viewGameList()', 'gameListButton');
    var sendButton = createButton('Play', 'playMove()', 'sendButton');
    var passButton = createButton('Pass', 'playPass()', 'passButton');
    var swapButton = createButton('Swap', 'startSwap()', 'swapButton');

    controlsDiv.appendChild(gameListButton);
    controlsDiv.appendChild(sendButton);
    controlsDiv.appendChild(passButton);
    controlsDiv.appendChild(swapButton);
}

function createTilesBoard(tilesBoard) {
    var div = document.createElement('div');
    div.setAttribute('id', 'tiles');
    div.setAttribute('ondragenter', 'dragEnter(event)');
    div.setAttribute('ondrop', 'drop(event)');
    div.setAttribute('ondragover', 'allowDrop(event)');

    tilesBoard.appendChild(div);
}

function createGameBoard(boardDiv) {
    var table = document.createElement('table');
    table.setAttribute('id', "gameTable");
    var tbody = document.createElement('tbody');

    for(var i=1; i <= 15; i++) {
        var tr = document.createElement('tr');
        for(var j=1; j <= 15; j++) {
            var td = document.createElement('td');
            td.setAttribute('id', i + '-' + j);
            td.setAttribute('ondragenter', 'dragEnter(event)');
            td.setAttribute('ondrop', 'drop(event)');
            td.setAttribute('ondragover', 'allowDrop(event)');
            if (((i == 1 || i == 15) && (j == 1 || j == 15))) {
                td.setAttribute('class', 'tl');
                tr.appendChild(td);
            }
            else if (((i == 2 || i == 14) && (j == 6 || j == 10))) {
                td.setAttribute('class', 'tl');
                tr.appendChild(td);
            }
            else if (((i == 4 || i == 12) && (j == 4 || j == 12))) {
                td.setAttribute('class', 'tl');
                tr.appendChild(td);
            }
            else if (((i == 6 || i == 10) && (j == 2 || j == 6 || j == 10 || j == 14))) {
                td.setAttribute('class', 'tl');
                tr.appendChild(td);
            }
            else if (((i == 1 || i == 15) && (j == 5 || j == 11))) {
                td.setAttribute('class', 'tw');
                tr.appendChild(td);
            }
            else if (((i == 5 || i == 11) && (j == 1 || j == 15))) {
                td.setAttribute('class', 'tw');
                tr.appendChild(td);
            }
            else if ((i == 1 || i == 15) && j == 8) {
                td.setAttribute('class', 'tw');
                tr.appendChild(td);
            }
            else if ((i == 2 || i == 14) && (j == 2 || j == 14)) {
                td.setAttribute('class', 'dl');
                tr.appendChild(td);
            }
            else if ((i == 3 || i == 5 || i == 11 || i == 13) && (j == 7 || j == 9)) {
                td.setAttribute('class', 'dl');
                tr.appendChild(td);
            }
            else if ((i == 7 || i == 9) && (j == 3 || j == 5 || j == 11 || j == 13)) {
                td.setAttribute('class', 'dl');
                tr.appendChild(td);
            }
            else if ((i == 8) && (j == 1 || j == 15)) {
                td.setAttribute('class', 'dl');
                tr.appendChild(td);
            }
            else if ((i == 3 || i == 13) && (j == 3 || j == 13)) {
                td.setAttribute('class', 'dw');
                tr.appendChild(td);
            }
            else if ((i == 4 || i == 12) && (j == 8)) {
                td.setAttribute('class', 'dw');
                tr.appendChild(td);
            }
            else if ((i == 5 || i == 11) && (j == 5 || j == 11)) {
                td.setAttribute('class', 'dw');
                tr.appendChild(td);
            }
            else if ((i == 8) && (j == 4 || j == 12)) {
                td.setAttribute('class', 'dw');
                tr.appendChild(td);
            }
            else if ((i == 8) && (j == 4 || j == 12)) {
                td.setAttribute('class', 'dw');
                tr.appendChild(td);
            }
            else if ((i == 8) && (j == 8)) {
                td.setAttribute('class', 'center');
                tr.appendChild(td);
            }
            else {
                td.setAttribute('class', 'regular');
                tr.appendChild(td);
            }
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    boardDiv.appendChild(table);
}

// On move response
function onMoveResponse(data) {
    console.log("Move response");
    var response = document.getElementById('response');

    if (data.result == "success") {
        if (data.newtiles) {
            addUnplayedTiles(data.newtiles);
        }

        response.innerHTML = "You got score point: " + data.score;
        console.log(JSON.stringify(data));
        turn = data.turn;

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

function getPlayerAsReadable(id)
{
    if (id == 0) return 'No one';
    return (id == player.getId() ? 'you' : 'opponent');
}

// On game ended
function onGameEnded(data) {
    console.log("Game ended");

    var response = document.getElementById('response');

    console.log(JSON.stringify(data));

    if (data.winner && data.scores) {
        response.innerHTML = "Winner is: " + getPlayerAsReadable(data.winner) + "<br>\n";

        for (var i in data.scores) {
            response.innerHTML += getPlayerAsReadable(data.scores[i].playerid) + "; score: " + data.scores[i].score + "<br>";
        }
    }
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

function joinGame()
{
    console.log("joinButton");
    var gamesSelect = document.getElementById('gamesSelect');
    var sessionid = gamesSelect.options[gamesSelect.selectedIndex].value;
    player.setSession(sessionid);
    socket.emit('joingame', {sessionid: sessionid, playerid: player.getId()});
}

function createGame() {
    console.log("createGame");

    var language = (dev == true) ? 'dev' : 'sv';
    socket.emit('initgame', {language: language, dictionary: "default"});
}

window.onload = function() {
    init();
    switchToView('choosegame');
};
