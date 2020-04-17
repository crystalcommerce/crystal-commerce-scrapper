const express = require('express');
const bodyParser = require('body-parser');

const http = require('http');
const path = require('path');
const expressHbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const mongoose=require('mongoose')
const flash = require('connect-flash');
const User = require("./model/User");
const scheduler = require('./helpers/scrapper-scheduler');
const M = require('./modules/db.yugioh-card');
let m = new M();
m.start(a=>{
  console.log(a);
})
console.log("2nd custom test message from jesse");
require("dotenv").config();
// const User = require('./models/User');
const app = express()
const port = 3000;
const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth');

require('./config/passport')(passport);

const {select,generateDate,paginate} = require('./helpers/handlebars-helpers');
const db = require('./config/keys').mongoURI;

console.log("third custom test message from jesse");

app.set('views', path.join(__dirname, 'views'));
//console.log(path.join(__dirname, 'views'))

app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main',layoutsDir:__dirname + '/views/layouts', helpers: {select: select, generateDate: generateDate,paginate: paginate}}));
app.set('view engine', 'hbs');

mongoose
  .connect('mongodb+srv://crystal:tR1MZq40N@cluster0-vlbkg.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

console.log("4th custom test message from jesse");


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

console.log("fifth custom test message from jesse");

app.use(flash());


app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use(express.static('public'));

const  users= require('./routes/admin/users');
const scraps=require('./routes/admin/scraps')
//app.use('/users', require('./routes/users.js'));

 app.get('/', (req, res) => res.render('index'));
app.get('/dashboard',(req, res) =>
res.render('admin_home', {
  user: req.user
}));
//res.render('main', {layout : 'index'});
console.log("6th custom test message from jesse");

app.get('/download', (req, res) => res.render('admin_home'));
app.get('/add-new', (req, res) => res.render('admin_home'));
app.get('/status', (req, res) => res.render('admin_home'));
app.get('/logout', (req, res) => res.render('admin_home'));

app.get('/register',(req,res)=>{
  
  User.findOne({role:'admin'}).then(usr=>{
    if(usr!==undefined&&usr!==null){
      res.render('index');

    }
    else{
      console.log('register starting')
       res.render('register')
    }
  })
});
console.log("7th custom test message from jesse");

app.use('/admin/users',users)
app.use('/admin/scraps',scraps)

///check if admin user exists and create it.


http.createServer(app).listen(port);


///add corn jobs for run scrappers
