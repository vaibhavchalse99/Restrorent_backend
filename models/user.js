const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

//username and password is automatically added by passport-loocal-mongoose
const User = new mongoose.Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId : String,
    admin:{
        type:Boolean,
        default:0
    }
},{
    timestamps:true
})

//it will support for username and hash passport using hash and salt
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',User);
;