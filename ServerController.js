/**
 * Created by joel on 2013-12-17.
 */

var ServerController = function()
{
    var sessions = new Array();

    var createGameSession = function createGameSession(client, data)
    {
        Stately = require('stately.js');
        gamesession = require('./public/gamesession').gamesession;
        var session = new gamesession();
        session.setId(10 + sessions.length * 55);
        session.setState(Stately.machine({
            'INGAME': {
                'endgame': 'WAITING'
            },
            'WAITING': {
                'completeSession': 'INGAME'
            }
        }));
        session.setSocket(client);
        session.addPlayer(client);
        session.language = data.language;
        session.dictionary = data.dictionary;

        return session;
    };


    var initGame = function initGame(client, data)
    {
        var message, data = JSON.parse(data);

        if (data.language == null || data.dictionary == null) {
            console.log(data.language);
            console.log(data.dictionary);
            message = createResponseMessage("Missing language or dictionary in message", true);
        } else if (sessions.length <= 3) {
            var session = createGameSession(client, data);
            sessions.push(session);
            message = createResponseMessage({"sessionid": "" + session.getId(), "userid": session.getPlayer(0)});
        } else {
            message = createResponseMessage("No more game sessions allowed at the moment", true);
        }

        client.emit('initgame-response', message);
    };

    var createResponseMessage = function createResponseMessage(message, error)
    {
        if (error) return {"result": "error", "message": message};

        return {"result": "success", "message": message};
    };

    var getBoardMessage = function getBoardMessage(session)
    {
        return createResponseMessage({
            "tiles": session.getUnplayedTiles(),
            "players": session.getPlayers()
        });
    };

    var getSession = function getSession(id)
    {
        for (i = 0; i < sessions.length; i++) {
            if (sessions[i].getId() == id) return sessions[i];
        }

        return false;
    };

    var joinGame = function joinGame(client, data)
    {
        var message, session = false, data = JSON.parse(data);

        if (data.sessionid == null) {
            message = createResponseMessage("Game session id is required for joining", true);
        } else {
            session = getSession(data.sessionid);

            console.log(JSON.stringify(session));

            if (session != false) {
                var player = session.addPlayer(client);

                console.log(player);

                if (player == false) {
                    message = createResponseMessage("Game has two players already", true);
                } else {
                    message = createResponseMessage({
                        "language": session.language,
                        "dictionary": session.dictionary,
                        "userid": player.id
                    });
                }
            } else {
                message = createResponseMessage("Game has two players already", true);
            }
        }

        client.emit('joingame-response', message);

        if (session != false) {
            client.broadcast.emit("joingame-response", getBoardMessage(session));
        }

        return session;
    };

    var makeMove = function makeMove(client, data)
    {
        var response;
        var state = session.getState();

        if (isArray(data.move)) {
            response = createResponseMessage(calculateMove());
        } else {
            switch (data.move) {
                case 'pass':
                    session.switchTurn(data);
                    response = createResponseMessage("");
                    break;
                case 'swap' :
                    response = createResponseMessage(swapTiles());
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
        createGameSession: createGameSession
    }
};

exports.ServerController = ServerController;