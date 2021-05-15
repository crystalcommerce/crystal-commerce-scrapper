const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const arrayToCsv = require('../../helpers/arrayToCsv');
var uuid = require('uuid');
var fs = require('fs');
const multer = require('multer');
const path = require('path');
const modulePath = 'modules/';
var filePath = 'uploads/';
const Scrap = require('../../models/Scrap');
const ScrapData = require('../../models/ScrapData');
const Log = require('../../models/Log');


var storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, filePath)
  },
  filename: function (req, file, cb) {
    //console.log(file);
    cb(null, uuid.v1() + "-" + file.originalname)
  }
})



router.get("/", (req, res) => {
  Scrap.find({}).lean().exec(
    function (error, data) {
      res.render('scraps', { layout: 'index', scraps: data });
    }
  )
})

router.get('/edit/:id', (req, res) => {

  Scrap.findById(req.params.id).lean().exec(function (error, scrap) {
    res.render('admin/scraps/edit', { layout: 'index', scrap: scrap });
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
    scrap.everyMinute = req.body.everyMinute;


    scrap.save().then(updatedScrap => {
      req.flash('success', `${updatedScrap.websitename} was Updated Successfully`);
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
  ScrapData.find({ _id: req.params.id }).select('resultData').lean().exec((err, scrapdata) => {

    if (scrapdata !== undefined && scrapdata !== null && scrapdata.length !== 0) {

      let now = new Date();
      var csvFileName = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
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
  var websitename = '';
  var disabled = false;

  Scrap.findOne({ _id: req.params.id }).then(scrap => {
    websitename = scrap.websitename;
    disabled = scrap.disabled;
  })

  ScrapData.find({ scrapId: req.params.id }).limit(20).
    sort({ createdDate: -1 }).lean().exec((error, scrapdata) => {
      console.log(disabled);
      res.render('admin/scraps/view', {
        layout: 'index', data: { disabled: disabled, scrapdata: scrapdata, websitename: websitename, scrapid: req.params.id }
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
  const { websitename, url, everyMinute, file } = req.body;

  let errors = [];

  if (!websitename || websitename === null) {
    errors.push({ msg: 'website is empty' })
  }
  if (!url || url === null) {
    errors.push({ msg: 'url is empty' })
  }

  if (!file || file === null) {
    errors.push({ msg: 'file is empty' })
  }



  if (errors.length > 0) {
    req.flash('error', error.map((m) => m.msg).join('\n'));
    res.redirect('/admin/scraps/create');
    // , {
    //   errors,
    //   websitename,
    //   url,

    // }
  }

  else {
    Scrap.findOne({ websitename: req.body.websitename }).then(scrap => {
      if (scrap) {
        req.flash('error', 'website already exists');
        res.redirect('/admin/scraps/create');
        // errors.push({ msg: 'website already exists' });
        // res.render('admin/scraps/create', {
        //   errors,
        //   websitename,
        //   url,
        // });
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
          req.flash('success', `${websitename} was created successfully`);
          res.redirect('/admin/scraps');
        }).catch(err => console.log(err))
      }
    });
  }
})

router.get('/edit-data/:id', async (req, res) => {
  ScrapData.findOne({ _id: req.params.id }).lean().exec(async (err, scrapdata) => {
    let data = JSON.parse(scrapdata.resultData);
    let titles = (data.length > 0) ? Object.keys(data[0]) : [];
    let scrap = await Scrap.findOne({ _id: scrapdata.scrapId })
    if (scrapdata !== undefined && scrapdata !== null && scrapdata.length !== 0) {
      res.render('admin/scraps/edit-data', { layout: 'index', titles: titles, scrapdata, data: data, scrap })
    }
    else {
      res.redirect('/admin/scraps')
    }
  })
});



router.get('/view-logs/:id/:limit?/:skip?', async (req, res) => {
  let id = req.params.id;
  let limit = req.params.limit ? parseInt(req.params.limit) : 10;
  let skip = req.params.skip ? parseInt(req.params.skip) : 0;
  let count = await Log.countDocuments({ scraperId: id });
  let haveMore = limit + skip < count;
  let nextLinkHref = (haveMore) ? `/admin/scraps/view-logs/${id}/${limit}/${skip + limit}` : '';
  let prevLinkHref = (skip > 0)? `/admin/scraps/view-logs/${id}/${limit}/${skip - limit}` : ''
  let logs = await Log.find({ scraperId: id }).limit(limit).skip(skip).lean();//.limit({ limit: (limit ? limit : 20) });
  res.render('admin/scraps/view-logs', {
    id: id,
    layout: 'index',
    logs: logs,
    skip: skip,
    limit: limit,
    haveMore: haveMore,
    nextLinkHref,
    prevLinkHref
  })
})

router.post('/delete-logs', async (req, res)=>{
  let id = req.body.id;
  let websitename = await Scrap.findOne({id: id}).select('websitename')
  await Log.deleteMany({scraperId: id});
  // req.flash('all logs have been deteled')
  req.flash('success', `all logs for ${websitename} have been deteled`);
  res.redirect(`/admin/scraps/view-logs/${id}`);
});

module.exports = router;