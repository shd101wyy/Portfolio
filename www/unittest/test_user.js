(function(){
    var User = require("../../svn_user.js").User;
    if (typeof(User) === "undefined"){
        console.log("ERROR: Failed to import User");
    }

    // check invalid user
    var user = new User("test", "test", "this should fail");
    var query_log_string = user.queryLog();
    if (!query_log_string.stderr.toString("utf8")){
        console.log("ERROR: Query Log Error");
    }

    var query_list_string = user.queryList();
    if (!query_log_string.stderr.toString("utf8")){
        console.log("ERROR: Query Log Error");
    }

    // check query success
    // I DONT WANT TO SHOW YOU GUYS MY PASSWORD...
})();
