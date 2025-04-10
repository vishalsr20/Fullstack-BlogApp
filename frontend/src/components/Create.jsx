import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CreateBlogRoute } from "../../APIRoutes";
import { useNavigate } from "react-router-dom";

const Create = () => {
  const navigate = useNavigate();
  
  const [values, setValues] = useState({
    title: "",
    content: "",
    category:"",
    image: null, // Store the image file directly
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
    }
  };

  const CreateHandler = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please login");
        return;
      }

      const { title, content,category, image } = values;
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category",category)
      formData.append("image", image); // Append the image file directly

      const { data } = await axios.post(
        CreateBlogRoute,
        formData, // Send form data with the image
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Make sure to set the correct content type
          },
        }
      );

      if (data.success) {
        toast.success("Blog created successfully");
        navigate('/');
      } else {
        toast.error(data.message || "Failed to create the blog");
      }
    } catch (error) {
      console.error("Error while creating the blog:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a New Blog</h2>
        <form onSubmit={CreateHandler}>
          <div className="mb-4">
            <input
              type="text"
              name="title"
              placeholder="Give a title for the blog"
              value={values.title}
              onChange={ChangeHandler}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <textarea
              name="content"
              placeholder="Write content about the blog"
              value={values.content}
              onChange={ChangeHandler}
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            ></textarea>
          </div>
          <div>
            <label className="block mb-1"> Select Category : </label>
            <select name="category"
            required
             value={values.category}
             onChange={ChangeHandler}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"

             >
              <option value=""> --Choose Category--</option>
                <option value="Technology">Technology</option>
                <option value="Fun">Fun</option>
                <option value="Health"> Health</option>
                <option value="Education">Education</option>
              

            </select>
          </div>

          <div className="mb-4">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={FileHandler}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Create;
