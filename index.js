const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const http = require('http');
const exphbs = require('express-handlebars');
const app = express()
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('hbs', exphbs({ extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static('public'))
app.get('/', (req, res) => res.render('index'));
app.get('/dashboard', (req, res) => res.render('admin_home'));
app.get('/download', (req, res) => res.render('admin_home'));
app.get('/add-new', (req, res) => res.render('admin_home'));
app.get('/status', (req, res) => res.render('admin_home'));
app.get('/logout', (req, res) => res.render('admin_home'));

http.createServer(app).listen(port);