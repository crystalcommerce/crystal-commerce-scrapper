const Log = require('../models/Log')

function addError(scraperId, message) {
    var log = new Log({
        scraperId: scraperId,
        date: new Date(),
        message: message,
        type: 'error'
    });
    log.save();
}
function addMessage(scraperId, message) {
    var log = new Log({
        scraperId: scraperId,
        date: new Date(),
        message: message,
        type: 'message'
    });
    log.save();
}
function addWarning(scraperId, message) {
    var log = new Log({
        scraperId: scraperId,
        date: new Date(),
        message: message,
        type: 'warning'
    });
    log.save();
}

function addLog(type, scraperId, message){
    var log = new Log({
        scraperId: scraperId,
        date: new Date(),
        message: message,
        type: type
    });
    log.save();
}

module.exports = {
    addError,
    addMessage,
    addWarning,
    addLog
}