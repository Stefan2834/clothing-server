const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const connectRouter = require('./routes/connect');
const userRouter = require('./routes/user');
const suggestionRoute = require('./routes/suggestion')
const { emailRoute } = require('./routes/email')
const adminRoute = require('./routes/admin')
const productRoute = require('./routes/product')

const app = express();
app.use(cookieParser());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', process.env.WEBSITE_KEY || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/connect', connectRouter);
app.use('/user', userRouter);
app.use('/suggestion', suggestionRoute)
app.use('/email', emailRoute)
app.use('/admin', adminRoute)
app.use('/product', productRoute)

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
  res.render('error');
});


module.exports = app;
