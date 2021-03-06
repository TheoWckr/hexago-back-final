let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
const loggerMorgan = require('morgan');
let mongoose = require('mongoose');
const dotEnv = require('dotenv');
let morgan = require('morgan');
const winston = require('./config/winston')
const logger = require('./config/winston')

dotEnv.config();

let cors = require('cors');
let app = express();
app.use(cors());

// connect to Mongo daemon
if (process.env.JEST_WORKER_ID !== undefined) {
  mongoose.connect(process.env.TEST_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info(
      {
        level: 'info',
        label: 'BDD',
        message: 'MongoDB Connected'}))
  .catch(err => logger.info(
      {
        level: 'error',
        label: 'JEST',
        message: err}));
} else {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info(
      {
        level: 'info',
        label: 'BDD',
        message: 'MongoDB Connected'}))
  .catch(err => logger.info(
      {
        level: 'error',
        label: 'BDD',
        message: err}));
}



let indexRouter = require('./routes');
let usersRouter = require('./routes/users');
let locationsRouter = require('./routes/locations');
let userProfile = require('./routes/userProfile');
let GameDetailsRouter = require('./routes/gameDetails');
let EventRouter = require('./routes/event');
let BadgeRouter = require('./routes/badge');
let GenreRouter = require('./routes/genre');
let ChatRouter = require('./routes/chat');



app.use(morgan('combined', { stream: winston.stream }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(loggerMorgan('dev'));
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



//wire up the server to listen to our port 500


module.exports = app;
