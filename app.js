//require is an easy way of including different modules in your application that exist in different files in the directory.

var express = require('express'); // express is a web application framework designed to help in the dvelopment and design of web applications, meaning a lot of code is pre written to assist programers.

var path = require('path'); //path provides utilities that allow for easier interaction and manipulation of file paths and directory paths.

var http = require('http'); // simple module that allows node to transfer data over the hyper text transfer protocol (HTTP). primarily used to create a http server that will listen to server ports allowing you to run applications on LocalHost.

var cookieParser = require('cookie-parser'); // used to parse cookies ()

var bodyParser = require('body-parser'); // converts data into a format that allows relevant information to be extracted simply and easily

var handlebars = require('handlebars');

var exphbs = require('express-handlebars'); //handlebars is a logicless templating engine, typically used to render web-pages to the client side fromm data on the server side.(each section has its own handlebars page
//(login, search, register, etc, these files create the basic layout of each section. then linked to the main layout.handlebars folder and styled from their using linked stylesheets so evrthing flows in terms 
//of appliaction design)).

var {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

var expressValidator = require('express-validator'); // typically used for server side security, ensuring that any information that a user inputs is the correct type also stopping untrusted data recieved from other
//clients such as other web applications. 

var flash = require('connect-flash'); // used to create pop up messages, such as the login failed message for exmaple.

var session = require('express-session'); // stores a session identifier (a piece of data that is used to indentify a session) withtin a cookie on the client end instead of cookie session which is used for smaller scaled applications.

var passport = require('passport'); // authentication middleware for node.js, allows for users to be authenticated against existing login details that are being stored in a database such as mongodb atlas. also allows for authentication
//through the use of google or facebook

var LocalStrategy = require('passport-local').Strategy; // allows authentication using only a username and password.

var mongo = require('mongodb'); // document oriented database program, NoSQL meaning it is unstructured

var mongoose = require('mongoose'); // manages the relationships between different data, as well as providing schema validation. ("the problem that mongoose aims to solve is allowing developers to enforce a specific schema 
//at the application layer").

var unirest = require('unirest');





var socketIO = require('socket.io'); // enables bidirectional communication (enables more than 2 people to have a conversation, i.e.previosuly created chat application)



//-----atttempt at configuring an AWS (amazon web servive) enviroment bucket for storing static files such as images.------------------------------------------------
// //configure AWS enviroment

// AWS.config.update({
//     accessKeyId: 
//     secretAccessKey
// });

// var s3 = new AWS.S3();
// var filePath = "/app/GoldChat/GoldChat/public/upload/goldchat.png";


// var params = {
//     Bucket:'goldchat',
//     Body: fs.createReadStream(filePath),
//     Key: "folder/"+Date.now()+"_"+path.basename(filePath),

// };

// s3.upload(params, function (err, data) {
//     //handle error
//     if (err) {
//       console.log("Error", err);
//     }
  
//     //success
//     if (data) {
//       console.log("Uploaded in:", data.Location);
//     }
//   });

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------
const User = require('./routes/users'); // require the users.js file from the routes folder
const fs = require('fs'); // require the fs module for the app.js file

mongoose.connect('mongodb+srv://djh783:Cococookie100@cluster0.mfl9z.mongodb.net/Cluster0?retryWrites=true&w=majority'); //allows for immediate use of models wihtout waiting for mongoose to establish a connection.
var db = mongoose.connection;

var routes = require('./routes/index'); // include the routes/index file.
var users = require('./routes/users'); // include the routes/users file.


// Initialise the app
var app = express(); // starts a new express application.
const server = http.createServer(app); // creates a server for the application to run on.
const io = socketIO(server); //server initialisation.



var friend =require('./socket/friend'); // require the friends file in the socket folder directory. which controls the add friends function.
friend(io);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs.engine({ // sets the application to use the handlebars engine.
    
    helpers: {
        ifIn: function (elem, list, options) {
            if (list.indexOf(elem) > -1) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    },
    defaultLayout: 'layout', // sets default layout of the page.
    handlebars: allowInsecurePrototypeAccess(handlebars) // allows handlebars to access prototype template engines.
}));
app.set('view engine', 'handlebars'); // sets the view engine as handlebars 


// middleware for bodyparser
app.use(bodyParser.json()); // tell the system to use JSON.
app.use(bodyParser.urlencoded({
    extended: false // use a simple algorithm for parsing.
}));
app.use(cookieParser()); // initialise cookie parser.

app.use(express.static(path.join(__dirname, 'public'))); // serves static files, for example, images and css files.

// use express session 
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// initialize passport managment and authentication through out the application.
app.use(passport.initialize());
app.use(passport.session());

// initialisze expressValidator 
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };// formats and controls errors created when the registration requirements are not met.
    }
}));

// uses the flash module for popup boxes.
app.use(flash());

// initialize messages.
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg'); // dislay success message locally, same for below respectively.
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes); // initialize the use of the routes and users folders and files respectivley.
app.use('/users', users);


// Set the localHost to listn on port 8080, if you search for localhost:8080 in a web browser with the application 
//running, you would be able to use and interact with it freely. although only on the running device.
app.set('port', (process.env.PORT || 8080));


server.listen(app.get('port'), function () { // makes sure the server listens to the port it will be running from.
    console.log('listening on port 8080'); // console.log message 'listening on port 8080' when conncection to the port is established.
});
