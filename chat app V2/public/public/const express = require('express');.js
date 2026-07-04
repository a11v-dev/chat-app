const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle real-time connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for a new message from a client
    socket.on('chat message', (data) => {
        // Broadcast the message to EVERYONE connected (including the sender)
        io.emit('chat message', data);
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});