const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

var bodyParser = require('body-parser')

const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');


var app = express()

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


router.get('/', (req, res) =>
    res.render('admin_home', {
        user: req.user
    }));



module.exports = router;