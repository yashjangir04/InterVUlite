import React, { useState } from 'react'
import { useEffect } from 'react';
import { handleSuccess } from '../utils';
import { Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";

const Home = () => {
  const [loggedInUser , setloggedInUser] = useState('');

  const [input , setinput] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      try {
        const res = await fetch('http://localhost:3000/auth/verify-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // ✅ Correct format
          }
        });
  
        const data = await res.json();
  
        if (!data.success) {
          localStorage.removeItem('token');
          localStorage.removeItem('loggedInUser');
          navigate('/login');
        } else {
          setloggedInUser(data.username);
        }
  
      } catch (err) {
        console.error('Verification error:', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
  
    verifyToken();
  }, []);
  
  const handleLogout = (e) => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('Logged Out Successfully');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  }

  const handleChange = (e) => {
    setinput(e.target.value);
  } 

  const handleJoin = (e) => {
    setTimeout(() => {
      navigate(`/room/${input}`)
    }, 1000);
  }


  return (
    <div className='w-full h-screen flex flex-col justify-center items-center gap-5 bg-zinc-800'>
      <input type="text" name="room_id" placeholder='Enter room code' className='px-5 py-3 bg-transparent text-white outline-none border-2 border-zinc-600 placeholder:text-zinc-500 rounded-lg text-center' onChange={handleChange} value={input} />
      <div className="btns flex flex-row justify-between gap-8">
        <button className='bg-transparent text-purple-600 px-5 py-2 border-2 border-purple-600 rounded-sm cursor-pointer hover:bg-purple-600 hover:text-white transition duration-300 min-w-24' onClick={handleJoin}>Join</button>
        <button onClick={handleLogout} className='bg-purple-600 min-w-24 text-white px-5 py-2 rounded-sm cursor-pointer hover:bg-purple-700 transition'>Logout</button>
      </div>
    </div>
  )
}

export default Home