/**
 * Created by Mats Maatson on 2013-11-28.
 */

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: {
        type:String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true
    }
});

mongoose.model('User', userSchema);

mongoose.connect('mongodb://nodescrabble:elbbarcsedon@paulo.mongohq.com:10018/nodescrabble');
