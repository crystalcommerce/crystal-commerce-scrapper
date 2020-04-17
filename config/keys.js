const mongodb = (process.env.MONGO_DB_URI || "mongodb://localhost:27017/") + "MyDb?retryWrites=true&w=majority";
module.exports = {
    mongoURI:mongodb
}; 
