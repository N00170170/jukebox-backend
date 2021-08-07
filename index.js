const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, createRoom, getCurrentUser, userLeave, getRoomInfo, getRooms, addToQueue, nextTrack, getRoomObj } = require('./utils/users');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;
const IP = process.env.IP || 'localhost';

//Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        console.log('joinRoom',user);

        socket.join(user.room);
        console.log(getRooms());

        //just emit to user that is connecting
        socket.emit('message', formatMessage('server', 'Welcome to the chat'));

        //emit to all users except the one connecting
        socket.broadcast.to(user.room).emit('message', formatMessage('server', `${user.username} has joined the chat`));

        //Send user and room info
        io.to(user.room).emit('roomUsers', {
            roomObj: getRoomObj(user.room),
            room: user.room,
            users: getRoomInfo(user.room),
        })
        console.log('roomObj', getRoomObj(user.room))
    })

    //called when host creates new room
    socket.on('createRoom', username => {
        const user = createRoom(socket.id, username);
        console.log('createRoom',user);
        socket.join(user.room);
        console.log(getRooms());

        //just emit to user that is connecting
        socket.emit('message', formatMessage('server', 'Welcome to the chat'));

        //emit to all users except the one connecting
        socket.broadcast.to(user.room).emit('message', formatMessage('server', `${user.username} has joined the chat`));

        //Send user and room info
        io.to(user.room).emit('roomUsers', {
            roomObj: getRoomObj(user.room),
            room: user.room,
            users: getRoomInfo(user.room),
        })
    })

    console.log('New WS Connection from ID: ', socket.client.id);

    //emit to everyone
    // io.emit();

    //Listen for chat message
    socket.on('chatMessage', (msg) => {
        // console.log(msg);

        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //Listen for queue add
    socket.on('queueAdd', (track) => {
        // console.log(msg);
        const user = getCurrentUser(socket.id);

        const queue = addToQueue(user,track);
        console.log("Track added. New queue is", queue);

        io.to(user.room).emit('message', formatMessage('server', `${user.username} just added ${track} to the queue`));
        io.to(user.room).emit('queueUpdate', queue); //emitting queueUpdate back to all clients with track

    });

    //Toggle pause
    socket.on('pauseToggle', playing => {
        //do we want to store the state of the track/queue/room on the server (ie playing/paused)??
        //server probably should store state - what if someone joins when track is paused. how do they know the state when they join?
        //for now just emit back generic message to tell clients to toggle, server will handle logic for that later
        const user = getCurrentUser(socket.id);
        const room = getRooms().find(room => user.room === room.name)

        //check if emitted by host
        if(user.id === room.users[0].id){
            if(playing){
                room.playing = false;
                user.roomPlaying = false;
                io.to(user.room).emit('pauseMsg', user.roomPlaying);
            } else {
                room.playing = true;
                user.roomPlaying = true;
                io.to(user.room).emit('pauseMsg', user.roomPlaying);
            }
        }
    });


    // Next track
    socket.on('nextTrack', () => {
        const user = getCurrentUser(socket.id);
        const room = getRooms().find(room => user.room === room.name)

        //check if emitted by host
        if(user.id === room.users[0].id){
            io.to(user.room).emit('queueUpdate', nextTrack(user)); //emitting queueUpdate back to all clients with updated queue
        }
    });


    //Runs when a user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id); //returns an array

        if (user && user.length > 0) {

            io.to(user[0].room).emit('message', formatMessage('server', `${user[0].username} has left the chat`));
            //Send user and room info
            io.to(user[0].room).emit('roomUsers', {
                roomObj: getRoomObj(user[0].room),
                room: user[0].room,
                users: getRoomInfo(user[0].room),
            })
        }
        console.log(getRooms());

    });
})

server.listen(PORT, IP, () => console.log(`Server running on ${IP}:${PORT}`));
