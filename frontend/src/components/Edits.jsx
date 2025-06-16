import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from  "axios"
import { UpdateBlogRoute } from "../../APIRoutes";
import { toast, ToastContainer } from "react-toastify";
const Edits = () => {
  const navigate = useNavigate()
  const {blogId} = useParams();
  const [blog, setBlog] = useState({
    title: "",
    content: "",
  });
  const token = localStorage.getItem("authToken")
  const handleChange = (e) => {
    
    const { name, value } = e.target;
    setBlog({
      ...blog,
      [name]: value,
    });
  };

  const handleSubmit = async  (e) => {
    e.preventDefault();
    const {title , content } = blog 
    if(content.length < 20){
      toast.error("legth should be greater than 20 character ");
      return;
    }
    try{
      const {data} = await axios.put(`${UpdateBlogRoute}/${blogId}`,
        {title,content},
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      )
      if(data.success == true){
        toast.success("Blog Update Successfully")
        navigate('/profile')
      }else{
        toast.error("Issue while fetching data")
      }
    }catch(error){
      toast.error("Failed to update blog")
      console.log("Error while updating blog ",error)
    }
  
  };

  return (
    <div className="flex mt-20 items-center justify-center min-h-screen bg-gray-200 p-4">
      <div className="w-full max-w-lg p-6 bg-white shadow-lg rounded-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Update Blog</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Blog Name
            </label>
            <input
              id="name"
              name="title"
              placeholder="Enter blog name"
              value={blog.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Blog Content
            </label>
            <textarea
              id="content"
              name="content"
              placeholder="Write your blog content here"
              value={blog.content}
              onChange={handleChange}
              rows={6}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
            >
              Update Blog
            </button>
          </div>
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Edits;
