import Scrap from '../models/Scrap';


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

        ///reqiore

        rss[id] = s;
        console.log("rrrrr");
    }
    console.log(scrapers);

}, null, true, 'America/Los_Angeles');
job.start();