import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Vuroom from "./pages/Vuroom";
import Code from "./pages/Code";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/room/:roomID" element={< Vuroom />}></Route>
        <Route path="/code/:roomID" element={< Code />}></Route>
      </Routes>
      <ToastContainer newestOnTop theme="dark"/>
    </>
  );
}

export default App;
