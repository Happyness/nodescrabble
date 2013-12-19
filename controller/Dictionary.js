/**
 * Created by joel on 2013-12-18.
 */

var Dictionary = function(l)
{
    var layout = l;
    var words;
    var letterScores;

    var createDictionary = function(layout)
    {
        switch (layout) {
            case 'default' :
                words = ["is", "jag", "test", "lol", "sa", "dö", "ja", "mig", "ta", "le", "te"];
                break;
            default :
            // Invalid list, @TODO
        }
    }

    var valid = function(word)
    {
        for (var i = 0; i < words.length; i++) {
            if (word.toLowerCase() == words[i]) {
                return true;
            }
        }

        return false;
    }

    createDictionary(l);

    return {valid: valid}
}

exports.Dictionary = Dictionary;