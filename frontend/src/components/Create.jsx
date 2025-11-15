import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CreateBlogRoute } from "../../APIRoutes";
import { useNavigate } from "react-router-dom";

const Create = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [values, setValues] = useState({
    title: "",
    content: "",
    category: "",
    image: null,
  });

  const ChangeHandler = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const FileHandler = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValues({
        ...values,
        image: file,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const CreateHandler = async (e) => {
    e.preventDefault();
    setLoader(true);
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please login");
        setLoader(false);
        return;
      }

      const { title, content, category, image } = values;
      
      if (content.length < 20) {
        setLoader(false);
        return toast.info("At least 20 characters should be there in the content of the blog");
      }
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("image", image);

      const { data } = await axios.post(
        CreateBlogRoute,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setLoader(false);
        toast.success("Blog created successfully");
        navigate("/");
      } else {
        setLoader(false);
        toast.error(data.message || "Failed to create the blog");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error while creating the blog:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gray-200 flex items-center justify-center p-5 animate-gradient">
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .shimmer {
          background: linear-gradient(to right, #f0f0f0 0%, #e0e0e0 20%, #f0f0f0 40%, #f0f0f0 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>

      <div className="bg-gray-100 backdrop-blur-lg p-12 rounded-3xl shadow-2xl w-full max-w-4xl border border-white/20 slide-in">
        
        {/* Animated Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl mb-6 float-animation pulse-glow">
            <span className="text-5xl">✨</span>
          </div>
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 animate-pulse">
            Create a New Blog
          </h2>
          <p className="text-gray-600 text-lg">Share your amazing story with the world 🌍</p>
        </div>

        <form onSubmit={CreateHandler} className="space-y-8">
          
          {/* Title Input - Animated */}
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-3">
              <span className="text-2xl animate-bounce">📝</span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Blog Title
              </span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Give a captivating title for your blog..."
              value={values.title}
              onChange={ChangeHandler}
              required
              className="w-full px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-3 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-6 focus:ring-indigo-200 transition-all duration-300 text-gray-800 placeholder-gray-400 text-lg font-medium shadow-sm hover:shadow-lg"
            />
          </div>

          {/* Content Textarea - Animated */}
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-3">
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>📄</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Blog Content
              </span>
            </label>
            <textarea
              name="content"
              placeholder="Write your amazing content here... (Minimum 20 characters)"
              value={values.content}
              onChange={ChangeHandler}
              rows="10"
              required
              className="w-full px-6 py-5 bg-gradient-to-r from-gray-50 to-purple-50 border-3 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-6 focus:ring-purple-200 transition-all duration-300 text-gray-800 placeholder-gray-400 text-lg resize-none font-medium shadow-sm hover:shadow-lg"
            ></textarea>
            <p className="text-sm text-gray-500 mt-2 font-semibold">
              Characters: <span className={values.content.length >= 20 ? "text-green-600" : "text-red-600"}>{values.content.length}</span> / 20 minimum
            </p>
          </div>

          {/* Category Select - Animated */}
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-3">
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🏷️</span>
              <span className="bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                Select Category
              </span>
            </label>
            <select
              name="category"
              required
              value={values.category}
              onChange={ChangeHandler}
              className="w-full px-6 py-5 bg-gradient-to-r from-gray-50 to-pink-50 border-3 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-500 focus:ring-6 focus:ring-pink-200 transition-all duration-300 text-gray-800 cursor-pointer text-lg font-semibold shadow-sm hover:shadow-lg"
            >
              <option value="">--Choose Category--</option>
              <option value="Technology">💻 Technology</option>
              <option value="Fun">🎉 Fun</option>
              <option value="Health">💪 Health</option>
              <option value="Education">📚 Education</option>
            </select>
          </div>

          {/* Image Upload - Super Animated */}
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <label className="flex items-center gap-3 text-base font-bold text-gray-800 mb-3">
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🖼️</span>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Upload Featured Image
              </span>
            </label>
            <div className="relative border-4 border-dashed border-indigo-300 rounded-3xl p-10 hover:border-indigo-500 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-500 bg-gradient-to-br from-gray-50 to-indigo-50 cursor-pointer group shadow-lg hover:shadow-2xl">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={FileHandler}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-72 object-cover rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full text-base font-black shadow-2xl flex items-center gap-2 animate-pulse">
                    <span className="text-xl">✓</span>
                    <span>Image Uploaded!</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 group-hover:scale-105 transition-transform duration-300">
                  <div className="mb-6 animate-bounce">
                    <span className="text-8xl">📸</span>
                  </div>
                  <p className="text-gray-700 font-bold text-2xl mb-3">Click or Drag to Upload</p>
                  <p className="text-gray-500 text-lg font-medium">PNG, JPG, GIF (Max: 10MB)</p>
                  <div className="mt-6">
                    <span className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-bold shadow-lg">
                      Choose File
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Animated Submit Button */}
          <button
            type="submit"
            disabled={loader}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-6 rounded-2xl font-black text-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {loader ? (
              <>
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="animate-pulse">Submitting Please Wait...</span>
              </>
            ) : (
              <>
                <span className="text-3xl animate-bounce">🚀</span>
                <span>Publish Your Blog</span>
              </>
            )}
          </button>
        </form>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            ✨ Your story matters. Share it with confidence! ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Create;