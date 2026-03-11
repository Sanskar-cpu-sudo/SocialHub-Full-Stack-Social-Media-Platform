// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UpProf from "./pages/UpProf";
import UserProfile from "./pages/UserProfile";
import CreatePost from "./pages/CreatePost";
import UpdatePost from "./pages/UpdatePost";
import GetUser from "./pages/GetUser";
import Followers from "./pages/Followers";
import Comments from "./pages/Comment";
import CreateComment from "./pages/CreateComment";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/posts/getallpost" element={<Home />} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/users/signup" element={<Signup />} />
        <Route path="/users/getprofile/:id" element={<UserProfile />} />
        <Route path="/users/getuser/:id" element={<GetUser/>}/>
        <Route path="/users/seefollowers/:id" element={<Followers/>}/>
        <Route path="/users/updateprofile/:id" element={<UpProf/>}/>
        <Route path="/posts/createpost" element={<CreatePost />} />
        <Route path="/posts/updatepost/:id" element={<UpdatePost />} />
        <Route path="/posts/:postId/allcomments" element={<Comments />} />
        <Route path="/posts/:postId/addcomments" element={<CreateComment />} />
      </Routes>
    </Router>
  );
};

export default App;
