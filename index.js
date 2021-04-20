const express = require('express');
const bodyParser = require('body-parser');

const http = require('http');
const path = require('path');
const expressHbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose')
const flash = require('connect-flash');
const User = require("./model/User");
const scheduler = require('./helpers/scrapper-scheduler');
require("dotenv").config();

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

// var m =  require('./modules/dbs-cardgame.js');

// m = new m();

// m.start((data)=>{
//   console.log(data);
// })
const app = express()
const port = process.env.PORT || 3000;
const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());




require('./config/passport')(passport);

const { select, generateDate, paginate } = require('./helpers/handlebars-helpers');
const db = require('./config/keys').mongoURI;


app.set('views', path.join(__dirname, 'views'));
//console.log(path.join(__dirname, 'views'))

app.engine('hbs', expressHbs({ extname: 'hbs', defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts', helpers: { select: select, generateDate: generateDate, paginate: paginate } }));
app.set('view engine', 'hbs');

mongoose
  .connect('mongodb+srv://crystal:tR1MZq40N@cluster0-vlbkg.mongodb.net/cc?retryWrites=true&w=majority',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));





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


app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use(express.static('public'));

const users = require('./routes/admin/users');
const scraps = require('./routes/admin/scraps');
const dashboard = require('./routes/dashboard')
//app.use('/users', require('./routes/users.js'));

app.get('/', (req, res) => res.render('index'));

// app.get('/dashboard', (req, res) =>
//   res.render('admin_home', {
//     user: req.user
//   }));
//res.render('main', {layout : 'index'});

app.get('/download', (req, res) => res.render('admin_home'));
app.get('/add-new', (req, res) => res.render('admin_home'));
app.get('/status', (req, res) => res.render('admin_home'));
app.get('/logout', (req, res) => res.render('admin_home'));

app.get('/register', (req, res) => {

  User.findOne({ role: 'admin' }).then(usr => {
    if (usr !== undefined && usr !== null) {
      res.render('index');

    }
    else {
      console.log('register starting')
      res.render('register')
    }
  })
});
app.use('/admin/users', users)
app.use('/admin/scraps', scraps)
app.use('/dashboard', dashboard)
http.createServer(app).listen(port);
