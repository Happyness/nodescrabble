var RemotePlayer = function(i) {
    var id = i;
    var letters = [];
    var playedTiles = [];
    var client;
    var score = 0;
    var passed = 0;
    var locked = false;
    var ready = false;

    var isReady = function()
    {
        return ready;
    }

    var setReady = function(r)
    {
        ready = r;
    }

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

    var setId = function(newId) {
        id = newId;
    };

    var addLetters = function(newLetters) {
        for (var i in newLetters) {
            letters.push(newLetters[i]);
        }
    };

    var addPlayedTiles = function(newPlayedTiles) {
        for (var i in newPlayedTiles) {
            playedTiles.push(newPlayedTiles[i]);
        }
    };

    var addScore = function(value) {
        score += value;
    };

    var substractScore = function(value) {
        score -= value;
    };

   var setClient = function(c)
   {
       client = c;
   }

    var setPassed = function(count)
    {
        passed = count;
    }

    var addPassed = function()
    {
        passed++;
    }

    var getNoPasses = function()
    {
        return passed;
    }

    var setLocked = function(mode)
    {
        locked = mode;
    }

    var isLocked = function()
    {
        return locked;
    }

    return {
        getScore: getScore,
        getClient: getClient,
        getId: getId,
        getLetters: getLetters,
        getPlayedTiles: getPlayedTiles,
        setId: setId,
        addLetters: addLetters,
        addPlayedTiles: addPlayedTiles,
        setClient: setClient,
        addScore: addScore,
        addPassed: addPassed,
        setPassed: setPassed,
        substractScore: substractScore,
        getNoPasses: getNoPasses,
        isLocked: isLocked,
        setLocked: setLocked,
        isReady: isReady,
        setReady: setReady
    }
};

exports.RemotePlayer = RemotePlayer;