/**************************************************
 ** GAME BOARD CLASS
 **************************************************/
var Board = function(language) {
    var lang = language;
    var tiles = [[]];

    var getTiles = function()
    {
        return tiles;
    };

    var setTiles = function(newBoard)
    {
        tiles = newBoard;
    };

    var getBoardSize = function()
    {
        var rows, cols;

        switch (lang) {
            case 'sv':
            default:
                rows = cols = 15;
                break;
        }

        return {cols: cols, rows: rows};
    }

    var createBoard = function(lang)
    {
        var size = getBoardSize(lang);

        var i, j;

        for (i = 0; i < size.rows; i++) {
            for (j = 0; j < size.cols; j++) {
                tiles[i] = [];
                tiles[i][j] = "";
            }
        }
    }

    createBoard(language);

    var getTile = function(i, j)
    {
        var size = getBoardSize();
        if (i > size.rows || j > size.cols) {
            return false;
        }
        return board[i-1][j-1];
    }

    return {
        getTiles: getTiles,
        setTiles: setTiles,
        getTile: getTile
    }
};

exports.Board = Board;