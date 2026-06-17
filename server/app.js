var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

//-----------------------------added dependencies-------------------------
//const csv = require('csv-parser');
require('dotenv').config()
const mongoose = require('mongoose');
//------------------------------------------------------------------------

var roomRouter = require('./routes/room');
var aiGameRouter = require('./routes/aiGame');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//---------------------mongoose connection---------------
const uri = process.env.ATLAS_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully."))
  .catch(err => console.error("MongoDB connection error:", err));

// serve the built frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

//routers
app.use('/room', roomRouter);
app.use('/ai-game', aiGameRouter);

// SPA fallback: all remaining GETs get the React app (must stay below the routers)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

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

module.exports = app;
