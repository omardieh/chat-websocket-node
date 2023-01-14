require("dotenv").config();
const socketIO = require("socket.io");
const path = require("path");
const express = require("express");
const app = express();

const { SERVER_PORT, CLIENT_PORT } = process.env;

const server = app.listen(SERVER_PORT, (e) => {
  if (e) {
    throw new Error(e);
  } else {
    console.log("running on server " + SERVER_PORT);
  }
});

// express.static(path.join(__dirname, "../chat-websocket-react/build"));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

// app.get("*", (req, res) => {
//   res.sendFile(
//     path.join(__dirname, "../chat-websocket-react/build", "index.html")
//   );
//   res.end();
// });

app.get("/api", (req, res) => {
  res.send("api test");
});

app.use(express.static("public"));

const io = socketIO(server, {
  cors: { origin: [`http://localhost:${CLIENT_PORT}`] },
});

let messages = [
  {
    author: "server",
    message:
      "welcome to the webSocket chat app! mad with Node, React and socket.io",
  },
];

io.on("connection", (socket) => {
  socket.emit("MessagesFromServer", messages);
  socket.on("MessageToServer", (message) => {
    messages.push(message);
    io.emit("MessageToClient", message);
  });
  socket.on("disconnect", () => {});
});
