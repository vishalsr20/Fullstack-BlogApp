import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getContentType, LikeRoutes } from "../../APIRoutes";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const [blogType, setBlogType] = useState([]);
  const category = searchParams.get("category");
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const tokenSession = localStorage.getItem("authToken");
    if (tokenSession) {
      setToken(tokenSession);
      try {
        const decodeToken = JSON.parse(atob(tokenSession.split('.')[1]));
        setUserId(decodeToken.div);
      } catch (error) {
        console.log("Token error:", error.message);
        toast.error("Session expired. Please login.");
        navigate("/login");
      }
    }
  }, []);

  useEffect(() => {
    if (category) {
      fetchData(category);
    }
  }, [category]);

  const fetchData = async (category) => {
    try {
      const res = await axios.get(getContentType(category));
      setBlogType(res.data.blog || []);
    } catch (error) {
      console.error("Error fetching filtered blogs:", error);
    }
  };

  const toggleLike = async (e, blogId) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to like the blog");
      navigate("/login");
      return;
    }

    try {
      setBlogType(prev =>
        prev.map(blog =>
          blog._id === blogId
            ? {
                ...blog,
                likes: blog.likes.includes(userId)
                  ? blog.likes.filter(id => id !== userId)
                  : [...blog.likes, userId],
                like: blog.likes.includes(userId) ? blog.like - 1 : blog.like + 1
              }
            : blog
        )
      );

      await axios.put(
        `${LikeRoutes}/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      toast.error("Token expired. Please login again.");
      navigate("/login");

      // Revert UI changes on error
      setBlogType(prev =>
        prev.map(blog =>
          blog._id === blogId
            ? {
                ...blog,
                likes: blog.likes.includes(userId)
                  ? blog.likes.filter(id => id !== userId)
                  : [...blog.likes, userId],
                like: blog.likes.includes(userId) ? blog.like - 1 : blog.like + 1
              }
            : blog
        )
      );
    }
  };

  const goToBlog = (blog) => {
    navigate(`/blog/${blog._id}`, { state: { blog } });
  };

  const hasUserLiked = (blog) => {
    return userId && blog.likes.includes(userId);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 flex flex-col items-center">
      <div className="w-[90%] max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Showing results for: <span className="text-blue-600">{category}</span>
        </h2>

        {blogType.length > 0 ? (
          <div className="flex flex-col space-y-8">
            {blogType.map((blog) => (
              <div
                key={blog._id}
                className="flex flex-col lg:flex-row bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={blog.avatar || "/default-avatar.png"}
                        alt="User"
                        width={50}
                        height={50}
                        className="rounded-xl object-cover"
                        onError={(e) => (e.target.src = "/default-avatar.png")}
                      />
                      <h3 className="text-lg font-bold text-gray-700">
                        @{blog.username}
                      </h3>
                    </div>
                    <h4
                      className="text-2xl font-semibold text-gray-800 mb-3 cursor-pointer"
                      onClick={() => goToBlog(blog)}
                    >
                      {blog.title}
                    </h4>
                    <p
                      className="text-gray-600 text-base mb-4 line-clamp-3 cursor-pointer"
                      onClick={() => goToBlog(blog)}
                    >
                      {blog.content}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => toggleLike(e, blog._id)}
                        className="focus:outline-none hover:scale-110 transition-transform"
                        aria-label={hasUserLiked(blog) ? "Unlike" : "Like"}
                      >
                        {hasUserLiked(blog) ? (
                          <FaHeart className="text-red-500 text-2xl" />
                        ) : (
                          <CiHeart className="text-gray-400 hover:text-red-500 text-2xl" />
                        )}
                      </button>
                      <span className="text-lg font-medium">{blog.likes?.length || 0}</span>
                      <p className="text-base text-gray-500">
                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {blog.image && (
                  <div className="w-full lg:w-1/3 flex justify-end mt-4 lg:mt-0">
                    <img
                      src={blog.image || "/default-blog-image.jpg"}
                      alt={blog.title}
                      className="rounded-xl object-cover w-full lg:w-[300px] h-[200px]"
                      onError={(e) => (e.target.src = "/default-blog-image.jpg")}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xl text-gray-600">No Blogs found</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default SearchResult;
