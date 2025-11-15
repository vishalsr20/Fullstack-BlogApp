import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "../assets/techthinker.webp";
import { FcSearch } from "react-icons/fc";
import { ToastContainer, toast } from "react-toastify";
import { FiMenu, FiX } from "react-icons/fi";

const Searchfilter = ({ isLoggedIn, setIsLoggedIn }) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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
      setShowDropdown(false);
    }
  };

  const handleCreateBlogClick = () => {
    if (!isLoggedIn) {
      toast.error("Please login to create blog");
      navigate("/login");
    } else {
      navigate("/createblog");
    }
    setIsMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-teal-100 shadow-lg font-serif text-black w-full fixed top-0 left-0 z-50">
      <nav className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
          <img src={logo} alt="TECH-THINKERS" className="rounded-2xl" width={50} height={50} />
          <h2 className="text-xl font-bold">BLOGS</h2>
        </Link>

        {/* Hamburger Icon (Mobile) */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Nav Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } absolute md:static top-16 left-0 w-full md:w-auto bg-teal-100 md:bg-transparent p-4 md:p-0 shadow-md md:shadow-none md:flex md:items-center md:space-x-6`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <NavLink
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) => (isActive ? "font-bold text-teal-700" : "")}
            >
              Home
            </NavLink>
            <button onClick={handleCreateBlogClick} className="text-left hover:text-teal-700">
              Create Blog
            </button>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSubmit}
            className="relative w-full md:w-64 mt-3 md:mt-0"
            autoComplete="off"
            ref={dropdownRef}
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
          <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
            {isLoggedIn ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => (isActive ? "font-bold text-teal-700" : "")}
                >
                  Profile
                </NavLink>
                <Link to={"/generate-blog-ai"}>
                Generate Blog
                </Link>
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    localStorage.removeItem("authToken");
                    setIsMenuOpen(false);
                    navigate("/");
                  }}
                  className="hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => (isActive ? "font-bold text-teal-700" : "")}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => (isActive ? "font-bold text-teal-700" : "")}
                >
                  Signup
                </NavLink>
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
 