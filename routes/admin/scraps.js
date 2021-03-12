const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const axios = require('axios');
const cheerio = require('cheerio');

var uuid = require('uuid');

var bodyParser = require('body-parser')

const passport = require('passport');
var fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

var filePath = 'uploads/'


var storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, filePath)
  },
  filename: function (req, file, cb) {
    //console.log(file);
    cb(null, uuid.v1() + "-" + file.originalname)
  }
})

var upload = multer({ storage: storage })


const Scrap = require('../../models/Scrap');
const ScrapData=require('../../models/ScrapData')
const { forwardAuthenticated } = require('../../config/auth');

const app = express();


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
router.get('/status',(req,res)=>{
  res.redirect('/dashboard')
})


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
router.get('/download/:id',(req,res)=>{

  console.log('download started')
  const json2csv = require('json2csv').parse;
  var scrapname=''
  Scrap.findOne({ _id: req.params.id }).then(scrap => {
    
    scrapname = scrap.websitename;
  })
  ScrapData.find({scrapId:req.params.id}).select('resultData').lean().exec((err,scrapdata)=>{
    
    if(scrapdata!==undefined&&scrapdata!==null&&scrapdata.length!==0){
      
      console.log('after jsonconvert')
    
      var csvString=  json2csv(scrapdata);
      res.setHeader('Content-disposition', 'attachment; filename='+scrapname+'.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csvString);
    
    
  }
  else{
    res.redirect('/admin/scraps')
  }

  })
  
})
router.get('/view/:id', (req, res) => {
  ///res.send("omidomid");
  var webname=''
  Scrap.findOne({ _id: req.params.id }).then(scrap => {
    console.log(scrap)
    webname = scrap.websitename;
  })

  ScrapData.find({scrapId:req.params.id}).limit(20).
  sort({ createdDate: -1 }).lean().exec((error,scrapdata)=>{
    
    res.render('admin/scraps/view',{layout:'index',data: {scrapdata:scrapdata,websitename:webname,scrapid:req.params.id}
    })
  })
  // Scrap.findById(req.params.id).lean().exec(function (error, scrap) {
    
  //   res.render('admin/scraps/view', { layout: 'index', scrap: scrap });
  // });
});



router.get('/create', (req, res) => {
  res.render('admin/scraps/create', { layout: 'index' });
})

router.get('/delete/:id', (req, res) => {
  
  var fileName = ''
  var scrapId='';
  Scrap.findOne({ _id: req.params.id }).then(scrap => {
    console.log(scrap)
    fileName = scrap.jsFilePath;
    
  })
  
  
  
    ScrapData.deleteMany({scrapId:req.params.id}).then((reslt)=>{
      Scrap.deleteOne({ _id: req.params.id }).then((resd)=>{
        fs.unlinkSync(fileName)
        res.redirect('/admin/scraps');
      })
      
  
    
  }).catch()

}
)


router.post('/create', upload.single('jsFile'), (req, res) => {

  const file = req.file
  
  console.log("file =>", req.file);

  const { websitename, url, everyMinute } = req.body;
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
          everyMinute
        });
        newScrap.jsFilePath = file.path;
        newScrap.save().then(scrap => {
          res.redirect('/admin/scraps');
        }).catch(err => console.log(err))
      }
    });
  }
})

module.exports = router;