const express = require("express")
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendEmail = require("../helper/email")
const cookie = require("cookie")
require("dotenv").config()
const Blog = require("../models/blogSchema")
const jdenticon = require("jdenticon");
const gravatar = require("gravatar");
const multer = require("multer")
const { Readable } = require('stream');
const user = require("../models/user")
// setting up temporarly


const cloudinary = require("cloudinary").v2
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // console.log("Username =>" , username + "email => " , email + "Password => ",password)
        
        let user = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });
        
        if (user) {
            if (user.isEmailVerified) {
                return res.status(400).json({
                    message: "Email is already registered and verified",
                    success: false
                });
            } else {
                const createOtp = Math.floor(100000 + Math.random() * 900000);
                const otpExpiresAt = Date.now() + 10 * 60 * 1000; 

                user.emailOtp = createOtp;
                user.otpExpiresAt = new Date(otpExpiresAt);
                
                await user.save();

                try {
                    await sendEmail({ email: email, username: username, otp: createOtp });
                } catch (emailError) {
                    console.log("Error sending email:", emailError);  // Log the email error
                    return res.status(500).json({
                        message: "Error sending OTP email",
                        success: false
                    });
                }

                return res.status(200).json({
                    message: "User already exists. A new OTP has been sent to your email.",
                    userId: user._id,
                    success: true
                });
            }
        }

        if (existingUsername) {
            return res.status(400).json({
                message: "Username is already taken",
                success: false
            });
        }

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (error) {
            console.log('Error hashing password:', error);  // Log the error
            return res.status(500).json({
                message: "Error in hashing password",
                success: false
            });
        }

        const createOtp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiresAt = Date.now() + 10 * 60 * 1000;

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            emailOtp: createOtp,
            otpExpiresAt: new Date(otpExpiresAt)
        });

        console.log("New User Created:", newUser);  // Log the created user data

        try {
            await sendEmail({ email: newUser.email, username: newUser.username, otp: createOtp });
        } catch (emailError) {
            console.log("Error sending email:", emailError);  // Log the email error
            return res.status(500).json({
                message: "Error sending OTP email",
                success: false
            });
        }

        return res.status(200).json({
            message: "User created successfully. Please verify your email",
            userId: newUser._id,
            success: true
        });

    } catch (error) {
        console.log("Error in signup:", error);
        return res.status(500).json({
            message: "Issue while signup",
            success: false,
        });
    }
};


exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;

       
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if(user.isEmailVerified == true){
            return res.status(400).json({
                message:"Your is already verrified",
                success:false
            })
        }

        
        if (user.emailOtp.toString() !== otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }


        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one", success: false });
        }

      
        user.isEmailVerified = true;
        // user.emailOtp = undefined;
        // user.otpExpiresAt = undefined;
        await user.save();

        return res.status(200).json({
            
            message: "Email verified successfully",
            success: true
        });
    } catch (error) {
        console.log("Error while verifying OTP:", error.message); 
        return res.status(500).json({

            message: "Error while verifying OTP",
            success: false
        });
    }
};

    

