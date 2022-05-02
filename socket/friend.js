module.exports = function (io) {
    io.on('connection', (socket) => {
        // exports and connects the socket.io module. 


        //function that allows users to send friend requests to eachother
        socket.on('friendRequest', (friend, callback) => {

            io.to(friend.receiver).emit('newFriendRequest', {
                from: friend.sender,
                to: friend.receiver // enables user to send a new friend request from the friend.sender -- friend.reciever.
            });
            callback(); //calls callback funtion that ensures details are correct.
        });
    });
}
