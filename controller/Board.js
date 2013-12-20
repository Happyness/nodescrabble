/**************************************************
 ** GAME BOARD CLASS
 **************************************************/
var Board = function(language, dictionary) {
    var lang = language;
    var board = [[]];
    var dict = dictionary;
    var letterScores;

    var getTiles = function()
    {
        return board;
    };

    var setTile = function(y, x, letter)
    {
        if (!isOnBoard(y, x)) {
            return false;
        }
        board[y-1][x-1] = letter;
    }

    var getTile = function(y, x)
    {
        if (!isOnBoard(y, x)) {
            return false;
        }
        return board[y-1][x-1];
    }

    var setTiles = function(newBoard)
    {
        board = newBoard;
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

    var isOnBoard = function(y, x)
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
        for (var i in letterScores) {
            if (Util.contains(letterScores[i].letters, tile)) {
                return letterScores[i].score;
            }
        }

        return 1;
    }

    var getScoredLetter = function(tile)
    {
        return tile.multiply * getLetterScore(tile.letter);
    }

    var getValidData = function(multiplyer, letters)
    {
        var word = "", score = 0;
        for (var i in letters) {
            word  += letters[i].letter;
            score += (getScoredLetter(letters[i]));
        }

        if (letters.length == 1) {
            return {"score": multiplyer * score, "word": "none"};
        }
        if (dict.valid(word)) {
            console.log(word);
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
        //word.push({"letter": letter, "multiply": getLetterMultiplyer(y, x)});

        while (!isEmpty(posy, posx) && run == true) {
            tile = getTile(posy, posx);
            multiplyer *= getWordMultiplyer(posy, posx);

            if (forward) {
                word.push({"letter": tile, "multiply": getLetterMultiplyer(posy, posx)});

                if (horisontal) {
                    posx++;
                } else {
                    posy++;
                }
            } else {
                word.unshift({"letter": tile, "multiply": getLetterMultiplyer(posy, posx)});

                if (horisontal) {
                    posx--;
                } else {
                    posy--;
                }
            }

            if (isEmpty(posy, posx) && forward) {
                posx = x-1;
                posy = y-1;
                forward = false;
            } else if (isEmpty(posy, posx)) {
                run = false;
            }
        }

        return getValidData(multiplyer, word);
    }

    var isEmpty = function(row, col)
    {
        if (isOnBoard(row, col)) {
            var tile = getTile(row, col);
            return (tile == null || tile == "" || typeof(tile) == 'undefined');
        }
        return true;
    }

    var putTiles = function(tiles)
    {
        var x, y, valid = true, values = new Array();

        for (var i in tiles) {
            x = tiles[i].x;
            y = tiles[i].y;

            if (isEmpty(y, x)) {
                setTile(y, x, tiles[i].letter);
            } else {
                return false;
            }
        }

        for (var i in tiles) {
            var data = calculateScores(tiles[i]);
            if (Array.isArray(data)) {
                values.push(data);
            } else {
                return false;
            }
        }

        console.log(values);

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
                board[j] = [];
                board[j][i] = "";
            }
        }
    }

    createBoard(language);

    return {
        getTiles: getTiles,
        setTiles: setTiles,
        getTile: getTile,
        putTiles: putTiles,
        getLetterScore: getLetterScore
    }
};

exports.Board = Board;