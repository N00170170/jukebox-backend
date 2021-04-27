const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomInfo, getRooms, addToQueue, nextTrack } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 3000 || process.env.PORT;

//Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
        console.log(getRooms());

        //just emit to user that is connecting
        socket.emit('message', formatMessage('server', 'Welcome to the chat'));

        //emit to all users except the one connecting
        socket.broadcast.to(user.room).emit('message', formatMessage('server', `${user.username} has joined the chat`));

        //Send user and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomInfo(user.room)
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
    //Todo


    // Next track
    socket.on('nextTrack', () => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('queueUpdate', nextTrack(user)); //emitting queueUpdate back to all clients with updated queue
    });


    //Runs when a user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage('server', `${user.username} has left the chat`));

            //Send user and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomInfo(user.room)
            })
        }
        console.log(getRooms());

    });
})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));