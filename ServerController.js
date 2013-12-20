Util = require('./Util').Util

var ServerController = function()
{
    var sessions = new Array();

    var getAllSessions = function()
    {
        var list = new Array();
        for (i = 0; i < sessions.length; i++) {
            list.push({"sessionid": sessions[i].getId()});
        }

        return JSON.stringify(list);
    }

    var createGameSession = function(client, data)
    {
        Stately = require('stately.js');
        gamesession = require('./controller/gamesession').gamesession;
        var id = 10 + sessions.length * 55;
        var session = new gamesession(id, data.dictionary, data.language, client);
        session.setState(Stately.machine({
            'INGAME': {
                'endgame': 'WAITING'
            },
            'WAITING': {
                'completeSession': 'INGAME'
            }
        }));

        return session;
    };

    var initGame = function(client, data)
    {
        var message;

        if (data.language == null || data.dictionary == null) {
            console.log(data.language);
            console.log(data.dictionary);
            message = createResponseMessage("Missing language or dictionary in message", true);
        } else if (sessions.length <= 3) {
            var session = createGameSession(client, data);
            sessions.push(session);

            message = createResponseMessage({
                "sessionid": session.getId(),
                "playerid": session.getPlayer(1).getId()
            });
        } else {
            message = createResponseMessage("No more game sessions allowed at the moment", true);
        }

        client.emit('initgame-response', message);
        client.broadcast.emit("update", {"type": "gamelist", "games": getAllSessions()});
    };

    var createResponseMessage = function(message, error)
    {
        if (error) return {"result": "error", "message": message};

        return Util.merge({"result": "success"}, message);
    };

    var getGameMessage = function(session, noTiles)
    {
        return {"tiles": session.getUnplayedTiles(noTiles), "board": session.getBoard().getTiles(), "turn": session.getTurn().getId()}
    }

    var broadcastToSession = function(session, messageType, message)
    {
        var players = session.getPlayers();

        for (i in players) {
            if (messageType == 'game-started') {
                var gameMessage = getGameMessage(session, 7);
                console.log(JSON.stringify(gameMessage));
                players[i].getClient().emit(messageType, gameMessage);
                players[i].addLetters(gameMessage.tiles);
            } else {
                players[i].getClient().emit(messageType, message);
            }
        }
    }

    var startGame = function(client, data)
    {
        if (data.playerid && data.sessionid) {
            var session = getSession(data.sessionid);

            if (session != false) {
                broadcastToSession(session, 'game-started');
            } else {
                client.emit('game-started', createResponseMessage("Session do not exist", true));
            }
        } else {
            client.emit('game-started', createResponseMessage("Cannot start game without session id and player id", true));
        }
    }

    var getBoardMessage = function(session)
    {
        return createResponseMessage({
            "tiles": session.getUnplayedTiles(),
            "players": session.getPlayers()
        });
    };

    var getSession = function(id)
    {
        for (i = 0; i < sessions.length; i++) {
            if (sessions[i].getId() == id) return sessions[i];
        }

        return false;
    };

    var joinGame = function joinGame(client, data)
    {
        var message, session = false;

        if (data.sessionid == null) {
            message = createResponseMessage("Game session id is required for joining", true);
        } else {
            session = getSession(data.sessionid);

            if (session != false) {
                var player = session.addPlayer(client);

                if (player == false) {
                    message = createResponseMessage("Game has two players already", true);
                } else {
                    message = createResponseMessage({
                        "language": session.language,
                        "dictionary": session.dictionary,
                        "playerid": player.getId()
                    });
                }
            } else {
                message = createResponseMessage("Game has two players already", true);
            }
        }

        client.emit('joingame-response', message);

        return session;
    };

    var calculateMove = function calculateMove(data)
    {
        var session = getSession(data.sessionid);
        var tiles = data.move;

        if (session == false) {
            return createResponseMessage("Session does not exist", true);
        } else if (session.getTurn() != session.getPlayer(data.playerid)) {
            return createResponseMessage("It is not your turn", true);
        } else {
            var board = session.getBoard();
            var data = board.putTiles(data.move);

            if (data != false) {
                var score = 0;
                var words = new Array();

                for (var i = 0; i < data.length; i++) {
                    score += data[i].score;

                    if (data[i].word != 'none')
                        words.push(data[i].word);
                }
                var player = session.getPlayerById(data.playerid);

                if (!player) {
                    return createResponseMessage("Player do not exist", true);
                } else {
                    player.addScore(score);
                    player.addPlayedTiles(tiles);

                    console.log(tiles);
                    var newTiles = session.getUnplayedTiles(tiles.length);

                    player.getClient().emit('update', {type: 'newtiles', tiles: newTiles});

                    player.addLetters(newTiles);
                    session.switchTurn(player.getId());
                    player.setPassed(0);
                    return createResponseMessage({
                        "playerid": player.getId(),
                        "score": score,
                        "tiles": data.move,
                        "words": words,
                        "totalscore": player.getScore()
                    });
                }
            } else {
                return createResponseMessage("Invalid word played", true);
            }
        }
    }

    var getGames = function(client, data)
    {
        client.emit('games-response', createResponseMessage({"games": getAllSessions()}));
    }

    var makeMove = function makeMove(client, data)
    {
        console.log("Try to make a move");
        console.log(JSON.stringify(data));
        var response;

        if (!data.sessionid || !data.playerid) {
            response = createResponseMessage("Session and player id is required to make a move", true);
        } else if (Array.isArray(data.move)) {
            response = calculateMove(data);
        } else {
            switch (data.move) {
                case 'pass':
                    session.getPlayer(data.playerId).addPassed();
                    session.switchTurn(data.playerid);

                    broadcastToSession(session, 'update', {type: "move"});
                    response = createResponseMessage("");
                    break;
                case 'swap' :
                    response = createResponseMessage(swapTiles(data));
                    session.switchTurn(data.playerid);
                    break;
                default :
                    console.log("Error: " + "Invalid move");
                    response = createResponseMessage("Invalid move", true);
                    break;
            }
        }

        console.log(JSON.stringify(response));
        client.emit('playmove-response', response);
    };

    return {
        initGame: initGame,
        makeMove: makeMove,
        joinGame: joinGame,
        getSession: getSession,
        getBoardMessage: getBoardMessage,
        getResponseMessage: createResponseMessage,
        createGameSession: createGameSession,
        getAllSessions: getAllSessions,
        getGames: getGames,
        startGame: startGame
    }
};

exports.ServerController = ServerController;