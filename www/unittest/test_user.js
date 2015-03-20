(function(){
    function assertEqual(a, b) {
        if (a !== b) {
            throw new Error('values are not equal. Expected: ' + a + "  Given: " + b);
        }
    }
    var User = require("../../svn_user.js").User;
    if (typeof(User) === "undefined"){
        throw new Error("ERROR: Failed to import User");
    }

    // check invalid user
    var user = new User("test", "test", "this should fail");
    var query_log_string = user.queryLog();
    if (!query_log_string.stderr.toString("utf8")){
        throw new Error("ERROR: Query Log Error");
    }

    var query_list_string = user.queryList();
    if (!query_log_string.stderr.toString("utf8")){
        throw new Error("ERROR: Query Log Error");
    }

    // check query success
    // I DONT WANT TO SHOW YOU GUYS MY PASSWORD...
})();
