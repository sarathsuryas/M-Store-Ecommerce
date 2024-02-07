require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const nocache = require('nocache')

const {connectToDb,getDb} = require('./config/database')

const session = require('express-session')
const bodyParser = require('body-parser')

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
const { log } = require('console');


var app = express();

app.use(nocache())

// Use the session middleware
app.use(
  session({
    secret: 'your-secret-key', // Replace with a strong and secure secret key
    resave: false,
    saveUninitialized: true,
  })
);




// Use bodyParser to parse JSON data in req.body
app.use(bodyParser.json());



//instance
let db
connectToDb((err)=>{
  if(!err){
    console.log('mongodb connected successfully');
    
  }
  db = getDb()
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/', usersRouter);

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
  console.log(err)
  res.render('error');

});

const port =3000

app.listen(port,()=>{
  console.log("localhost connected sucessfully");
})
