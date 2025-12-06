import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { UpdateBlogRoute } from "../../APIRoutes";
import { toast, ToastContainer } from "react-toastify";

const Edits = () => {
  const navigate = useNavigate();
  const { blogId } = useParams();
  const location = useLocation();
  
  const blogDataFromState = location.state?.blogData;
  
  // Simple state initialization
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Load data once on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (blogDataFromState) {
      // console.log("Loading blog:", blogDataFromState);
      setTitle(blogDataFromState.title || "");
      setContent(blogDataFromState.content || "");
    } else {
      toast.warning("No blog data loaded");
    }
  }, []); // Run only once

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!blogId) {
      toast.error("Blog id missing");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("No auth token");
      return;
    }

    if (title.trim().length < 3 || content.trim().length < 20) {
      toast.error("Title must be >=3 and content >=20 chars");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${UpdateBlogRoute}/${blogId}`,
        { title, content },
        { 
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true 
        }
      );

      if (res.status >= 200 && res.status < 300 && res.data?.success) {
        toast.success("Blog updated successfully!");
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .fade-in {
          animation: fadeInUp 0.6s ease-out;
        }

        .gradient-text {
          background: linear-gradient(to right, #667eea 0%, #764ba2 50%, #667eea 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div className="min-h-screen mt-16 bg-gray-200 font-serif flex items-center justify-center py-12 px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '2s' }}></div>
        </div>

        <div className="relative w-full max-w-3xl">
          <div className="text-center mb-8 fade-in">
            <h1 className="text-5xl font-bold gradient-text mb-3" style={{ animation: 'float 3s ease-in-out infinite' }}>
              ✨ Update Your Blog ✨
            </h1>
            <p className="text-gray-600 text-lg font-light">
              Make your content shine with updates
            </p>
          </div>

          <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100 fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                  📝 Blog Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter title..."
                  value={title}
                  onChange={(e) => {
                    // console.log("Title changed:", e.target.value);
                    setTitle(e.target.value);
                  }}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-300 text-gray-800"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {title.length} characters
                </p>
              </div>

              {/* Content Textarea */}
              <div>
                <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">
                  ✍️ Blog Content
                </label>
                <textarea
                  id="content"
                  placeholder="Share your thoughts..."
                  value={content}
                  onChange={(e) => {
                    // console.log("Content changed:", e.target.value.substring(0, 50));
                    setContent(e.target.value);
                  }}
                  rows={12}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-300 resize-none text-gray-800 leading-relaxed"
                />
                <p className={`mt-2 text-xs ${content.length < 20 ? 'text-red-500' : 'text-green-600'}`}>
                  {content.length < 20 ? `${20 - content.length} more characters needed` : `✓ ${content.length} characters`}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || content.length < 20}
                  className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                    loading || content.length < 20
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <span>Update Blog 🚀</span>
                  )}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <h3 className="text-sm font-bold text-gray-700 mb-2">💡 Quick Tips</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Title must be at least 3 characters</li>
                  <li>• Content must be at least 20 characters</li>
                  <li>• Check spelling before updating</li>
                </ul>
              </div>
            </form>
          </div>
        </div>

        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </>
  );
};

export default Edits;