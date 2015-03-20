var parseString = require('xml2js').parseString; // parse xml to json
var User = require("./svn_user.js").User;
var fs = require("fs");
var express = require("express");
var querystring = require("querystring");
var router = express.Router();
var app = express();
/**
    Include a static file serving middleware at the top of stack
*/
app.use(express.static(__dirname + '/www'));

var user = null;  // global variables
var log_json = null;
var list_json = null;

/*
user.queryLog(function(error){
    console.log(error);
}, function(data){
    console.log(data);
});*/

app.get('/', function(req, res){
   res.sendfile("index.html");   // render index.html
});

// User Login
app.post('/UserLogin', function(req, res){
    console.log("User Login");
    var post_data = '';
    if (req.method === "POST"){
        // begin to get data
        req.on("data", function(data){
            post_data += data;
        });
        // finish loading data
        req.on('end', function(){
            var jsonObject = querystring.parse(post_data);
            var user_name = jsonObject.user_name;
            var user_password = jsonObject.user_password;
            var user_svn_address = jsonObject.user_svn_address;

            // initialize user
            user = new User(user_name, user_password, user_svn_address);
            var query_log_result = user.queryLog();
            var log_error = query_log_result.stderr.toString("utf8");
            var log_string = query_log_result.stdout.toString("utf8");
            if (log_error){
                res.send("error"); // error
                return;
            }
            var query_list_result = user.queryList();
            var list_error = query_list_result.stderr.toString("utf8");
            var list_string = query_list_result.stderr.toString("utf8");
            if (list_error){
                res.send("error");
                return;
            }

            log_json = null;
            list_json = null;
            parseString(log_string, function(error, data){
                if(error){
                    res.send("error");
                    return;
                }
                log_json = data;
            });
            parseString(list_string, function(error, data){
                if (error){
                    res.send("error");
                    return;
                }
                list_json = data;
            });
            res.send("success");

            /*
            console.log("Result: ");
            console.log(query_result.stdout.toString("utf8"));
            console.log("Stderr: " + query_result.stderr.toString("utf8"));
            console.log(query_result);
            */
        });
    }
});


var server = app.listen(3000, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log(host + " " + port);
});
