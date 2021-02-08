let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
const logger = require('morgan');
let mongoose = require('mongoose');
const dotEnv = require('dotenv');

dotEnv.config();

let cors = require('cors');
let app = express();
app.use(cors());

// connect to Mongo daemon
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


let indexRouter = require('./routes');
let usersRouter = require('./routes/users');
let locationsRouter = require('./routes/locations');
let userProfile = require('./routes/userProfile');
let GameDetailsRouter = require('./routes/gameDetails');
let EventRouter = require('./routes/event');
let BadgeRouter = require('./routes/badge');
let GenreRouter = require('./routes/genre');
let ChatRouter = require('./routes/chat');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/userProfile', userProfile);
app.use('/locations', locationsRouter);
app.use('/gamedetails', GameDetailsRouter);
app.use('/event', EventRouter);
app.use('/badge', BadgeRouter);
app.use('/genre', GenreRouter);
app.use('/chat', ChatRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use('/', indexRouter);
app.use('/api/v0/users', usersRouter);
app.use('/api/v0/locations', locationsRouter);
app.use('/api/v0/gamedetails', GameDetailsRouter);
app.use('/api/v0/event', EventRouter);
app.use('/api/v0/badge', BadgeRouter);
app.use('/api/v0/genre', GenreRouter);
app.use('/api/v0/chat', ChatRouter);

const http = require('http').createServer(app);

// require the socket.io module
const io = require('socket.io');

const port = process.env.PORT;

const socket = io(http);
//create an event listener



//To listen to messages
socket.on('connection', (socket)=>{
  console.log('connection');
  socket.on("newMessage", async function(msg, userId, chatId) {
    console.log("message: " + msg);

    //broadcast message to everyone in port:5000 except yourself.
    // socket.broadcast.emit("received", { message: msg });

    //save chat to the database
    let Chat = require('./models/chat');
    const chat = await Chat.findById(chatId);
    chat.messages.push({userId: userId, message: msg})
    chat.save();
    // mongoose.connect('mongodb://localhost:27017/hexago', { useNewUrlParser: true })
    //   .then(async (db) => {
    //     console.log("connected correctly to the server");
    //     const chat = await Chat.findById(chatId);
    //     chat.messages.push({userId: userId, message: msg})
    //     chat.save();
    //   })
    //   .catch(err => console.log(err));
  });
});

//wire up the server to listen to our port 500
http.listen(port, ()=>{
  console.log('connected to port: '+ port)
});

module.exports = app;
