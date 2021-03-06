/**
 * Created by joel on 2013-12-18.
 */
var Util = function()
{}

Util.merge = function(to, from, writeover) {
    for (n in from) {
        if (typeof to[n] != 'object') {
            if (writeover) {
                to[n] = from[n];
            } else {
                to.push(from[n]);
            }
        } else if (typeof from[n] == 'object') {
            to[n] = Util.merge(to[n], from[n]);
        }
    }

    return to;
};

Util.contains = function(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
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