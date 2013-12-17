/**************************************************
 ** GAME BOARD CLASS
 **************************************************/
var Board = function() {
    var tiles = [];

    var getTiles = function() {
        return tiles;
    };

    var setTiles = function(newBoard) {
        tiles = newBoard;
    };

    return {
        getTiles: getTiles,
        setTiles: setTiles
    }
};