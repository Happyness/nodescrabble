RemotePlayer = require('./RemotePlayer').RemotePlayer;

var gamesession = function() {
    var id;
    var players = [];
    var unplayedTiles = [];
    var playedTiles = [];
    var turn;
    var socket;
    var state;
    var language;
    var dictionary;

    var switchTurn = function(data)
    {
        if (typeof data.userid != 'undefined' && data.userid > 0) {
            for (i = 0; i < players.length; i++) {
                if (players[i].id != data.userid) {
                   turn = data.userid;
                   return;
                }
            }
        }
    };

    var addPlayer = function(client)
    {
        //if (players.length > 10) {
        //    return false;
        //}

        var player = new RemotePlayer();
        player.id = players.length;
        //player.client = client;

        players.push(player);

        return player;
    }

    var getPlayers = function()
    {
        return players;
    }

    var getPlayer = function getPlayer(id)
    {
        for (i = 0; i < players.length; i++) {
            if (players[i].id == id) return players[i];
        }

        return false;
    };

    var getId = function() {
        return id;
    };

    var getSession = function() {
        return session;
    };

    var getSocket = function() {
        return socket;
    };

    var getUnplayedTiles = function(amount) {
        var randoms = [];
        for (var i = 0, index; i < amount; ++i) {
            index = Math.floor(Math.random() * unplayedTiles.length);
            randoms.push(unplayedTiles[index]);
            delete unplayedTiles[index];
        }

        return randoms;
    };

    var getState = function()
    {
        return state;
    };

    var getPlayedTiles = function() {
        return playedTiles;
    };

    var getTurn = function() {
        return turn;
    };

    var setId = function(newId) {
        id = newId;
    };

    var setTurn = function(newTurn) {
        turn = newTurn;
    };
    var setSocket = function(s) {
        socket = s;
    };
    var setState = function(s) {
        state = s;
    };

    return {
        addPlayer: addPlayer,
        getPlayer: getPlayer,
        getId: getId,
        getState: getState,
        getSession: getSession,
        getUnplayedTiles: getUnplayedTiles,
        getPlayedTiles: getPlayedTiles,
        getPlayers: getPlayers,
        getTurn: getTurn,
        getSocket: getSocket,
        switchTurn: switchTurn,
        setId: setId,
        setTurn: setTurn,
        setSocket: setSocket,
        setState: setState
    }
};

exports.gamesession = gamesession;