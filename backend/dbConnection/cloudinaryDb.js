// cloudinaryDb.js

const cloudinary = require('cloudinary').v2;

const cloudinaryConnect = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    });

    if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
        console.error("Cloudinary credentials are not set in the environment variables");
    }

    console.log("Cloudinary connected successfully");
};

module.exports = cloudinaryConnect;
