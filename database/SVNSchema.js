/**
 *
 *  SVN schema:
 *  	svn_addr
 *  	svn_username
 *  	svn_password
 *   	username           == who create the svn.
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
    console.log("Failed to connect to database: svns");
});

db.once("open", function(callback){
    console.log("Connected to database: svns");
});

// create schema
var svnSchema = new Schema({
    svn_addr: String,
    svn_username: String,
    svn_password: String,
    username: String
});

// create model that uses the schema
var db_SVN = mongoose.model("svn", svnSchema);

// make this available to our users.
module.exports = db_SVN;
