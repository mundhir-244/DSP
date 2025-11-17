import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/userContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SignupForm from '../components/SignupForm'

const Signup = () => {
  // Check if user is not logged in
  const { user, loading } = useContext(UserContext); // Use useContext to get the user object
  const navigate = useNavigate()

  // If user is logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className='flex w-full justify-center'>
        <Navbar />
        <SignupForm />
    </div>
      
  )
}

export default Signup