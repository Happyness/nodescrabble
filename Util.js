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

exports.Util = Util;