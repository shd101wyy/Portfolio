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
    var formatList = require("../js/formatList.js");
    var content = fs.readFileSync("../list.json", "utf8");
    content = JSON.parse(content);
    var home_directory = formatList.cleanListJSON(content, "ywang189", {});

    assertEqual('/ywang189', home_directory.name);
    assertEqual('dir', home_directory.kind);
    assertEqual(".", home_directory.parent);
    assertEqual("/ywang189", home_directory.single_name);
    assertEqual(3, Object.keys(home_directory.files).length);
    assertIn(home_directory.files, "Assignment0");
    assertIn(home_directory.files, "CSAir");
    assertIn(home_directory.files, "Chess");
    assertEqual(home_directory, home_directory.files.CSAir.parent);
    assertEqual("478", home_directory.files.Assignment0.commit_revision);
    assertEqual('2015-03-13T21:26:54.384631Z', home_directory.files.CSAir.commit_date);
    assertEqual('undefined', home_directory.files.Chess.size);

    var Chess = home_directory.files.Chess;
    assertIn(Chess.files, "src");
    assertEqual("dir", Chess.files.src.kind);
})();
