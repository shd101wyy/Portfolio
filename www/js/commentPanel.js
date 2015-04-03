// create comment
function createCommentElement(msg, left){
    /*
    <div class="comment_item">
        <span >
            <span> shd101wyy: </span> <br>
            <span class="comment_content"> You are stupid </span>
        </span>
    </div>*/
    var comment_item = $("<div></div>")
                        .addClass("comment_item")
                        .attr({
                            left: left,
                            width: $("#comment_container").width() - left - 10
                        });
    var span = $("<span></span>");
    var username_span = $("<span></span>").text(user_name+":");
    var comment_content_span = $("<span></span>").addClass("comment_content").text(msg);
    span.append(username_span);
    span.append("<br>");
    span.append(comment_content_span);
    comment_item.append(span);

    $("#comment_container").append(comment_item);

    // add click event
    comment_item.click(function(){
        console.log("Clicked");
        smoke.prompt("Followup", function(content){
            if(content){
                createCommentElement(content, comment_item.css("left") + 10);
            }
        }, {
            ok: "Post",
            cancel: "No",
            reverseButtons: true
        });
    });
}

// user make new comment
$("#make_new_comment").click(function(){
    smoke.prompt("Enter your new comment here", function(content){
        if(content){
            createCommentElement(content, 0);
        }
    }, {
        ok: "Post",
        cancel: "No",
        reverseButtons: true
    });
});
