const  mongoose = require("mongoose")

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"title is required"],
        uppercase:true
    },
    content:{
        type:String,
        required:[true,"Content is required"],
        minlength:20,
        
    },
    category:{
        type:String,

    },
    like:{
        type:Number,
        default:0
    },
    image:{
        type:String,
        default:""
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    avatar:{
        type:String,
    },
    likes:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"User",
        default:[]
    },
    username:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Blog",blogSchema)