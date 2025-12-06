import axios from 'axios';
import { useEffect, useState, useCallback, useRef } from 'react';
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
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Error handling
  const [error, setError] = useState(null);
  
  // Refs
  const observer = useRef();
  const abortControllerRef = useRef(null);
  
  const BLOGS_PER_PAGE = 7; // Fetch 7 blogs at a time
  
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

  // Fetch blogs with pagination
  const fetchBlogs = useCallback(async (pageNum = 1, isLoadMore = false) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      console.log(`Fetching page ${pageNum} with limit ${BLOGS_PER_PAGE}`);

      // IMPORTANT: Add pagination parameters to your API call
      const { data } = await axios.get(AllBlogsRoute, {
        params: {
          page: pageNum,
          limit: BLOGS_PER_PAGE,
          sort: '-createdAt'
        },
        signal: abortControllerRef.current.signal,
        timeout: 10000
      });

      // Handle the response - adjust based on your API response structure
      const newBlogs = data.getBlogs || data.blogs || data || [];
      
      console.log(`Received ${newBlogs.length} blogs for page ${pageNum}`);

      if (isLoadMore) {
        // Append new blogs, avoiding duplicates
        setAllBlogs(prev => {
          const existingIds = new Set(prev.map(blog => blog._id));
          const uniqueNewBlogs = newBlogs.filter(blog => !existingIds.has(blog._id));
          return [...prev, ...uniqueNewBlogs];
        });
      } else {
        setAllBlogs(newBlogs);
      }

      // Check if there are more blogs to load
      // If we received fewer blogs than requested, there are no more
      setHasMore(newBlogs.length === BLOGS_PER_PAGE);
      
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return;
      }

      console.error("Error fetching blogs:", error);
      
      if (error.code === 'ECONNABORTED') {
        setError("Request timeout. Please check your connection.");
        toast.error("Connection timeout. Please try again.");
      } else if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          setError("Blogs not found.");
          toast.error("No blogs available.");
        } else if (status === 500) {
          setError("Server error. Please try again later.");
          toast.error("Server error occurred.");
        } else {
          setError("Failed to load blogs.");
          toast.error("Failed to load blogs.");
        }
      } else if (error.request) {
        setError("No response from server. Check your connection.");
        toast.error("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBlogs(1, false);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchBlogs]);

  // Infinite scroll - last blog element ref
  const lastBlogElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('Loading more blogs...');
        setPage(prevPage => prevPage + 1);
      }
    }, {
      threshold: 0.5 // Trigger when 50% of the element is visible
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchBlogs(page, true);
    }
  }, [page, fetchBlogs]);

  // Retry function
  const retryFetch = () => {
    setPage(1);
    setAllBlogs([]);
    setHasMore(true);
    fetchBlogs(1, false);
  };

  // Manual "Load More" button (alternative to infinite scroll)
  const loadMoreBlogs = () => {
    if (!loadingMore && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // Navigate to single blog page
  const Category = (blogId) => {
    navigate(`/blog/${blogId}`, { state: { blogId } });
  };

  // Toggle like with better error handling
  const toggleLike = async (e, blogId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please login to like blogs");
      return navigate('/login');
    }

    const blog = allBlogs.find(blog => blog._id === blogId);
    if (!blog) return;

    const isLiked = blog.likes.includes(userId);
    const previousBlogs = [...allBlogs];

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
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
    } catch (error) {
      console.error("Like toggle error:", error);
      setAllBlogs(previousBlogs);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to update like. Please try again.");
      }
    }
  };

  const hasUserLiked = (blog) => userId && blog.likes?.includes(userId);

  const commentsHandler = (e, blogId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBlogId(blogId);
  };

  const handleCloseComments = () => {
    setSelectedBlogId(null);
  };

  // Loading state
  if (loading && allBlogs.length === 0) {
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

  // Error state
  if (error && allBlogs.length === 0) {
    return (
      <div className="flex font-serif flex-col justify-center items-center h-64 gap-4">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-2">⚠️ {error}</p>
          <button
            onClick={retryFetch}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 font-semibold"
          >
            Retry
          </button>
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
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
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
        .blog-card:nth-child(6) { animation-delay: 0.6s; }
        .blog-card:nth-child(7) { animation-delay: 0.7s; }
        .blog-card:nth-child(n+8) { animation-delay: 0.8s; }
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
        .load-more-btn {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          background-size: 200% auto;
          transition: all 0.3s ease;
        }
        .load-more-btn:hover {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
      `}</style>

      <div className="bg-gray-200 font-serif flex flex-col mt-20 items-center w-full min-h-screen py-8 px-4">
        <div className="w-[90%] max-w-6xl">
          <div className="text-center mb-6">
            <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-lg" style={{ animation: 'float 3s ease-in-out infinite' }}>
              ✨ All Blogs ✨
            </h2>
            <p className="text-gray-600 text-sm">
              Showing {allBlogs.length} blog{allBlogs.length !== 1 ? 's' : ''}
            </p>
          </div>

          {allBlogs.length === 0 ? (
            <p className="text-center text-xl text-gray-600">No Blogs found</p>
          ) : (
            <>
              <div className="flex flex-col space-y-8">
                {allBlogs.map((blog, index) => (
                  <div
                    key={blog._id}
                    ref={index === allBlogs.length - 1 ? lastBlogElementRef : null}
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

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
                    <p className="text-gray-600 font-medium">Loading more blogs...</p>
                  </div>
                </div>
              )}

              {/* Manual Load More Button (Optional - uncomment to use instead of auto-scroll) */}
              {/* {hasMore && !loadingMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMoreBlogs}
                    className="load-more-btn px-8 py-4 text-white font-bold rounded-xl shadow-lg"
                  >
                    Load More Blogs
                  </button>
                </div>
              )} */}

              {/* No More Blogs Indicator */}
              {!hasMore && allBlogs.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
                    <p className="text-lg font-semibold text-gray-700">
                      🎉 You've seen all {allBlogs.length} blogs!
                    </p>
                  </div>
                </div>
              )}
            </>
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