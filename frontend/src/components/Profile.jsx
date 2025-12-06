import axios from "axios";
import { useEffect, useState } from "react";
import { DeleteRoute, ProfileRoute } from "../../APIRoutes";
import { toast, ToastContainer } from "react-toastify";
import { FcLike } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Calendar, Heart } from "lucide-react";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredBlog, setHoveredBlog] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Please login");
          navigate("/login");
          return;
        }

        const { data } = await axios.get(ProfileRoute, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.success) {
          setProfileData(data.userProfile);
        } else {
          setError(data.message || "Failed to fetch profile.");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20 items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <div className="text-2xl text-red-600 font-semibold">Error: {error}</div>
        </div>
      </div>
    );
  }

  function EditBlogHandler(blog) {
    navigate(`/updateBlog/${blog._id}`,{
     state: {
      blogData: {
        title: blog.title,
        content: blog.content,
        image: blog.image,
        _id: blog._id
      }
    }

    });
  }

  const DeleteHandler = async (blogId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${DeleteRoute}/${blogId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Blog deleted successfully");
      setProfileData((prevData) => ({
        ...prevData,
        Blog: prevData.Blog.filter((blog) => blog._id !== blogId),
      }));
    } catch (error) {
      console.error("Error deleting blog", error.response?.data);
      toast.error("Error deleting blog");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 mt-20 from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
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

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .blog-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .blog-card:hover {
          transform: translateY(-8px);
        }

        .blog-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .blog-card:hover::before {
          opacity: 1;
        }

        .image-overlay {
          position: relative;
          overflow: hidden;
        }

        .image-overlay::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }

        .image-overlay:hover::after {
          left: 100%;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
      `}</style>

      <div className="max-w-7xl bg-g mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4 animate-float">
            My Profile
          </h1>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Card */}
          <div className="w-full lg:w-1/3 animate-fadeInUp stagger-1">
            <div className="glass-effect rounded-2xl shadow-2xl p-8 sticky top-8">
              <div className="text-center">
                {/* Profile Image with Pulse Ring */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse-ring"></div>
                  <div className="relative">
                    <img
                      className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full object-cover ring-4 ring-white shadow-xl"
                      src={profileData.profileImage || "default-avatar.jpg"}
                      alt="Profile"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {profileData.username}
                    </h3>
                    <p className="text-gray-600 text-sm">@{profileData.username}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">Email</p>
                    <p className="text-gray-800 font-medium break-all">{profileData.email}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="glass-effect rounded-xl p-4">
                      <p className="text-3xl font-bold text-blue-600">{profileData.Blog?.length || 0}</p>
                      <p className="text-xs text-gray-600 mt-1">Total Blogs</p>
                    </div>
                    <div className="glass-effect rounded-xl p-4">
                      <p className="text-3xl font-bold text-pink-600">
                        {profileData.Blog?.reduce((acc, blog) => acc + (blog.like || 0), 0) || 0}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Total Likes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blogs Section */}
          <div className="w-full lg:w-2/3 animate-fadeInUp stagger-2">
            <div className="glass-effect rounded-2xl shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-blue-600">📝</span>
                My Blogs
              </h2>

              <div className="space-y-6">
                {profileData.Blog && profileData.Blog.length > 0 ? (
                  profileData.Blog.map((blog, index) => (
                    <div
                      key={blog._id || index}
                      className={`blog-card glass-effect rounded-xl p-6 shadow-lg hover:shadow-2xl animate-fadeInUp stagger-${Math.min(index + 1, 4)}`}
                      onMouseEnter={() => setHoveredBlog(blog._id)}
                      onMouseLeave={() => setHoveredBlog(null)}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Blog Content */}
                        <div className="flex-1">
                          {/* Author Info */}
                          <div className="flex items-center gap-3 mb-4">
                            <img
                              src={profileData.profileImage}
                              alt="User"
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200"
                            />
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">@{profileData.username}</h3>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Title & Content */}
                          <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors">
                            {blog.title}
                          </h4>
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                            {blog.content.length > 150 ? `${blog.content.slice(0, 150)}...` : blog.content}
                          </p>

                          {/* Stats & Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <Heart className="w-5 h-5 text-red-500 fill-current" />
                              <span className="text-sm font-semibold text-gray-700">{blog.like || 0} Likes</span>
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => EditBlogHandler(blog)}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button
                                onClick={() => DeleteHandler(blog._id)}
                                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Blog Image */}
                        {blog.image && (
                          <div className="w-full md:w-48 flex items-center">
                            <div className="image-overlay w-full h-40 md:h-48 rounded-xl overflow-hidden shadow-lg">
                              <img
                                src={blog.image}
                                alt="Blog"
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hover Effect Border */}
                      <div 
                        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-500 ${
                          hoveredBlog === blog._id ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-2xl text-gray-600 font-medium">No blogs yet</p>
                    <p className="text-gray-500 mt-2">Start creating your first blog!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Profile;