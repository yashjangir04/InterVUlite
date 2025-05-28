import React, { useState } from "react";
import { useEffect } from "react";
import { handleSuccess } from "../utils";
import { Navigate, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Footer from "./Footer";

const Home = () => {
  const [loggedInUser, setloggedInUser] = useState("");

  const [input, setinput] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/auth/verify-token", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Correct format
          },
        });

        const data = await res.json();

        if (!data.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("loggedInUser");
          navigate("/login");
        } else {
          setloggedInUser(data.username);
        }
      } catch (err) {
        console.error("Verification error:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    verifyToken();
  }, []);

  const handleLogout = (e) => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("Logged Out Successfully");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const handleChange = (e) => {
    setinput(e.target.value);
  };

  const handleJoin = (e) => {
    setTimeout(() => {
      navigate(`/room/${input}`);
    }, 1000);
  };

  const handleCreate = () => {
    const randomRoomId = Math.floor(1000000000 + Math.random() * 9000000000); // Generates a 10-digit number
    navigate(`/room/${randomRoomId}`);
  };

  return (
    <div
      className="w-full h-screen flex flex-col justify-center items-center gap-5 bg-zinc-800 relative"
      role="main"
    >
      <button
        onClick={handleLogout}
        className="text-red-500 cursor-pointer hover:text-red-600 duration-300 absolute right-5 top-5 border-b-2 border-zinc-800 hover:border-red-600"
        aria-label="Logout"
      >
        Logout
      </button>

      <label htmlFor="room_id" className="sr-only">
        Room Code
      </label>
      <input
        id="room_id"
        type="text"
        name="room_id"
        placeholder="Enter room code"
        className="px-5 py-3 bg-transparent text-white outline-none border-2 border-zinc-600 placeholder:text-zinc-500 rounded-lg text-center"
        onChange={handleChange}
        value={input}
        aria-label="Room code input"
      />

      <div className="btns flex flex-row justify-between gap-8">
        <button
          className="bg-transparent text-purple-600 px-5 py-2 border-2 border-purple-600 rounded-sm cursor-pointer hover:bg-purple-600 hover:text-white transition duration-300 min-w-24"
          onClick={handleJoin}
          aria-label="Join room"
        >
          Join
        </button>

        <button
          className="bg-purple-600 min-w-24 text-white px-5 py-2 rounded-sm cursor-pointer hover:bg-purple-700 transition"
          onClick={handleCreate}
          aria-label="Create room"
        >
          Create
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
