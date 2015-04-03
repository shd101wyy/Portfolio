
// generate unique id
// refered from stackoverflow
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// create comment
// msg: comment content
// left: left coordinate
// parent: under which comment
// poster_name: who post this.
function createCommentElement(msg,
                              left,
                              parent,
                              poster_name,
                              comment_id,
                              dont_emit){
    /*
    console.log("\n\nCreate Comment Element");
    console.log(msg);
    console.log(left);
    console.log(parent);
    console.log(poster_name);
    console.log(comment_id);
    console.log(dont_emit);
    */
    /*
    <div class="comment_item">
        <span >

            <span> <i class="icon-plus-2 on-left"></i> shd101wyy: </span> <br>
            <span class="comment_content"> You are stupid </span>
        </span>
    </div>*/
    var comment_item = $("<div></div>")
                        .addClass("comment_item")
                        .css({
                            "margin-left": left
                        });
    comment_item.attr("id", comment_id ? comment_id : guid()); // bind unique id
    var span = $("<span></span>");
    var username_span = $("<span></span>");
    var comment_content_span = $("<span></span>").addClass("comment_content").text(msg);
    var collapsed_btn = $("<i></i>").addClass("icon-minus on-left");
    username_span.append(collapsed_btn);
    username_span.append("    " + poster_name + " :");
    span.append(username_span);
    span.append("<br>");
    span.append(comment_content_span);
    comment_item.append(span);

    if(parent){
        /*
        console.log("Parent: ");
        console.log(parent);
        */
        parent.append(comment_item); // append element right after parent
    }
    else{
        $("#comment_container").append(comment_item);
    }

    // click collapsed_btn to hide all its children
    collapsed_btn.click(function(event){
        event.preventDefault();
        event.stopPropagation(); // prevent event bubbling

        // change icon for collapsed_btn
        if (collapsed_btn.hasClass("icon-minus")){
            collapsed_btn.removeClass("icon-minus").addClass("icon-plus");
        }
        else{
            collapsed_btn.removeClass("icon-plus").addClass("icon-minus");
        }
        comment_item.children("div").toggle();
    });

    // add click event
    comment_item.click(function(event){
        event.preventDefault();
        event.stopPropagation(); // prevent event bubbling
        //console.log("Clicked");
        smoke.prompt("Followup", function(content){
            if(content){
                createCommentElement(content,
                                     parseInt(comment_item.css("margin-left")) + 20,
                                     comment_item,
                                     user_name);
            }
        }, {
            ok: "Post",
            cancel: "No",
            reverseButtons: true
        });
    });

    $("#comment_container")[0].scrollTop = $("#comment_container")[0].scrollHeight;

    // when we don't need to send data to server.
    if(!dont_emit){
        socket.emit("save_comment",
                    {username: user_name,
                        content:msg,
                        left:left,
                        parent_id: (!parent)? "null" : parent.attr("id"),
                        comment_id: comment_item.attr("id"),
                        post_date: Date.now()});
             }

}

// user make new comment
$("#make_new_comment").click(function(){
    smoke.prompt("Enter your new comment here", function(content){
        if(content){
            createCommentElement(content, 0, null, user_name);
        }
    }, {
        ok: "Post",
        cancel: "No",
        reverseButtons: true
    });
});


// initialize comments
function initializeComments(comment_array){
    //console.log(comment_array);
    for(var i = 0; i < comment_array.length; i++){
        var c = comment_array[i];
        createCommentElement(
            c.content,
            c.left,
            (c.parent_id === "null"? null : $("#" + c.parent_id)),
            c.username,
            c.comment_id,
            true   // dont emit
        );
        // not your post
        if (c.username !== user_name){
            $("#" + c.comment_id).css("background", "#6b59bc");
        }
    }
}
