const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

var bodyParser = require('body-parser')

const passport = require('passport');

const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const { forwardAuthenticated } = require('../../config/auth');


var app = express()

var jsonParser = bodyParser.json()

var urlencodedParser = bodyParser.urlencoded({ extended: false })


router.get('/login', forwardAuthenticated, (req, res) =>
{ 
  console.log('login is start')
  res.render('index')
});


router.get('/register', forwardAuthenticated, (req, res) => {
  console.log('register starting')  
  res.render('register')
});

router.post('/register', (req, res) => {
  const { name, email, password, password2,role } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
        newUser.role=role||"basic";
       console.log(process.env.JWT_KEY)
        const accessToken=jwt.sign({userId:newUser._id},process.env.JWT_KEY,{
          expiresIn:"1d"
        });
        newUser.accessToken=accessToken;
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
             
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
               
                res.redirect('../users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});
// Login

router.post('/login',urlencodedParser, (req, res, next) => {
  
  
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '../users/login',
    failureFlash: true
  })(req, res, next);
});




// Logout
router.get('/logout', (req, res) => {
  console.log('logoutstart')
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('../users/login');
});



router.get('/',(req,res)=>{
  
   User.find({}).lean().exec(
   function(error,data){
    res.render('users',{users:data})
   } 
   )
 })

 router.get('/edit/:id', (req, res) => {
  console.log('edit users')
  User.findById(req.params.id).lean().exec(function(error,user) {
    console.log(user)
        res.render('admin/users/edit', {user: user});
      

  });

});
module.exports = router;