exports.login = async (req,res) => {
    try{
        const {email , password} = req.body

        if(!email || !password){
            return res.status(400).json({
                message:"Please fill the details properly",
                success:false
            })
        }

        const user  = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                message:"E-mail does not exist",
                success:false
            })
        }

        const payload = {
            email:user.email,
            id:user._id
        }

        if(await bcrypt.compare(password,user.password)){
           let token =  jwt.sign(payload,
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
           )

           user.token = token
        //    user.password = 

           if (!user.profileImage) {
            // Generate a Gravatar URL or set a default avatar
            const avatarUrl = gravatar.url(user.email, {
                s: "200", // Size
                r: "pg", // Rating
                d: "retro", // Default image style
            });

            // Update the user's profile with the avatar
            user.profileImage = avatarUrl;
            await user.save();
        }

           const option = {
            expires :new  Date(Date.now() + 30000),
            httpOnly:true
           }

           res.cookie("token", token , option).status(200).json({
            success:true,
            token,
            user,
            message:"User logged in Successfully"
           })
            
        }else{
            return res.status(400).json({
                message:"Incorrect password",
                success:false
            })
        }

    }catch(error){
        console.log("Error in Login : ",error)
        return res.status(500).json({
            message:"Issue in Login",
            success:false
        })
    }
}
 // Add this import

 

 

 // Assuming User model is defined elsewhere
 
 exports.createBlog = async (req, res) => {
   try {
     const { title, content } = req.body;
     const category = req.body.category?.toLowerCase()
     console.log("Content Type",category)
     console.log("title", title);
     console.log("content", content);
     const image = req.file
     
     // Validate input fields
     if (!title || !content) {
       return res.status(403).json({
         message: "All fields are required",
         success: false
       });
     }
     
     console.log("Image received:", image);
     
     const userId = req.user.id;
     let imageUrl = '';
     
     // Check if the user exists
     const user = await User.findById(userId);
     if (!user) {
       return res.status(404).json({
         message: "User not found",
         success: false,
       });
     }
 
     const username = user.username;
     const avatarImage = user.profileImage;
     
     // Handle image upload if provided
     if (image) {
       const uploadResponse = await new Promise((resolve, reject) => {
         const uploadStream = cloudinary.uploader.upload_stream(
           { folder: 'techThinker' }, 
           (error, result) => {
             if (error) return reject(error);
             resolve(result);
           }
         );
 
         // Convert the image buffer to a stream and pipe it to Cloudinary
         const readableImageStream = new Readable();
         readableImageStream.push(image.buffer);
         readableImageStream.push(null); // Close the stream
         readableImageStream.pipe(uploadStream);
       });
 
       imageUrl = uploadResponse.secure_url; // Get the URL from Cloudinary
     } else {
       // Default image URL if no image is uploaded
       imageUrl = 'https://res.cloudinary.com/djw5u4i50/image/upload/v1737143436/techThinker/ser2_v3bdlq.png';
     }
 
     // Create the blog post in the database
     const blog = await Blog.create({
       title,
       content,
       category,
       author: userId,
       image: imageUrl,
       avatar: avatarImage,
       username: username
     });
 
     // Add blog ID to the user's blog list
     await User.findByIdAndUpdate(
       { _id: userId },
       { $push: { Blog: blog._id } }
     );
 
     res.status(201).json({
       message: "Blog created successfully",
       success: true,
       blog
     });
   } catch (error) {
     console.log("Error while creating blog: ", error);
     return res.status(500).json({
       message: "Issue while creating blog",
       success: false
     });
   }
 };
 
 exports.getForgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
    //   console.log(email, "Email");
      const user = await User.findOne({ email });
      if (!user) {
        console.log("Error: Email is not registered");
         return res.status(401).json({
          message: "Email is not registered",
          success: false,
        });
      }
  
      const createOtp = Math.floor(100000 + Math.random() * 900000);
      const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  
      user.emailOtp = createOtp;
      user.otpExpiresAt = new Date(otpExpiresAt);
      const username = user.username;
      await user.save();
      try {
        await sendEmail({ email: email, username: username, otp: createOtp });
      } catch (emailError) {
        console.log("Error sending email:", emailError.message); // Log the email error
        return res.status(500).json({
          message: "Error sending OTP email",
          success: false,
        });
      }
      return res.status(200).json({
        user,
        message: "User found, check your email",
        success: true,
      });
    } catch (error) {
      console.log("Error while generating otp: ", error.message);
      return res.status(500).json({
        message: "Issue getting email",
        success: false,
      });
    }
  };
  


exports.profile = async (req, res) => {
    try{
        const userId = req.user.id
        if(!userId){
            return res.status(400).json({
                message:"User does not exist , Please login first",
                success:false,
            })
        }


        const userProfile = await User.findById(userId)
        .select("profileImage username email Blog")
        .populate("Blog")
        console.log("User Profile",userProfile)
        return res.status(200).json({
            message:"Your profile found",
            success:true,
            userProfile
        })
    }catch(error){
        console.log("Error in  profile",error);
        return res.status(500).json({
            
            message:"Issue in profile section",
            success:false
        })
    }
}


exports.updateBlog = async (req , res) => {
    try{
        const { title,content} = req.body
        console.log("title",title)
        console.log("COntent ", content)
        const blogId = req.params.blogId
        if(!content || !title){
            return res.status(403).json({
                message:"All fields are required , while updating blog",
                success:false
            })
        }

        const userId = req.user.id
        if(!userId){
            return res.status(403).json({
                message:"User token is expired please login",
                success:false
            })
        }

        const blog = await Blog.findById(blogId)
        if(!blog){
            return res.json({
                message:"Blog not found",
                success:false
            })
        }
        blog.content = content;
        blog.title = title;

        await blog.save()

        res.status(200).json({
            message: "Blog updated successfully",
            success: true,
            blog
        });

       

    }catch(error){
        console.log("Error while updating blog",error)
        return res.status(500).json({
            message:"Eror while updating Blog",
            success:false
        })
    }
}

exports.updatePassword = async (req, res) => {
    try{

        const{password} = req.body;
        const userId = req.params.userId

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
                success: false
            });
        }
        const user = await User.findById(userId)
        if(!user){
            return res.json({
                message:"user not found",
                success:false
            })
        }

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (error) {
            console.log('Error hashing password:', error);  // Log the error
            return res.status(500).json({
                message: "Error in hashing password",
                success: false
            });
        }
        user.password = hashedPassword;
        

        await user.save()

        res.status(200).json({
            message: "user password  updated successfully",
            success: true,
            
        });




    }catch(error){
        console.log("Error in updatePassword:", error);

        return res.status(500).json({
            message:"Error while updating password",
            success:false
        })



    }
}

