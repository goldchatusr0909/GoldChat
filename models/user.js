//Mongoose allows you to create a schema so you can interact with structured data repeatedly, mongoose will also return data as a JSON object that you can directly interact with instead of a string.
var mongoose = require('mongoose'); 
// the require function is just an easy way of including models such as mongoose and bycrypt when they exist in seperate files in the directory.

//bycrypt allows you to hash your passwords, meaning it will convert it into a random string as an added layer of security so anyone attempting to breach user data wont be able to see the full password.
var bcrypt = require('bcryptjs');
const { Db } = require('mongodb');



// We use a schema here which defines the content and structure of the data in a datbase for example below it states the input for a password when regstering has to be in the form of a string.
var UserSchema = mongoose.Schema({
	username: {
		type: String,  //here it states that the input for the username when registering will be in the form of a string. the same applies for each instance in this schema.
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	lastname: {
		type: String
	},
	userImage : {
		type:String,
		default:'default.png'  // the name of the image will be saved as a string and a default png will be loaded in for each new user.
	},
	sentRequest:[{
		username: {type: String, default: ''}  // when sending a friend request the user must input a string which would be another persons username, if the username typed matches one in this database then you will be able - 
	}],										   //- to add them as a friend.
	request: [{
		userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // this section is that when a friend rquest is sent it will cheeck if a user by that name exists.
		//adds the username of a user trying to send a request to the database
		username: {type: String, default: ''} 
	}],
	friendsList: [{
		friendId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // an object containing all the usernames on your friend list.
		friendName: {type: String, default: ''}
	}],
	totalRequest: {
		type: Number, default:0 // the number 0 will increase as the amount of valid users on your friend list increases.
	},
});



// module.export instrcuts node.js on which bits of code such as functions and objects to export from the specified file so other code files can access them, in this case being the above user schema.
var User = module.exports = mongoose.model('User', UserSchema); 
// var Locschema = module.exports = mongoose.model('Locschema', locationSchema);

// exports the create user function from one of the models as well as password hashing. essentially a function to create a new user and hash that users password to save in the database.
module.exports.createUser = function(newUser, callback){ 
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}
//exports the getUserByUsername function from the mongoose model meaning that a user could search the database for someone via their username.
module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}
// similar to the above function except instead of searching for a username it would be searching for a userID.
module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}
//exports a comparePassword function from the mongoose model meaning that when logging in, the password that has been entered will be compared against the password created on registration that was subsequently hashed.
//if the passwords do not match exactly then an error will be thrown.
module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch); // if they do match then no error is thrown, allowing a user to continue using the application.
	});
}
