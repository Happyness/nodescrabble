/**
 * Created by joel on 2013-12-18.
 */
var Util = function()
{}

Util.merge = function(objOne, objTwo) {
    if (objOne instanceof Array) {
        return objOne.concat(objTwo);
    }
    var merge = {};
    var property;
    for (property in objOne) {
        merge[property] = objOne[property];
    }
    for (property in objTwo) {
        merge[property] = objTwo[property];
    }
    return merge;
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