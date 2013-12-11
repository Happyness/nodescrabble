/**
 * Created by Mats Maatson on 2013-11-28.
 */
var mongoose = require('mongoose');
var passwordHash = require('password-hash');

exports.users = function getUsers(callback) {
    var User = mongoose.model('User');

    User.find({},'username', function(err, users) {
        if(err) {
            callback(err);
        } else {
            callback(err, users);
        }
    })
};

exports.addUser = function addUser(data, callback) {
    if (data.username == null || data.password == null) {
        callback("You need to specify username and password");
    }
    var User = mongoose.model('User');
    var hashedPassword = passwordHash.generate(data.password);
    var user = new User({ username: data.username, password: hashedPassword});
    user.save(function(err){
        if (err) {
            if(err.code == 11000) {
                callback("Username has already been taken");
            } else {
                callback(err);
            }
        } else {
            callback(null, "User successfully added!");
        }
    })
};