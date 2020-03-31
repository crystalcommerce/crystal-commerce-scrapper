const mongoose=require('mongoose');
const scrapdataSchema=new mongoose.Schema({
    scrapId:{
        type:mongoose.SchemaTypes.ObjectId
    },
    createdDate:{
        type:Date
    },
    resultData:{
        type:mongoose.SchemaTypes.String
    }

});


const ScrapData=mongoose.model('ScrapData',scrapdataSchema);
module.exports=ScrapData;