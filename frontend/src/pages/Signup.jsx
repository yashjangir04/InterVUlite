import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import  vCallPic  from "../assets/images/call2.jpg";

const Signup = () => {
  const [signUpInfo , setsignUpInfo] = useState({
    username : '',
    email : '',
    password : ''
  })

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name , value } = e.target;
    // console.log(name,value);
    const copysignUpInfo = {...signUpInfo};
    copysignUpInfo[name] = value;
    setsignUpInfo(copysignUpInfo);
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const { username , email , password } =  signUpInfo;
    console.log(username , email , password);
    console.log(!username || !email || !password);
    if(!username || !email || !password){
      return handleError('All Details are required');
    }

    try {
      const url = "http://localhost:3000/auth/signup"
      const response =  await fetch(url, {
        method:"POST",
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify(signUpInfo)
      });
      const result = await response.json();
      const {success , message , error} = result;
      if(success){
        handleSuccess(message);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
      else if(error){
        const det = error.details[0].message;
        handleError(det);
      }
      else if(!success){
        handleError(message);
      }
      // console.log(result);
    } catch (err) {
      handleError(err);
    }
  }

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
          method="POST"
          onSubmit={handleSignUp}
          className="bg-transparent border-2 border-zinc-700 rounded-md min-h-1/2 flex flex-col justify-center min-w-72 gap-3 py-10 px-8"
          aria-label="Sign up form"
        >
          <h1 className="text-white font-semibold text-3xl mb-10 text-center">Sign Up</h1>

          <label htmlFor="username" className="sr-only">User name</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="User Name"
            autoFocus
            onChange={handleChange}
            required
            aria-label="User name"
            className="placeholder:text-zinc-400 text-center w-full text-white border-2 border-zinc-700 px-3 py-2 outline-none rounded-md text-sm"
          />

          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            aria-label="Email address"
            className="placeholder:text-zinc-400 text-center w-full text-white border-2 border-zinc-700 px-3 py-2 outline-none rounded-md text-sm"
          />

          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            aria-label="Password"
            className="placeholder:text-zinc-400 text-center w-full text-white border-2 border-zinc-700 px-3 py-2 outline-none rounded-md text-sm"
          />

          <button
            type="submit"
            className="w-full bg-purple-600 text-white text-sm px-5 py-3 rounded-md mt-5 cursor-pointer hover:bg-purple-700 duration-300"
            aria-label="Register"
          >
            Register
          </button>

          <span className="text-purple-600 text-center text-sm hover:underline mt-1">
            <Link to="/login" aria-label="Already have an account? Sign in">
              Have an account? Sign in
            </Link>
          </span>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;
