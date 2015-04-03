
/**
 * Create Chat Panel
 */
/*
<div id="chat_test" class="chat_panel ui-widget-content">
    <div class="chat_header">
        <strong> ywang189 </strong>
        <i class="icon-plus-2 chat_panel_add_friend_btn"></i>
        <i class="icon-cancel-2 chat_panel_close_btn"></i>
    </div>
    <div class="chat_container">
        <div class="chat_content">
        </div>
        <div class="input-control text chat_panel_input" data-role="input-control">
            <input type="text" placeholder="enter your message here">
            <button class="btn-clear" tabindex="-1" type="button"></button>
        </div>
    </div>
</div>
*/

function createMyMessage(message){
    var m = $("<div'></div>").addClass("my_message").text(message);
    return m;
}


function createFriendMessage(message){
    var m = $("<div'></div>").addClass("friend_message").text(message);
    return m;
}

function createChatPanel(x, y, send_to_user_name){
    var chat_panel = $("<div></div>").addClass("chat_panel ui-widget-content").attr({id: "room_" + send_to_user_name});
    var chat_header = $("<div></div>").addClass("chat_header");
    var chat_container = $("<div></div>").addClass("chat_container");
    // make header
    var chatroom_name_header = $("<strong></strong>").text(send_to_user_name);
    //var invite_friend_button = $("<i></i>").addClass("icon-plus-2 chat_panel_add_friend_btn");
    var close_window_button = $("<i></i>").addClass("icon-cancel-2 chat_panel_close_btn");
    chat_header.append(chatroom_name_header);
    //chat_header.append(invite_friend_button);
    chat_header.append(close_window_button);

    // make container
    var chat_content = $("<div></div>").addClass("chat_content");
    var input_control_div = $("<div></div>").addClass("input-control text chat_panel_input").attr({"data-role": "input-control"});
    var input = $("<input>").attr({
        type: "text",
        placeholder: "enter your message here"
    });
    var btn_clear = $("<button></button>").addClass("btn-clear").attr({
        tabindex: "-1",
        type: "button"
    });
    input_control_div.append(input);
    input_control_div.append(btn_clear);

    chat_container.append(chat_content);
    chat_container.append(input_control_div);

    chat_panel.append(chat_header);
    chat_panel.append(chat_container);

    chat_panel.draggable(); // make panel draggable

    // set x and y coordinate
    chat_panel.css({left: x, bottom: y + $("#bottom_nagivation_bar").height(), position:"absolute"});


    // click close_btn to close window
    close_window_button.click(function(){
        chat_panel.hide();
    });

    // input click enter button
    $(input).on('keypress', function (event) {
         if(event.which == '13'){
            //Disable textbox to prevent multiple submit
            input.attr("disabled", "disabled");
            //Do Stuff, submit, etc..
            //console.log(input.val());
            if(input.val().trim().length === 0) return;
            sendMessage(send_to_user_name, input.val());

            chat_content.append(createMyMessage(input.val()));
            chat_content.append("<br>");

            chat_content[0].scrollTop = chat_content[0].scrollHeight;

            // clear buffer
            input.val("");
            // remove diable
            input.removeAttr("disabled");
         }
    });

    // add to body
    $("body").append(chat_panel);
    return chat_panel;
}

/**
 * Send message to_user_name.
 */
function sendMessage(to_user_name, message){
    socket.emit("user_send_message_1_to_1", [user_name, to_user_name, message]);
}

/**
 *
 */
function addFriendMessage(chat_panel, friend_name, message){
    //console.log(chat_panel.find(".chat_content"));
    chat_panel.find(".chat_content").append(createFriendMessage(message));
}
