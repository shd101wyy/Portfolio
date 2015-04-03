/**
 * Server Side Code
 */
var parseString = require('xml2js').parseString; // parse xml to json
var User = require("./svn_user.js").User;
var fs = require("fs");
var express = require("express");
var querystring = require("querystring");
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var crypto = require('crypto');
var db_User = require("./database/UserSchema.js"); // require database User model

/**
    Include a static file serving middleware at the top of stack
*/
app.use(express.static(__dirname + '/www'));

/*
 * TODO: use database
 */
var user_name_data = {}; // key is user name, value is socketid
var user_socketid_data = {}; // key is socketid, value is user_name

/**
 * user will
 */
function notifyFriendsOnline(user){

}

/**
 * User will notify all its friends that it is now offline
 */
function notifyFriendsOffline(user){
    var friends = user.friends;
    for(var i = 0; i < friends.length; i++){
        if (friends[i] in user_name_data){
            io.sockets.connected[user_name_data[friends[i]]].emit("friend_offline", user.username);
        }
    }
}

// make 2 users friends
function establishFriendRelationship(user1, user2){
    user1.friends.push(user2.username);
    user2.friends.push(user1.username);

    user1.save(function(error){
        if(error){
            return;
        }
    });
    user2.save(function(error){
        if(error){
            return;
        }
    });

    // update listview
    io.sockets.connected[user_name_data[user1.username]].emit("add_friend_list_item", user2.username);

    io.sockets.connected[user_name_data[user2.username]].emit("add_friend_list_item", user1.username);

}

app.get('/', function(req, res){
   res.render("/www/index.html");  // render index.html
});

io.on("connection", function(socket){
    // user connect
    console.log("User: " + socket.id + " connected");

    // user login
    socket.on("user_login", function(data){
        // get user information from data
        var username = data.user_name;
        var password = data.user_password;
        password = crypto.createHash('md5').update(password).digest('hex');

        db_User.find({username: username, password: password}, function(error, users){
            if (error || users.length === 0){ // no such user exists
                socket.emit("login_error", "no such user existed");
            }
            else{
                // user already login
                // we only allow user login in one page (once)
                if (username in user_name_data){
                    socket.emit("user_already_login");
                }
                else{
                    socket.emit("login_success", users[0]._id);
                }
            }
        });
    });

    // user signup
    socket.on("user_signup", function(data){
        // get user information from data
        var username = data.user_name;
        var password = data.user_password;
        password = crypto.createHash('md5').update(password).digest('hex');

        // create new user
        var new_user = db_User({
            username: username,
            password: password,
            friends: []
        });

        // save to database
        new_user.save(function(error){
            if (error){
                socket.emit("signup_error");
            }
            else{
                socket.emit("login_success", new_user._id);
            }
        });
    });

    // user enter user panel
    socket.on("user_in_panel_page", function(data){
        var username = data[0];
        var user_id = data[1];
        db_User.find({username: username, _id: user_id}, function(error, data){
            if(error || data.length !== 1){
                return;
            }
            else{
                console.log(socket.id + " " + username + " enter user panel ");
                user_name_data[username] = socket.id; // save username => socketid to user_data.
                user_socketid_data[socket.id] = username;

                var friends = data[0].friends;
                var online_friends = {};
                for(var i = 0; i < friends.length; i++){
                    // notify user that you are online now
                    if (friends[i] in user_name_data){
                        online_friends[friends[i]] = true; // mark this friend as online
                        io.sockets.connected[user_name_data[friends[i]]].emit("friend_online", username);
                    }
                }


                // TODO: send necessary data only..
                //       dont send password
                // Send data to user
                socket.emit("receive_user_data_from_server", {
                    friends: friends,
                    online_friends: online_friends
                });
            }
        });
        // check user notification
        // TODO: do it later
    });

    /*
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
            socket.emit("login_error", "fail to get log string"); // error
            return;
        }
        else{
            socket.emit("get_log_string_data_success");
        }

        // query list
        var query_list_result = user.queryList();
        var list_error = query_list_result.stderr.toString("utf8");
        var list_string = query_list_result.stdout.toString("utf8");
        if (list_error){
            socket.emit("login_error", "fail to get list string"); // error
            return;
        }
        else{
            socket.emit("get_list_string_data_success");
        }
        // parse xml to json
        var log_json = null;
        var list_json = null;
        parseString(log_string, function(error, data){
            if(error){
                socket.emit("login_error", "parsing log string failed"); // error
                return;
            }
            log_json = data;
            parseString(list_string, function(error, data){
                if (error){
                    socket.emit("login_error", "parsing list string failed"); // error
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
                    // user_password: user_password,
                    user_svn_address: user_svn_address,
                    log_json: log_json,
                    list_json: list_json,
                    svn_user: user
                };
                socket.emit("login_success", socket.id);
            });
        });
    });
    */

    // user add friend
    socket.on("add_friend", function(friend_user_name){
        console.log("user add " + friend_user_name);
        db_User.find({username: friend_user_name}, function(error, friend){
            // no such user existed
            if (error || friend.length === 0){
                socket.emit("no_such_user", friend_user_name);
            }
            // friend not online
            else if (!(friend_user_name in user_name_data)){
                socket.emit("friend_request_failed", "User " + friend_user_name + " has to be online");
            }
            // user cannot add himself
            else if (friend_user_name === user_socketid_data[socket.id]){
                socket.emit("friend_request_failed", "You are not allowed to add yourself");
            }
            // already friend
            else if (friend[0].friends.indexOf(user_socketid_data[socket.id]) !== -1){
                socket.emit("friend_request_failed", "You and " + friend_user_name + " are already friends");
            }
            else{
                socket.emit("add_friend_request_sent", friend_user_name);

                // send friend your information
                io.sockets.connected[user_name_data[friend_user_name]].emit("receive_friend_request", user_socketid_data[socket.id]);
            }
        });
    });

    // user accept friend
    socket.on("accept_friend_request", function(data){
        var user1 = data[0];
        var user2 = data[1];
        db_User.find({username: user1}, function(error, users){
            if (users && users.length === 1 ){
                user1 = users[0];

                db_User.find({username: user2}, function(error, users){
                    if (users && users.length === 1){
                        user2 = users[0];
                        establishFriendRelationship(user1, user2);
                    }
                });
            }
        });
    });

    /*
    // user get data
    socket.on("get_data", function(user_id){
        socket.emit("get_data_success", user_data[user_id]);
    });

    // user query file
    socket.on("query_file", function(data){
        var user_id = data.user_id;
        var file_name = data.file_name;
        var user = user_data[user_id].svn_user;
        var query_file_result = user.queryFile(file_name);
        var query_file_error = query_file_result.stderr.toString("utf8");
        var query_file_string = query_file_result.stdout.toString("utf8");
        if(query_file_error){
            socket.emit("query_file_fail");
        }
        else{
            socket.emit("query_file_success", query_file_string);
        }
    });
    */

   socket.on("disconnect", function(){
       if (socket.id in user_socketid_data){
           var disconnect_user_name = user_socketid_data[socket.id];
           console.log(socket.id + " " + disconnect_user_name + " disconnect");
           delete(user_socketid_data[socket.id]);
           delete(user_name_data[disconnect_user_name]);
           // notify friends that the user is now offline
           db_User.find({username: disconnect_user_name}, function(error, data){
               notifyFriendsOffline(data[0]);
           });
       }
       else{
           console.log(socket.id + " not in data");
       }
   });
});


// setup server
http.listen(3000, function(){
    console.log("Listening on port 3000");
});
