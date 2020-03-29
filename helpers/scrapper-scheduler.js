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
