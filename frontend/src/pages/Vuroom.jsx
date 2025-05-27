import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { HiCode } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const Vuroom = () => {
  const { roomID } = useParams();
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [loggedInUser, setloggedInUser] = useState("");

  useEffect(() => {
    const appID = 671341082;
    const serverSecret = "734a383367e26eaddd0540b8a4708427";
    const username = localStorage.getItem("loggedInUser") || "Guest";

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
          navigate(`/room/${roomID}`);
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

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      Date.now().toString(),
      username
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: containerRef.current,
      sharedLinks: [
        {
          name: "Copy Link",
          url: `http://localhost:5173/room/${roomID}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      onJoinRoom: (users) => {
        if (users.length >= 2) {
          alert("Room is full. Try again later.");
          // You can redirect or just leave room
          window.location.href = "/";
        }
      },
    });
  }, [roomID]);

  const navToRoom = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // No token, go to login
      return; 
    }

    try {
      const res = await fetch("http://localhost:3000/auth/verify-token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.success) {
        // Token invalid or expired
        localStorage.removeItem("token");
        localStorage.removeItem("loggedInUser");
        navigate("/login"); // redirect to login
      } else {
        // Authenticated — open the /code/:roomID page in a new tab
        navigate(`/code/${roomID}`);
      }
    } catch (err) {
      console.error("Verification error:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      navigate("/login");
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <button
        ref={buttonRef}
        onClick={navToRoom}
        className="bg-orange-500 text-white hover:bg-transparent hover:border-2 hover:border-orange-500 hover:text-orange-500 duration-300  fixed top-10 right-10 z-100 text-4xl rounded-full h-16 w-16 flex justify-center items-center cursor-pointer hover:scale-110"
      >
        <HiCode />
      </button>
    </div>
  );
};

export default Vuroom;
