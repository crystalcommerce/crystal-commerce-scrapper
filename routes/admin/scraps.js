const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const axios = require('axios');
const cheerio = require('cheerio');
const arrayToCsv = require('../../helpers/arrayToCsv');

var uuid = require('uuid');

var bodyParser = require('body-parser')

const passport = require('passport');
var fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
var appDir = path.dirname(require.main.filename);

const modulePath = 'modules/';
var filePath = 'uploads/';


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
const ScrapData = require('../../models/ScrapData')
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

router.get("/change-status/:id", (req, res) => {
  Scrap.findById(req.params.id).lean().exec(async function (error, scrap) {
    // console.log(scrap)
    if (!error) {
      await Scrap.updateOne({ _id: req.params.id }, { disabled: !scrap.disabled });
      // scrap.disabled = !scrap.disabled
      res.redirect('/admin/scraps');
    } else {
      res.send("error")
    }
  });
})
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
router.get('/status', (req, res) => {
  res.redirect('/dashboard')
})


router.get('/scrap/:id', (req, res) => {
  Scrap.findById(req.params.id).lean().exec(function (error, scrap) {
    axios(scrap.url).then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      const statsTable = $('.statsTableContainer > tr');
    })
  })
});

router.get('/delete-data/:id', (req, res) => {
  ScrapData.deleteMany({ _id: req.params.id }).then((reslt) => {
    res.redirect('/admin/scraps');
  });
});
router.get('/download-data/:id', (req, res) => {

  console.log('download started')
  var scrapname = ''
  ScrapData.find({ _id: req.params.id }).select('resultData').lean().exec((err, scrapdata) => {

    if (scrapdata !== undefined && scrapdata !== null && scrapdata.length !== 0) {

      let now  = new Date();
      var csvFileName = now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDate();
      scrapdata = scrapdata[0]["resultData"];
      if (typeof (scrapdata) == "string") scrapdata = JSON.parse(scrapdata)
      const csvString = arrayToCsv({ data: scrapdata });
      res.setHeader('Content-disposition', 'attachment; filename=' + csvFileName + '.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csvString);
    }

    else {
      res.redirect('/admin/scraps')
    }
  })

})
router.get('/view/:id', (req, res) => {
  ///res.send("omidomid");
  var webname = ''
  Scrap.findOne({ _id: req.params.id }).then(scrap => {
    webname = scrap.websitename;
  })

  ScrapData.find({ scrapId: req.params.id }).limit(20).
    sort({ createdDate: -1 }).lean().exec((error, scrapdata) => {

      res.render('admin/scraps/view', {
        layout: 'index', data: { scrapdata: scrapdata, websitename: webname, scrapid: req.params.id }
      })
    })
  // Scrap.findById(req.params.id).lean().exec(function (error, scrap) {

  //   res.render('admin/scraps/view', { layout: 'index', scrap: scrap });
  // });
});



router.get('/create', (req, res) => {
  let files = fs.readdirSync(modulePath);
  res.render('admin/scraps/create', { layout: 'index', files: files });
});

router.get('/delete/:id', (req, res) => {

  var fileName = ''
  var scrapId = '';
  Scrap.findOne({ _id: req.params.id }).then(scrap => {
    if (scrap) fileName = scrap.jsFilePath;

  })



  ScrapData.deleteMany({ scrapId: req.params.id }).then((reslt) => {
    Scrap.deleteOne({ _id: req.params.id }).then((resd) => {
      // if (fs.existsSync(fileName))
        // fs.unlinkSync(fileName)
      res.redirect('/admin/scraps');
    })



  }).catch()

}
)


router.post('/create', (req, res) => {
  const { websitename, url, everyMinute, file} = req.body;

  let errors = [];

  if (!websitename || websitename === null) {
    console.log('website is ', websitename)
    errors.push({ msg: 'website is empty' })
  }
  if (!url || url === null) {
    console.log('url is ', url)
    errors.push({ msg: 'url is empty' })
  }

  if (!file || file === null) {
    console.log('file is ', file)
    errors.push({ msg: 'file is empty' })
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
        let jsFilePath = path.join(modulePath, file);

        const newScrap = new Scrap({
          websitename,
          url,
          everyMinute,
          jsFilePath
        });
        // newScrap.jsFilePath = file.path;
        newScrap.save().then(scrap => {
          res.redirect('/admin/scraps');
        }).catch(err => console.log(err))
      }
    });
  }
})

module.exports = router;