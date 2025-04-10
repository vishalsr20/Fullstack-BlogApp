import { useEffect, useState } from "react";
import axios from "axios";
import { AllBlogsRoute, LikeRoutes } from "../../APIRoutes";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import GetAllBlogs from "./GetAllBlogs";
import SearchResults from "./SearchResults";

const BlogsPage = ({ searchResults }) => {
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
        const decodedToken = JSON.parse(atob(tokenSession.split(".")[1]));
        setUserId(decodedToken.id);
      } catch (err) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      }
    }
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get(AllBlogsRoute);
        setAllBlogs(data.getBlogs || []);
      } catch (err) {
        toast.error("Failed to fetch blogs.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const toggleLike = async (e, blogId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please login to like blogs");
      navigate("/login");
      return;
    }

    try {
      setAllBlogs((prev) =>
        prev.map((blog) =>
          blog._id === blogId
            ? {
                ...blog,
                likes: blog.likes.includes(userId)
                  ? blog.likes.filter((id) => id !== userId)
                  : [...blog.likes, userId],
              }
            : blog
        )
      );

      await axios.put(
        `${LikeRoutes}/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      toast.error("Token expired. Please login again.");
      navigate("/login");
    }
  };

  const hasUserLiked = (blog) => {
    return userId && blog.likes.includes(userId);
  };

  const handleCardClick = (blog) => {
    navigate(`/blog/${blog._id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {searchResults && searchResults.length > 0 ? (
        <SearchResults
          searchResults={searchResults}
          toggleLike={toggleLike}
          userId={userId}
          token={token}
        />
      ) : (
        <GetAllBlogs
          blogs={allBlogs}
          toggleLike={toggleLike}
          userId={userId}
          token={token}
          onClickCard={handleCardClick}
        />
      )}
    </>
  );
};

export default BlogsPage;
