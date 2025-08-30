import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBlogDetails } from "../../APIRoutes";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [blog, setBlog] = useState();
  const [loading, setLoading] = useState(!location.state?.blog);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get(getBlogDetails(id));
        setBlog(res.data.blog || res.data.data || res.data);
      } catch (err) {
        // console.log("Error fetching blog:", err);
        toast.error("Failed to fetch blog details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, []);

  if (loading) return <div className="text-center mt-10 text-lg">Loading blog...</div>;
  if (!blog) return <div className="text-center mt-10 text-red-500">Blog not found</div>;

  const formattedDate = blog.createdAt
    ? format(new Date(blog.createdAt), "PPP p")
    : "Unknown date";

  return (
   <div>
     <div className="px-4 w-[90%] mt-24 mb-10 font-serif p-8 rounded-xl   py-8 focus:outline  shadow-md  shadow-black max-w-4xl mx-auto">
      <ToastContainer />

      {/* Go back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-600 hover:underline"
      >
        ← Back to blogs
      </button>

      {/* Blog Title */}
      <h1 className="text-xl font-semibold mb-2 font-serif text-gray-700">{blog.title}</h1>

      {/* Created Date */}
      <p className="text-xs text-gray-500 mb-6">Posted on {formattedDate}</p>

      {/* Author section */}
      <div className="flex items-center mb-6">
        <img
          src={blog.avatar || "/default-avatar.png"}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <p className="ml-4 text-sm font-serif text-gray-700">
          @{blog.username || "anonymous"}
        </p>
      </div>

      {/* Blog Image */}
      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-[300px] object-cover rounded-xl mb-6"
        />
      )}

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <p className="text-sm font-serif flex justify-start text-gray-600 whitespace-pre-line leading-relaxed">
        {blog.content}
      </p>
    </div>
   </div>
  );
};

export default BlogDetails;
