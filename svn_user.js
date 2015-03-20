var exec = require('child_process').exec;
var spawnSync = require('child_process').spawnSync;
function User(user_name, user_password, user_svn_address){
    this.user_name = user_name;
    this.user_password = user_password;
    this.user_svn_address = user_svn_address;
}

User.prototype.queryLog = function(error_function, success_function){
    // "svn log --verbose --xml https://subversion.ews.illinois.edu/svn/sp15-cs242/ywang189 --username ywang189 --password HsjWghW11"
    // set up function
    //var command = "svn log --verbose --xml " + this.user_svn_address + " --username " + this.user_name + "  --password " + this.user_password;
    return spawnSync("svn",
                     ["log", "--verbose", "--xml", this.user_svn_address, "--username", this.user_name, "--password", this.user_password],
        {
            timeout: 3000  // wait for 3 seconds, if no response, kill the process
        });
};

User.prototype.queryList = function(error_function, success_function){
    // svn list --xml --recursive https://subversion.ews.illinois.edu/svn/fa13-cs242/{netid} > svn_list.xml
    // // setup function
    //var command = "svn list --xml --recursive " + this.user_svn_address + " --username " + this.user_name + "  --password " + this.user_password;
    return spawnSync("svn",
                    ["list", "--xml", "--recursive", this.user_svn_address, "--username", this.user_name, "--password", this.user_password],
        {
            timeout: 3000  // wait for 3 seconds, if no response, kill the process
        });
};

// export Prototype
module.exports.User = User;
