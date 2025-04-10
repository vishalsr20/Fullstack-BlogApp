import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/techthinker.webp";
import { useState } from "react";
import { FcSearch } from "react-icons/fc";
import { ToastContainer, toast } from "react-toastify";
import { FiMenu, FiX } from "react-icons/fi";

const Searchfilter = ({ isLoggedIn, setIsLoggedIn }) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const categories = ["Technology", "Health", "Education", "Fun"];

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (category) => {
    setSearch(category);
    setShowDropdown(false);
    navigate(`/search?category=${category.toLowerCase()}`);
    setIsMenuOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/blogs?category=${search.toLowerCase()}`);
      setIsMenuOpen(false);
    }
  };

  const handleCreateBlogClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to create blog");
      navigate("/login");
    } else {
      navigate("/createblog");
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-teal-100 shadow-lg font-serif text-black w-full fixed top-0 left-0 z-50">
      <nav className="px-4 py-3 mx-auto flex items-center justify-evenly flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
            <img src={logo} alt="TECH-THINKERS" className="rounded-2xl" width={55} height={55} />
            <h2 className="text-lg font-bold">BLOGS</h2>
          </Link>
        </div>

        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl">
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } w-full md:flex md:items-center md:w-auto mt-3 md:mt-0 space-y-3 md:space-y-0 md:space-x-6`}
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <button onClick={handleCreateBlogClick} className="text-left">
              CreateBlog
            </button>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-xs mx-auto md:mx-0"
            autoComplete="off"
          >
            <FcSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            />
            {showDropdown && search && (
              <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-md">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <li
                      key={category}
                      onClick={() => handleSelect(category)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {category}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No category found</li>
                )}
              </ul>
            )}
          </form>

          {/* Auth Links */}
          <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0 md:items-center">
            {isLoggedIn ? (
              <>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <Link
                  to="/"
                  onClick={() => {
                    setIsLoggedIn(false);
                    localStorage.removeItem("authToken");
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Signup</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <ToastContainer />
    </div>
  );
};

export default Searchfilter;
