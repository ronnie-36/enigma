var createError = require('http-errors');
var express = require('express');
const dotenv = require('dotenv');
var path = require('path');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var logger = require('morgan');
var expressHbs =  require('express-handlebars');
const passport = require('passport');
const connectDB = require('./config/db');
var flash = require('connect-flash');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var app = express();

dotenv.config();

// passport config
require('./config/passport')(passport)

connectDB();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', expressHbs({defaultLayout: false,extname: 'hbs',layoutsDir: "views/layouts/"}));
app.set('view engine', 'hbs');
var hbs = expressHbs.create({});
hbs.handlebars.registerHelper({
  eq: (v1, v2) => v1 === v2,
  ne: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
  and() {
      return Array.prototype.every.call(arguments, Boolean);
  },
  or() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  },
  inc: (v) => v+1
});

app.disable('x-powered-by');
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  expressSession({
    secret: process.env.EXPRESS_SECRET,
    resave: false,
    saveUninitialized: true,
    name: "SessionCookie"
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  if(err.status==404){res.render('', { layout: '404' });}
  res.render('',{layout:'error'});
});

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Listening to PORT ${PORT}`);
// });

module.exports = app;
