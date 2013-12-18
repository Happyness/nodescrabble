RemotePlayer = require('./RemotePlayer').RemotePlayer;
Board = require('./Board').Board;
Dictionary = require('./Dictionary').Dictionary;

var gamesession = function(i, dict, lang, c) {
    var id = i;
    var players = [];
    var unplayedTiles = [];
    var playedTiles = [];
    var board = [[]];
    var turn;
    var state;
    var activeDictionary;

    var createDictionary = function(dictionary)
    {
        activeDictionary = new Dictionary(dictionary);
    }

    var createBoard = function(language)
    {
        board = new Board(language);
    }

    // Constructor methods
    createDictionary(dict);
    createBoard(lang);

    var switchTurn = function(data)
    {
        var i;
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
        if (players.length > 10) {
            return false;
        }

        var player = new RemotePlayer(players.length + 1);
        //player.client = client;

        players.push(player);

        return player;
    }

    var getPlayers = function()
    {
        return players;
    }

    var getPlayerById = function getPlayerById(id)
    {
        var i;
        for (i = 0; i < players.length; i++) {
            if (players[i].id == id) return players[i];
        }

        return false;
    };

    var getPlayer = function getPlayer(key)
    {
        if (key <= players.length) {
            return players[key - 1];
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

    addPlayer(c);

    return {
        addPlayer: addPlayer,
        getPlayer: getPlayer,
        getPlayerById: getPlayerById,
        getId: getId,
        getState: getState,
        getSession: getSession,
        getUnplayedTiles: getUnplayedTiles,
        getPlayedTiles: getPlayedTiles,
        getPlayers: getPlayers,
        getTurn: getTurn,
        switchTurn: switchTurn,
        setId: setId,
        setTurn: setTurn,
        setState: setState
    }
};

exports.gamesession = gamesession;