import { Routes, Route, useLocation } from "react-router-dom"
import Login from "./components/Login"
import Signup from "./components/Signup"
import Profile from './components/Profile'
import Otp from "./components/Otp"
import Create from "./components/Create"
import GetAllBlogs from "./components/GetAllBlogs"
import Edits from "./components/Edits"
import Searchfilter from "./components/Searchfilter"
import SearchResult from "./components/SearchResult"
import BlogDetails from "./components/BlogDetails"
import OtpForgotPassword from "./components/pages/OtpForgotPassword"
import { UpdatePassword } from "./components/pages/UpdatePassword"
import { useEffect, useState } from "react"
import FortgotPassword from "./components/pages/FortgetPassword"
import BlogGenerator from "./components/pages/BlogGenerator"
import AiAgent from "./components/pages/AiAgent"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const location = useLocation() // Add this
  
  // Check login status on mount AND on every route change
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    setIsLoggedIn(!!token)
  }, [location]) // Add location as dependency - checks on every navigation

  return (
    <>
      <Searchfilter isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
      <AiAgent/>
      <Routes>
        <Route path="/" element={<GetAllBlogs/>} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/profile" element={<Profile />} />
        <Route path="/verifyOtp" element={<Otp setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/createblog" element={<Create/>} />
        <Route path="/updateBlog/:blogId" element={<Edits/>} />
        <Route path="/search" element={<SearchResult/>} />
        <Route path="/blog/:id" element={<BlogDetails/>} />
        <Route path="/forgotpassword" element={<FortgotPassword/>} />
        <Route path="verifyotpforgotpassword" element={<OtpForgotPassword/>} />
        <Route path="/updatepassword" element={<UpdatePassword/>}/>
        <Route path="/generate-blog-ai" element={<BlogGenerator/>} />
      </Routes>
    </>
  )
}

export default App