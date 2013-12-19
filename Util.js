/**
 * Created by joel on 2013-12-18.
 */
var Util = function()
{}

Util.merge = function(to, from) {
    for (n in from) {
        if (typeof to[n] != 'object') {
            to[n] = from[n];
        } else if (typeof from[n] == 'object') {
            to[n] = realMerge(to[n], from[n]);
        }
    }

    return to;
};

Util.contains = function(a, obj) {
    if (Array.isArray(a)) {
        var i = a.length;
        while (i--) {
            if (a[i] === obj) {
                return true;
            }
        }
    }
    return false;
};

Util.shuffle = function (array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

exports.Util = Util;