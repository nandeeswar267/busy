const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

let users = [];
let messages = [];

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Socket.IO connection event
io.on('connection', (socket) => {
    console.log('A user connected on', socket.id);

    // Listen for user connection
    socket.on('user connected', (userData) => {
        const user = {
            id: socket.id,
            name: userData.name
        };
        users.push(user);
        console.log(`${user.name} connected`);

        // Broadcast the user list to all connected clients
        io.emit('user list', users.map(u => u.name));
    });

    // Listen for chat messages
    socket.on('chat message', (msg) => {
        console.log('Message:', msg.message);

        // Broadcast the message to all connected clients
        io.emit('chat message', msg);
    });
    // Listen for typing notifications
    socket.on('typing', ({ userName, isTyping }) => {
        // Broadcast typing status to all connected clients
        io.emit('typing', { userName, isTyping });
    });
    // Listen for disconnection
    socket.on('disconnect', () => {
        const disconnectedUser = users.find(user => user.id === socket.id);
        if (disconnectedUser) {
            users = users.filter(user => user.id !== socket.id);
            console.log(`${disconnectedUser.name} disconnected`);

            // Broadcast the updated user list to all connected clients
            io.emit('user list', users.map(u => u.name));
        }
    });
});

// Start the server
const port = 3000;
http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
