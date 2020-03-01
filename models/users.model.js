const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new Schema(
    {
        username: {type:String,required:true, unique:true},
        mail: {type:String},
        password: {type:String},
        college: {type:String},
        phone: {type:Number},
        isVerified: {type: Boolean},
        registrationValidity: {type: Date}
    }
);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user",userSchema);