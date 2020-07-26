const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUserById,
  getUsersInRoom,
} = require("./utils/users.js");

const app = express();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

//expected arguments for socketio() is a raw http server
const io = socketio(server); // configure socket.io to work with our server

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("join", (queryString, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username: queryString.username,
      room: queryString.room,
    });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined the room!`)
      );
    io.to(user.room).emit("roomMembers", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  // Text message send event listener
  socket.on("sendMessage", (userMessage, callback) => {
    const user = getUserById(socket.id);
    io.to(user.room).emit(
      "message",
      generateMessage(user.username, userMessage)
    );
    callback();
  });

  socket.on("shareLocation", (latitude, longitude, callback) => {
    const user = getUserById(socket.id);
    io.to(user.room).emit(
      "shareLocation",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback("Your location has been shared");
  });

  // runs when this specific user gets disconnected
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left the room!`)
      );
      io.to(user.room).emit("roomMembers", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`server running on port ${port}`);
});
