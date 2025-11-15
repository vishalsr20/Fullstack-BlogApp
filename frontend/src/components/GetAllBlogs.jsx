import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AllBlogsRoute, LikeRoutes } from '../../APIRoutes';
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Comments } from './pages/Comments';

const GetAllBlogs = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const navigate = useNavigate();

  // Get token and userId from localStorage
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
  }, [navigate]);

  // Fetch all blogs
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

  // Navigate to single blog page
  const Category = (blogId) => {
    navigate(`/blog/${blogId}`, { state: { blogId } });
  };

  // Toggle like
  const toggleLike = async (e, blogId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please login to like blogs");
      return navigate('/login');
    }

    const blog = allBlogs.find(blog => blog._id === blogId);
    const isLiked = blog.likes.includes(userId);

    // Optimistic UI update
    setAllBlogs(prev =>
      prev.map(blog =>
        blog._id === blogId
          ? {
              ...blog,
              likes: isLiked
                ? blog.likes.filter(id => id !== userId)
                : [...blog.likes, userId],
            }
          : blog
      )
    );

    try {
      await axios.put(
        `${LikeRoutes}/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      toast.error("Action failed. Please login again.");
      navigate("/login");

      // Revert optimistic update
      setAllBlogs(prev =>
        prev.map(blog =>
          blog._id === blogId
            ? {
                ...blog,
                likes: isLiked
                  ? [...blog.likes, userId]
                  : blog.likes.filter(id => id !== userId),
              }
            : blog
        )
      );
    }
  };

  const hasUserLiked = (blog) => userId && blog.likes.includes(userId);

  const commentsHandler = (e, blogId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBlogId(blogId);
  };

  const handleCloseComments = () => {
    setSelectedBlogId(null);
  };

  if (loading) {
    return (
      <div className="flex font-serif justify-center items-center h-64">
        <style>{`
          @keyframes spin-pulse {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
          }
        `}</style>
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500" style={{ animation: 'spin-pulse 1.5s ease-in-out infinite' }}></div>
          <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 opacity-50" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          10%, 30% { transform: scale(0.9); }
          20%, 40% { transform: scale(1.1); }
        }
        .blog-card {
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }
        .blog-card:nth-child(1) { animation-delay: 0.1s; }
        .blog-card:nth-child(2) { animation-delay: 0.2s; }
        .blog-card:nth-child(3) { animation-delay: 0.3s; }
        .blog-card:nth-child(4) { animation-delay: 0.4s; }
        .blog-card:nth-child(5) { animation-delay: 0.5s; }
        .blog-card:nth-child(n+6) { animation-delay: 0.6s; }
        .liked-heart {
          animation: heartBeat 0.6s ease-in-out;
        }
        .title-hover {
          background: linear-gradient(to right, #667eea 0%, #764ba2 50%, #667eea 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: all 0.3s ease;
        }
        .title-hover:hover {
          background-position: right center;
        }
      `}</style>

      <div className="bg-gray-200 font-serif flex flex-col mt-20 items-center w-full min-h-screen py-8 px-4">
        <div className="w-[90%] max-w-6xl">
          <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-10 drop-shadow-lg" style={{ animation: 'float 3s ease-in-out infinite' }}>
            ✨ All Blogs ✨
          </h2>

          {allBlogs.length === 0 ? (
            <p className="text-center text-xl text-gray-600">No Blogs found</p>
          ) : (
            <div className="flex flex-col space-y-8">
              {[...allBlogs]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((blog) => (
                  <div
                    key={blog._id}
                    className="blog-card flex flex-col lg:flex-row w-full bg-white p-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] border border-gray-100"
                    onClick={() => Category(blog._id)}
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4 transform transition-all duration-300 hover:scale-105">
                          <img
                            src={blog.avatar || '/default-avatar.png'}
                            alt="User"
                            width={30}
                            height={30}
                            className="rounded-xl object-cover ring-2 ring-purple-400 shadow-lg"
                            onError={(e) => { e.target.src = '/default-avatar.png'; }}
                          />
                          <h3 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            @{blog.username}
                          </h3>
                        </div>
                        <h4 className="text-2xl font-bold text-gray-800 mb-3 title-hover">
                          {blog.title.split(" ").slice(0, 10).join(" ")}
                          {blog.title.split(" ").length > 10 ? "..." : ""}
                        </h4>
                        <p className="text-gray-700 text-base mb-4 line-clamp-3 leading-relaxed">{blog.content}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => toggleLike(e, blog._id)}
                            className={`focus:outline-none hover:scale-125 transition-all duration-300 ${hasUserLiked(blog) ? 'liked-heart' : ''}`}
                            aria-label={hasUserLiked(blog) ? "Unlike" : "Like"}
                          >
                            {hasUserLiked(blog) ? (
                              <FaHeart className="text-red-500 lg:text-3xl text-2xl drop-shadow-lg" />
                            ) : (
                              <CiHeart className="text-gray-400 hover:text-red-500 text-3xl transition-colors duration-300" />
                            )}
                          </button>
                          <span className="text-sm lg:text-lg font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                            {blog.likes?.length || 0}
                          </span>
                        </div>

                        <div>
                          <button
                            className="text-sm lg:text-lg font-bold text-gray-700 whitespace-nowrap font-serif hover:scale-110 transition-all duration-300 hover:text-blue-600"
                            onClick={(e) => commentsHandler(e, blog._id)}
                          >
                            💬 Comment
                          </button>
                        </div>

                        <p className="text-xs lg:text-sm text-gray-500 font-medium">
                          {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {blog.image && (
                      <div className="w-full lg:w-1/3 flex justify-end mt-4 lg:mt-0">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="rounded-2xl object-cover w-full lg:w-[300px] h-[200px] shadow-xl transform transition-all duration-500 hover:scale-105 hover:rotate-1 ring-2 ring-purple-200"
                          onError={(e) => { e.target.src = '/default-blog-image.jpg'; }}
                        />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {selectedBlogId && (
            <Comments blogId={selectedBlogId} onClose={handleCloseComments} />
          )}
        </div>
      </div>
    </>
  );
};

export default GetAllBlogs;