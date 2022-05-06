//imports express from the module folder for use in the application, setting its variable name to express.
var express = require('express');

//initiates the express.router function which essentially creates the route to each page but also extends so it can also create routes to error pages (404 page not found) as an example.
var router = express.Router();

//initiates formidable which is used for parsing form data(changing it into a differrnt format), especially in the case of file uploads (avatar images for example).
var formidable = require('formidable');

//imports the user script from the models directory.
var User = require('../models/user');

//path is a function that makes it easier to interact with different file paths through out the directories.
var path = require('path');

var async = require('async'); // provides functions that make it easier to use asynchronous javascript (code that executs immediatley instead of waiting for the current execution to finish
//before running the next).

var unirest = require('unirest'); // unirest is used in the creation of rest APIs and in making rest requests for http.

var http = require('http'); //examines incoming and outgoing requests to help decide what to do.

var fs = require('fs'); //fs is used in this instance so client side js files can be inluded in node.js files as modules aswell as allowing node.js modules to be used in client js.

//before rendering the index page router.get requests data from the database to ensure that you are authenticated to be on or see what is on the specified page.
router.get('/', ensureAuthenticated, function (req, res) {
    
    res.render('index', {
        newfriend: req.user.request, // if authentication is successful then this should render and allow you to see the friend requests dropdown mennu.
        
    });
});

//checks the search function to make sure the user is allowed to use it.
router.get('/search', ensureAuthenticated, function (req, res) {
    var sent = []; // these are arrays that are made to store sent friend requests, a list of a users friends and a list of recieved friend requests respectively.
    var friends = [];
    var received = [];

    received = req.user.request; // means that the recieved var seen above is equal to req.user.request (recieved friend requests).

    sent = req.user.sentRequest; // sent var is equal to req.user.sentRequest (sent friend requests).

    friends = req.user.friendsList; //friends array variable name is equal to req.user.friendsList (list of added friends).

    //each time a user sends a friend request and recieves a friend request it will be included in the arrays above.
    //aso each time a new user is added to the friends list (when a request is accepted) it will be added to the friends list array.


    //initiates the user.find function which looks at what you have input and matches it against the user names in the database. (same as above two).
    User.find({
        username: {
            $ne: req.user.username
        }
    }, function (err, result) { // if the username that is being searched for does not match any of the ones in the database then an error will be thrown and you will have to try again.
        if (err) throw err;

        res.render('search', { // if the username does match one in the database then a friend request can be sent. updating the above arrays as the process continues.
            result: result,
            sent: sent,
            friends: friends,
            received: received
        });
    });
});
// ensureAuthenticated is a middleware that will ensure that the request (in this case submitting data to the search page) has been authenticated with passport before it can run.
router.post('/search', ensureAuthenticated, function (req, res) {
    var searchfriend = req.body.searchfriend;
    if (searchfriend) {
        var mssg = '';
        if (searchfriend == req.user.username) {//if the username searched for is equal to one in in the database then no error will be thrown, then alowing you to add them.
            searchfriend = null;  
        }
        User.find({
            username: searchfriend
        }, function (err, result) {
            if (err) throw err;
            res.render('search', { // uses the input data to try and find the respective account, if it cannot, it will return an error. If not the correct user will be displayed.
                result: result,
                mssg: mssg
            });
        });
    }



    //  async.parallel will run each operation inside simultaneously 
    async.parallel([
		function (callback) {
            // callback function so if a request is successfully made to you, your add friends section will be updated with the sent request.
                if (req.body.receiverName) {
                    User.update({
                        'username': req.body.receiverName,
                        'request.userId': {
                            $ne: req.user._id
                        },
                        'friendsList.friendId': {
                            $ne: req.user._id
                        }
                    }, {
                        $push: {
                            request: {
                                userId: req.user._id,
                                username: req.user.username // push the user ID and username of the account requesting so it can be displayed on the recipients page.
                            }
                        },
                        $inc: {
                            totalRequest: 1 // each time a new friend request is recieved then increment the value representing total friend requests by one.
                        }
                    }, (err, count) => {
                        console.log(err);
                        callback(err, count); // a call back is provided so when the results or data is recived it can be called again. during this time between initiating and the final call back, other computations can be completed parralell but separately.
                    })
                }
		},
		//this callback has a similar effect to the one above except on the request senders end instead. updating the sent requests section with the input data if correct.
        function (callback) {
                if (req.body.receiverName) {
                    User.update({
                        'username': req.user.username,
                        'sentRequest.username': {
                            $ne: req.body.receiverName  
                        }
                    }, {
                        $push: {
                            sentRequest: {
                                username: req.body.receiverName //updates information specifying the username of the account that has sent the friend request.
                            }
                        }
                    }, (err, count) => {
                        callback(err, count); // if anything goes wrong then throw an error.
                    })
                }
		}],
        (err, results) => {
            res.redirect('/search'); // if for any reason an error is thrown (entering the wrong username in the search bar for example) then the user will be redirected back to the start of the search system to try again.
        });

    async.parallel([

        //when a friend request is accepted by another user this function updates for the reciever of the request

				function (callback) {
            if (req.body.senderId) {
                User.update({
                    '_id': req.user._id,
                    'friendsList.friendId': {  //update the friends list with the ID of the accepted user
                        $ne: req.body.senderId
                    }
                }, {
                    $push: {
                        friendsList: {
                            friendId: req.body.senderId,
                            friendName: req.body.senderName // updates the friends list with the ID and name of the account sending the friend request.
                        }
                    },
                    $pull: {
                        request: {
                            userId: req.body.senderId,
                            username: req.body.senderName // remove user information from the friends list area when a request has been accepted (so it cannot be accepted more than once).
                        }
                    },
                    $inc: {
                        totalRequest: -1 // when a friend request has been accepted then it will decrease the number of available friend requests by one.
                    }
                }, (err, count) => {
                    callback(err, count); // if anything goes wrong throw an error.
                });
            }
				},
				// this function is updated for the sender of the friend request when it is accepted by the receiver	
				function (callback) {
            if (req.body.senderId) {
                User.update({
                    '_id': req.body.senderId,
                    'friendsList.friendId': { 
                        $ne: req.user._id
                    }
                }, {
                    $push: {
                        friendsList: {
                            friendId: req.user._id,
                            friendName: req.user.username // add the username of the accepted friend request to the friends list
                        }
                    },
                    $pull: {
                        sentRequest: {
                            username: req.user.username // remove the username from the request section so you can only add a user once.
                        }
                    }
                }, (err, count) => {
                    callback(err, count); // throw an error if something goes wrong.
                });
            }
				},
				function (callback) {
            if (req.body.user_Id) {
                User.update({
                    '_id': req.user._id,
                    'request.userId': {
                        $eq: req.body.user_Id // update the user ID in the request section 
                    }
                }, {
                    $pull: {
                        request: {
                            userId: req.body.user_Id // remove the user ID from the request section once accpeted
                        }
                    },
                    $inc: {
                        totalRequest: -1 // decreases the amount of total requests by one.
                    }
                }, (err, count) => {
                    callback(err, count);
                });
            }
				},
				function (callback) {
            if (req.body.user_Id) {
                User.update({
                    '_id': req.body.user_Id,
                    'sentRequest.username': { // changes the username from a sent request to on the friends list.
                        $eq: req.user.username
                    }
                }, {
                    $pull: {
                        sentRequest: {
                            username: req.user.username // removes the username from the sent request array.
                        }
                    }
                }, (err, count) => {
                    callback(err, count);
                });
            }
				} //if there is an error when you enter something into the search function, then it will reset
			], (err, results) => {
        res.redirect('/search');
    });
});



