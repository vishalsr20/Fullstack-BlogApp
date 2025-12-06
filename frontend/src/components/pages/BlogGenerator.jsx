import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wand2, TrendingUp, BookOpen, Upload, Type, MessageSquare } from 'lucide-react';
import { generateBlog } from '../../../APIRoutes';

const BlogGenerator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    tone: '',
    length: '',
    keyword: '',
    category: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [draftPreview, setDraftPreview] = useState(null);


  const toneOptions = [
    'Professional', 'Casual', 'Indian Education', 'Technical', 
    'Friendly', 'Formal', 'Humorous', 'Inspirational'
  ];

  const lengthOptions = ['150 words', '250 words', '350 words', '500 words', '750 words', '1000 words'];

  const categoryOptions = [
    'Education', 'Technology', 'Lifestyle', 'Business', 
    'Health', 'Travel', 'Food', 'Fashion', 'Sports'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null
    });
    setImagePreview(null);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsGenerating(true);
  setDraftPreview(null);

  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to generate blogs");
      navigate('/login');
      setIsGenerating(false);
      return;
    }

    // basic validation
    if (!formData.title || !formData.tone || !formData.length || !formData.keyword || !formData.category) {
      toast.error("Please fill all required fields");
      setIsGenerating(false);
      return;
    }

    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('tone', formData.tone);
    fd.append('length', formData.length);
    fd.append('keyword', formData.keyword);
    fd.append('category', formData.category.toLowerCase());
    if (formData.image) fd.append('image', formData.image);

    // DEBUG: show FormData in console
    console.log("FormData to be sent:");
    for (const pair of fd.entries()) console.log(pair[0], ':', pair[1]);

    

    // IMPORTANT: don't set Content-Type header for FormData
    const res = await axios.post(generateBlog, fd, {
      headers: { Authorization: `Bearer ${token}` },
      // optional: timeout: 60_000
    });

    const data = res.data;
    console.log("Server response:", data);

    if (!data) {
      toast.error("No response from server");
      setIsGenerating(false);
      return;
    }

    // If backend returned a created blog
    if (data.success && data.blog) {
      toast.success("Blog created on server");
      // show returned blog in preview section (don't navigate away)
      setDraftPreview({
        title: data.blog.title,
        content: data.blog.content,
        image: data.blog.image || null,
        created: data.blog.createdAt || null,
      });
      if (data.blog.image) setImagePreview(data.blog.image);
      // optionally clear form or keep it
      navigate('/') 
      setIsGenerating(false);
      return;
    }

    // If backend returned generated parsed data (draft)
    if (data.success && (data.data || data.generated)) {
      const parsed = data.data || data.generated;
      // aggregated content for preview
      const previewContent = [
        parsed.summary || "",
        ...(Array.isArray(parsed.sections) ? parsed.sections.map(s => `${s.heading}\n\n${s.body}`) : [])
      ].join("\n\n");

      setDraftPreview({
        title: parsed.title || formData.title,
        content: previewContent,
        image: parsed.image || null,
      });
      if (parsed.image) setImagePreview(parsed.image);
      toast.success("Draft generated — review below");
      setIsGenerating(false);
      return;
    }

    // fallback — server success but no expected payload
    toast.info(data.message || "Operation completed. Check server response in console.");
    setIsGenerating(false);
  } catch (err) {
    console.error('Error generating blog:', err);
    if (err.response) {
      console.error('Server status:', err.response.status);
      console.error('Server response body:', err.response.data);
      toast.error(err.response.data?.message || `Server error ${err.response.status}`);
    } else if (err.request) {
      console.error('No response received:', err.request);
      toast.error("No response from server. Check backend.");
    } else {
      toast.error(err.message);
    }
    setIsGenerating(false);
  }
};



  return (
    <div className="min-h-screen mt-20 bg-gray-200 from-purple-50 via-blue-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

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

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
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

        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
        }

        .upload-area {
          border: 2px dashed #d1d5db;
          transition: all 0.3s ease;
        }

        .upload-area:hover {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.05);
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Wand2 className="w-16 sm:w-20 h-16 sm:h-20 text-purple-600 animate-float" />
              <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-pink-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-4">
            AI Blog Generator
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Create engaging, high-quality blog posts powered by artificial intelligence
          </p>
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Form */}
        <div className="glass-effect rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeInUp stagger-2">
          <div className="space-y-6">
            {/* Title Input */}
            <div className="animate-fadeInUp stagger-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Type className="w-5 h-5 text-purple-600" />
                Blog Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Engineering Placement Issue"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 input-glow transition-all duration-300 outline-none"
                required
              />
            </div>

            {/* Tone Select */}
            <div className="animate-fadeInUp stagger-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Writing Tone
              </label>
              <select
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 input-glow transition-all duration-300 outline-none cursor-pointer"
                required
              >
                <option value="">Select a tone...</option>
                {toneOptions.map((tone) => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>

            {/* Length and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Length Select */}
              <div className="animate-fadeInUp stagger-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  Content Length
                </label>
                <select
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 input-glow transition-all duration-300 outline-none cursor-pointer"
                  required
                >
                  <option value="">Select length...</option>
                  {lengthOptions.map((length) => (
                    <option key={length} value={length}>{length}</option>
                  ))}
                </select>
              </div>

              {/* Category Select */}
              <div className="animate-fadeInUp stagger-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 input-glow transition-all duration-300 outline-none cursor-pointer"
                  required
                >
                  <option value="">Select category...</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keyword Input */}
            <div className="animate-fadeInUp stagger-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                Focus Keyword
              </label>
              <input
                type="text"
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                placeholder="e.g., growth"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 input-glow transition-all duration-300 outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Main keyword to focus on in the blog</p>
            </div>

            {/* Image Upload */}
            <div className="animate-fadeInUp stagger-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Cover Image (Optional)
              </label>
              
              {!imagePreview ? (
                <div className="upload-area rounded-lg p-8 text-center cursor-pointer">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-1">Click to upload image</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Your Blog...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate AI Blog
                  <Wand2 className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="glass-effect p-6 rounded-xl text-center animate-fadeInUp stagger-3 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">Advanced AI creates engaging content</p>
          </div>

          <div className="glass-effect p-6 rounded-xl text-center animate-fadeInUp stagger-4 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">SEO Optimized</h3>
            <p className="text-sm text-gray-600">Keyword-focused for better reach</p>
          </div>

          <div className="glass-effect p-6 rounded-xl text-center animate-fadeInUp stagger-5 hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Instant Results</h3>
            <p className="text-sm text-gray-600">Generate blogs in seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogGenerator;