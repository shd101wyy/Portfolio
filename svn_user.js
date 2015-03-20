var exec = require('child_process').exec;
var spawnSync = require('child_process').spawnSync;
function User(user_name, user_password, user_svn_address){
    this.user_name = user_name;
    this.user_password = user_password;
    this.user_svn_address = user_svn_address;
}

User.prototype.queryLog = function(){
    // "svn log --verbose --xml https://subversion.ews.illinois.edu/svn/sp15-cs242/ywang189 --username ywang189 --password ****"
    // set up function
    //var command = "svn log --verbose --xml " + this.user_svn_address + " --username " + this.user_name + "  --password " + this.user_password;
    return spawnSync("svn",
                     ["log", "--verbose", "--xml", this.user_svn_address, "--username", this.user_name, "--password", this.user_password],
        {
            //timeout: 10000  // wait for 10 seconds, if no response, kill the process
        });
};

User.prototype.queryList = function(){
    // svn list --xml --recursive https://subversion.ews.illinois.edu/svn/sp15-cs242/ywang189 --username ywang189 --password ****
    // // setup function
    //var command = "svn list --xml --recursive " + this.user_svn_address + " --username " + this.user_name + "  --password " + this.user_password;
    return spawnSync("svn",
                    ["list", "--xml", "--recursive", this.user_svn_address, "--username", this.user_name, "--password", this.user_password],
        {
            //timeout: 10000  // wait for 10 seconds, if no response, kill the process
        });
};


/*
    given file name like Chess/Chess.iml
    return its content
*/
User.prototype.queryFile = function(file_name){
    return spawnSync("svn",
                    ["cat",
                    (this.user_svn_address[this.user_svn_address.length - 1] === "/" ?
                        this.user_svn_address :
                        (this.user_svn_address + "/"))  + file_name,
                    "--username", this.user_name, "--password", this.user_password],
        {
            //timeout: 10000  // wait for 10 seconds, if no response, kill the process
        });
};

// export Prototype
module.exports.User = User;
