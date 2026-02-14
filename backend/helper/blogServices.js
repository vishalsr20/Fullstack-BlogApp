const Blog = require("../models/blogSchema")

async function getBlogList(){
    try{
        return await Blog.find({})
        .select("title category username like createdAt")
        .sort({createdAt:-1})
        .limit(20)
        .lean();
    }catch(error){
        console.error("GetBlogList Error: ",error)
        return []
    }
}


// async function getBlogById(blogId) {
//     try{
//         return await Blog.findById(blogId)
//             .select("title content category username")
//             .lean()
//     }catch(error){
//         console.log("GetBlogById error: ",error)
//         return null
//     }
// }


async function getBlogById(blogId) {
  try {
    return await Blog.findById(blogId).lean();
  } catch (error) {
    console.log("GetBlogById error: ", error);
    return null;
  }
}

module.exports = {
    getBlogList,
    getBlogById
}