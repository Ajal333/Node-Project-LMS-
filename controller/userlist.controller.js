const User = require("../models/users.model");
const Book = require("../models/books.model");
const Withdrawn = require("../models/withdrawn_books.model");

exports.view_users = (req,res) => {
    User.find({isVerified: true} ,(err,user) => {
        if(err)
        {
            console.log(err);
            return res.render('home');
        }
        console.log(user);
        res.render('view_user', {user:user});
    });
};

exports.view_usersbook = (req,res) => {
    Withdrawn.find({}, (err,books) => {
        if(err)
        {
            console.log(err);
            return res.render('home1');
        }
        console.log(books);
        res.render('userbooklist',{books:books});
        
    });
};

