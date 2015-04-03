/**
 * Show file information on the right side
 */
function showFileInfo(file){
    // home directory
    if (file.name === "/" + svn_username){
        $("#info_name").text("Home Directory /" + svn_username);
        $("#info_path").text("Portfolio by Yiyi Wang ywang189");
        $("#info_kind").text("Projects are listed on the left side");
        $("#info_size").text("");
        /*
        $("#info_commit_revision").text("");
        $("#info_commit_author").text("");
        $("#info_commit_date").text("");
        $("#info_commit_msg").text("");
        */
        return;
    }
    $("#info_name").text("Name: " + file.single_name);
    $("#info_path").text("Path: " + ("/"+svn_username+(file.name[0] !== "/" ? "/" : "")) + file.name);
    $("#info_kind").text("Kind: " + file.kind);

    if (file.kind === "dir"){ // directory, so no size
        $("#info_size").hide();
    }
    else{ // file
        $("#info_size").show();
        $("#info_size").text("Size: " + file.size);
    }

    /*
    $("#info_commit_revision").text("Commit Revision: " + file.commit_revision);
    $("#info_commit_author").text("Commit Author: " + file.commit_author);
    $("#info_commit_date").text("Commit Date: " + file.commit_date);
    if (file.commit_msg){
        $("#info_commit_msg").text("Commit Message: " + file.commit_msg);
    }
    else{
        $("#info_commit_msg").text("");
    }*/
}

/**
 * file_info
 *  {
 *     name:
 *     kind:
 *     size:
 *     commit_revision:
 *     commit_author:
 *     commit_date:
 *     parent:    get parent folder
 *     children:  if it is dir, recursively list all children
 * }
 *
 */
function generateDivObjectForFile(file_info){
    var file_div = $("<div></div>");
    if (file_info.kind === "dir"){ // directory
        file_div.addClass("tile bg-amber");
        file_div.append('<div class="tile-content icon"><i class="icon-folder-2"></i></div>'); // add icon
    }
    else{ // file
        file_div.addClass("tile bg-cyan");
        file_div.append('<div class="tile-content icon"><i class="icon-file"></i></div>'); // add icon
    }
    var file_brand = $("<div></div>").addClass("brand bg-dark opacity");
    var file_name = $("<span></span>").addClass("text").text(file_info.single_name);
    file_div.attr({data: file_info}); // save data

    file_brand.append(file_name);
    file_div.append(file_brand);

    // user click directory
    if (file_info.kind === "dir"){ // directory
        // bind click function
        file_div.click(function(){
            generateFileList(file_info);
        });
    }
    else{
        // bind click function
        file_div.click(function(){
            clickFileTile(file_info);
        });
    }
    return file_div;
}

/**
 * Extend String prototype to check suffix
 */
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// refered from http://stackoverflow.com/questions/14915058/how-to-display-binary-data-as-image-extjs-4
/*
function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}
*/

/**
 * Clicked file tile
 * Show its information
 */
function clickFileTile(file_data){
    // show file info
    showFileInfo(file_data);

    // show commit list
    showCommitList(file_data);


    var file_name = file_data.single_name;

    // show file content
    socket.emit("query_file", {file_name: file_data.name, svn_addr: $("#svn_info_address").text()});

    // get file content
    socket.on("query_file_success", function(data){
        // TODO: Support PDF
        // Check pictures
        if (file_name.endsWith(".png") || file_name.endsWith(".gif" || file_name.endsWith(".jpeg") || file_name.endsWith(".jpg"))){
            $("#files_view").html("");
            // create back tile
            createBackTile(file_data.parent);
            var image_div = $("<img></img>")
                .attr({
                       // "src": 'data:image/png;base64,' + hexToBase64(data)
                       "src": "https://subversion.ews.illinois.edu/svn/sp15-cs242/ywang189/" + file_data.name
                       })
                .css({"width": $("#files_view").width()-$("#back_tile").width()-30, "height": "90%"});
            $("#files_view").append(image_div);
        }
        else{
            $("#files_view").html("");
            // create back tile
            createBackTile(file_data.parent);
            // show data in ace editor
            var editor = $("<div></div>").attr({"id": "editor"}).css({"width": $("#files_view").width()-$("#back_tile").width()-30, "height": "90%"});
            $("#files_view").append(editor);
            var ace_editor = ace.edit("editor");
            var modelist = ace.require('ace/ext/modelist'); // use mode list to auto select language mode
            var mode = modelist.getModeForPath(file_data.name).mode;
            ace_editor.session.setMode(mode);
            ace_editor.setValue(data);
            ace_editor.setReadOnly(true); // dont allow to change the content
        }

    });

    // fail to get file content
    socket.on("query_file_fail", function(){
        var not = $.Notify({
            caption: "Query File Failed",
            content: "name: " + file_data.name,
            timeout: 10000 // 10 seconds
        });
    });
}

/*
 * create back tile
 */
function createBackTile(parent){
    if (parent === "." || parent === null) return "";
    var back_div = $("<div></div>").addClass("tile bg-darkRed").attr({"id":"back_tile"});
    var back_brand = $("<div></div>").addClass("brand bg-dark opacity");
    var back_name = $("<span></span>").addClass("text").text("back");
    back_div.append('<div class="tile-content icon"><i class="icon-arrow-left"></i></div>'); // add icon

    back_brand.append(back_name);
    back_div.append(back_brand);

    // bind click function
    back_div.click(function(){
        generateFileList(parent);
    });
    $("#files_view").append(back_div);
    return back_div;
}

/**
 * Show a list of commit messages
 */
function showCommitList(file_data){
    $("#commit_list").html(""); // clear everything
    var file_name = file_data.name;
    var log = LOG.file_name_dict;
    if (file_name in log){
        var commit_list = log[file_name];

        /*
            element in commit_list is like
            {
                action:
                author:
                date:
                msg:
                path:
                revision:
            }
         */
        for(var i = 0; i < commit_list.length; i++){
            var element = commit_list[i];
            var li = $("<li></li>");
            var revision = $("<strong></strong>").text("Revision: " + element.revision);
            var date = $("<p></p>").text("Date: " + element.date);
            var author = $("<p></p>").text("Author: " + element.author);
            var action = $("<p></p>").text("Action: " + element.action);
            // var path = $("<p></p>").text("Path: " + element.path);
            var msg = $("<p></p>").text("Msg: " + element.msg);

            li.append(revision);
            li.append(date);
            li.append(author);
            li.append(action);
            //li.append(path);
            li.append(msg);
            $("#commit_list").append(li);
        }
    }
}

/**
 * Generate file list tree
 * tree id: file_list_tree
 *
 * The tile is like:
 * <div class="tile bg-cyan">
     <div class="brand bg-dark opacity">
         <span class="text">
             Hello
         </span>
     </div>
 </div>
 */
 function generateFileList(file_data){
     // clear files_view
     $("#files_view").html("");

     // create back tile
     createBackTile(file_data.parent);

     // draw children files/directories
     var file_info = null;
     var children = file_data.files;
     for(var file_name in children){
         file_info = children[file_name];
         $("#files_view").append(generateDivObjectForFile(file_info));
     }

     // show file info
     showFileInfo(file_data);

     // show commit info
     showCommitList(file_data);
 }
