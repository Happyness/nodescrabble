RemotePlayer = require('./RemotePlayer').RemotePlayer;
Board = require('./Board').Board;
Dictionary = require('./Dictionary').Dictionary;

var gamesession = function(i, dict, lang, c) {
    var id = i;
    var players = new Array();
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
        board = new Board(language, activeDictionary);
    }

    var getCharCounter = function(lang, letter)
    {
        var howMany;

        switch (lang) {
            case 'sv':
            /* Swedish board:
             1 point: A ×8, R ×8, S ×8, T ×8, E ×7, N ×6, D ×5, I ×5, L ×5
             2 points: O ×5, G ×3, K ×3, M ×3, H ×2
             3 points: Ä ×2, F ×2, V ×2
             4 points: U ×3, B ×2, Ö ×2, P ×2, Å ×2
             7 points: J ×1, Y ×1
             8 points: C ×1, X ×1
             10 points: Z ×1 */
            default:
                howMany = [
                    {"letters": ['A', 'R', 'S', 'T'], "score": 8},
                    {"letters": ['E'], "score": 7},
                    {"letters": ['N'], "score": 6},
                    {"letters": ['D', 'I', 'L', 'O'], "score": 5},
                    {"letters": ['G', 'K', 'M', 'U'], "score": 3},
                    {"letters": ['H', 'Ä', 'F', 'V', 'B', 'Ö', 'P', 'Å'], "score": 2},
                    {"letters": ['J', 'Y', 'C', 'X', 'Z'], "score": 1}
                ];
                break;
        }

        for (var i = 0; i < howMany.length; i++) {
            if (Util.contains(howMany[i].letters,letter)) {
                return howMany[i].score;
            }
        }
    }

    var createTiles = function(language)
    {
        var charCodeRange = {
            start: 65,
            end: 93
            }, char;
        // Loop through alphabet
        for (var cc = charCodeRange.start; cc <= charCodeRange.end; cc++) {
            if (cc > 90 && language == 'sv') {
                switch (cc) {
                    case 91: char = 'Å'; break;
                    case 92: char = 'Ä'; break;
                    case 93: char = 'Ö'; break;
                }
            } else {
                char = String.fromCharCode(cc)
            }
            for (var i = 0; i < getCharCounter(language, char); i++) {
                unplayedTiles.push(char);
            }
        }

        // Shuffle tiles
        unplayedTiles = Util.shuffle(unplayedTiles);
    }

    // Constructor methods
    createDictionary(dict);
    createBoard(lang);
    createTiles(lang);

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
        player.setClient(client);

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

    var setState = function(s) {
        state = s;
    };
    var getBoard = function()
    {
        return board;
    }

    turn = addPlayer(c);

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
        setState: setState,
        getBoard: getBoard
    }
};

exports.gamesession = gamesession;