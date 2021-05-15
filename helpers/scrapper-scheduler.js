const Scrap = require('../models/Scrap');
const ScrapData = require('../models/ScrapData');
var vm = require("vm");
var fs = require("fs");
var path = require('path');
var dateFormat = require('dateformat');
var appDir = path.dirname(require.main.filename);
const {addLog} = require('../helpers/scraper-logger')

let runningScrapper = [];

function diff_minutes(dt2, dt1) {

    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return (Math.round(diff));

}

function logMessage(type, id, message){
    console.log({type, message, id})
    addLog(type, id, message)
}
var CronJob = require('cron').CronJob;
var job = new CronJob('* * * * *', async function () {
    let scrapers = await Scrap.find();
    for (let i = 0; i < scrapers.length; i++) {
        
        const s = scrapers[i];
        if(s.disabled) continue;
        let id = s.id;
        let rss = runningScrapper.filter(rs => {
            return rs.config.id == id
        });
        if (rss.length != 0) {
            continue;
        }
        var d = new Date();
        var comp = diff_minutes(d, s.lastDoneDate);
        var modulepath = '';
        if (comp === 0 || comp > 0) {
            s.lastDoneDate.setTime(s.lastDoneDate.getTime() + s.everyMinute * 60000);
            if (comp === 0) {
                s.lastDoneDate = s.lastDoneDate.getTime() + (s.everyMinute * 60000);
            }
            else {
                s.lastDoneDate = new Date(d.getTime() + (s.everyMinute * 60000));
            }

            modulepath = s.jsFilePath;
            if (modulepath !== null && modulepath !== undefined) {


                let Module = require(path.join(appDir, modulepath));
                let module = new Module(s._id, logMessage);
                module.config.id = id;
                // scrapers[s._id] = module;
                runningScrapper.push(module);
                await module.start(async (data) => {
                    var scrapData = new ScrapData({
                        scrapId: s._id, 
                        resultData: JSON.stringify(data),
                        createdDate: dateFormat(new Date(), 'shortDate')
                    });
                    try {
                        await scrapData.save();
                    }
                    catch (err) {
                    }

                    runningScrapper = runningScrapper.filter(rs => rs.config.id != id)
                });
            }
            try {
                await s.save();
                console.log('scrap saved in scrapper schedular')
            }
            catch (err) {
                console.log('Scrap saving in schedular has error', err)
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
