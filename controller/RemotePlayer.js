var RemotePlayer = function(i) {
    var id = i;
    var session;
    var letters = [];
    var playedTiles = [];
    var turn;
    var client;

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

    var setTurn = function(newTurn) {
        turn = newTurn;
    };

   var setClient = function(c)
   {
       client = c;
   }

    return {
        getClient: getClient,
        getId: getId,
        getLetters: getLetters,
        getPlayedTiles: getPlayedTiles,
        setId: setId,
        setLetters: setLetters,
        setPlayedTiles: setPlayedTiles,
        setClient: setClient
    }
};

exports.RemotePlayer = RemotePlayer;