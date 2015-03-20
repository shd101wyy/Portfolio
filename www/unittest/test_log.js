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

    var fs = require("fs");
    var formatLog = require("../js/formatLog.js");
    var content = fs.readFileSync("../log.json", "utf8");
    content = JSON.parse(content);
    var log = formatLog.cleanLogJSON(content);

    assertIn(log, "174");
    assertIn(log, "477");
    assertEqual("ywang189", log["475"].author);
    assertEqual('2015-02-20T19:15:12.794212Z', log["2265"].date);
    assertEqual("add doc", log["2266"].msg);
    assertEqual('huhh', log["3603"].msg);
    assertIn(log, "file_name_dict");

    var file_name_dict = log.file_name_dict;
    assertIn(file_name_dict, "CSAir/csair/node.py");
    assertIn(file_name_dict, "Assignment0/README.txt");
})();
