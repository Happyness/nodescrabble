/**
 * Created by joel on 2013-12-18.
 */

var Dictionary = function(l)
{
    var fs = require('fs');
    var layout = l;
    var words = [];
    var letterScores;

    var createDictionary = function(layout)
    {
        switch (layout) {
            case 'default' :
            default :
                var data  = fs.readFileSync('./model/sv.txt').toString().split("\n");
                for(i in data) {
                    words.push(data[i].trim());
                }
                //words = ["is", "jag", "test", "lol", "sa", "dö", "ja", "mig", "ta", "le", "te"];
                break;
        }
    }

    var valid = function(word)
    {
        for (var i = 0; i < words.length; i++) {
            console.log('my word: ' +  word.toLowerCase() + " compared: " + words[i]);
            if (word.toLowerCase() == words[i]) {
                console.log('DEBUG: TRUE');
                return true;
            }
        }
        console.log('DEBUG: FALSE');
        return false;
    }

    createDictionary(l);

    return {valid: valid}
}

exports.Dictionary = Dictionary;