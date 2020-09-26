var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var onlineUsers = []

io.on('connection', (socket) => {
  // console.log('a user connected');
  
  socket.on('disconnect', () => {
    // console.log('user disconnected');
    var index = onlineUsers.findIndex(item => item.id === socket.id);
    var leaveUser = onlineUsers[index]
    socket.broadcast.emit('chat message', `${leaveUser.nickname} leaved the room.`);
    onlineUsers.splice(index, 1);
    io.emit('user update', onlineUsers);
  });

  socket.on('enter room', (nickname) => {
    onlineUsers.push({ id: socket.id, nickname: nickname });
    io.emit('chat message', `${nickname} entered the room.`);
    io.emit('user update', onlineUsers);
  });

  socket.on('chat message', (payload) => {
    socket.broadcast.emit('chat message', `${payload.nickname}: ${payload.message}`);

    // Send private message
    // io.to(onlineUsers[0].id).emit('chat message', `${payload.nickname}: ${payload.message}`);
  });

  socket.on('typing', (nickname) => {
    socket.broadcast.emit('typing', nickname);
  });
});

http.listen(3000, '0.0.0.0', () => {
  console.log('listening on *:3000');
});
