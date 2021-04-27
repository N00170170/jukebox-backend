const { Room } = require('../classes/Room');
// import Room from ('../classes/Room');

const rooms = [];
const users = [];

// Join user to chat
function userJoin(id, username, room) {

    const roomName = room;
    //check if room exists
    if(!rooms.find(room => roomName === room.name)){
        // const newRoom = {
        //     "name" : room,
        //     "users" : [],
        //     "queue" : []
        // }
        const newRoom = new Room(room); //create new room
        rooms.push(newRoom);
    }

    //create new user object - maybe abstract this out to a class?
    const user = { id, username, room};

    //add user to users array in room
    addUserToRoom(user,room);

    //add user to users array - do we still need? remove at some point and just use room.users?
    users.push(user);

    return user;
}

//Get current user
function getCurrentUser(id){
    return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id){

    const userIndex = users.findIndex(user => user.id === id);

    const userLeaving = getCurrentUser(id);

    if(userIndex !== -1){
        //Remove user from room first
            //find room user was in
            const roomLeft = rooms.find(room => userLeaving.room === room.name)
            console.log("The user left", roomLeft.name);

            //find user index in room.users array
            const roomUserIndex = roomLeft.users.findIndex(user => userLeaving.id === id);

            //remove user from users array in room
            // console.log("Users in room before splice",roomLeft.users);
            roomLeft.users.splice(roomUserIndex,1);
            // console.log("Users in room after splice",roomLeft.users);


        users.splice(userIndex,1)[0];
        //check if room is empty and delete if it is
        if(users.filter(user => user.room === userLeaving.room).length === 0){
            const roomIndex = rooms.findIndex(room => userLeaving.room === room.name);
            rooms.splice(roomIndex,1);
        }
        return users;
    }
}

//Get room users
function getRoomInfo(room){
    return users.filter(user => user.room === room);
}

//Get rooms
function getRooms(){
    return rooms;
}

// Add user to room
function addUserToRoom(user, roomName){
    let room = rooms.find(room => roomName === room.name);

    room.users.push(user);

    //first person in will be the one playing music

    // console.log(JSON.stringify(room));

}

////////////////////
// Queue functions
////////////////////

// Get room queue
function getQueue(room){

}

//Add track to queue
function addToQueue(user,track){
    // const track = data.track;
    // const roomName = data.room;
    
    // let room = rooms.find(room => user.id === room.users.id);
    //get the room of the user
    const room = rooms.find(room => user.room === room.name)

    room.queue.push(track);
    console.log(JSON.stringify(room.queue));
    
    return room.queue;
}

// Next track
function nextTrack(user){
    const room = rooms.find(room => user.room === room.name);
    room.queue.shift();
    return room.queue;
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomInfo,
    getRooms,
    addToQueue,
    nextTrack
}

// Rooms
// [
//     {
//         "name" : "HF42",
//         "queue" : [{
//                 "url" : "sad"
//             },
//             {
//                 "url" : "ddd"
//             }]
//     }
// ]