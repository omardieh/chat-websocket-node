require("dotenv").config();
const socketIO = require("socket.io");
const express = require("express");
const {
  addUser,
  getUser,
  getUsers,
  deleteUser,
} = require("./users.controller");
const app = express();

const { SERVER_PORT, CLIENT_PORT } = process.env;

const server = app.listen(SERVER_PORT, (e) => {
  if (e) {
    throw new Error(e);
  }
});

app.get("/api", (req, res) => {
  res.send("api test");
});

app.use(express.static("public"));
app.use("*", express.static("public"));

const io = socketIO(server, {
  cors: { origin: [`http://localhost:${CLIENT_PORT}`] },
});

const timeDateNow = new Date()
  .toLocaleString()
  .replace(",", "")
  .replace(/:.. /, " ");

io.on("connection", (socket) => {
  socket.on("login", ({ name, room }, callback) => {
    const { user, error } = addUser(socket.id, name, room);
    if (error) return callback(error);
    socket.join(user.room);
    socket.in(room).emit("notification", {
      title: "Someone's here",
      description: `${user.name} just entered the room`,
    });
    io.in(room).emit("users", getUsers(room));
    callback();
  });

  socket.on("MessageToServer", (message) => {
    const user = getUser(socket.id);
    // messages.push({ ...message, date: timeDateNow });
    io.in(user.room).emit("MessageToClient", {
      user: user.name,
      text: message,
      date: timeDateNow,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    const user = deleteUser(socket.id);
    if (user) {
      io.in(user.room).emit("notification", {
        title: "Someone just left",
        description: `${user.name} just left the room`,
      });
      io.in(user.room).emit("users", getUsers(user.room));
    }
  });
});
