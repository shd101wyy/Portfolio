(function(){
    function assertEqual(a, b) {
        if (a !== b) {
            throw new Error('values are not equal. Expected: ' + a + "  Given: " + b);
        }
    }
    // b in a
    function assertIn(a, b){
        if (!(b in a)){
            throw new Error(b + " not in " + a);
        }
    }

    var db_User = require("../../database/UserSchema.js"); // require database User model
    var db_Comment = require("../../database/CommentSchema.js"); // require database comment model

    var test1, test2;
    db_User.find({username: "test1"}, function(error, data){
        if (error){
            throw error;
        }
        if (data.length === 1){
            test1 = data[0];
        }
        else{
            test1 = db_User({
                username: "test1",
                password: "1234",
                friends: [],
                svn: []
            });
            test1.save();
        }

        db_User.find({username: "test2"}, function(error, data){
            if (error){
                throw error;
            }
            if (data.length === 1){
                test2 = data[1];
            }
            else{
                test2 = db_User({
                    username: "test2",
                    password: "1234",
                    friends: [],
                    svn: []
                });
                test2.save();

                // now test1 tried to send malicious content to test2
                var comment = db_Comment({
                    username: "test1",
                    content: "console.log('HAHAHAHA')", // this should not print out
                    left: "0",
                    parent_id: "123",
                    comment_id: "123",
                    post_date: Date.now()
                });

                // test2 read from db_Comment
                db_Comment.find({comment_id: "123"}, function(error, data){
                    if(error){
                        throw error;
                    }
                    else{
                        try{
                            var content = data[0].content;
                            assertEqual("console.log('HAHAHAHA')", content);

                            // actually I didnt use .html or eval function in my code
                            // so I think the code overall should be safe.
                        }
                        catch(e){
                            throw e;
                        }
                    }
                });

                db_Comment.find({comment_id: "123"}).remove().exec();
            }
        });

    });

})();
