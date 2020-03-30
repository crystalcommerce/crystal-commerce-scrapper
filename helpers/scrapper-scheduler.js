const Scrap= require('../models/Scrap');


let runningScrapper = [];


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
        var comp= s.lastDoneDate-d;
        if(comp===0){
         console.log('same time and should do',comp)
         s.lastDoneDate.setTime(s.lastDoneDate.getTime()+s.everyMinute*60000);
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