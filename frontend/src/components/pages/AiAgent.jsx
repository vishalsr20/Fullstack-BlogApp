


import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { AiAgentRoutes } from "../../../APIRoutes";

const AiAgent = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  let mode = "HOME";
  let blog_id = null;

  if (location.pathname.startsWith("/blog/")) {
    mode = "BLOG";
    blog_id = location.pathname.split("/blog/")[1];
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(AiAgentRoutes, {
        mode,
        blog_id,
        question: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        
        .chat-container {
          font-family: 'Outfit', sans-serif;
        }
        
        .chat-window {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .chat-fab {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
        }
        
        .chat-fab:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.4);
        }
        
        .chat-fab:active {
          transform: scale(0.95);
        }
        
        .message-user {
          animation: messageSlideInRight 0.3s ease-out;
        }
        
        .message-assistant {
          animation: messageSlideInLeft 0.3s ease-out;
        }
        
        @keyframes messageSlideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes messageSlideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }
        
        .typing-dot {
          width: 8px;
          height: 8px;
          background: #8b5cf6;
          border-radius: 50%;
          animation: typingBounce 1.4s infinite;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
        
        .chat-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .send-button {
          transition: all 0.2s ease;
        }
        
        .send-button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }
        
        .send-button:not(:disabled):active {
          transform: translateY(0);
        }
        
        .chat-header-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .chat-bg-pattern {
          background-color: #fafafa;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(102, 126, 234, 0.03) 0%, transparent 50%);
        }
      `}</style>

      {/* Chat Window */}
      {open && (
        <div className="chat-container fixed bottom-24 right-6 w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 chat-window overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="chat-header-gradient p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                ✨
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">Blog Assistant</h3>
                <p className="text-white/80 text-xs">Powered by AI</p>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-bg-pattern">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  💬
                </div>
                <h4 className="text-gray-800 font-semibold mb-2">Start a conversation</h4>
                <p className="text-gray-500 text-sm">Ask me anything about the blog content!</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white message-user rounded-br-sm"
                      : "bg-white shadow-sm border border-gray-100 text-gray-800 message-assistant rounded-bl-sm"
                  }`}
                >
               <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content.split("\n").map((line, i) => {
                    if (/^\d+\./.test(line)) {
                      return (
                        <div key={i} className="font-semibold text-indigo-600">
                          {line}
                        </div>
                      );
                    }

                    if (line.startsWith("Title:")) {
                      return (
                        <div key={i}>
                          <span className="font-semibold text-gray-900">Title:</span>
                          {line.replace("Title:", "")}
                        </div>
                      );
                    }

                    return <div key={i}>{line}</div>;
                  })}
                </p>

                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="chat-input flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 transition-all"
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="send-button bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">↑</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="chat-fab bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold"
        >
          {open ? "✕" : "✨"}
        </button>
      </div>
    </>
  );
};

export default AiAgent;
