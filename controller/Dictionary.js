/**
 * Created by joel on 2013-12-18.
 */

var Dictionary = function(l)
{
    var fs = require('fs');
    var layout = l;
    var words = [];
    var letterScores;

    var readDictionaryFile = function(file)
    {
        return fs.readFileSync(file).toString().split("\n");
    }

    var createDictionary = function(language)
    {
        var data;
        switch (language) {
            case 'en':
                data = readDictionaryFile('./model/en.txt');
            case 'sv' :
            default :
                data = readDictionaryFile('./model/sv.txt');
                break;
        }

        for(i in data) {
            words.push(data[i].trim().toLowerCase());
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