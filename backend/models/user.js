const  mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        lowercase:true,
        
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    emailOtp:{
        type:String,
        
    },
    otpExpiresAt:{
        type:Date
    },
    profileImage:{
      type:String,
      default:""  
    },
    
    Blog:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    }]
    
})

module.exports = mongoose.model("User",userSchema)