/**************************************************
 ** GAME PLAYER CLASS
 **************************************************/
var Player = function() {
    var id;
    var session;
    var letters = [];
    var playedTiles = [];
    var turn;

    var getId = function() {
        return id;
    };

    var getSession = function() {
        return session;
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

    var setSession = function(newSession) {
        session = newSession;
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

    return {
        getId: getId,
        getSession: getSession,
        getLetters: getLetters,
        getPlayedTiles: getPlayedTiles,
        getTurn: getTurn,
        setId: setId,
        setSession: setSession,
        setLetters: setLetters,
        setPlayedTiles: setPlayedTiles,
        setTurn: setTurn
    }
};