const express = require("express");
const app = express();
const cors = require("cors");
const AuthRouter = require("./Routes/AuthRouter.js");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const { stdin } = require("process");
const { initSocket } = require("./Controllers/coderunner.js");
const ensureAuthenticated = require("./Middlewares/Auth.js");

require("dotenv").config();
require("./Models/db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use("/auth", AuthRouter);

const clientId = "7c0a36a82c864cf75ca04b31b14ed035";
const clientSecret =
  "51d4fa9dd3ac29a80b905bd673ba516129904560d7e329af4d268a75b2cc3d56";

app.get("/code/:roomID", ensureAuthenticated, (req, res) => {
  console.log("Someone came...")
  res.send(`Welcome to the code room: ${req.params.roomID}`);
});

app.post("/compile", async (req, res) => {
  const { code, input, roomId } = req.body; // ✅ include roomId from client

  const program = {
    script: code,
    stdin: input,
    language: "cpp17",
    versionIndex: "0",
    clientId,
    clientSecret,
  };

  try {
    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      program
    );
    const output = response.data.output;

    res.json({ output });
  } catch (err) {
    console.error("JDoodle API error:", err.message);
    res.status(500).json({ output: "❌ Compilation failed. Try again." });
  }
});

app.listen(PORT, () => {
  console.log("Server Running...");
});
