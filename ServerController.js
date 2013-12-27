Util = require('./Util').Util

var ServerController = function()
{
    var sessions = new Array();
    var noPlayers = 0, noSessions = 0;

    var getAllSessions = function()
    {
        var list = new Array();

        for (i = 0; i < sessions.length; i++) {
            if (sessions[i].getPlayers().length < 2) {
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
        noPlayers++;

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
        var client

        for (i in players) {
            client = players[i].getClient();

            if (messageType == 'game-started') {
                var letters = players[i].getLetters();
                if (letters.length == 0) {
                    players[i].addLetters(session.getUnplayedTiles(7));
                }
                console.log("try id: " + message + ", compared to: " + players[i].getId());
                if (message == players[i].getId()) {
                    gameMessage = {
                        "tiles": players[i].getLetters(),
                        "board": session.getBoard().getTiles(),
                        "turn": session.getTurn(),
                        "playedTiles": session.getPlayedTiles()
                    };
                } else {
                    gameMessage = {
                        "tiles": players[i].getLetters(),
                        "board": session.getBoard().getTiles(),
                        "turn": session.getTurn()
                    };
                }

                if (client) client.emit(messageType, gameMessage);
            } else {
                if (client) client.emit(messageType, message);
            }
        }
    }

    var startGame = function(client, data)
    {
        console.log(JSON.stringify(data));

        if (data.playerid && data.sessionid) {
            var session = getSession(data.sessionid);

            if (session != false) {
                if (typeof(session.getTurn()) == 'undefined') session.setRandomTurn();
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

    var joinGame = function (client, data)
    {
        console.log(JSON.stringify(data));

        var message, session, player;
        var check = checkSessionAndPlayer(data.sessionid, data.playerid);

        if (!check.session) {
            message = check.message;
        } else {
            session = check.session;

            if (session.getPlayers().length < 2) {
                var player = session.getRememberPlayer();

                if (!player) {
                    player = new RemotePlayer(noPlayers + 1);
                }

                player.setClient(client);
                session.addPlayer(player);
                noPlayers++;

                message = createResponseMessage({
                    "language": session.language,
                    "dictionary": session.dictionary,
                    "playerid": player.getId()
                });
            } else {
                message = createResponseMessage('Cannot join, 2 players already', true);
            }
        }

        client.emit('joingame-response', message);
        return session;
    };

    var calculateMove = function (session, player, data)
    {
        var tiles = data.move;

        if (session.getTurn() != player.getId()) {
            return createResponseMessage("It is not your turn", true);
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
                    "type": 'move',
                    "tiles": session.addScoresToTiles(tiles),
                    "turn": session.getTurn(),
                    "playerid": player.getId(),
                    "score": player.getScore()
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

    var chatMessage = function(client, data)
    {
        if (data.playerid && data.sessionid) {
            var session = getSession(data.sessionid);

            if (session) {
                broadcastToSession(session, 'chatmessage-response', {message: data.message, playerid: data.playerid});
            }
        } else {
            client.emit('chatmessage-response', {error: 'Invalid session or player id'});
        }
    }

    var getGames = function(client)
    {
        client.emit('update', createResponseMessage({"type": 'gamelist', "games": getAllSessions()}));
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

    var makePass = function(player, session)
    {
        player.addPassed();

        var winner = session.isGameEnded();
        if (winner != false) {
            broadcastToSession(session, 'game-ended', {winner: winner, scores: session.getScores()});
            removeSession(session.getId());
        } else {
            session.switchTurn(player.getId());
            broadcastToSession(session, 'update', {type: "move", turn: session.getTurn()});
        }
    }

    var makeSwap = function(player, session)
    {
        session.switchTurn(player.getId());
        player.setPassed(0); // Reset pass
        var oldTiles = data.tiles;
        var newTiles = swapTiles(session, oldTiles);

        if (newTiles != false) {
            sendToOpponent(session, 'update', {type: "move", turn: session.getTurn()});
            return createResponseMessage({newtiles: newTiles, turn: session.getTurn()});
        }

        return createResponseMessage("Not enough tiles", true);
    }

    var checkSessionAndPlayer = function(sessionid, playerid)
    {
        var session = getSession(sessionid);
        var player = false;

        if (session) {
            player  = session.getPlayerById(playerid);
        }

        if (!session) {
            return {message: createResponseMessage("Session does not exist", true)};
        } else if (!player) {
            return {message: createResponseMessage("Player does not exist", true), session: session};
        } else {
            return {session: session, player: player};
        }
    }

    var makeMove = function makeMove(client, data)
    {
        console.log("Try to make a move");
        console.log(JSON.stringify(data));
        var response, session, player;

        if (!data.sessionid || !data.playerid) {
            response = createResponseMessage("Session and player id is required to make a move", true);
        } else {
            var check = checkSessionAndPlayer(data.sessionid, data.playerid);

            if (check.message != null) {
                client.emit('playmove-response', check.message);
                return;
            } else {
                session = check.session;
                player = check.player;
            }

            if (session.hasWinner()) {
                response = createResponseMessage("Game is ended, no moves allowed", true);
            } else if (session.getTurn() != player.getId()) {
                response = createResponseMessage("It is not your turn", true);
            } else if (player.isLocked()) {
                response = createResponseMessage("You cannot make move multiple times in a row");
            } else {
                player.setLocked(true);
                if (Array.isArray(data.move)) {
                    response = calculateMove(session, player, data);
                } else {
                    switch (data.move) {
                        case 'pass':
                            makePass(player, session);
                            return;
                            break;
                        case 'swap' :
                            response = makeSwap(player, session);
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

                player.setLocked(false);
            }
        }

        console.log(JSON.stringify(response));
        client.emit('playmove-response', response);
    };

    var clientDisconnected = function(client)
    {
        for (var i in sessions) {
            var player = sessions[i].getPlayerByClient(client);

            if (player != false) {
                broadcastToSession(sessions[i], 'message', {type: "disconnected", message: 'Player ' + player.getId() + ' got disconnected'});
                sessions[i].removePlayer(player);

                if (sessions[i].getTurn() == player.getId()) {
                    sessions[i].setTurn(player.getId());
                }

                sessions[i].setRememberPlayer(player);

                if (sessions[i].getPlayers().length == 0) {
                    removeSession(sessions[i].getId());
                }
            }
        }
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
        clientDisconnected: clientDisconnected,
        chatMessage: chatMessage
    }
};

exports.ServerController = ServerController;