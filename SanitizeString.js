
// Check user name valid ?
function usernameValid(username){
    return /^[0-9a-zA-Z_.-]+$/.test(username);
}

// check user password valid ?
function userpasswordValid(password){
    return /^[$!@#$%^&*()0-9a-zA-Z_.-]+$/.test(password);
}

// check svn address valid ?
function svnAddressValid(address){
    return /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(address);
}

// filter comment
function filterComment(input_string, filter){
    for(var key in filter){
        input_string.split(key).jon(filter[key]);
    }
    return input_string;
}


module.exports = {
    usernameValid: usernameValid,
    userpasswordValid: userpasswordValid,
    svnAddressValid: svnAddressValid,
    filterComment: filterComment
};
