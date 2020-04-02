const Scrap = require('../models/Scrap');
const ScrapData=require('../models/ScrapData');
var vm = require("vm");
var fs = require("fs");
var path = require('path');
var appDir = path.dirname(require.main.filename);


let runningScrapper = [];

function diff_minutes(dt2, dt1) {

    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return (Math.round(diff));

}
var CronJob = require('cron').CronJob;
var job = new CronJob('* * * * *', async function () {

    // return;
    
    /// get scrap ///
    let scrapers = await Scrap.find();

    for (let i = 0; i < scrapers.length; i++) {
        const s = scrapers[i];
        let id = s._id;
        console.log('first scrap filter')
        let rss = runningScrapper.filter(rs => rs.config.id == id);

        if (rss.length != 0) continue;
        var d = new Date();
         console.log('now time is ',new Date());
         console.log('last date done is ',s.lastDoneDate)
        var comp = diff_minutes(d, s.lastDoneDate);
        var modulepath = '';
        if (comp === 0 || comp > 0) {
            s.lastDoneDate.setTime(s.lastDoneDate.getTime() + s.everyMinute * 60000);
            Scrap.findOne({ _id: s.id }, (err, doc) =>{
                if (comp === 0) {
                    console.log('is equal');
                    doc.lastDoneDate = s.lastDoneDate.getTime() + (s.everyMinute * 60000);
                }
                else {
                    console.log('comp is gr and d.getTime() is ',d.getTime())
                    doc.lastDoneDate = new Date(d.getTime() + (s.everyMinute * 60000));
                }

                modulepath = s.jsFilePath;
                if (modulepath !== null && modulepath !== undefined) {
                 
                    
                  let Module = require(path.join(appDir, modulepath));
                  console.log('before module new')
                    let module = new Module();
                    scrapers[doc._id] = module;
                    module.start((data)=> {
                        //console.log(data);
                        //it json file, 
                        //put it into db let call it scrapData 
                        //id- scrapid - {{data}} - date

                       var scrapData = new ScrapData({ scrapId:doc._id,resultData:JSON.stringify(data),createdDate:Date.now() });
                       console.log('saving ....')
                         scrapData.save(function (err) {
                               if (err) console.log(err)
                             });
                             console.log('saved and next date',doc.lastDoneDate)
                             
                    });
                }
                
                doc.save((err)=>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log('doc is saved')
                    }
                });
            });

        }
        else {
            continue;  
        }
        rss[id] = s;
    }
}, null, true, 'America/Los_Angeles');
job.start();
