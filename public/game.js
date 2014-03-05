/**************************************************
 ** GAME VARIABLES
 **************************************************/
var socket;
var player;
var board;
var tiles;
var gameTable;
var currentTile = 1;
var dev = true;
var swapMode = false;
var viewState;
var sessions = new Array();
var activeSession;
var messages = [];

/**************************************************
 ** GAME INITIALISATION
 **************************************************/
function init() {

    console.log("Init");

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

    // On error
    socket.on("error", onErrorMessage);

    // Game started
    socket.on("game-started", onGameStarted);

    // On move response
    socket.on("playmove-response", onMoveResponse);

    // Game ended
    socket.on("game-ended", onGameEnded);

    // Server message
    socket.on("servermessage", onServerMessage);

    // Chat message
    socket.on('chatmessage', onChatMessage);

}

/**************************************************
 ** UPDATES FROM SERVER
 **************************************************/
function onUpdate(data) {
    console.log("On Update");
    console.log(JSON.stringify(data));

    // TODO: check for type of update and calculate next move
    switch(data.type) {
        case 'gameinfo':
            updateGameList(data.games);
            updateLanguageList(data.languages);
            break;
        case 'move':
            if (data.tiles && viewState == 'ingame') {
                updateBoard(data.tiles);
            }

            if (data.score && data.playerid) {
                updateScoreBoard(data.score, data.playerid);
            }

            activeSession.setTurn(data.turn);
            var response = document.getElementById('response');
            response.innerHTML = getTurn();
            break;
        case 'playable-tiles' :
            if (data.tiles && viewState == 'ingame') {
                addUnplayedTiles(data.tiles);
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
    var value;
    for (var i = 0; i < data.length; i++) {
        value = data[i].sessionid;
        gamesSelect.options.add(new Option(value, value))
    }
}

function updateLanguageList(data) {
    console.log("updateLanguageList()")
    var languageSelect = document.getElementById("languageSelect");
    languageSelect.options.length = 0;
    var value;
    for (var i = 0; i < data.length; i++) {
        value = data[i];
        languageSelect.options.add(new Option(value, value));
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

function updateScoreBoard(score, id)
{
    var player;

    if (id == activeSession.getPlayerId()) {
        player = document.getElementById('player-you');
    } else {
        player = document.getElementById('player-opponent');
    }

    var scoreElement = player.querySelector('.score');
    scoreElement.innerHTML = score;
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
            var languageList = createElement('select', '', [{key: 'id', value: 'languageSelect'}]);
            selectList.appendChild(lister);
            selectList.appendChild(languageList);

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
            break;
        case 'ingame' :
            var chooseGame = document.getElementById("chooseGame");
            while (chooseGame.firstChild) {
                chooseGame.removeChild(chooseGame.firstChild);
            }
            var inGame = document.getElementById("inGame");
            var leftDiv = createElement('div', '', [{key: 'id', value: 'left'}]);
            var rightDiv = createElement('div', '', [{key: 'id', value: 'right'}]);
            var boardDiv = createElement('div', '', [{key: 'id', value: 'boardDiv'}]);
            var tilesBoard = createElement('div', '', [{key: 'id', value: 'tilesBoard'}]);
            var controlsDiv = createElement('div', '', [{key: 'id', value: 'inGameControls'}]);
            var response = createElement('h2', '', [{key: 'id', value: 'response'}]);
            var chatDiv = createElement('div', '', [{key: 'id', value: 'chatDiv'}]);
            var scoreBoard = createElement('div', 'Score board', [{key: 'id', value: 'scoreboard'}]);

            createScoreBoard(scoreBoard);
            createGameBoard(boardDiv);
            createTilesBoard(tilesBoard);
            createButtons(controlsDiv);
            createChat(chatDiv);

            leftDiv.appendChild(controlsDiv);
            leftDiv.appendChild(tilesBoard);
            leftDiv.appendChild(boardDiv);
            rightDiv.appendChild(response);
            rightDiv.appendChild(scoreBoard);
            rightDiv.appendChild(chatDiv);

            inGame.appendChild(leftDiv);
            inGame.appendChild(rightDiv);
            break;
    }
    viewState = view;
}

function addUnplayedTiles(tiles)
{
    var tileHolder = document.getElementById('tiles');

    for (i in tiles) {
        if (tileHolder.childElementCount < 7) {
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
}


/**************************************************
 ** ON SOCKET EVENTS
 **************************************************/

// Socket connection successful
function onSocketConnected() {
    console.log("Connected to socket");
    socket.emit("gameinfo", {});
}

// On init game response
function onInitGameResponse(data) {
    console.log("Init game response");

    if(data.result == "success") {
        activeSession = new Session(data.sessionid, data.playerid);
        sessions.push(activeSession);

        var header = document.getElementById('header');
        var controls = document.getElementById('controls');
        var select = document.getElementById('select');
        var joinButton = document.getElementById('joinButton');
        var createGameButton = document.getElementById('createGameButton');
        var gamesSelect = document.getElementById('gamesSelect');
        var languageSelect = document.getElementById('languageSelect');

        header.innerHTML = "Waiting for player...";

        select.removeChild(gamesSelect);
        select.removeChild(languageSelect);
        controls.removeChild(joinButton);
        controls.removeChild(createGameButton);

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
        activeSession.setPlayerId(data.playerid);
        console.log(JSON.stringify(data));

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

        sendReady();
    }
    else {
        alert(data.message);
    }
}

// Socket disconnection
function onSocketDisconnect() {
    console.log("Socket disconnect");
    switchToView('choosegame');
    alert("Server closed current socket connection");
}

// On error
function onErrorMessage(data) {
    console.log("Error message" + data);
    alert(data.message);
}

function isBoardTileEmpty(y, x)
{
    return (board[y][x] == "");
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

                    console.log("update tile " + i + "," + j + " where board value now is: " + board[y][x]);
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
    if (activeSession.isMyTurn() && swapMode != true) {
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
            socket.emit('playmove',{playerid: activeSession.getPlayerId(), sessionid: activeSession.getId(), move: moveList});
            console.log({move: moveList});
        }
    }
    else {
        alert("You'll have to wait for your turn");
    }
}

function playPass() {
    if (activeSession.isMyTurn() && swapMode != true) {
        // Send pass to server
        console.log("passButton.onClick");
        socket.emit("playmove", {move: "pass", sessionid: activeSession.getId(), playerid: activeSession.getPlayerId()});
    }
    else {
        alert("You'll have to wait for your turn");
    }
}

function playSwap() {
    if (activeSession.isMyTurn() && swapMode == true) {
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
            socket.emit("playmove", {
                move: 'swap',
                sessionid: activeSession.getId(),
                playerid: activeSession.getPlayerId(),
                tiles: swapList
            });
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
    if (activeSession.isMyTurn()) {
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
    return activeSession.isMyTurn() ? "your turn" : "opponent turn";
}

// Game started
function onGameStarted(data) {
    console.log("Game started");
    console.log(JSON.stringify(data));

    if (viewState == 'ingame') {
        return;
    }

    activeSession.setTurn(data.turn);
    activeSession.setLetters(data.tiles);
    board = [[data.size]];

    for (var i = 0; i < data.size; i++) {
        board[i] = [data.size];
        for (var j = 0; j < data.size; j++) {
            board[i][j] = "";
        }
    }

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

function createScoreBoard(scoreBoard) {
    for (var i = 0; i < 2; i++) {
        var div;
        if (i % 2 == 0) {
            div = createElement('div', '', [{key: 'id', value: 'player-you'}]);
            div.appendChild(createElement('span', 'You', [{key: 'class', value: 'label'}]));
        } else {
            div = createElement('div', '', [{key: 'id', value: 'player-opponent'}]);
            div.appendChild(createElement('span', 'Opponent', [{key: 'class', value: 'label'}]));
        }
        div.appendChild(createElement('span', '0', [{key: 'class', value: 'score'}]));
        scoreBoard.appendChild(div);
    }
}

function createTilesBoard(tilesBoard) {
    var div = document.createElement('div');
    div.setAttribute('id', 'tiles');
    div.setAttribute('ondragenter', 'dragEnter(event)');
    div.setAttribute('ondrop', 'drop(event)');
    div.setAttribute('ondragover', 'allowDrop(event)');

    tilesBoard.appendChild(div);
}

function createChat(chatDiv) {
    var chatContent = createElement('div', '', [{key: 'id', value: 'chatContent'}]);
    var inputField = createElement('input', '', [{key: 'id', value: 'chatInput'}, {key: 'onkeydown', value: 'if (event.keyCode == 13) document.getElementById("sendMessage").click()'}]);
    var sendMessage = createButton('Send', 'sendChatMessage()', 'sendMessage');

    chatDiv.appendChild(chatContent);
    chatDiv.appendChild(inputField);
    chatDiv.appendChild(sendMessage);
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

    console.log(JSON.stringify(data));

    if (data.result == "success") {
        var moved = document.querySelectorAll('.move-tile');

        for (var i in moved) {
            moved[i].className = 'played-tile';
        }

        activeSession.setTurn(data.turn);

        if (data.newtiles) {
            addUnplayedTiles(data.newtiles);
            response.innerHTML = "You got new tiles: ";

            for (var i in data.newtiles) {
                response.innerHTML += data.newtiles[i].letter + ', ';
            }
        }

        updateScoreBoard(data.totalscore, data.playerid);
    } else {
        response.innerHTML = data.message;
    }
}

function getPlayerAsReadable(id)
{
    if (id == 0) return 'No one';
    return (id == activeSession.getPlayerId() ? 'you' : 'opponent');
}

// On game ended
function onGameEnded(data) {
    console.log("Game ended");

    var response = document.getElementById('response');
    var controlsDiv = document.getElementById('inGameControls');

    while (controlsDiv.firstChild) {
        controlsDiv.removeChild(controlsDiv.firstChild);
    }
    controlsDiv.appendChild(createButton('Back to gamelist', 'viewGameList()', 'gameListButton'));

    console.log(JSON.stringify(data));

    if (data.winner && data.scores) {
        response.innerHTML = "Winner is: " + getPlayerAsReadable(data.winner) + "<br>\n";

        for (var i in data.scores) {
            updateScoreBoard(data.scores[i].score, data.scores[i].playerid);
        }
    }
}

// Server message
function onServerMessage(data) {
    console.log(data.message);

    switch (data.type) {
        case "disconnected" :
            //switchToView('choosegame');
            break;
        default :
            break;
    }

    alert(data.message);
};

function sendReady()
{
    console.log("send Ready message to server");
    socket.emit('startgame', {
        "playerid": activeSession.getPlayerId(),
        "sessionid": activeSession.getId()
    });
}

function getSession(id)
{
    for (var i in sessions) {
        if (sessions[i].getId() == id) {
            return sessions[i];
        }
    }

    return false;
}

function joinGame()
{
    console.log("joinButton");
    var gamesSelect = document.getElementById('gamesSelect');
    var sessionid = gamesSelect.options[gamesSelect.selectedIndex].value;

    var session = getSession(sessionid);
    var message;

    if (session != false) {
        activeSession = session;
        message = {sessionid: sessionid};
    } else {
        activeSession = new Session(sessionid);
        message = {sessionid: sessionid};
        sessions.push(activeSession);
    }

    socket.emit('joingame', message);
}

function createGame() {
    console.log("createGame");
    var languageSelect = document.getElementById('languageSelect');
    var language = languageSelect.options[languageSelect.selectedIndex].value;
    socket.emit('initgame', {language: language});
}

// Chat message
function onChatMessage(data) {
    if (data.error) {
        console.log(data.error);
        alert(data.error);
    } else if (data.message) {
        if (data.playerid == activeSession.getPlayerId()) {
            messages.push('You: ' + data.message);
        } else {
            messages.push('Opponent: ' + data.message);
        }

        var html = '';
        for (var i = 0; i < messages.length; i++) {
            html += messages[i] + '<br />';
        }
        var chatContent = document.getElementById("chatContent");
        chatContent.innerHTML = html;
        chatContent.scrollTop = chatContent.scrollHeight;
    }
}

function sendChatMessage() {
    var chatInput = document.getElementById("chatInput");
    var text = chatInput.value;
    socket.emit('chatmessage', {message: text, playerid: activeSession.getPlayerId(), sessionid: activeSession.getId()});
    chatInput.value = "";
}

window.onload = function() {
    switchToView('choosegame');
    init();
};
