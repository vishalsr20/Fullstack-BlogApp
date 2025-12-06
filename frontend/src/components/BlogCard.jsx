const BlogCard = ({ blog, toggleLike, hasUserLiked, onClickCard }) => {
    return (
      <div
        onClick={() => onClickCard(blog)}
        className="flex flex-col mt-20 lg:flex-row w-full bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        {/* Left content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={blog.avatar || '/default-avatar.png'}
                alt="User"
                width={50}
                height={50}
                className="rounded-xl object-cover"
                onError={(e) => { e.target.src = '/default-avatar.png'; }}
              />
              <h3 className="text-lg font-bold text-gray-700">@{blog.username}</h3>
            </div>
            <h4 className="text-sm  font-semibold text-gray-800 mb-3">{blog.title}</h4>
            <p className="text-gray-600 text-base mb-4 line-clamp-3">{blog.content}</p>
          </div>
  
          {/* Likes */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={(e) => toggleLike(e, blog._id)}
                className="focus:outline-none hover:scale-110 transition-transform"
                aria-label={hasUserLiked(blog) ? "Unlike" : "Like"}
              >
                {hasUserLiked(blog) ? (
                  <FaHeart className="text-red-500 mr-2 text-2xl" />
                ) : (
                  <CiHeart className="text-gray-400 mr-2 hover:text-red-500 text-2xl" />
                )}
              </button>
              <span className="text-lg font-medium">{blog.likes?.length || 0}</span>
            </div>
            <p className="text-base text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
  
        {/* Right image */}
        {blog.image && (
          <div className="w-full lg:w-1/3 flex justify-end">
            <img
              src={blog.image || '/default-blog-image.jpg'}
              alt={blog.title}
              className="rounded-xl object-cover w-full lg:w-[300px] h-[200px]"
              onError={(e) => { e.target.src = '/default-blog-image.jpg'; }}
            />
          </div>
        )}
      </div>
    );
  };
  
  export default BlogCard;
  
