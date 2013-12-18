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
        gamesession = require('./public/gamesession').gamesession;
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

                console.log(player);

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
        client.broadcast.emit("update", {"type": "gamelist", "games": getAllSessions()});

        return session;
    };

    var calculateMove = function calculateMove()
    {

    }

    var getGames = function(client, data)
    {
        client.emit('games-response', createResponseMessage({"games": getAllSessions()}));
    }

    var makeMove = function makeMove(client, data)
    {
        var response;
        var state = session.getState();

        if (isArray(data.move)) {
            response = createResponseMessage(calculateMove(data));
        } else {
            switch (data.move) {
                case 'pass':
                    session.switchTurn(data);
                    response = createResponseMessage("");
                    break;
                case 'swap' :
                    response = createResponseMessage(swapTiles(data));
                    session.switchTurn(data);
                    break;
                default :
                    console.log("Error: " + "Invalid move");
                    response = createResponseMessage("Invalid move", true);
                    break;
            }

            client.emit('playmove-response', response);
        }
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
        getGames: getGames
    }
};

exports.ServerController = ServerController;