/**************************************************
 ** GAME BOARD CLASS
 **************************************************/
var Board = function(language, dictionary) {
    var lang = language;
    var board;
    var dict = dictionary;
    var letterScores;
    var checkedPos = new Array();
    var usedMultiplyers = new Array();

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
        switch (lang) {
            case 'en':
                return 17;
            case 'sv':
            default:
                return 15;
                break;
        }
    }

    var isOnBoard = function(y, x)
    {
        var size = getBoardSize();
        return (x > 0 && x <= size && y > 0 && y <= size);
    }

    var getWordMultiplyer = function(j, j)
    {
        if (isUsedMultiplyer(j, i)) return 1;

        addUsedMultiplyer(j, i);

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

    var getLetterMultiplyer = function(j, i)
    {
        if (isUsedMultiplyer(j, i)) return 1;

        addUsedMultiplyer(j, i);

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

    var isUsedMultiplyer = function(y, x)
    {
        for (var i in usedMultiplyers) {
            if (usedMultiplyers[i].x == x && usedMultiplyers[i].y == y) {
                return true;
            }
        }

        return false;
    }

    var addUsedMultiplyer = function(y, x)
    {
        usedMultiplyers.push({x: x, y: y});
    }

    var getLettersScore = function(tiles)
    {
        var score = 0;
        for (var i in tiles) {
            score += getLetterScore(tiles[i]);
        }

        return score;
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
        if (letters.length <= 1) {
            return {"score": 0, "word": 'none'};
        }

        var word = "", score = 0;
        for (var i in letters) {
            word  += letters[i].letter;
            score += (getScoredLetter(letters[i]));
        }

        console.log(word);

        if (dict.valid(word)) {
            return {"score": multiplyer * score, "word": word};
        }

        return false;
    }

    var calculateScores = function(tile, deep)
    {
        var result;
        var valid = new Array();
        result = validWord(tile.letter, tile.x, tile.y, true, deep) // Horisontal check

        if (result != false) {
            valid.push(result);
        } else {
            return false;
        }

        result = validWord(tile.letter, tile.x, tile.y, false, deep); // Vertical check

        if (result != false) {
            valid.push(result);
        } else {
            return false;
        }

        return valid;
    }

    var addCheckedPos = function(y, x, horisontal)
    {
        checkedPos.push({x: x, y: y, horisontal: horisontal});
    }

    var isCheckedPos = function(y, x, horisontal)
    {
        for (var i in checkedPos) {
            if (checkedPos[i].x == x && checkedPos[i].y == y && checkedPos[i].horisontal == horisontal) {
                return true;
            }
        }

        return false;
    }

    var validWord = function(letter, x, y, horisontal, deep)
    {
        var posx = x, posy = y;
        var multiplyer = 1, tile, forward = true, run = true;

        var word = new Array();
        //console.log("horisontal:" + horisontal);
        //console.log(JSON.stringify(checkedPos));
        var result = new Array(), tmpres;

        while (!isEmpty(posy, posx) && !isCheckedPos(posy, posx, horisontal) && run == true) {
            tile = getTile(posy, posx);
            multiplyer *= getWordMultiplyer(posy, posx);
            addCheckedPos(posy, posx, horisontal);
            //console.log("row: "+posy+", col: "+posx);

            if (deep < 1) {
                deep++;
                tmpres = calculateScores({letter: tile, x: posx, y: posy}, deep);
                if (tmpres != false) {
                    result.push(tmpres);
                } else {
                    return false;
                }
            }

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
                if (horisontal) {
                    posx = x - 1;
                    posy = y;
                } else {
                    posy = y - 1;
                    posx = x;
                }
                forward = false;
            } else if (isEmpty(posy, posx)) {
                run = false;
            }
        }

        //console.log(JSON.stringify(word));

        tmpres = getValidData(multiplyer, word);
        if (tmpres != false) {
            result.push(tmpres);
        } else {
            return false;
        }

        return result;
    }

    var isWordCrossingCenter = function(tiles)
    {
        var size = getBoardSize();
        var cx = Math.ceil(size / 2);
        var cy = Math.ceil(size / 2);

        for (var i in tiles) {
            if (tiles[i].x == cx && tiles[i].y == cy) return true;
        }

        return false;
    }

    var isBoardEmpty = function()
    {
        var size = getBoardSize();

        for (var y = 1; y <= size; y++) {
            for (var x = 1; x <= size; x++) {
                if (!isEmpty(y, x)) return false;
            }
        }

        return true;
    }

    var isEmpty = function(row, col)
    {
        if (isOnBoard(row, col)) {
            var tile = getTile(row, col);
            return (tile == null || tile == "" || typeof(tile) == 'undefined' || tile == false);
        }
        return true;
    }

    var addTiles = function(tiles)
    {
        for (var i in tiles) {
            x = tiles[i].x;
            y = tiles[i].y;

            if (isEmpty(y, x)) {
                setTile(y, x, tiles[i].letter);
            }
        }
    }

    var removeTiles = function(tiles)
    {
        for (var i in tiles) {
            x = tiles[i].x;
            y = tiles[i].y;

            setTile(y, x, null);
        }
    }

    var printBoard = function()
    {
        var output = "";

        for (var row in board) {
            output += JSON.stringify(board[row]) + "\r\n";
        }

        console.log(output);
    }

    var putTiles = function(tiles)
    {
        checkedPos = new Array();
        var x, y, valid = true, values = new Array(), counter = 0;
        var tmptiles = tiles.slice(0);

        for (var i in tiles) {
            x = tiles[i].x;
            y = tiles[i].y;

            if (isEmpty(y, x)) {
                counter++;
            }
        }

        if (counter == tiles.length) {
            addTiles(tmptiles);
        } else {
            return false;
        }

        for (var i in tiles) {
            var data = calculateScores(tiles[i], 0);

            if (data == false) {
                console.log("Invalid word in playTiles");
                removeTiles(tmptiles);
                printBoard();

                return false;
            } else {
                values.push(data);
            }
        }

        return values;
    }

    var createBoard = function(lang)
    {
        switch (lang) {
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
        board = [size][size];
    }

    createBoard(language);

    return {
        getTiles: getTiles,
        setTiles: setTiles,
        getTile: getTile,
        putTiles: putTiles,
        printBoard: printBoard,
        removeTiles: removeTiles,
        getLetterScore: getLetterScore,
        getLettersScore: getLettersScore,
        isBoardEmpty: isBoardEmpty,
        isEmpty: isEmpty,
        isWordCrossingCenter: isWordCrossingCenter,
        getBoardSize: getBoardSize
    }
};

exports.Board = Board;