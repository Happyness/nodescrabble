Util = require('./Util').Util

var ServerController = function()
{
    var sessions = new Array();

    var getAllSessions = function(playerid)
    {
        var list = new Array();
        for (i = 0; i < sessions.length; i++) {
            if (sessions[i].getPlayers().length < 2 || sessions[i].getPlayerById(playerid) != false) {
                list.push({"sessionid": sessions[i].getId()});
            }
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
        var message, player;

        if (data.language == null || data.dictionary == null) {
            console.log(data.language);
            console.log(data.dictionary);
            message = createResponseMessage("Missing language or dictionary in message", true);
        } else if (sessions.length <= 3) {
            var session = createGameSession(client, data);
            sessions.push(session);
            player = session.getPlayer(1).getId();

            message = createResponseMessage({
                "sessionid": session.getId(),
                "playerid": player
            });
        } else {
            message = createResponseMessage("No more game sessions allowed at the moment", true);
        }

        client.emit('initgame-response', message);
        client.broadcast.emit("update", {"type": "gamelist", "games": getAllSessions(player)});
    };

    var createResponseMessage = function(message, error)
    {
        if (error) return {"result": "error", "message": message};

        return Util.merge({"result": "success"}, message);
    };

    var sendToOpponent = function(session, messageType, message)
    {
        var players = session.getPlayers();
        var turn = session.getTurn();

        for (i in players) {
            if (players[i].getId() == turn) {
                players[i].getClient().emit(messageType, message);
            }
        }
    }

    var broadcastToSession = function(session, messageType, message)
    {
        var players = session.getPlayers();
        var gameMessage;

        for (i in players) {
            if (messageType == 'game-started') {
                var letters = players[i].getLetters();
                if (letters.length == 0) {
                    players[i].addLetters(session.getUnplayedTiles(7));
                }
                if (message == players[i].getId()) {
                    gameMessage = {
                        "tiles": players[i].getLetters(),
                        "board": session.getBoard().getTiles(),
                        "turn": session.getTurn(),
                        "playedTiles": session.getPlayedTiles()//@TODO session.getPlayedTiles();
                    };
                } else {
                    gameMessage = {
                        "tiles": players[i].getLetters(),
                        "board": session.getBoard().getTiles(),
                        "turn": session.getTurn()
                    };
                }
                players[i].getClient().emit(messageType, gameMessage);
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
                broadcastToSession(session, 'game-started', data.playerid);
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

    var removeSession = function(id)
    {
        for (var i in sessions) {
            if (sessions[i].getId() == id) {
                sessions.splice(i, 1);
            }
        }
    }

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

        if (!data.sessionid) {
            message = createResponseMessage("Game session id is required for joining", true);
        } else {
            session = getSession(data.sessionid);

            if (session != false) {
                var player = session.getPlayerById(data.playerid);
                if (player != false) {
                    message = createResponseMessage({
                        "language": session.language,
                        "dictionary": session.dictionary,
                        "playerid": player.getId(),
                        "message" : "welcome back"
                    });
                } else if (session.getPlayers().length < 2) {
                    var player = session.addPlayer(client);
                    session.setRandomTurn();

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
            } else {
                message = createResponseMessage("Session does not exist", true);
            }
        }

        client.emit('joingame-response', message);

        return session;
    };

    var calculateMove = function calculateMove(client, data)
    {
        var session = getSession(data.sessionid);
        var tiles = data.move;
        var id = data.playerid;

        if (session == false) {
            return createResponseMessage("Session does not exist", true);
        } else if (session.getTurn() != id) {
            return createResponseMessage("It is not your turn", true);
        } else {
            var board = session.getBoard();
            var tilesResponse = board.putTiles(tiles);

            if (tilesResponse != false) {
                var score = 0;
                var words = new Array();

                for (var i = 0; i < tilesResponse.length; i++) {
                    var tilesData = tilesResponse[i];

                    for (var j = 0; j < tilesData.length; j++) {
                        score += tilesData[j].score;

                        if (tilesData[j].word != 'none')
                            words.push(tilesData[j].word);
                    }
                }
                var player = session.getPlayerById(id);

                if (score == 0) {
                    return createResponseMessage("Invalid word", true);
                } else if (!player) {
                    return createResponseMessage("Player do not exist", true);
                } else {
                    session.switchTurn(player.getId());
                    player.addScore(score);
                    player.addPlayedTiles(tiles);
                    session.addPlayedTiles(tiles);

                    var newTiles = session.getUnplayedTiles(tiles.length);

                    player.addLetters(newTiles);
                    player.setPassed(0);

                    sendToOpponent(session, 'update', {
                        "type": 'played-tiles',
                        "tiles": session.addScoresToTiles(tiles),
                        "turn": session.getTurn()
                    });

                    return createResponseMessage({
                        "playerid": player.getId(),
                        "score": score,
                        "newtiles": newTiles,
                        "tiles": tiles,
                        "words": words,
                        "totalscore": player.getScore(),
                        turn: session.getTurn()
                    });
                }
            } else {
                return createResponseMessage("Invalid word played", true);
            }
        }
    }

    var getGames = function(client, data)
    {
        client.emit('update', createResponseMessage({"type": 'gamelist', "games": getAllSessions(data.playerid)}));
    }

    var swapTiles = function(session, oldTiles)
    {
         session.addUnplayedTiles(oldTiles);
         var newTiles = session.getUnplayedTiles(oldTiles.length);

         if (newTiles.length != oldTiles.length) {
             session.addUnplayedTiles(newTiles);
             return false;
         } else {
             return newTiles;
         }
    }

    var makeMove = function makeMove(client, data)
    {
        console.log("Try to make a move");
        console.log(JSON.stringify(data));
        var response;

        if (!data.sessionid || !data.playerid) {
            response = createResponseMessage("Session and player id is required to make a move", true);
        } else if (Array.isArray(data.move)) {
            response = calculateMove(client, data);
        } else {
            var session = getSession(data.sessionid);

            switch (data.move) {
                case 'pass':
                    session.getPlayer(data.playerid).addPassed();
                    var winner = session.isGameEnded();
                    if (winner != false) {
                        broadcastToSession(session, 'game-ended', {winner: winner, scores: session.getScores()});
                        removeSession(data.sessionid);
                    } else {
                        session.switchTurn(data.playerid);
                        broadcastToSession(session, 'update', {type: "move", turn: session.getTurn()});
                    }
                    return;
                    break;
                case 'swap' :
                    session.switchTurn(data.playerid);
                    session.getPlayer(data.playerid).setPassed(0); // Reset pass
                    var oldTiles = data.tiles;
                    var newTiles = swapTiles(session, oldTiles);
                    console.log(JSON.stringify(newTiles));

                    if (newTiles != false) {
                        sendToOpponent(session, 'update', {type: "move", turn: session.getTurn()});
                        response = createResponseMessage({tiles: newTiles});
                    } else {
                        response = createResponseMessage("Not enough tiles", true);
                    }
                    break;
                default :
                    console.log("Error: " + "Invalid move");
                    response = createResponseMessage("Invalid move", true);
                    break;
            }
        }

        var winner = session.isGameEnded();
        if (winner != false) {
            broadcastToSession(session, 'update', {type: "game-ended", winner: winner, scores: session.getScores()});
            removeSession(data.sessionid);
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