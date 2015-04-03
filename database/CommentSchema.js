/**
 *
 *  SVN schema:
 *  	username
 *  	content
 *  	left
 *   	parent_id
 *  	comment_id
 *   	_id
 *   	post_date
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
var commentSchema = new Schema({
    username: String,
    content: String,
    left: String,
    parent_id: String,
    comment_id: String,
    post_date: Date
});

// create model that uses the schema
var db_Comment = mongoose.model("comment", commentSchema);

// make this available to our users.
module.exports = db_Comment;