exports.deleteBlog = async( req,res) => {
    try{
        const BlogId = req.params.blogId
        console.log("Params blogId: ",BlogId)
        const user = req.user.id;
        const checkUser = await User.findById(user)
        if(!checkUser){
            return res.status(403).json({
                message:"Token is expiered , please login",
                success:false
            })
        }
        const blog = await Blog.findById(BlogId)


        console.log("Blog=>",BlogId)
        if(!blog){
            return res.status(403).json({
                message:"Invalid blog Id, Blog not found",
                success:false
            })
        }
        await blog.deleteOne();

        return res.status(200).json({
            message:"Blog deleted successfully",
            success:false
            
        })


    }catch(error){
        console.log("Error while deleting the blog",error)
        return res.status(500).json({
            message:"Issue in delete route",
            success:false
        })
    }
}

exports.likeBlog = async (req, res) => {
    try {
      const { blogId } = req.params; // Blog ID from request params
      const userId = req.user.id; // User ID from authenticated user
  
      // Find the blog by ID
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          message: "Blog not found",
          success: false,
        });
      }
  
      // Check if the user has already liked the blog
      let isLiked;
      if (blog.likes.includes(userId)) {
        // If the user has already liked, remove the like (unlike)
        blog.likes.pull(userId); // Remove the user ID from likes array
        isLiked = false
      } else {
        // Add the user's like to the blog
        blog.likes.push(userId);
        isLiked = true
      }
  
      // Synchronize the like count with the likes array
      blog.like = blog.likes.length;
  
      // Save the blog with updated like details
      await blog.save();
  
      return res.status(200).json({
        message: blog.likes.includes(userId)
          ? "Blog liked successfully"
          : "Blog unliked successfully",
        success: true,
        likeCount: blog.like, 
        isLiked : isLiked// 
         //,Return the updated like count
      });
    } catch (error) {
      console.error("Error in the Like section:", error);
      return res.status(500).json({
        message: "Issue in like section",
        success: false,
      });
    }
  };

//   exports.getAllBlogs = async (req, res) => {
//     try {
//       const getBlogs = await Blog.find({});
//       if (!getBlogs) {
//         return res.status(404).json({
//           message: "No blogs are found",
//           success: false,
//         });
//       }
  
//       // Get the logged-in user's ID from the request (assuming middleware attaches the user)
//       const userId = req.user ? req.user.id : null; // Only get userId if logged in
  
//       // Map through blogs and add `isLiked` field
//       const updatedBlogs = getBlogs.map((blog) => {
//         const isLiked = userId ? blog.likes.some((like) => like.toString() === userId) : false; // Only check if logged in
//         return { ...blog.toObject(), isLiked }; // Add `isLiked` field to the blog object
//       });
//       console.log("All Blogs : ", updatedBlogs)
//       return res.status(200).json({
//         message: "All blogs are fetched",
//         success: true,
//         getBlogs: updatedBlogs,
//       });
//     } catch (error) {
//       console.log("Error in get all blogs", error);
//       return res.status(500).json({
//         message: "Issue in get all blogs",
//         success: false,
//       });
//     }
//   };

exports.getAllBlogs = async (req, res) => {
  try {
    const getBlogs = await Blog.find({}).lean(); // .lean() returns plain JS objects (faster, skips mongoose overhead)
    
    if (!getBlogs || getBlogs.length === 0) {
      return res.status(404).json({
        message: "No blogs are found",
        success: false,
      });
    }

    const userId = req.user ? req.user.id : null;

    // Convert likes to a Set per blog for O(1) lookup instead of O(n) with .some()
    const updatedBlogs = getBlogs.map((blog) => {
      const likesSet = new Set(blog.likes.map((like) => like.toString()));
      const isLiked = userId ? likesSet.has(userId) : false;
      return { ...blog, isLiked };
    });

    console.log("All Blogs : ", updatedBlogs);
    return res.status(200).json({
      message: "All blogs are fetched",
      success: true,
      getBlogs: updatedBlogs,
    });
  } catch (error) {
    console.log("Error in get all blogs", error);
    return res.status(500).json({
      message: "Issue in get all blogs",
      success: false,
    });
  }
};



  exports.verifyOtpForPassword = async (req, res) => {
    try {
        const { userId, otp } = req.body;

       
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

 
        
        if (user.emailOtp.toString() !== otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }


        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one", success: false });
        }

      
        user.isEmailVerified = true;
        // user.emailOtp = undefined;
        // user.otpExpiresAt = undefined;
        await user.save();

        return res.status(200).json({
            
            message: "Email verified successfully",
            success: true
        });
    } catch (error) {
        console.log("Error while verifying OTP:", error.message); 
        return res.status(500).json({

            message: "Error while verifying OTP",
            success: false
        });
    }
};
  
  
