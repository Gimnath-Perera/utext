const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

let usernames = [];

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function (req, res) {
  res.render('home');
});

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/template.html');
// });

server.listen(process.env.PORT || 3000, () => {
  console.log('Sever started running at 3000');
});

io.on('connection', (socket) => {
  console.log('Socket connected...');

  socket.on('new user', (data, callback) => {
    if (usernames.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  //update usernames
  updateUsernames = () => {
    io.emit('usernames', usernames);
  };

  //send message
  socket.on('send message', (msg) => {
    io.emit('new message', { msg: msg, user: socket.username });
  });

  //Disconnect
  socket.on('disconnect', (data) => {
    if (!socket.username) {
      return;
    }
    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });
});
