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
const User = require("./models/User");
const scheduler = require('./helpers/scrapper-scheduler');
console.log(`.env.${process.env.NODE_ENV}`);
let env = process.env.NODE_ENV;
if (env)
  env = `.env.${process.env.NODE_ENV}`
else
  env = '.env.prod'
require('dotenv').config({ path: env })

var multer = require('multer')
const app = express()
var sessionStore = new session.MemoryStore;
const port = process.env.PORT || 3000;
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(multer().array())
app.use(cookieParser());
require('./config/passport')(passport);
const { select, generateDate, paginate, toFormatedDate, ifCond } = require('./helpers/handlebars-helpers');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', expressHbs(
  {
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts',
    helpers: {
      select: select,
      generateDate:
        generateDate,
      paginate: paginate,
      toFormatedDate: toFormatedDate,
      ifCond: ifCond
    }
  }));


app.set('view engine', 'hbs');

mongoose
  .connect(process.env.MONGOURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log(`MongoDB Connected to ${process.env.MONGOURI}`))
  .catch(err => console.log(err));

app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(function (req, res, next) {
  res.locals.success = req.session.success = req.flash('success');
  res.locals.error = req.session.error = req.flash('error');
  next();
});

app.use(express.static('public'));

const users = require('./routes/admin/users');
const scraps = require('./routes/admin/scraps');
const dashboard = require('./routes/dashboard')
app.get(['/', '/index', '/home'], async (req, res) => {
  let user = await User.findOne({ role: 'admin' });
  let data = {};
  data.userDefinded = true;
  if (!user)
    data.userDefinded = false;
  res.render('index', data)
});
app.get('/register', (req, res) => {
  User.findOne({ role: 'admin' }).then(usr => {
    if (usr !== undefined && usr !== null) {
      res.render('index');

    }
    else {
      res.render('register')
    }
  })
});
app.use('/admin/users', users)
app.use('/admin/scraps', scraps)
app.use('/dashboard', dashboard)
http.createServer(app).listen(port);
