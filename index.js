const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const http = require('http');
const app = express()
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', './views');
app.get('/', (req, res) => res.render('index'));
http.createServer(app).listen(port);