//FILENAME : db.js

const mongoose = require("mongoose");

// Replace this with your MONGOURI.

const MONGOURI = (process.env.MONGO_DB_URI || "mongodb://localhost:27017/") + "scraper?retryWrites=true&w=majority";

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true
    });
    console.log("Connected to DB !!");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;
