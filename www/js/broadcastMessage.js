/**
 * Broadcast message to friends given user_name
 */
function broadcastMessage(user_name, message){
    socket.emit("broadcast_message", [user_name, message]);
}
