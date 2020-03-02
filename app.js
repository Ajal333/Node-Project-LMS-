const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const nodemailer = require('nodemailer');
const expressSession = require("express-session");

//Creating server
const server = express();

//Connecting to the database
mongoose.connect("mongodb://localhost/library");

//Using resources
server.use(expressSession({
    secret: "Polisaanam",
    resave: false,
    saveUninitialized: false
}));
server.use("/assets/css", express.static(__dirname + "/assets/css"));
server.use("/assets/img", express.static(__dirname + "/assets/img"));
server.use(bodyParser.urlencoded({extended : false}));
server.use(bodyParser.json());
server.use(passport.initialize());
server.use(passport.session());
server.use(flash());

//Route path
const booklistRoutes = require("./routes/booklist.route");
const userlistRoutes = require("./routes/userlist.route");
const userbooklistRoutes = require("./routes/userbooklist.route");


//Using model
const User = require("./models/users.model");
const Book = require("./models/books.model");
const Withdrawn = require("./models/withdrawn_books.model");

//passport
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Setting view engine
server.set("view engine","ejs");

//Setting parent routes
server.use('/booklist',booklistRoutes);
server.use('/userlist',userlistRoutes);
server.use('/viewbook',userbooklistRoutes);

//Resgister
server.get("/register",(req,res) => {
    res.render("register");
});

server.post("/register",(req,res) => {
    req.session.mail = req.body.mail;
    if(req.body.password == req.body.confpassword) {

        User.register(new User({

            username: req.body.username,
            college: req.body.college,
            phone: req.body.phone,
            mail: req.body.mail,
            registrationValidity: Date.now() + 3600000
        
        }), req.body.password, (err,user) => {
            if(err) {
                console.log(err);
                return res.redirect('/register');
            }
            
            passport.authenticate('local')(req,res,() => {
                if(req.user)
                {
                    console.log("User Authenticated..!");
                }
            });
            console.log("User created "+user.username);
            
        });

    //sending mail to registered people
    smtpTransport = nodemailer.createTransport({
        host:'smtp.gmail.com',
        post:465,
        secure:true,
        auth: {
            user: 'visitthestars0010@gmail.com',
            pass: 'pass@882836'
        }
    });

    let msg = {
        to: req.body.mail,
        from: 'Library Admin <nerdhacker007@gmail.com>',
        subject: 'User Registration',
        text: `Hey ${req.body.username},

Thank you for registering in the library. You may use ${req.body.username} as your login username.

Click on this link to confirm registration http://localhost:8000/confirm .

Regards,
Library Admin`
    };

    smtpTransport.sendMail(msg, (err) => {
        if(err) return console.log(err);
        console.log("Mail sent to "+req.body.username+".");
        return res.redirect('/thankyou');
    });

    }
    else {
        console.log("Password Mismatch");
        res.redirect('/register');
    }
});


//Mail Confirmation
server.get('/confirm', (req,res) => {
    User.findOneAndUpdate({mail: req.session.mail,registrationValidity:{$gt:Date.now()}},{isVerified: true} , err => {
        if(err) console.log(err);
        res.render('confirm'); 
        console.log('Done..!');
    });
});

//Login
server.get('/login', (req,res) => {
        res.render('login',{message: req.flash("Wrong Username or password")});
});

server.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash:true,
    successRedirect: '/home1',
}));

//logout
server.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/login');
});

//Add book
server.get('/addbook', (req,res) => {
    res.render("addbook");
});

server.post('/addbook', (req,res) => {
    book = new Book({

        author: req.body.author,
        name: req.body.name,
        genre: req.body.genre

    });
    console.log(book);
    
    book.save((err,books) => {
        if(err) {
            console.log(err);
            return res.redirect('/addbook');
        }
        console.log("Book Added");
        res.redirect('/booklist');
    });
});

//Remove Book
server.get('/removebook', (req,res) => {
    res.render("removebook");
});

server.post('/removebook', (req,res) => {
    Book.deleteOne({name: req.body.name , author: req.body.author}, err => {
        if(err)
        {
            console.log(err);
            return res.redirect('/removebook');
        }
        console.log(("The book "+req.body.name+" by "+req.body.author+" is deleted."));
        res.redirect('/booklist');
    });
});

//Remove User
server.get('/removeuser', (req,res) => {
    res.render("removeuser");
});

server.post('/removeuser', (req,res) => {
    User.deleteOne({username: req.body.username}, err => {
        if(err)
        {
            console.log(err);
            return res.redirect('/removeuser');
        }
        console.log(("The User "+req.body.username+" is deleted."));
        res.redirect('/userlist');
    });
});

//To change book from library to user
server.get('/takebook', (req,res) => {
    res.render('takebook');
});

server.post('/takebook', (req,res) => {
    Book.find({name:req.body.name, author: req.body.author},(err,books) => {
        if(err) return res.redirect('/takebook');
        console.log(books);
        withdrawn = new Withdrawn({
            name: req.body.name,
            author: req.body.author,
            genre: books[0].genre,
            username: req.body.username
        }); 
        console.log(withdrawn);

        withdrawn.save((err,files) => {
            if(err)
            {
                console.log(err);
                res.redirect('/takebook');
            }
            console.log("Book added to user DB");
            res.redirect('/viewbook');
         });
    });  
    Book.deleteOne({name: req.body.name, author: req.body.author}, err => {
        if(err)
        {
            console.log(err);
            return res.redirect('/takebook');
        }
        console.log(("The book "+req.body.name+" by "+req.body.author+" is deleted."));
    });
});

//To display static web pages
server.get('/polisaanam',(req,res) => {
    res.render("home");
    console.log("Veetil ethiyee...!");
})

server.get('/home1', (req,res) => {
    res.render("home1");
    console.log("Aaro veetil ethi..!");
});

server.get('/thankyou',(req,res) => {
    res.render('thankyou');
});

server.listen(8000);