/**************************************************
 ** GAME BOARD CLASS
 **************************************************/
var Board = function(language, dictionary) {
    var lang = language;
    var tiles = [[]];
    var dict = dictionary;
    var letterScores;

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

    var isOnBoard = function(x, y)
    {
        var size = getBoardSize();

        return (x > 0 && x <= size.cols && y > 0 && y <= size.rows);
    }

    var getWordMultiplyer = function(i, j)
    {
        if (((i == 1 || i == 15) && (j == 5 || j == 11)))
            return 3;
        else if (((i == 5 || i == 11) && (j == 1 || j == 15)))
            return 3;
        else if ((i == 3 || i == 13) && (j == 3 || j == 13))
            return 2;
        else if ((i == 4 || i == 12) && (j == 8))
            return 2;
        else if ((i == 5 || i == 11) && (j == 5 || j == 11))
            return 2;
        else if ((i == 8) && (j == 4 || j == 12))
            return 2;
        else if ((i == 8) && (j == 4 || j == 12))
            return 2;
        else
            return 1;
    }

    var getLetterMultiplyer = function(i, j)
    {
        if (((i == 1 || i == 15) && (j == 1 || j == 15)))
            return 3;
        else if (((i == 2 || i == 14) && (j == 6 || j == 10)))
            return 3
        else if (((i == 4 || i == 12) && (j == 4 || j == 12)))
            return 3;
        else if (((i == 6 || i == 10) && (j == 2 || j == 6 || j == 10 || j == 14)))
            return 3
        else if ((i == 1 || i == 15) && j == 8)
            return 2;
        else if ((i == 2 || i == 14) && (j == 2 || j == 14))
            return 2;
        else if ((i == 3 || i == 5 || i == 11 || i == 13) && (j == 7 || j == 9))
            return 2;
        else if ((i == 7 || i == 9) && (j == 3 || j == 5 || j == 11 || j == 13))
            return 2;
        else if ((i == 8) && (j == 1 || j == 15))
            return 2;

        else return 1;

    }

    var getLetterScore = function(tile)
    {
        var score = 0;

        for (var i = 0; i < letterScores.length; i++) {
            if (letterScores[i].letters.contains(tile.letter)) {
                return letterScores[i].score * tile.multiply;
            }
        }

        return 1 * tile.multiply; // Fallback if not found in any group
    }

    var getValidData = function(multiplyer, letters)
    {
        var word = "", score = 0;
        for (var i = 0; i < letters.length; i++) {
            word += letters[i].letter;
            score += (getLetterScore(letters[i]));
        }

        if (dict.valid(word)) {
            return {"score": multiplyer * score, "word": word};
        }

        return false;
    }

    var calculateScores = function(tile)
    {
        var result;
        var valid = new Array();
        result = validWord(tile.letter, tile.x, tile.y, true) // Horisontal check

        if (result != false) {
            valid.push(result);
        } else {
            return false;
        }

        result = validWord(tile.letter, tile.x, tile.y, false); // Vertical check

        if (result != false) {
            valid.push(result);
        } else {
            return false;
        }

        return valid;
    }

    var validWord = function(letter, x, y, horisontal)
    {
        var posx = x, posy = y;
        var multiplyer = 1, tile, forward = true, run = true;

        var word = new Array();
        word.push(letter);

        tile = board[posx][posy];
        while (isOnBoard(pos, y) && tile && run) {
            multiplyer *= getWordMultiplyer(posx, posy);

            if (forward) {
                word.push({"letter": tile, "multiply": getLetterMultiplyer(posx, posy)});

                if (horisontal) {
                    posx++;
                } else {
                    posy++;
                }
            } else {
                word.unshift({"letter": tile, "multiply": getLetterMultiplyer(posx, posy)});

                if (horisontal) {
                    posx--;
                } else {
                    posy--;
                }
            }

            tile = board[posx][posy];

            if (!tile && forward) {
                posx = x-1;
                posy = y-1;
                forward = false;
            } else {
                run = false;
            }
        }

        return getValidData(multiplyer, word);
    }

    var putTiles = function(tiles)
    {
        var x, y, valid = true, values;

        for (var i = 0; i < tiles.length; i++) {
            x = tiles[i].x;
            y = tiles[i].y;

            if (!isOnBoard(x, y) || board[x][y]) {
                return false;
            }

            var data = calculateScores(tiles[i]);
            if (Array.isArray(data)) {
                values = data;
            } else {
                return false;
            }
        }

        for (var i = 0; i < tiles.length; i++) {
            x = tiles[i].x;
            y = tiles[i].y;

            board[x][y] = tiles[i].letter;
        }

        return values;
    }

    var createBoard = function(lang)
    {
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
                letterScores = [
                    {"letters": ['A', 'R', 'S', 'T', 'E', 'N', 'D', 'I', 'L'], "score": 1},
                    {"letters": ['O', 'G', 'K', 'M', 'H'], "score": 2},
                    {"letters": ['Ä', 'F', 'V'], "score": 3},
                    {"letters": ['U', 'B', 'Ö', 'P', 'Å'], "score": 4},
                    {"letters": ['J', 'Y'], "score": 5},
                    {"letters": ['C', 'X'], "score": 6},
                    {"letters": ['Z'], "score": 7}
                ];
                break;
        }

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
        if (!isOnBoard(i, j)) {
            return false;
        }
        return board[i-1][j-1];
    }

    return {
        getTiles: getTiles,
        setTiles: setTiles,
        getTile: getTile,
        putTiles: putTiles
    }
};

exports.Board = Board;