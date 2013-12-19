var RemotePlayer = function(i) {
    var id = i;
    var letters = [];
    var playedTiles = [];
    var turn;
    var client;
    var score = 0;

    var getScore = function() {
        return score;
    };

    var getId = function() {
        return id;
    };

    var getClient = function() {
        return client;
    };

    var getLetters = function() {
       return letters;
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

    var setLetters = function(newLetters) {
        letters = newLetters;
    };

    var setPlayedTiles = function(newPlayedTiles) {
        playedTiles = newPlayedTiles;
    };

    var addScore = function(value) {
        score += value;
    };

   var setClient = function(c)
   {
       client = c;
   }

    return {
        getScore: getScore,
        getClient: getClient,
        getId: getId,
        getLetters: getLetters,
        getPlayedTiles: getPlayedTiles,
        setId: setId,
        setLetters: setLetters,
        setPlayedTiles: setPlayedTiles,
        setClient: setClient,
        addScore: addScore
    }
};

exports.RemotePlayer = RemotePlayer;