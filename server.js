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

var user = new User(
    "ywang189",
    "HsjWghW11",
    "https://subversion.ews.illinois.edu/svn/sp15-cs242/ywang189"
);
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
    var jsonString = '';
    if (req.method === "POST"){
        // begin to get data
        req.on("data", function(data){
            jsonString += data;
        });
        // finish loading data
        req.on('end', function(){
            var jsonObject = querystring.parse(jsonString);
            var user_name = jsonObject.user_name;
            var user_password = jsonObject.user_password;
            var user_svn_address = jsonObject.user_svn_address;
            console.log(user_name + " " + user_password + " " + user_svn_address);
            res.send(JSON.stringify(jsonObject));
        });
    }
});


var server = app.listen(3000, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log(host + " " + port);
});
