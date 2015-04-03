/**
 *
 *  filterComment schema:
 *
 *  	replace_string: String
 *  	with_string:    String
 *   	_id
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
var commentFilterSchema = new Schema({
    replace_string: String,
    with_string: String
});

// create model that uses the schema
var db_commentFilter = mongoose.model("filter_comments", commentFilterSchema);

// make this available to our users.
module.exports = db_commentFilter;
