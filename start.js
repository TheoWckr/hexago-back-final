const app = require('./app.js')
const port = process.env.PORT;
let morgan = require('morgan');
const winston = require('./config/winston')
const http = require('http').createServer(app);

http.listen(port, ()=>{
    console.log('connected to port: '+ port)
});


// require the socket.io module
const socket = require("socket.io")(http, {
  cors: {
    origin: "http://127.0.0.1:3000",
  },
  
});


// const socket = io(http);
//create an event listener


app.use(morgan('combined', { stream: winston.stream }));
//To listen to messages
socket.on('connection', (socket)=>{
  socket.on("newMessage", async function(msg, userId, chatId) {

    //save chat to the database
    let Chat = require('./models/chat');
    const chat = await Chat.findById(chatId);
    chat.messages.push({userId: userId, message: msg})
    chat.save();

    socket.broadcast.emit("message", msg, chat._id);
  });
  socket.on("writingMessage", async function(userId, chatId) {
    let Chat = require('./models/chat');
    const chat = await Chat.findById(chatId);
    socket.broadcast.emit("writing", userId, chat._id, chat.userIdList);
  });
  socket.on("stopWritingMessage", async function(userId, chatId) {
    let Chat = require('./models/chat');
    const chat = await Chat.findById(chatId);
    socket.broadcast.emit("stopWriting", userId, chat._id, chat.userIdList);
  });
});