router.get('/location', function (req, res){ // the below IP retrieval and coordinates push is contained in the get location function so it happens upon loading the location page and not on app launch to increase speeds.

let location = {

    location: []

} // creates a location object containing a location array to store geocoordinates
    



http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
    resp.on('data', function(ip) {
      console.log("My public IP address is: " + ip); // display your devices public IP in the command line.
      const ipLocation = []; // creaete an ipLocation array.

      const axios = require('axios'); // require the axios module for using a geolocation api in node.js

      async function getIpInfo (){
         // Set endpoint and your access key
          const pubIp = ip;
          const accessKey = '838e8bea-f2c2-4502-a7c2-f87050cf6281';
          const url = 'https://apiip.net/api/check?ip='+ pubIp +'&accessKey='+ accessKey;
  // Make a request and store the response
  const response = await axios.get(url);
  const result = response.data;

  // display the latitude and longitude parameters from the IP results.
  console.log(result.latitude, result.longitude);

  location.location.push([result.longitude, result.latitude]); //push the lat/lng coords into the location array created above
  console.log(location);

  fs.writeFileSync(path.resolve(__dirname, 'location.json'), JSON.stringify(location)); // use the fs module to write the lat/lng coords array and object into a locations.json file for storing in a mongodb database.

};
getIpInfo(); // call to get the ip information from the device
      
    });


  });
    
    res.render("location.handlebars") // render the location handerbars file so the location page can match the sites layout.
})

//form for uploading a new user profile image.
router.post('/', function (req, res) {
    var form = new formidable.IncomingForm();// used for pasrsing form data.
    form.parse(req);
    let reqPath = path.join(__dirname, '../'); // path.join merges specified path segments into one path.
    let newfilename;
    form.on('fileBegin', function (name, file) {
        file.path = reqPath + 'public/upload/' + req.user.username + file.name;
        newfilename = req.user.username + file.name; // path to uploading a user image for a profile picture/avatar 
    });
    form.on('file', function (name, file) {
        User.findOneAndUpdate({
                username: req.user.username
            }, {
                'userImage': newfilename // 
            },
            function (err, result) {
                if (err) {
                    console.log(err);// throw an error if something goes wrong
                }
            });
    });
    req.flash('success_msg', 'profile picture updated');
    res.redirect('/'); // redirected back to the page with an updated profile picture along with a success message.
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {  // if passport is able to authenticate that you are logged in correctly you will be taken to the next page
        return next();
    } else {
        
        res.redirect('/users/login'); // otherwise if passport cannot authenticate you then you will be redirected back to the login page.
    }
}

module.exports = router; 
