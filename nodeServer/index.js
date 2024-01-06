const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  // Handle your HTTP requests here, if needed
  fs.readFile('index.html', 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

// Set CORS headers for HTTP requests
server.on('request', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  // Add other headers as needed
});

// Set CORS headers for WebSocket connections
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST'],
  },
});

const users = {};

io.on('connection', (socket) => {
 socket.on('new-user-joined',name=>{
      users[socket.id]=name;
      socket.broadcast.emit('user-joined',name);
 });
 socket.on('send',message=>{
      socket.broadcast.emit('receive',{name:users[socket.id],message:message});
 })
 socket.on('disconnect',message=>{
      socket.broadcast.emit("leave",users[socket.id]);
      delete users[socket.id];
 })

});

// Start the server
const port = 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
