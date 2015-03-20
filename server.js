var parseString = require('xml2js').parseString; // parse xml to json
var User = require("./svn_user.js").User;
var fs = require("fs");
var express = require("express");
var querystring = require("querystring");
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);

/**
    Include a static file serving middleware at the top of stack
*/
app.use(express.static(__dirname + '/www'));

var user_data = {}; // key is user name

/*
user.queryLog(function(error){
    console.log(error);
}, function(data){
    console.log(data);
});*/

app.get('/', function(req, res){
   // res.sendfile("index.html");   // render index.html
   res.render("/www/index.html");
});

io.on("connection", function(socket){
    console.log("User: " + socket.id + " connected");

    // user login
    socket.on("user_login", function(data){
        // get user information from data
        var user_name = data.user_name;
        var user_password = data.user_password;
        var user_svn_address = data.user_svn_address;

        // initialize user
        user = new User(user_name, user_password, user_svn_address);

        // query log
        var query_log_result = user.queryLog();
        var log_error = query_log_result.stderr.toString("utf8");
        var log_string = query_log_result.stdout.toString("utf8");
        if (log_error){
            io.emit("login_error", "fail to get log string"); // error
            return;
        }

        // query list
        var query_list_result = user.queryList();
        var list_error = query_list_result.stderr.toString("utf8");
        var list_string = query_list_result.stdout.toString("utf8");
        if (list_error){
            io.emit("login_error", "fail to get list string"); // error
            return;
        }
        // parse xml to json
        var log_json = null;
        var list_json = null;
        parseString(log_string, function(error, data){
            if(error){
                io.emit("login_error", "parsing log string failed"); // error
                return;
            }
            log_json = data;
            parseString(list_string, function(error, data){
                if (error){
                    io.emit("login_error", "parsing list string failed"); // error
                    return;
                }
                list_json = data;
                // done retrieving data
                console.log("Finish loading svn data");

                // save to database
                // TODO: save to mongodb
                // TODO: check same user name ...
                user_data[socket.id ] = {
                    user_name: user_name,
                    user_password: user_password,
                    user_svn_address: user_svn_address,
                    log_json: log_json,
                    list_json: list_json
                };
                socket.emit("login_success", socket.id);
            });
        });
    });

    // user get data
    socket.on("get_data", function(user_id){
        socket.emit("get_data_success", user_data[user_id]);
    });
});



http.listen(3000, function(){
    console.log("Listening on port 3000");
});
