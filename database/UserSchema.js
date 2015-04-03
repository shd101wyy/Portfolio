/**
 *
 *  User schema:
 *  	username
 *  	password
 *  	friends         => save friends _id
 *  	comment: [[username, message, left], [username, message, left], ...]
 *  	svn:     [svn_addr, svn_addr, ...]
 *  	_id
 *
 *
 */
// grab the things we need
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.connect("mongodb://127.0.0.1/Portfolio");

/**
 * Check database connection
 **/
var db = mongoose.connection;
db.on("error", function(){
    console.log("Failed to connect to database: users");
});

db.once("open", function(callback){
    console.log("Connected to database: users");
});

// create schema
var userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    friends: Array,
    comment: Array,
    svn: Array
});

// create model that uses the schema
var db_User = mongoose.model("User", userSchema);

// make this available to our users.
module.exports = db_User;
