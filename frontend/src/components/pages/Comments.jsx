import { useState, useEffect } from "react";
import axios from "axios";
import { createComments, getComments } from "../../../APIRoutes";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Comments = ({ blogId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(getComments(blogId));
        console.log(res)
        const fetchedComments = Array.isArray(res.data.comments)
          ? res.data.comments
          : [];

        const sortedComments = fetchedComments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setComments(sortedComments);
        setError(null);
      } catch (err) {
        console.error("Error fetching comments", err);
        setError("Failed to load comments");
        toast.error("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    if (blogId) fetchComments();
  }, [blogId]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      toast.warning("Comment cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please login to comment");
        return;
      }

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
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error submitting comment", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes commentSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .modal-overlay {
          animation: fadeIn 0.3s ease-out;
        }
        .modal-content {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .comment-item {
          animation: commentSlideIn 0.5s ease-out;
          animation-fill-mode: both;
        }
        .comment-item:nth-child(1) { animation-delay: 0.1s; }
        .comment-item:nth-child(2) { animation-delay: 0.2s; }
        .comment-item:nth-child(3) { animation-delay: 0.3s; }
        .comment-item:nth-child(4) { animation-delay: 0.4s; }
        .comment-item:nth-child(n+5) { animation-delay: 0.5s; }
      `}</style>

      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="modal-content bg-gradient-to-br from-white via-blue-50 to-purple-50 p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border-2 border-white/50">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gradient-to-r from-indigo-200 to-purple-200">
            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-4xl" style={{ animation: 'bounce 2s ease-in-out infinite' }}>{Array.isArray(comments) ? comments.length : 0}  💬</span>
              {comments.length === 1 ? "1 Comment" : `${comments.length} Comments`}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-4xl font-bold transition-all duration-300 transform hover:scale-110 hover:rotate-90"
              aria-label="Close comments"
            >
              &times;
            </button>
          </div>

          {/* Scrollable Comments Box */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-32 gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
                  <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-gray-600 font-semibold animate-pulse">Loading comments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block" style={{ animation: 'bounce 1s ease-in-out infinite' }}>😔</span>
                <p className="text-red-500 font-bold text-lg">{error}</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="comment-item border-2 border-indigo-200 rounded-2xl p-5 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-bold text-gray-800 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      @{comment.username}
                    </div>
                  </div>
                  <div className="text-gray-800 text-base mt-2 leading-relaxed font-medium pl-1">
                    {comment.content}
                  </div>
                  <div className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <span className="text-lg">🕐</span>
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <span className="text-7xl mb-4 block" style={{ animation: 'bounce 2s ease-in-out infinite' }}>💭</span>
                <p className="text-lg text-gray-600 font-semibold">No comments yet.</p>
                <p className="text-md text-gray-500 mt-2">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="mt-auto space-y-3">
            <div className="relative">
              <textarea
                className="w-full border-3 border-indigo-200 p-5 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 resize-none text-gray-800 placeholder-gray-400 text-lg font-medium shadow-sm hover:shadow-lg bg-white"
                rows={4}
                placeholder="✍️ Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={loading}
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-400 font-semibold">
                {newComment.length} / 500
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleCommentSubmit}
              disabled={loading || !newComment.trim()}
              className={`w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xl px-6 py-4 rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3 ${
                (loading || !newComment.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🚀</span>
                  <span>Post Comment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};