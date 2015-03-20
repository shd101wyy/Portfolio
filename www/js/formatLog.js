
/**
 * Log Object
 */
function Log(info){
    this.revision = info.revision;
    this.author = info.author;
    this.date = info.date;
    this.msg = info.msg;
    this.path = info.path;
}

// clean xml2js generated JSON file
function cleanLogJSON(log_json){
    var output = {};  // revision number is the key
    var file_name_dict = {}; // file name is the key
    var info;
    log_json = log_json.log.logentry;
    /**
     * element in log_json is like
     *
     * {
        "$":{
           "revision":"4183"
        },
        "author":[
           "ywang189"
        ],
        "date":[
           "2015-03-13T21:26:54.384631Z"
        ],
        "paths":[
           {
              "path":[
                 {
                    "_":"/ywang189/CSAir/csair/query.py",
                    "$":{
                       "action":"M",
                       "kind":"file"
                    }
                 }
              ]
           }
        ],
        "msg":[
           "asd"
        ]
     }
     */
    for(var i = 0; i < log_json.length; i++){
        element = log_json[i];
        info = {
            revision: element.$.revision,
            author: element.author[0],
            date: element.date[0],
            msg: ("msg" in element ? element.msg[0] : "no msg provided"),
            path: element.paths[0].path
        };
        var log = new Log(info);
        output[element.$.revision] = log;

        // check single file
        var path = element.paths[0].path;
        for (var j = 0; j < path.length; j++){
            var e = path[j];
            var file_name = e._;
            file_name = file_name.slice(file_name.indexOf("/", 2) + 1); // remove /ywang189/
            if (!(file_name in file_name_dict)){
                file_name_dict[file_name] = [];
            }
            file_name_dict[file_name].push({
                revision: element.$.revision,
                author: element.author[0],
                date: element.date[0],
                msg: ("msg" in element ? element.msg[0] : "no msg provided"),
                path: e._,
                action: e.$.action
            });
            // add to file_name_dict

        }
    }
    output.file_name_dict = file_name_dict; // save file_name_dict to output
    return output;
}


if (typeof(module) !== "undefined") {
    module.exports.cleanLogJSON = cleanLogJSON;
}
