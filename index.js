const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const http = require('http');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const mongoose=require('mongoose')
const flash = require('connect-flash');
require("dotenv").config();

const app = express()
const port = 3000;
const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth');

 require('./config/passport')(passport);

 const {select,generateDate,paginate} = require('./helpers/handlebars-helpers');
const db = require('./config/keys').mongoURI;


mongoose
  .connect('mongodb://localhost:27017/exampleDb',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());



app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);


app.use(passport.initialize());
app.use(passport.session());


app.use(flash());


app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.engine('hbs', exphbs({extname: '.hbs', helpers: {select: select, generateDate: generateDate,paginate: paginate}}));

app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static('public'));

const  users= require('./routes/admin/users');

//app.use('/users', require('./routes/users.js'));

app.get('/', (req, res) => res.render('index'));
app.get('/dashboard',ensureAuthenticated, (req, res) =>
res.render('admin_home', {
  user: req.user
}));
app.get('/download', (req, res) => res.render('admin_home'));
app.get('/add-new', (req, res) => res.render('admin_home'));
app.get('/status', (req, res) => res.render('admin_home'));
app.get('/logout', (req, res) => res.render('admin_home'));
app.get('/register',(req,res)=>res.render('register'));
app.get('/users',(req,res)=>res.render('users'))

app.use('/admin/users',users)

///

http.createServer(app).listen(port);