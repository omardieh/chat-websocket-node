require("dotenv").config();
const socketIO = require("socket.io");
const { SERVER_PORT, CLIENT_PORT } = process.env;

const app = require("express")();
const server = app.listen(SERVER_PORT);

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
  // console.log("A user connected");
  //
  // send initial messages from server :
  socket.emit("MessagesFromServer", messages);
  //
  // receive message from client :
  socket.on("MessageToServer", (message) => {
    messages.push(message);
    //
    // send message back to client :
    io.emit("MessageToClient", message);
  });

  //
  //
  socket.on("disconnect", () => {
    // console.log("A user disconnected");
  });
});
