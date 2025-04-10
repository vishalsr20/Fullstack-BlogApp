import axios from "axios";
import { useEffect, useState } from "react";
import { DeleteRoute, ProfileRoute } from "../../APIRoutes";
import { toast, ToastContainer } from "react-toastify";
import { FcLike } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  }, []);

  if (loading) return <div className="text-center text-2xl text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-2xl text-red-600">Error: {error}</div>;

  function EditBlogHandler(blogId) {
    navigate(`/updateBlog/${blogId}`);
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
    <div className="bg-gray-100 min-h-screen py-6 px-4 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6">
        {/* Profile Section */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <img
              className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full object-cover"
              src={profileData.profileImage || "default-avatar.jpg"}
              alt="Profile"
            />
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mt-4">
              Username: <span className="font-normal">{profileData.username}</span>
            </h3>
            <h2 className="text-base md:text-lg text-gray-600 mt-2">
              Email: <span className="font-normal">{profileData.email}</span>
            </h2>
          </div>
        </div>

        {/* Blogs Section */}
        <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col space-y-6">
            {profileData.Blog && profileData.Blog.length > 0 ? (
              profileData.Blog.map((blog, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row bg-gray-50 p-5 rounded-lg shadow-sm space-y-4 md:space-y-0 md:space-x-6"
                >
                  {/* Blog Content */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 font-bold mb-2">
                      <img
                        src={profileData.profileImage}
                        alt="User"
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <h3 className="text-sm md:text-base">@{profileData.username}</h3>
                    </div>
                    <h4 className="text-lg md:text-xl font-semibold text-gray-800">{blog.title}</h4>
                    <p className="text-gray-600 mt-2 text-sm">
                      {blog.content.length > 100 ? `${blog.content.slice(0, 100)}...` : blog.content}
                    </p>
                    <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1 text-red-600">
                        <FcLike /> <span>{blog.like}</span>
                      </div>
                      <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-4 mt-4 flex-wrap">
                      <button
                        onClick={() => EditBlogHandler(blog._id)}
                        className="bg-green-500 text-white py-1.5 px-4 rounded hover:bg-green-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => DeleteHandler(blog._id)}
                        className="bg-red-500 text-white py-1.5 px-4 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Blog Image */}
                  {blog.image && (
                    <div className="w-full md:w-40 h-40 overflow-hidden rounded-lg">
                      <img
                        src={blog.image}
                        alt="Blog"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-lg text-gray-600">No Blogs found</p>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Profile;
