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

var indexRouter = require('./routes/index');
var roomRouter = require('./routes/room');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//---------------------mongoose connection---------------
const uri = process.env.ATLAS_URI;
mongoose.connect(uri,{useNewUrlParser:true, useCreateIndex:true});
const connection=mongoose.connection;
connection.once('open',()=>{
  console.log("MongoDB database connection established successfully.");
})

// ... other app.use middleware 
app.use(express.static(path.join(process.cwd(), "build")))

// ...
// Right before your app.listen(), add this:
app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "build", "index.html"));

//---------------------------------------------------
//routers
app.use('/', indexRouter);
app.use('/room', roomRouter);

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
