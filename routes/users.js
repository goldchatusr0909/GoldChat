var express = require('express'); // requires the express module from modules folder.

var router = express.Router(); // the application listens for requests that match the specified routes, if a match is detected the specified callback function is called.

var passport = require('passport'); // requires the passport module from modules folder

var LocalStrategy = require('passport-local').Strategy; // this allows simpler creation of a username/password authentication system.

var User = require('../models/user'); // requires the user file to be called in this document.


// var fs = require('fs');
// eval(fs.readFileSync('public/scripts/geoController.js')+'');
// eval(fs.readFileSync('public/scripts/geoMap.js')+'');


// renders the registration page
router.get('/register', function (req, res) {
    res.render('register'); // sends rendered register HTML string to the client
});



// sends registration information to the register page, specifying the input of each field from the database, i.e. the var name will be made equal to req.body.name.
router.post('/register', function (req, res) {
    globalThis.Name = req.body.name;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    // var location = req.body.location;

    
    

    // checks to see if each registration field is comlpete, aswell as making sure that your passwords match
    req.checkBody('name', 'Name is required').notEmpty(); // if a name has not been entered then the message 'name is required' will be displayed in the designated text box. also designating the box as not empty.

    req.checkBody('lastname', 'last name is required').notEmpty(); // check the last name field for the above reason.

    req.checkBody('email', 'Email is required').notEmpty(); // the same as above expect using an email address

    req.checkBody('email', 'Email is not valid').isEmail(); // checks to see if the chosen email has already been taken, if so the message 'email not valid' will be displayed.

    req.checkBody('username', 'Username is required').notEmpty();

    req.checkBody('password', 'Password is required').notEmpty();

    req.checkBody('password2', 'Passwords do not match').equals(req.body.password); // checks if the password entered here matches the password entered in the previous section,

    var errors = req.validationErrors(); // means that any error that appears in the registration section is a validation error, meaning the registration process will start again.

    if (errors) {
        res.render('register', { // if a valiation error is detected then redirect to the start of the registration form.
            errors: errors
        });
    } else {
        //checks to see if the user name entered matchs any from an already created account
        User.findOne({
            username: {
                "$regex": "^" + username + "\\b", // used to search for the specified data in the collection, in this case searching to see if your username matches one aready created.
                "$options": "i"
            }
        }, function (err, user) {
            User.findOne({
                email: {
                    "$regex": "^" + email + "\\b", // used to search for the specified data in the collection, in this case searching to see if your email matches one already created.
                    "$options": "i"
                }
            }, function (err, mail) {
                if (user || mail) {
                    res.render('register', { // if the user name or email matches ones that have already been created, then an error will be thrown and you will be redirected back to the sart of the registration page.
                        user: user,
                        mail: mail
                    });
                } else {
                    var newUser = new User({  //if all the details enetered meet the requirements and no errors are thrown then a new user will be created with the name, username, email and password stored in the database.
                        name: Name,
                        lastname: lastname,
                        email: email,
                        username: username,
                        password: password
                    });
                    User.createUser(newUser, function (err, user) {
                        if (err) throw err;
                        console.log(user);
                    }); 
                    req.flash('success_msg', 'You are registered and can now login'); // if you have sucessfully registerd then this message will be displayed.
                    res.redirect('/users/login'); // you will then be redirected to the login page so you can login using the username and password just created.
                }
            });
        });
    }
});

// render the login page. 
router.get('/login', function (req, res) {
    res.render('login');
});


passport.use(new LocalStrategy( // authenticate the username when it has been entered
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'Unknown User' // if the username entered is not recognised then throw an error and display 'unknown user' message.
                });
            }
            //compare the password entered at login with exising passwords.
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user); // if the input password matches an existing one then continue.
                } else {
                    return done(null, false, {
                        message: 'Invalid password' //if the password does not match an existing one then display 'Invalid password' and try again.
                    });
                }
            });
        });
    }));
//used to set the user ID as a cookie in the browser (cookies are used to indentify your computer when using a network).
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
// retrieves the ID from the cookie, then used to get user info in a callback function. 
passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login', //submits data taken from the login form.
    passport.authenticate('local', { //authenticate the username and password against the database.
        successRedirect: '/', // is password is correct redirect to the homepage logged in.
        failureRedirect: '/users/login', // if password is incorrect then redirect to the login page to try again. 
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/'); 
    });
//logout function.
router.get('/logout', function (req, res) {
    req.logout(); // call the logout funtion.

    req.flash('success_msg', 'You are logged out'); // when logout is successful, display the message 'you are logged out'.

    res.redirect('/users/login'); // logging out will redirect you to the login page, from which you can choose to log back in or create a new user.
});


module.exports = router;
