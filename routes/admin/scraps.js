const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const axios = require('axios');
const cheerio = require('cheerio');

var bodyParser = require('body-parser')

const passport = require('passport');

const jwt = require('jsonwebtoken');
const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })


const Scrap = require('../../models/Scrap');
const { forwardAuthenticated } = require('../../config/auth');

const app = express();

// router.all('/*', (req, res, next) => {
//   // router.all('/*',userAuthenticated ,(req, res, next) => {
//       req.app.locals.layout = 'index';

//       next();
//   });

router.get("/", (req, res) => {
  Scrap.find({}).lean().exec(
    function (error, data) {
      res.render('scraps', { layout: 'index', scraps: data });
    }
  )
})

router.get('/edit/:id', (req, res) => {

  Scrap.findById(req.params.id).lean().exec(function (error, scrap) {
    res.render('scrapedit', { layout: 'index', scrap: scrap });
  });
});

router.post('/edit/:id', (req, res) => {

  const id = req.params.id;
  Scrap.findById(id).then(scrap => {
    scrap.websitename = req.body.websitename;
    scrap.url = req.body.url;


    scrap.save().then(updatedScrap => {
      req.flash('success_message', `${updatedScrap.websitename} was Updated Successfully`);
      res.redirect('/admin/scraps');
    }).catch(err => res.status(400).send(`COULD NOT SAVE BECAUSE: ${err}`));
  });
});
router.get('/scrap/:id', (req, res) => {

  Scrap.findById(req.params.id).lean().exec(function (error, scrap) {
    axios(scrap.url).then(response => {
      console.log('after axios')
      const html = response.data;
      const $ = cheerio.load(html);
      const statsTable = $('.statsTableContainer > tr');
      console.log(statsTable.length);
      console.log(statsTable.text)
    })
  })
});


router.get('/view/:id', (req, res)=>{
  ///res.send("omidomid");
  Scrap.findById(req.params.id).lean().exec(function (error, scrap) {
    res.render('admin/scraps/view', { layout: 'index', scrap: scrap });
  });
});


router.get('/create', (req, res) => {
  res.render('admin/scraps/create', { layout: 'index' });
})

router.get('/delete/:id',(req,res)=>{
  Scrap.deleteOne({_id:req.params.id}).then((resd)=>{
    res.redirect('/admin/scraps');
  }).catch()
})

router.post('/create', upload.single('jsFile'), (req, res) => {
  const file = req.file
  console.log(file);
  res.send(file);
  return;

  const { websitename, url } = req.body;
  let errors = [];

  if (!websitename || websitename === null) {
    console.log('website is ', websitename)
    errors.push({ msg: 'website is empty' })
  }
  if (!url || url === null) {
    console.log('url is ', url)
    errors.push({ msg: 'url is empty' })
  }



  if (errors.length > 0) {
      res.render('admin/scraps/create', {
        errors,
        websitename,
        url,

      });
  }

  else {
    Scrap.findOne({ websitename: req.body.websitename }).then(scrap => {
      if (scrap) {
        errors.push({ msg: 'website already exists' });
        res.render('admin/scraps/create', {
          errors,
          websitename,
          url,

        });
      } else {

        const newScrap = new Scrap({
          websitename,
          url,
        });
        newScrap.save().then(scrap => {
          //req.flash('success_msg', 'You are create new scrap')
          res.redirect('/admin/scraps');
        }).catch(err => console.log(err))
      }
    });
  }
})


module.exports = router;