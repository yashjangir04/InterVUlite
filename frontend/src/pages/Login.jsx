import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import vCallPic from "../assets/images/call1.jpg";

const Login = () => {
  const [LoginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(name,value);
    const loginInfo = { ...LoginInfo };
    loginInfo[name] = value;
    setLoginInfo(loginInfo);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = LoginInfo;
    console.log(email, password);
    console.log(!email || !password);
    if (!email || !password) {
      return handleError("All Details are required");
    }

    try {
      const url = "http://localhost:3000/auth/login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(LoginInfo),
      });
      const result = await response.json();
      const { success, message, jwtToken, username, error } = result;
      console.log(jwtToken, username);
      if (success) {
        handleSuccess(message);
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("loggedInUser", username);
        // console.log(localStorage.getItem('token'));
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else if (error) {
        const det = error.details[0].message;
        handleError(det);
      } else if (!success) {
        handleError(message);
      }
      console.log(result);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="w-full h-screen bg-zinc-800 flex flex-row" role="main">
      <div className="l w-1/2 h-screen rounded-xl overflow-hidden">
        <img
          src={vCallPic}
          alt="People on a video call"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="r w-1/2 h-screen flex justify-center items-center">
        <form
          onSubmit={handleLogin}
          method="POST"
          className="bg-transparent border-2 border-zinc-700 rounded-md min-h-1/2 flex flex-col justify-center min-w-72 gap-3 py-10 px-8"
          aria-label="Login form"
        >
          <h1 className="text-white font-semibold text-3xl mb-10 text-center">
            Login
          </h1>

          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            onChange={handleChange}
            type="email"
            name="email"
            placeholder="Email Address"
            aria-label="Email address"
            className="placeholder:text-zinc-400 text-center w-full text-white border-2 border-zinc-700 px-3 py-2 outline-none rounded-md text-sm"
            required
          />

          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            onChange={handleChange}
            type="password"
            name="password"
            placeholder="Password"
            aria-label="Password"
            className="placeholder:text-zinc-400 text-center w-full text-white border-2 border-zinc-700 px-3 py-2 outline-none rounded-md text-sm"
            required
          />

          <button
            type="submit"
            className="w-full bg-purple-600 text-white text-sm px-5 py-3 rounded-md mt-5 cursor-pointer hover:bg-purple-700 duration-300"
            aria-label="Submit login"
          >
            Login
          </button>

          <span className="text-purple-600 text-center text-sm hover:underline mt-1">
            <Link
              to="/signup"
              aria-label="Sign up if you don't have an account"
            >
              No account? Sign up
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
