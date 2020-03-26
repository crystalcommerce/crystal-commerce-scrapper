const Scrap= require('../models/Scrap');


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
        console.log('date time is ',d)
        console.log('last done ',s.lastDoneDate)
        console.log('compare is ',comp)
        if(comp===0){
         console.log('same time and should do',comp)
         s.lastDoneDate.setTime(s.lastDoneDate.getTime()+s.everyMinute*60000);
         Scrap.findOne({ _id: s.id }, function (err, doc){
            doc.lastDoneDate =s.lastDoneDate.getTime()+(s.everyMinute*60000);
            
            doc.save();
          });
         
        }
        else if(comp>0){
            console.log('last done date is passed and should do',comp)
            s.lastDoneDate.setTime(d.getTime()+s.everyMinute*60000);
            Scrap.findOne({ _id: s.id }, function (err, doc){
                doc.lastDoneDate =d.getTime()+(s.everyMinute*60000);
                
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
