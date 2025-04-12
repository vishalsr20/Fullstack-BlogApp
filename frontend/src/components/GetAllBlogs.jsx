import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AllBlogsRoute, LikeRoutes } from '../../APIRoutes';
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GetAllBlogs = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenSession = localStorage.getItem("authToken");
    if (tokenSession) {
      setToken(tokenSession);
      try {
        const decodedToken = JSON.parse(atob(tokenSession.split('.')[1]));
        setUserId(decodedToken.id);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("Session error. Please login again.");
        navigate('/login');
      }
    }
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(AllBlogsRoute);
        setAllBlogs(data.getBlogs || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);
  const Category = (blog) => {
    navigate(`/blog/${blog}`, { state: { blog } });

  }

  const toggleLike = async (e, blogId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      toast.error("Please login to like blogs");
      navigate('/login');
      return;
    }

    try {
      setAllBlogs(prevBlogs =>
        prevBlogs.map(blog => {
          if (blog._id === blogId) {
            const isLiked = blog.likes.includes(userId);
            return {
              ...blog,
              likes: isLiked
                ? blog.likes.filter(id => id !== userId)
                : [...blog.likes, userId],
              like: isLiked ? blog.like - 1 : blog.like + 1
            };
          }
          return blog;
        })
      );

      await axios.put(
        `${LikeRoutes}/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      toast.error("Token expires please login ");
      navigate("/login")
      // console.log("Error while liking the post",error.messagae)
      
      setAllBlogs(prevBlogs =>
        prevBlogs.map(blog => {
          if (blog._id === blogId) {
            const wasLiked = !blog.likes.includes(userId);
            return {
              ...blog,
              likes: wasLiked
                ? blog.likes.filter(id => id !== userId)
                : [...blog.likes, userId],
              like: wasLiked ? blog.like - 1 : blog.like + 1
            };
          }
          return blog;
        })
      );
    }
  };

  const hasUserLiked = (blog) => {
    return userId && blog.likes.includes(userId);
  };

  if (loading) {
    return (
      <div className="flex font-serif justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

 

  return (
    <div className="bg-gray-100 font-serif flex flex-col mt-20  items-center w-full min-h-screen py-8 px-4">
      <div className="w-[90%] max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">All Blogs</h2>
        
        {allBlogs.length === 0 ? (
          <p className="text-center text-xl text-gray-600">No Blogs found</p>
        ) : (
          <div className="flex flex-col  space-y-8">
            {allBlogs.map((blog) => (
              <div
                key={blog._id}
                className="flex flex-col lg:flex-row w-full bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                onClick={() => Category(blog._id)}
              >
                <div className="flex-1  flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={blog.avatar || '/default-avatar.png'}
                        alt="User"
                        width={50}
                        height={50}
                        className="rounded-xl object-cover"
                        onError={(e) => { e.target.src = '/default-avatar.png'; }}
                      />
                      <h3 className="text-lg font-bold text-gray-700">@{blog.username}</h3>
                    </div>
                    <h4 className="text-2xl font-semibold text-gray-800 mb-3"
                    onClick={() =>  Category(blog)}
                    >{blog.title}</h4>
                    <p className="text-gray-600 text-base mb-4 line-clamp-3">{blog.content}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <button 
                        onClick={(e) => toggleLike(e, blog._id)}
                        className="focus:outline-none hover:scale-110 transition-transform"
                        aria-label={hasUserLiked(blog) ? "Unlike" : "Like"}
                      >
                        {hasUserLiked(blog) ? (
                          <FaHeart className="text-red-500 mr-2 text-2xl" />
                        ) : (
                          <CiHeart className="text-gray-400 mr-2 hover:text-red-500 text-2xl" />
                        )}
                      </button>
                      <span className="text-lg font-medium">{blog.likes?.length || 0}</span>
                    </div>
                    <p className="text-base text-gray-500">{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                {blog.image && (
                  <div className="w-full lg:w-1/3 flex justify-end">
                    <img
                      src={blog.image || '/default-blog-image.jpg'}
                      alt={blog.title}
                      className="rounded-xl object-cover w-full lg:w-[300px] h-[200px]"
                      onError={(e) => { e.target.src = '/default-blog-image.jpg'; }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetAllBlogs;
