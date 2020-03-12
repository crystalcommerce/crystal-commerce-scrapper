const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

var bodyParser = require('body-parser')

const passport = require('passport');

const jwt = require('jsonwebtoken');

const Scrap = require('../../models/Scrap');
const { forwardAuthenticated } = require('../../config/auth');

const app=express();

router.get("/",(req,res)=>{
  
    Scrap.find({}).lean().exec(
        function(error,data){
            res.render('scraps',{scraps:data});
        }
    )
})

router.get('/edit/:id', (req, res) => {

  Scrap.findById(req.params.id).lean().exec(function(error,scrap) {
        res.render('admin/scraps/edit', {scrap: scrap});
      

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


router.get('/create',forwardAuthenticated,(req,res)=>{
    console.log('create is fire')
    res.render('admin/scraps/create');
})
router.post('/create',(req,res)=>{
    console.log('body is ',req.body)
    const { websitename,url } = req.body;
    let errors=[];

    if(!websitename||websitename===null){
        console.log('website is ',websitename)
        errors.push({msg:'website is empty'})
    }
    if(!url||url===null){
        console.log('url is ',url)
        errors.push({msg:'url is empty'})
    }

    

  if (errors.length > 0) {
    res.render('admin/scraps/create', {
      errors,
      websitename,
      url,
     
    });
  }
  
  else {
    Scrap.findOne({websitename:req.body.websitename}).then(scrap => {
      
     
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
        newScrap.save().then(scrap=>{
            req.flash('success_msg','You are create new scrap')
            res.render('/admin/scraps')
        }).catch(err=>console.log(err))

      }
    });
    } 
})


module.exports = router;