const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGIN || '*',
        methods: ['GET', 'POST'],
    }
});

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        console.log('New user joined:', name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', message => {
        const user = users[socket.id];
        if (user) {
            socket.broadcast.emit('receive', {
                message: message,
                name: user,
            });
        }
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            socket.broadcast.emit('left', user);
            delete users[socket.id];
        }
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
