import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import axios from "axios";
import { HiCode } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { FaArrowRightFromBracket } from "react-icons/fa6";

const Code = () => {
  const { roomID } = useParams();
  const [code, setCode] = useState("// Write your code in C++");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState("");
  const [isHost, setIsHost] = useState(false);

  // examples: array of { input: string, output: string }
  const [examples, setExamples] = useState([]);

  useEffect(() => {
    // Verify user token and redirect if invalid
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
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!data.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("loggedInUser");
          navigate("/login");
        } else {
          setLoggedInUser(data.username);
        }
      } catch (err) {
        console.error("Verification error:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    verifyToken();

    // Setup socket connection
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

    socket.on("room-full", () => {
      alert("❌ Room is full.");
      navigate("/"); // redirect to homepage or error page
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

    // Receive full examples array (initial load or update)
    socket.on("examples-update", (newExamples) => {
      setExamples(newExamples);
    });

    // When a new example is added (server sends updated array)
    socket.on("example-added", (newExamples) => {
      setExamples(newExamples);
    });

    // When an example input or output is updated
    socket.on("example-changed", ({ index, field, value }) => {
      setExamples((prevExamples) => {
        const updated = [...prevExamples];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            [field]: value,
          };
        }
        return updated;
      });
    });

    return () => {
      socket.disconnect();
      console.log("🧹 Socket disconnected");
    };
  }, [roomID, navigate]);

  const addNewExample = () => {
    const newExample = { input: "", output: "" };
    const newExamples = [...examples, newExample];
    setExamples(newExamples);
    socketRef.current.emit("add-example", { roomID, examples: newExamples });
  };

  const handleExampleChange = (index, field, value) => {
    setExamples((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
    socketRef.current.emit("example-change", { roomID, index, field, value });
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
    if (!isHost) return;
    setTitle(value);
    socketRef.current.emit("title-change", { roomID, title: value });
  };

  const handleDesc = (value) => {
    if (!isHost) return;
    setDesc(value);
    socketRef.current.emit("desc-change", { roomID, desc: value });
  };

  const compileCode = async () => {
    try {
      const res = await axios.post("http://localhost:3000/compile", {
        code,
        input,
        roomID,
      });
      setOutput(res.data.output);
      socketRef.current.emit("output-change", {
        roomID,
        output: res.data.output,
      });
    } catch (err) {
      setOutput("❌ Error running code");
      console.error(err);
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-row bg-zinc-800 text-zinc-400 overflow-hidden"
      role="main"
    >
      <div className="w-1/2 flex flex-col px-4 py-8 h-screen overflow-y-scroll">
        <div className="title">
          <label htmlFor="title" className="sr-only">
            Question Title
          </label>
          <textarea
            id="title"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            disabled={!isHost}
            placeholder="Question Title"
            aria-label="Question title input"
            style={{ width: "100%", height: "50px" }}
            className={`outline-none overflow-hidden text-white text-4xl font-bold tracking-tighter placeholder:text-zinc-500 ${
              !isHost ? "cursor-not-allowed" : ""
            }`}
          />
        </div>

        <div className="desc">
          <label htmlFor="desc" className="sr-only">
            Question Description
          </label>
          <textarea
            id="desc"
            rows="10"
            style={{ width: "100%" }}
            value={desc}
            onChange={(e) => handleDesc(e.target.value)}
            disabled={!isHost}
            placeholder="Description"
            aria-label="Question description input"
            className={`outline-none text-white tracking-tighter overflow-hidden mt-12 text-md placeholder:text-zinc-500 ${
              !isHost ? "cursor-not-allowed" : ""
            }`}
          />
        </div>

        <div className="mt-6">
          {examples.map((example, index) => (
            <div key={index} className="example mt-10">
              <h2 className="text-white text-lg tracking-tighter font-semibold">
                Example {index + 1}
              </h2>
              <div className="w-full flex flex-row mt-2 gap-2">
                <div className="w-1/2 border-2 border-zinc-700 rounded-md">
                  <h4 className="text-white bg-zinc-700 px-2 py-1 text-sm flex flex-row justify-between">
                    <span>Input</span>
                    <button
                      className="cursor-pointer"
                      onClick={() => handleChangeMainInput(example.input)}
                      aria-label={`Use input from Example ${index + 1}`}
                    >
                      <FaArrowRightFromBracket className="mt-1 mr-1 text-sm" />
                    </button>
                  </h4>
                  <label htmlFor={`example-input-${index}`} className="sr-only">
                    Example {index + 1} input
                  </label>
                  <textarea
                    id={`example-input-${index}`}
                    rows="5"
                    style={{ width: "100%" }}
                    placeholder="// Sample Input //"
                    className="outline-none resize-none mt-2 px-2 placeholder:text-sm placeholder:text-zinc-500 text-white text-sm"
                    value={example.input}
                    onChange={(e) =>
                      handleExampleChange(index, "input", e.target.value)
                    }
                    aria-label={`Example ${index + 1} input`}
                  />
                </div>
                <div className="w-1/2 border-2 border-zinc-700 rounded-md">
                  <h4 className="text-white bg-zinc-700 px-2 py-1 text-sm">
                    Output
                  </h4>
                  <label
                    htmlFor={`example-output-${index}`}
                    className="sr-only"
                  >
                    Example {index + 1} output
                  </label>
                  <textarea
                    id={`example-output-${index}`}
                    rows="5"
                    style={{ width: "100%" }}
                    placeholder="// Sample Output //"
                    className="outline-none resize-none mt-2 px-2 placeholder:text-sm placeholder:text-zinc-500 text-white text-sm"
                    value={example.output}
                    onChange={(e) =>
                      handleExampleChange(index, "output", e.target.value)
                    }
                    aria-label={`Example ${index + 1} output`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addNewExample}
          className="cursor-pointer mt-4"
          aria-label="Add new example"
        >
          <div className="w-full flex gap-2 justify-center items-center p-2 border-zinc-600 border-2 border-dotted">
            <FaPlus className="text-md text-zinc-500" />
            <h1 className="text-md">Add Example</h1>
          </div>
        </button>
      </div>

      <div className="w-1/2 h-[98%] bg-zinc-800 px-2 border-l-6 border-black py-2 overflow-y-scroll">
        <div className="bg-zinc-700 rounded-md">
          <div className="h-9 flex flex-row items-center gap-1 px-2">
            <HiCode className="text-green-500 text-md" />
            <h2 id="code-editor-label" className="text-white text-sm">
              Code
            </h2>
          </div>
          <p id="editor-desc" className="sr-only">
            This is a code editor area. It may not be fully compatible with
            screen readers.
          </p>
          <Editor
            height="60vh"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={handleChange}
            className="border-1 border-black rounded-b-md bg-[#1E1E1E] py-2"
            aria-labelledby="code-editor-label"
            aria-describedby="editor-desc"
          />
        </div>

        <div className="w-full flex flex-row mt-2 gap-2">
          <div className="w-1/2 border-2 border-zinc-700 rounded-md">
            <h4 className="text-white bg-zinc-700 px-2 py-1 text-sm">Input</h4>
            <label htmlFor="test-input" className="sr-only">
              Test Case Input
            </label>
            <textarea
              id="test-input"
              rows="5"
              style={{ width: "100%" }}
              value={input}
              onChange={(e) => handleChangeMainInput(e.target.value)}
              placeholder="// Test Cases //"
              aria-label="Test case input"
              className="outline-none resize-none mt-2 px-2 placeholder:text-sm placeholder:text-zinc-500 text-white text-sm"
            />
          </div>
          <div className="w-1/2 border-2 border-zinc-700 rounded-md">
            <h4 className="text-white bg-zinc-700 px-2 py-1 text-sm">Output</h4>
            <p
              className="mt-2 px-2 placeholder:text-sm placeholder:text-zinc-500 text-white text-sm min-h-[115px] whitespace-pre-wrap break-words"
              aria-label="Code output"
            >
              {output || <span className="text-zinc-500">// Output //</span>}
            </p>
          </div>
        </div>

        <div className="w-full flex flex-row justify-between items-center mt-2">
          <button
            onClick={compileCode}
            className="bg-green-600 rounded-md text-white font-semibold hover:bg-green-700 transition duration-300 px-4 py-2 cursor-pointer text-sm"
            aria-label="Run code"
          >
            Run
          </button>
          <div className="flex flex-row w-3/4 gap-1">
            <IoIosWarning className="text-red-600 text-lg mt-[0.2rem]" />
            <p className="text-sm text-red-600">
              Compiler currently doesn't support "endl" and "\n", kindly use any
              other character to represent a new line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Code;
