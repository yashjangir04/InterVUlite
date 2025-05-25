import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import axios from "axios";
import { HiCode } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";

const Code = () => {
  const { roomID } = useParams();
  const [code, setCode] = useState("// Write your code in C++");
  const [input, setInput] = useState(""); // 🔹 New state for input
  const [output, setOutput] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [loggedInUser, setloggedInUser] = useState("");
  const [col, setCol] = useState(0);
  const [items, setItems] = useState([]);
  const [isHost, setIsHost] = useState(false);

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
          navigate(`/code/${roomID}`);
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

    socketRef.current = io("http://localhost:3001", {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("join-room", roomID);
    });

    socket.on("host-status", (status) => {
      setIsHost(status);
    });

    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    socket.on("input-update", (inp) => {
      setInput(inp);
    });

    socket.on("output-update", (out) => {
      setOutput(out);
    });

    socket.on("title-update", (tit) => {
      setTitle(tit);
    });

    socket.on("desc-update", (des) => {
      setDesc(des);
    });

    return () => {
      socket.disconnect();
      console.log("🧹 Socket disconnected");
    };
  }, []);

  const addNewCol = () => {
    const newIndex = col + 1;
    setCol(newIndex);

    const newExample = (
      <div key={newIndex} className="example mt-10">
        <h1 className="text-white text-lg tracking-tighter font-semibold">
          Example {newIndex}
        </h1>
        <div className="w-full flex flex-row mt-2 gap-2">
          <div className="w-1/2 border-2 border-zinc-700 rounded-md">
            <h4 className="text-white bg-zinc-700 px-2 py-1 text-sm">Input</h4>
            <textarea
              rows="5"
              style={{ width: "100%" }}
              placeholder="// Sample Input //"
              className="outline-none resize-none mt-2 px-2 placeholder:text-sm placeholder:text-zinc-500 text-white text-sm"
            />
          </div>
          <div className="w-1/2 border-2 border-zinc-700 rounded-md">
            <h4 className="text-white bg-zinc-700 px-2 py-1 text-sm">Output</h4>
            <textarea
              rows="5"
              style={{ width: "100%" }}
              placeholder="// Sample Output //"
              className="outline-none resize-none mt-2 px-2 placeholder:text-sm placeholder:text-zinc-500 text-white text-sm"
            />
          </div>
        </div>
      </div>
    );

    setItems((prevItems) => [...prevItems, newExample]);
  };

  const handleChange = (value) => {
    setCode(value);
    socketRef.current.emit("code-change", { roomID, code: value });
  };

  const handleChangeMainInput = (value) => {
    setInput(value);
    socketRef.current.emit("input-change", { roomID, input: value });
  };

  const handleTitle = (value) => {
    if (!isHost) return; // Only host can update
    setTitle(value);
    socketRef.current.emit("title-change", { roomID, title: value });
  };

  const handleDesc = (value) => {
    if (!isHost) return; // Only host can update
    setDesc(value);
    socketRef.current.emit("desc-change", { roomID, desc: value });
  };

  const compileCode = async () => {
    try {
      const res = await axios.post("http://localhost:3000/compile", {
        code,
        input,
        roomID, // 🔹 send input too
      });
      setOutput(res.data.output);
    } catch (err) {
      setOutput("❌ Error running code");
      console.error(err);
    }
  };

  return (
    <div className="w-full h-screen flex flex-row bg-zinc-800 text-zinc-400 overflow-hidden">
      <div className="w-1/2 flex flex-col px-4 py-8 h-screen overflow-y-scroll">
        <div className="title">
          <textarea
            spellCheck={false}
            autoCorrect="off"
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            autoCapitalize="off"
            rows="1"
            disabled={!isHost}
            style={{ width: "100%", height: "50px" }}
            placeholder="Question Title"
            className={`outline-none overflow-hidden text-white text-4xl font-bold tracking-tighter placeholder:text-zinc-500 ${
              !isHost ? "cursor-not-allowed" : ""
            }`}
          />
        </div>
        <div className="desc">
          <textarea
            rows="6"
            style={{ width: "100%" }}
            value={desc}
            onChange={(e) => handleDesc(e.target.value)}
            disabled={!isHost}
            placeholder="Description"
            className={`outline-none text-white tracking-tighter overflow-hidden mt-12 text-md placeholder:text-zinc-500 ${
              !isHost ? "cursor-not-allowed" : ""
            }`}
          />
        </div>
        <div className="">{items}</div>
        <button onClick={addNewCol} className="cursor-pointer">
          <div className="w-full flex justify-center items-center mt-4 p-2 border-zinc-600 border-2 border-dotted">
            <FaPlus className="text-lg text-zinc-500" />
          </div>
        </button>
      </div>
      <div className="w-1/2 h-98%  bg-zinc-800 px-2 border-l-6 border-black py-2 overflow-y-scroll">
        <div className="bg-zinc-700 rounded-md">
          <div className="h-9 flex flex-row items-center gap-1 px-2">
            <HiCode className="text-lime-400 text-md" />
            <h2 className="text-white text-sm">Code</h2>
          </div>

          <Editor
            height="60vh"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={handleChange}
            className="border-1 border-black rounded-b-md bg-[#1E1E1E] py-2"
          />
        </div>
        <div className="w-full flex flex-row mt-2 gap-2">
          <div className="w-1/2 border-2 border-zinc-700 rounded-md">
            <h4 className="text-white bg-zinc-700 px-2 py-1 text-sm">Input</h4>
            <textarea
              rows="5"
              style={{ width: "100%" }}
              value={input}
              onChange={(e) => handleChangeMainInput(e.target.value)}
              placeholder="// Test Cases //"
              className="outline-none resize-none mt-2 px-2 placeholder:text-sm placeholder:text-zinc-500 text-white text-sm"
            />
          </div>
          <div className="w-1/2 border-2 border-zinc-700 rounded-md">
            <h4 className="text-white bg-zinc-700 px-2 py-1 text-sm">Output</h4>
            <p className="mt-2 px-2 placeholder:text-sm placeholder:text-zinc-500 text-white text-sm">
              {output}
            </p>
          </div>
        </div>
        <div className="w-full flex flex-row justify-between items-center">
          <button
            onClick={compileCode}
            className="bg-[#02B128] text-white px-4 py-2 border-2 border-[#02B128] rounded-md cursor-pointer hover:bg-transparent hover:text-[#02B128] hover:border-2 duration-300 scale-103 text-sm mt-2 font-semibold"
            >
            Run
          </button>
          <div className="flex flex-row w-3/4 gap-2 mt-2">
            <IoIosWarning className="text-red-600 text-xl"/>
            <h1 className="text-red-600 text-sm ">JDoodle currently doesn't support "endl" or "\n" , use "/" or any other character to represent newline in the output.</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Code;
