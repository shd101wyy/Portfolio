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
var db_SVN = require("./database/SVNSchema.js");   // require database SVN model
var db_Comment = require("./database/CommentSchema.js");
var  algorithm = 'aes-256-ctr';
function encrypt(text){
  var cipher = crypto.createCipher(algorithm, "asdfnjksaQW");
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,"asdfnjksaQW");
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}

/**
    Include a static file serving middleware at the top of stack
*/
app.use(express.static(__dirname + '/www'));

/*
 * TODO: use database
 */
var user_name_data = {}; // key is username, value is socketid
var user_socketid_data = {}; // key is socketid, value is username
var user_svn_data = {};  // key is svn_addr, value is User object.
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

// send friend svn to user
function sendFriendSVNToUser(friend_name, socket){
    db_User.find({username: friend_name}, function(error, data){
        socket.emit("receive_friend_svn", [friend_name, data[0].svn]);
    });
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
        password = encrypt(password); // encrypt password

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
        password = encrypt(password);  // encrypt password

        // create new user
        var new_user = db_User({
            username: username,
            password: password,
            friends: [],
            comment: [],
            svn: []
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
            var user = data[0];
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

                // get all comments
                db_Comment.find({}).sort("-date").exec(function(error, data){
                    if (error){
                        socket.emit("request_error", "Failed to connect to database");
                    }
                    else{
                        // TODO: send necessary data only..
                        //       dont send password
                        // Send data to user
                        socket.emit("receive_user_data_from_server", {
                            friends: friends,
                            online_friends: online_friends,
                            svn: user.svn,
                            comment: data
                        });

                        // send friend svn
                        for(i = 0; i < friends.length; i++){
                            sendFriendSVNToUser(friends[i], socket);
                        }
                    }
                });
            }
        });
        // check user notification
        // TODO: do it later
    });

    // user connect to svn
    socket.on("user_connect_to_svn", function(data){
        var username = data[0];
        var svn_addr = data[1];
        console.log("user connect to " + svn_addr);
        db_SVN.find({svn_addr: svn_addr}, function(error, data){
            if (error || !data || data.length !== 1){
                socket.emit("request_error", "Failed to connect to database");
            }
            else{
                // TODO: decrypt svn password
                var svn_username = data[0].svn_username;
                var svn_password = decrypt(data[0].svn_password); // decrypt password
                var svn_addr = data[0].svn_addr;

                var svn_user = new User(svn_username, svn_password, svn_addr);

                // query log
                var query_log_result = svn_user.queryLog();
                var log_error = query_log_result.stderr.toString("utf8");
                var log_string = query_log_result.stdout.toString("utf8");
                if (log_error){
                    socket.emit("request_error", "failed to get log string"); // error
                    return;
                }
                else{
                    socket.emit("get_log_string_data_success");
                }

                // query list
                var query_list_result = svn_user.queryList();
                var list_error = query_list_result.stderr.toString("utf8");
                var list_string = query_list_result.stdout.toString("utf8");
                if (list_error){
                    socket.emit("request_error", "failed to get list string"); // error
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
                        socket.emit("request_error", "parsing log string failed"); // error
                        return;
                    }
                    log_json = data;
                    parseString(list_string, function(error, data){
                        if (error){
                            socket.emit("request_error", "parsing list string failed"); // error
                            return;
                        }
                        list_json = data;
                        // done retrieving data
                        console.log("Finish loading svn data");

                        user_svn_data[svn_addr] = svn_user;

                        socket.emit("connect_to_svn_successfully", {
                            user_name: svn_username,
                            user_svn_address: svn_addr,
                            log_json: log_json,
                            list_json: list_json
                        });
                    });
                });
            }
        });
    });

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
                socket.emit("request_error", "User " + friend_user_name + " has to be online");
            }
            // user cannot add himself
            else if (friend_user_name === user_socketid_data[socket.id]){
                socket.emit("request_error", "You are not allowed to add yourself");
            }
            // already friend
            else if (friend[0].friends.indexOf(user_socketid_data[socket.id]) !== -1){
                socket.emit("request_error", "You and " + friend_user_name + " are already friends");
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

    // create svn
    socket.on("create_svn", function(data){
        var svn_addr = data[0];
        var svn_username = data[1];
        var svn_password = encrypt(data[2]); // encrypt password.
        var username = data[3];

        // check svn exists?
        db_SVN.find({svn_addr: svn_addr}, function(error, data){
            if (error || !data){
                socket.emit("request_error", "Fail to connect to database");
            }
            else if (data.length !== 0){
                socket.emit("request_error", "Address: " + svn_addr + " already existed");
                return;
            }
            else{

                var svn = db_SVN({
                    svn_addr: svn_addr,
                    svn_username: svn_username,
                    svn_password: svn_password,
                    username: username
                });
                svn.save(function(error){
                    if(error){
                        socket.emit("request_error", "Failed to create svn account");
                    }
                    else{
                        // add svn data to user
                        db_User.find({username: username}, function(error, data){
                            if (error || !data || data.length !== 1){
                                socket.emit("request_error", "Fail to connect to database1");
                            }
                            else{
                                var user = data[0];
                                user.svn.push(svn_addr); // add to user
                                user.save(function(error){
                                    if (error){
                                        socket.emit("request_error", "Fail to connect to database2");
                                    }
                                    else{
                                        socket.emit("create_svn_account_successfully", svn_addr);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    });


    // user query file
    socket.on("query_file", function(data){
        console.log(data);
        var svn_addr = data.svn_addr;
        var file_name = data.file_name;
        var user = user_svn_data[svn_addr];
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


    socket.on("broadcast_message", function(data){
        var username = data[0];
        var message = data[1];

        // get friends list
        db_User.find({username: username}, function(error, data){
            if(error || !data || data.length !== 1){
                return;
            }
            else{
                friends = data[0].friends;
                for(var i = 0; i < friends.length; i++){
                    if (friends[i] in user_name_data){ // this user is online
                        io.sockets.connected[user_name_data[friends[i]]].emit("receive_broadcast_message", [username, message]);
                    }
                }
            }
        });
    });

    socket.on("user_send_message_1_to_1", function(data){
       var user1 = data[0];
       var user2 = data[1];
       var message = data[2];
       console.log(user1 + " send " + user2 + " message: " + message);
       io.sockets.connected[user_name_data[user2]].emit("user_receive_message_from_friend", [user1, message]);
    });

    // user post comment to forum
    socket.on("save_comment", function(data){
        var comment_data = data;
        var comment = db_Comment(data);
        comment.save(function(error){
            if (error){
                socket.emit("request_error", "failed to connect to database");
            }
            else{
                // broadcast comment data to anyone else
                socket.broadcast.emit("forum_comment_update", comment_data);
            }
        });
    });

    // remove svn account
    socket.on("remove_svn_account", function(data){
        var username = data[0];
        var svn_addr = data[1];

        db_SVN.find({svn_addr: svn_addr}).remove().exec();
        db_User.find({username: username}, function(error, data){
            if (error || !data || data.length !== 1){
                socket.emit("request_error", "Failed to connect to database");
            }
            else{
                var user = data[0];
                var svn = user.svn;
                var index = svn.indexOf(svn_addr);
                svn.splice(index, 1);
                user.save(function(error){
                    if (error){
                        socket.emit("request_error", "Failed to connect to database");
                    }
                    else{
                        socket.emit("svn_account_delete_successfully", svn_addr);
                    }
                });
            }
        });
    });

    // user disconnect
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
