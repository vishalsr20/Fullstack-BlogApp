import { useState, useEffect } from "react";
import axios from "axios";
import { createComments, getComments } from "../../../APIRoutes";
import GetAllBlogs from "../GetAllBlogs";

export const Comments = ({ blogId, onClose, onCommentCountChange  }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(getComments(blogId));
          const sortedComments = res.data.getAllComments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComments(sortedComments);
         onCommentCountChange(sortedComments.length);
        // console.log("Fetched comments response:", res.data);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      }
    };

    fetchComments();
  }, [blogId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        createComments(blogId),
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments([res.data.comment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment", error);
    }
  };

 return (
    <div className="p-5 absolute z-50 bg-gray-400 rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 border-b pb-2">
        <h3 className="text-xl font-semibold text-gray-800">
          {comments.length === 1 ? "1 Comment" : `${comments.length} Comments`}
        </h3>
        <button
          onClick={onClose}
          className="text-red-600 font-bold text-base hover:text-red-700"
        >
          ✕
        </button>
      </div>
    
      {/* Scrollable Comments Box */}
      <div className="max-h-44 overflow-y-auto space-y-4 mb-5 pr-1">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50"
            >
              
              <div className="text-sm font-bold text-gray-500">
                @{comment.username}
              </div>
              <div className="text-gray-800 text-sm mt-1">{comment.content}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No comments yet.</p>
        )}
      </div>

  <div className="bg-white  w-full h-[0.5px] mb-4">

      </div>
      {/* Comment Input */}
      <textarea
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition "
        rows={4}
        placeholder="Write your comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <button
        onClick={handleCommentSubmit}
        className="bg-blue-600  text-white font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </div>
  );
};











