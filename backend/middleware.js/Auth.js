const jwt = require("jsonwebtoken")
require("dotenv").config();


exports.auth = (req, res ,next) => {
    try{

        const token = req.body.token || req.cookies.token || req.header("Authorization")?.replace("Bearer ","");

        if(!token || token == undefined){
            return res.status(401).json({
                message:"Token is missing",
                success:false
            })
        }

        try{
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            console.log("This is paylod",payload)
            req.user = payload
        }catch(error){
            console.log("Error while verify",error)
            return res.status(401).json({
                message:"Jwt token expire please login ",
                success:false
            })
        }
        next();


    }catch(error){
        console.log("Error in Middleware",error)
        return res.status(500).json({
            message:"Error in the middleware",
            success:false
        })
    }
}
