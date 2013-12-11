/**
 * Created by joel on 2013-11-28.
 */

exports.move = function(req, res) {
    console.log("Received json: " + req.body.data);
    var data = {"message": "move"};
    res.json(data);
};