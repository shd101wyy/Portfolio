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

    var sanitize = require("../../SanitizeString.js");
    // test username
    assertEqual(true, sanitize.usernameValid("shd101wyy"));
    assertEqual(true, sanitize.usernameValid("ywang189"));
    assertEqual(false, sanitize.usernameValid("var x = 12"));
    assertEqual(false, sanitize.usernameValid("'; SELECT * FROM table; --"));

    // test user password
    assertEqual(true, sanitize.userpasswordValid("4rfv5tgSASD"));
    assertEqual(true, sanitize.userpasswordValid("sadkl@MSKADL!"));
    assertEqual(true, sanitize.userpasswordValid("1234"));
    assertEqual(true, sanitize.userpasswordValid("$))(@#)"));
    assertEqual(false, sanitize.userpasswordValid("var x = 20"));
    assertEqual(false, sanitize.userpasswordValid("3 + 4"));
    assertEqual(false, sanitize.userpasswordValid("'; SELCET name from bank; --"));

    // test svn address
    assertEqual(true, sanitize.svnAddressValid("http://www.google.com"));
    assertEqual(true, sanitize.svnAddressValid("https://www.google.com"));
    assertEqual(true, sanitize.svnAddressValid("ftp://www.google.com"));
    assertEqual(true, sanitize.svnAddressValid("http://subversion.ews.illinois.edu/svn/sp15-cs460/ywang189/"));
    assertEqual(false, sanitize.svnAddressValid("var haha = 12"));
    assertEqual(false, sanitize.svnAddressValid("1234"));
    assertEqual(false, sanitize.svnAddressValid("UPDATE name=15"));
    assertEqual(false, sanitize.svnAddressValid("SELECT * FROM *"));

    var filter = {
        "I hate making plans": "I don't want to make plans with you",
        "All the girls I've dated were just too much": "He isn't willing to compromise",
        "You take sex too seriously": "He doesn't take sex with you seriously",
        "I never go after hot girls": "He's lazy and insecure",
        "I don't really have any male friends": "If I haven't seen my female friends naked yet, I plan on it"
    };
    // check filter comment
    assertEqual("abc", sanitize.filterComment("abc", filter));
    assertEqual("I like you, but you don't like me", sanitize.filterComment("I like you, but you don't like me", filter));
    assertEqual("You are pretty ugly", sanitize.filterComment("You are pretty ugly", filter));
    assertEqual("I don't want to make plans with youI don't want to make plans with you", sanitize.filterComment("I hate making plansI hate making plans", filter));
    assertEqual("18290-i390-12I don't want to make plans with youASDASDASDI don't want to make plans with you", sanitize.filterComment("18290-i390-12I hate making plansASDASDASDI don't want to make plans with you", filter));

    assertEqual("If I haven't seen my female friends naked yet, I plan on it!!!ASDI don't want to make plans with you", sanitize.filterComment("I don't really have any male friends!!!ASDI hate making plans", filter));



})();
