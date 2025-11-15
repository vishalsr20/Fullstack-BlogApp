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
        toast.error("Failed to fetch blog details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes spin-pulse {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
          }
        `}</style>
        <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-800" style={{ animation: 'spin-pulse 1.5s ease-in-out infinite' }}></div>
            <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-400 opacity-50" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          </div>
          <p className="text-xl font-semibold text-gray-800 animate-pulse">
            Loading blog...
          </p>
        </div>
      </>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <span className="text-6xl mb-4 animate-bounce">😔</span>
        <p className="text-xl font-semibold text-red-500">Blog not found</p>
      </div>
    );
  }

  const formattedDate = blog.createdAt
    ? format(new Date(blog.createdAt), "PPP p")
    : "Unknown date";

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        .slide-in-left {
          animation: slideInLeft 0.5s ease-out;
        }
        .content-section {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-gray-200 py-8">
        <div className="px-4 w-[90%] mt-24 mb-10 font-serif max-w-4xl mx-auto">
          <ToastContainer />

          <div className="bg-gray-100 rounded-2xl shadow-lg border border-gray-200 p-8 lg:p-12">
            {/* Go back button */}
            <button
              onClick={() => navigate(-1)}
              className="slide-in-left mb-8 text-gray-600 hover:text-gray-900 flex items-center gap-2 font-semibold transition-all duration-300 hover:gap-3"
            >
              <span className="text-xl">←</span>
              <span>Back to blogs</span>
            </button>

            {/* Blog Title */}
            <h1 className="fade-in-up text-3xl lg:text-4xl font-bold mb-4 text-gray-900 leading-tight">
              {blog.title}
            </h1>

            {/* Author and Date Section */}
            <div className="fade-in-up flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3">
                <img
                  src={blog.avatar || "/default-avatar.png"}
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    @{blog.username || "anonymous"}
                  </p>
                  <p className="text-xs text-gray-500">{formattedDate}</p>
                </div>
              </div>

              {/* Category Badge */}
              {blog.category && (
                <span className="text-sm font-semibold text-gray-700 px-5 py-2 bg-gray-100 rounded-full border border-gray-300">
                  {blog.category}
                </span>
              )}
            </div>

            {/* Blog Image */}
            {blog.image && (
              <div className="content-section mb-10" style={{ animationDelay: '0.2s' }}>
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-[400px] object-cover rounded-xl border border-gray-200 shadow-md"
                />
              </div>
            )}

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="content-section flex flex-wrap gap-2 mb-8" style={{ animationDelay: '0.3s' }}>
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm font-medium text-gray-700 px-4 py-1.5 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors duration-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="content-section mb-10 p-6 bg-gray-50 rounded-xl border border-gray-200" style={{ animationDelay: '0.4s' }}>
              <p className="text-base font-serif text-gray-800 whitespace-pre-line leading-relaxed">
                {blog.content}
              </p>
            </div>

            {/* Engagement Stats */}
            <div className="content-section flex gap-8 pt-8 border-t border-gray-200" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3 px-6 py-3 bg-red-50 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300">
                <span className="text-3xl">❤️</span>
                <div>
                  <p className="text-xl font-bold text-gray-900">{blog.likes?.length || 0}</p>
                  <p className="text-xs text-gray-600 font-semibold">Likes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                <span className="text-3xl">💬</span>
                <div>
                  <p className="text-xl font-bold text-gray-900">{blog.comments?.length || 0}</p>
                  <p className="text-xs text-gray-600 font-semibold">Comments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;