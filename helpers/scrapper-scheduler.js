const Scrap = require('../models/Scrap');
const ScrapData = require('../models/ScrapData');
var vm = require("vm");
var fs = require("fs");
var path = require('path');
var dateFormat = require('dateformat');
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
        if(s.disabled) continue;
        
        let id = s._id;
        console.log('first scrap filter')
        let rss = runningScrapper.filter(rs => rs.config.id == id);

        if (rss.length != 0) continue;
        var d = new Date();
        console.log('now time is ', new Date());
        console.log('last date done is ', s.lastDoneDate)
        var comp = diff_minutes(d, s.lastDoneDate);
        var modulepath = '';
        if (comp === 0 || comp > 0) {
            s.lastDoneDate.setTime(s.lastDoneDate.getTime() + s.everyMinute * 60000);
            //  let scrap=await  Scrap.findOne({_id:s.id});
            // Scrap.findOne({ _id: s.id }, (err, doc) =>{
            if (comp === 0) {
                console.log('is equal');
                s.lastDoneDate = s.lastDoneDate.getTime() + (s.everyMinute * 60000);
            }
            else {
                console.log('comp is gr and d.getTime() is ', d.getTime())
                s.lastDoneDate = new Date(d.getTime() + (s.everyMinute * 60000));
            }

            modulepath = s.jsFilePath;
            if (modulepath !== null && modulepath !== undefined) {


                let Module = require(path.join(appDir, modulepath));
                console.log('before module new')
                let module = new Module();
                scrapers[s._id] = module;
                await module.start(async (data) => {
                    //console.log(data);
                    //it json file, 
                    //put it into db let call it scrapData 
                    //id- scrapid - {{data}} - date

                    var scrapData = new ScrapData({
                        scrapId: s._id, resultData: JSON.stringify(data),
                        createdDate: dateFormat(new Date(), 'shortDate')
                    });
                    console.log('saving Scraping Data ....')


                    try {
                        await scrapData.save();
                        console.log('scrapData saved in schedular')
                    }
                    catch (err) {
                        console.log('scrapData saving has error ', err)
                    }

                });
            }
            try {
                await s.save();
                console.log('scrap saved in scrapper schedular')
            }
            catch (err) {
                console.log('Scrap saving in schedular has erro', err)
            }

            //   });

        }
        else {
            continue;
        }
        rss[id] = s;
    }
}, null, true, 'America/Los_Angeles');
job.start();
