Util = require('./Util').Util

var ServerController = function()
{
    var sessions = new Array();
    var noPlayers = 0, noSessions = 0;

    var getAllSessions = function(client, playerid)
    {
        var ip   = client._remoteAddress;
        var list = new Array();

        for (i = 0; i < sessions.length; i++) {
            if (sessions[i].getPlayers().length < 2 ||
                sessions[i].getPlayerById(playerid) != false ||
                sessions[i].getPlayerByIp(ip) != false) {
                list.push({"sessionid": sessions[i].getId()});
            }
        }

        return JSON.stringify(list);
    }

    var createGameSession = function(client, data)
    {
        Stately = require('stately.js');
        gamesession = require('./controller/gamesession').gamesession;
        var id = 10 + noSessions * 55;
        var player = new RemotePlayer(noPlayers + 1);
        player.setClient(client);

        var session = new gamesession(id, data.dictionary, data.language, player);
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
            message = createResponseMessage("Missing language or dictionary in message", true);
        } else if (sessions.length <= 3) {
            var session = createGameSession(client, data);
            sessions.push(session);
            player = session.getPlayer(1).getId();
            noPlayers++;
            noSessions++;

            message = createResponseMessage({
                "sessionid": session.getId(),
                "playerid": player
            });
        } else {
            message = createResponseMessage("No more game sessions allowed at the moment", true);
        }

        console.log(JSON.stringify(message));
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
                    var player = new RemotePlayer(noPlayers + 1);
                    player.setClient(client);

                    if (!session.addPlayer(player)) {
                        message = createResponseMessage("Game has two players already", true);
                    } else {
                        noPlayers++;
                        session.setRandomTurn();

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
                var player = session.getPlayerById(id);

                if (!player) {
                    return createResponseMessage("Player do not exist", true);
                } else {
                    if (!session.isCenter(tiles)) {
                        return createResponseMessage("First word must be in center of game board", true);
                    } else if (!session.isTileGrouped(tiles)) {
                        return createResponseMessage("You need to put a word next to another one", true);
                    }

                    var tilesResponse = session.playTiles(tiles);

                    if (tilesResponse != false) {
                        console.log(tilesResponse);
                        var score = tilesResponse.score;
                        var words = tilesResponse.words;

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
                    } else {
                        return createResponseMessage("Invalid word played", true);
                    }
                }
        }
    }

    var getGames = function(client, data)
    {
        var games = data.playerid ? getAllSessions(client, data.playerid) : getAllSessions(client);
        client.emit('update', createResponseMessage({"type": 'gamelist', "games": games}));
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
        } else {
            var session = getSession(data.sessionid);
            var player = false;

            if (session) {
                player  = session.getPlayerById(data.playerid);
            }

            if (!session) {
                response = createResponseMessage("Session does not exist", true);
            } else if (!player) {
                response = createResponseMessage("Player does not exist", true);
            } else if (session.hasWinner()) {
                response = createResponseMessage("Game is ended, no moves allowed", true);
            } else if (session.getTurn() != player.getId()) {
                response = createResponseMessage("It is not your turn", true);
            } else {
                if (Array.isArray(data.move)) {
                    response = calculateMove(client, data);
                } else {
                    switch (data.move) {
                        case 'pass':
                            player.addPassed();
                            var winner = session.isGameEnded();
                            if (winner != false) {
                                broadcastToSession(session, 'game-ended', {winner: winner, scores: session.getScores()});
                                removeSession(session.getId());
                            } else {
                                session.switchTurn(player.getId());
                                broadcastToSession(session, 'update', {type: "move", turn: session.getTurn()});
                            }
                            return;
                            break;
                        case 'swap' :
                            session.switchTurn(player.getId());
                            player.setPassed(0); // Reset pass
                            var oldTiles = data.tiles;
                            var newTiles = swapTiles(session, oldTiles);

                            if (newTiles != false) {
                                sendToOpponent(session, 'update', {type: "move", turn: session.getTurn()});
                                response = createResponseMessage({newtiles: newTiles, turn: session.getTurn()});
                            } else {
                                response = createResponseMessage("Not enough tiles", true);
                            }
                            break;
                        default :
                            console.log("Error: " + "Invalid move");
                            response = createResponseMessage("Invalid move", true);
                            break;
                    }

                    var winner = session.isGameEnded();
                    if (winner != false) {
                        broadcastToSession(session, 'update', {type: "game-ended", winner: winner, scores: session.getScores()});
                        removeSession(data.sessionid);
                    }
                }
            }
        }

        console.log(JSON.stringify(response));
        client.emit('playmove-response', response);
    };

    var clientDisconnected = function(client)
    {
        // @TODO when client dies
    }

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
        startGame: startGame,
        clientDisconnected: clientDisconnected
    }
};

exports.ServerController = ServerController;