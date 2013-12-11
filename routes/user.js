
var userdata = require('../model/users');

exports.getUsers = function(req, res){
    userdata.users(function(err, users) {
        var output;
        if (err == null) {
            output = users;
        } else {
            output = "No users found";
        }
        res.render('users', {
            title: 'User list',
            users: users});
    })
};

exports.addUser = function(req, res) {
    //console.log(req.body);
    if(req.body.username == null || req.body.password == null) {
        res.statusCode = 404;
        return res.send('Error 404: You need to specify both username and password');
    }
    userdata.addUser({username: req.body.username, password: req.body.password}, function(err, result) {
        var output;
        if (err == null) {
            output = result;
        } else {
            output = err;
        }

        res.render('newuser', { title: 'Add new user', response: output});
    });
};

exports.viewAddUser = function(req, res) {
    res.render('newuser', { title: 'Db Response'});
};