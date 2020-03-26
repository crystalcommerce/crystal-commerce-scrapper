const mongoose=require('mongoose');
const scrapSchema=new mongoose.Schema({
    websitename:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }, 
    jsFilePath: {
        type: String,
        required: false
    }
})

const Scrap=mongoose.model('Scrap',scrapSchema);
module.exports=Scrap;