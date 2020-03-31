const Scrap= require('../models/Scrap');
var vm = require("vm");
var fs = require("fs");

let runningScrapper = [];

function diff_minutes(dt2, dt1) 
 {

  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
  
 }
var CronJob = require('cron').CronJob;
var job = new CronJob('* * * * *', async function () {


    /// get scrap ///
    let scrapers = await Scrap.find();

    for (let i = 0; i < scrapers.length; i++) {
        const s = scrapers[i];
        let id = s._id;

        let rss = runningScrapper.filter(rs => rs.config.id == id);

        if (rss.length != 0) continue;
        var d=new Date();
    
        
       var comp= diff_minutes(d,s.lastDoneDate);
       var modulepath='';
        if(comp===0 || comp>0 ){
         console.log('same time and should do',comp)
         s.lastDoneDate.setTime(s.lastDoneDate.getTime()+s.everyMinute*60000);
<<<<<<< HEAD
         s.save();

         //////////
         var S = require(s.jsFilePath);
         s1 = new S();
         s1.id = s.id;
         runningScrapper[s1.id] = s1;
         s1.start((data)=>{
             //data ba id
             //time stamp 
         })
        }
        else if(comp<0){
            console.log('last done date is passed and should do',comp)
            s.lastDoneDate.setTime(d.getTime()+s.everyMinute*60000);
            s.save()
=======
         
         Scrap.findOne({ _id: s.id }, function (err, doc){
        if(comp===0){
              doc.lastDoneDate =s.lastDoneDate.getTime()+(s.everyMinute*60000);
            }
            else{
              doc.lastDoneDate =d.getTime()+(s.everyMinute*60000);
            }
       
            modulepath=s.jsFilePath;
           if(modulepath!==null&&modulepath!==undefined){
              console.log(modulepath)
              var data = fs.readFileSync(modulepath);
              const script = new vm.Script(data);
              script.runInThisContext();
              console.log('run is done')
           }
          
          doc.save();
          });
         
>>>>>>> cbedb88832c2559326568897ab3482294204e286
        }
        else{

           console.log('date earlier',comp)
           continue;
        }
        rss[id] = s;
        console.log("rrrrr");
    }
    console.log(scrapers);

}, null, true, 'America/Los_Angeles');
job.start();
