const express = require("express")
const BlogModel = require("../models/blogSchema")

exports.getCategory = async (req, res) => {

    try{
        const {category} = req.query;
        if (!category) {
            return res.status(400).json({ message: "Category is required" });
          }
          const filter = { category: category.toLowerCase() };

        const blog = await BlogModel.find(filter);
        return res.status(200).json({
            blog,
            message:"Content fecth successfully",
            success:true
        })
        
    }catch(error){
        console.log("Error  while filtering",error.message)
        return res.status(500).json({
            message:"Error in search content",
            success:false
        })
    }
}

exports.getBlogDetails = async (req , res) => {
    const {id} = req.params;
  
    try{
        if(!id){
            return res.status(404).json({
                message:"Id is required",
                success:false
            })
        }
        const blog = await BlogModel.findById(id)
        return res.status(200).json({
            blog,
            message:"Blog fecth successfully",
            success:true
        })

    }catch(error){
        console.log("Error  while id",error.message)
        return res.status(500).json({
            message:"Error in search id",
            success:false
        })
    }
}

