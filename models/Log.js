const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({
    scraperId: {
        type: mongoose.SchemaTypes.ObjectId
    },
    date: {
        type: Date
    },
    message: {
        type: String
    },
    type: {
        type: String
    }
})

const Log = mongoose.model('Log', logSchema);
module.exports = Log;