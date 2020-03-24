const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    role:{
        type:String,
        default:'basic',
        enum:["basic","supervisor","admin"]
    },
    accessToken:{
        type:String
    },


});
const User=mongoose.model('User',userSchema);
module.exports=User;