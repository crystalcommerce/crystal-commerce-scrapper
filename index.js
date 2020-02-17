const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const http = require('http');
const app = express()
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
import x from './modules/db.yugioh-card';
let y = new x();
y.start();
app.get('/', (req, res) => res.send('Scrapper'));
http.createServer(app).listen(port);