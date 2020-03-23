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



router.get('/login', forwardAuthenticated, (req, res) => {
  console.log('login is start')
  res.render('index')
});


router.get('/register', forwardAuthenticated, (req, res) => {
  console.log('register starting')
  res.render('register')
});

router.post('/register', (req, res) => {
  const { name, email, password, password2, role } = req.body;
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
        newUser.role = role || "basic";

        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_KEY, {
          expiresIn: "1d"
        });
        newUser.accessToken = accessToken;
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

router.post('/login', urlencodedParser, (req, res, next) => {


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



router.get('/', (req, res) => {

  User.find({}).lean().exec(
    function (error, data) {
      res.render('users', { layout: 'index', users: data })
    }
  );
})

router.get('/edit/:id', (req, res) => {

  User.findById(req.params.id).lean().exec(function (error, user) {
    res.render('admin/users/edit', { layout: 'index', user: user });


  });

});

router.get('/create', (req, res) => {
  res.render('admin/users/create',{ 
    layout: 'index' 
  });
});

router.post('/edit/:id', (req, res) => {

  const id = req.params.id;
  User.findById(id).then(user => {
    user.name = req.body.name;
    user.email = req.body.email;
    user.role = req.body.role;


    user.save().then(updatedUser => {
      req.flash('success_message', `${updatedUser.email} was Updated Successfully`);
      res.redirect('/admin/users');
    }).catch(err => res.status(400).send(`COULD NOT SAVE BECAUSE: ${err}`));
  });
});

router.post('/create', (req, res) => {

  const { name, email, role } = req.body;
  let errors = [];

  if (!name || !email) {
    errors.push({ msg: 'Please enter all fields' });
  }



  if (errors.length > 0) {
    res.render('admin/users/create', {
      errors,
      name,
      email,

    });
  }
  else {
    User.findOne({ email: req.body.email }).then(user => {


      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('admin/users/create', {
          errors,
          name,
          email,
          role
        });
      } else {
        password = "123";
        const newUser = new User({
          name,
          email,
          password,
          role
        });
        newUser.role = role || "basic";

        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_KEY, {
          expiresIn: "1d"
        });
        newUser.accessToken = accessToken;
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

                res.redirect('/admin/users');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

module.exports = router;