RemotePlayer = require('./RemotePlayer').RemotePlayer;
Board = require('./Board').Board;
Dictionary = require('./Dictionary').Dictionary;

var gamesession = function(i, lang, player) {
    var id = i;
    var players = new Array();
    var unplayedTiles = [];
    var playedTiles = [];
    var board;
    var turn;
    var state;
    var activeDictionary;
    var winner = false;
    var rememberPlayer;

    var getScores = function()
    {
        var scores = new Array();

        for (var i in players) {
            scores.push({playerid: players[i].getId(), score:players[i].getScore()});
        }

        return scores;
    }

    var calcEndScore = function()
    {
        for (var i in players) {
            var player = players[i];
            var letters = player.getLetters();

            if (letters.length == 0) {
                player.addScore(50);
            } else {
                player.substractScore(board.getLettersScore(letters));
            }
        }
    }

    var hasWinner = function()
    {
        return winner;
    }

    var getOpponentId = function(id)
    {
        for (var i in players) {
            var pid = players[i].getId();
            if (id != pid) {
                return pid;
            }
        }
    }

    var isGameEnded = function()
    {
        var next = false, counter = 0;

        for (var i in players) {
            if (players[i].getNoPasses() >= 2) {
                calcEndScore();
                winner = true;
                return getOpponentId(players[i].getId());
            }
            if (players[i].getLetters().length == 0 && unplayedTiles.length == 0) counter++;
        }

        if (counter > 0) {
            winner = true;
            calcEndScore();
            var player1 = players[0], player2 = players[1];
            if (player1.getScore() == player2.getScore()) { return 0;
            } else if (player1.getScore() > player2.getScore()) { return player1.getId();
            } else { return player2.getId(); }
        }

        return false;
    }

    var createDictionary = function(language)
    {
        activeDictionary = new Dictionary(language);
    }

    var createBoard = function(language)
    {
        board = new Board(language, activeDictionary);
    }

    var getCharCounter = function(lang, letter)
    {
        var howMany;

        switch (lang) {
            case 'dev' :
                howMany = [
                    {"letters": ['A', 'R', 'S', 'T', 'E', 'I'], "score": 10},
                    {"letters": ['R'], "score": 0},
                    {"letters": ['N'], "score": 0},
                    {"letters": ['D', 'L', 'O'], "score": 0},
                    {"letters": ['G', 'K', 'M', 'U'], "score": 0},
                    {"letters": ['H', 'Ä', 'F', 'V', 'B', 'Ö', 'P', 'Å'], "score": 0},
                    {"letters": ['J', 'Y', 'C', 'X', 'Z'], "score": 0}
                ];
                break;
            /* Swedish board:
             1 point: A ×8, R ×8, S ×8, T ×8, E ×7, N ×6, D ×5, I ×5, L ×5
             2 points: O ×5, G ×3, K ×3, M ×3, H ×2
             3 points: Ä ×2, F ×2, V ×2
             4 points: U ×3, B ×2, Ö ×2, P ×2, Å ×2
             7 points: J ×1, Y ×1
             8 points: C ×1, X ×1
             10 points: Z ×1 */
            case 'sv':
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
            if (Util.contains(howMany[i].letters, letter)) {
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
                unplayedTiles.push({letter: char, score: board.getLetterScore(char)});
            }
        }

        // Shuffle tiles
        unplayedTiles = Util.shuffle(unplayedTiles);
    }

    // Constructor methods
    createDictionary(lang);
    createBoard(lang);
    createTiles(lang);

    var switchTurn = function(id)
    {
            for (var i = 0; i < players.length; i++) {
                if (players[i].getId() != id) {
                   turn = players[i].getId();
                   return;
                }
            }
    };

    var addPlayer = function(player)
    {
        if (players.length >= 2) {
            return false;
        }

        players.push(player);
        return true;
    }

    var removePlayer = function(player)
    {
        for (var i in players) {
            if (players[i].getId() == player.getId()) players.splice(i, 1);
        }
    }

    var getPlayers = function()
    {
        return players;
    }

    var getPlayerById = function(id)
    {
        for (var i = 0; i < players.length; i++) {
            if (players[i].getId() == id) return players[i];
        }

        return false;
    };

    var getPlayerByClient = function(client)
    {
        for (var i = 0; i < players.length; i++) {
            if (players[i].getClient() && players[i].getClient().id == client.id) return players[i];
        }

        return false;
    };

    var getPlayer = function(key)
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

    var setRandomTurn = function()
    {
        turn = players[Math.floor(Math.random() * players.length)].getId();
    }

    var getUnplayedTiles = function(amount) {
        var randoms = [];
        for (var i = 0, index; i < amount; ++i) {
            index = Math.floor(Math.random() * unplayedTiles.length);

            if (unplayedTiles[index]) {
                randoms.push(unplayedTiles[index]);
                unplayedTiles.splice(index, 1);
            }
        }

        return randoms;
    };

    var addUnplayedTiles = function(tiles)
    {
        tiles = addScoresToTiles(tiles);

        for (var i in tiles) {
            unplayedTiles.push(tiles[i]);
        }
    }

    var addPlayedTiles = function(tiles)
    {
        tiles = addScoresToTiles(tiles);

        for (var i in tiles) {
            playedTiles.push(tiles[i]);
        }
    }

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

    var scanScoreAndWords = function(data)
    {
        var words = new Array(), score = 0, result;

        if (Array.isArray(data)) {
            for (var i in data) {
                result = scanScoreAndWords(data[i]);
                score += result.score;
                words = Util.merge(words, result.words);
            }
        } else {
            score += data.score;
            if (data.word != 'none') words.push(data.word);
        }

        return {words: words, score: score};
    }

    var playTiles = function(tiles)
    {
        var playResponse = board.putTiles(tiles);

        if (playResponse != false) {
            var result = scanScoreAndWords(playResponse);

            if (result.score == 0) {
                board.removeTiles(tiles);
                board.printBoard();
                return false;
            } else {
                if (tiles.length == 7) result.score += 40;
                return result;
            }
        }
        return false;
    }

    var addScoresToTiles = function(tiles)
    {
        for (var i in tiles) {
            if (!tiles[i].score)
                tiles[i].score = board.getLetterScore(tiles[i].letter);
        }

        return tiles;
    }

    var isCenter = function(tiles)
    {
        if (board.isBoardEmpty()) {
            return board.isWordCrossingCenter(tiles);
        }
        return true; // Only check if empty board
    }

    var isTileGrouped = function(tiles)
    {
        var tile;
        // Dont check if board is empty
        if (!board.isBoardEmpty()) {
            for (i in tiles) {
                tile = tiles[i];

                if (!board.isEmpty(tile.y, parseInt(tile.x) + 1)) return true; // right
                if (!board.isEmpty(tile.y, parseInt(tile.x) - 1)) return true; // left
                if (!board.isEmpty(parseInt(tile.y) + 1, tile.x)) return true; // down
                if (!board.isEmpty(parseInt(tile.y) - 1, tile.x)) return true; // up
            }

            return false;
        }

        return true;
    }

    var setRememberPlayer = function(player)
    {
        rememberPlayer = player;
    }

    var getRememberPlayer = function()
    {
        player = rememberPlayer;

        if (rememberPlayer) {
            rememberPlayer = null;
        }

        return player;
    }

    var isPlayersReady = function()
    {
        if (players.length < 2) {
            return false;
        }

        for (var p in players) {
            if (!players[p].isReady()) {
                return false;
            }
        }

        return true;
    }

    addPlayer(player);

    return {
        addPlayer: addPlayer,
        getPlayer: getPlayer,
        getPlayerById: getPlayerById,
        getId: getId,
        getState: getState,
        getSession: getSession,
        getUnplayedTiles: getUnplayedTiles,
        addUnplayedTiles: addUnplayedTiles,
        getPlayedTiles: getPlayedTiles,
        getPlayers: getPlayers,
        getTurn: getTurn,
        switchTurn: switchTurn,
        setId: setId,
        setTurn: setTurn,
        setState: setState,
        getBoard: getBoard,
        addScoresToTiles: addScoresToTiles,
        isGameEnded: isGameEnded,
        getScores: getScores,
        setRandomTurn: setRandomTurn,
        addPlayedTiles: addPlayedTiles,
        playTiles: playTiles,
        isCenter: isCenter,
        isTileGrouped: isTileGrouped,
        hasWinner: hasWinner,
        getPlayerByClient: getPlayerByClient,
        removePlayer: removePlayer,
        setRememberPlayer: setRememberPlayer,
        getRememberPlayer: getRememberPlayer,
        isPlayersReady: isPlayersReady
    }
};

exports.gamesession = gamesession;