/**************************************************
 ** GAME SESSION CLASS
 **************************************************/
var Session = function(sid, pid) {
    var id = sid;
    var playerid = pid;
    var letters = [];
    var playedTiles = [];
    var turn;

    var getId = function() {
        return id;
    };

    var getPlayerId = function() {
        return playerid;
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

    var setLetters = function(newLetters) {
        letters = newLetters;
    };

    var setPlayedTiles = function(newPlayedTiles) {
        playedTiles = newPlayedTiles;
    };

    var setTurn = function(newTurn) {
        turn = newTurn;
    };

    var setId = function(i) {
        id = i;
    };

    var setPlayerId = function(id) {
        playerid = id;
    };

    var isMyTurn = function()
    {
        return playerid == turn;
    }

    return {
        getId: getId,
        getPlayerId: getPlayerId,
        getLetters: getLetters,
        getPlayedTiles: getPlayedTiles,
        getTurn: getTurn,
        setId: setId,
        setLetters: setLetters,
        setPlayedTiles: setPlayedTiles,
        setTurn: setTurn,
        setPlayerId: setPlayerId,
        isMyTurn: isMyTurn
    }
};