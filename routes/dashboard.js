const express = require('express');
const router = express.Router();
const Scrap = require('../models/Scrap');
const {formatDate} = require('../helpers/date');


router.get('/', async (req, res) => {
    let date = (await Scrap.find({ disabled: false })
        .select({ "lastDoneDate": 1, "everyMinute": 1 }))
        .map(({ lastDoneDate, everyMinute }) => new Date(lastDoneDate.getTime() + (everyMinute * 60 * 1000)))
        .sort((a, b) => a > b);
    if (date.length > 0) date = date[0]
    else date = "-"
    res.render('dashboard', {
        layout: 'index',
        scrapInfo: {
            total: await Scrap.countDocuments({}),
            running: await Scrap.countDocuments({ disabled: false }),
            nextRunning: (date - new Date() > 0 && date != '-')? formatDate(date): "less than 1 min"
        },
        user: req.user
    });
});



module.exports = router;
