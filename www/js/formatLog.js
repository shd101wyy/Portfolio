
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
            msg: element.msg[0],
            path: element.paths[0].path
        };
        output[element.$.revision] = new Log(info);
    }
    return output;
}
