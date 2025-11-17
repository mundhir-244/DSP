import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import LoginForm from '../components/LoginForm'
import Navbar from '../components/Navbar'

const Login = () => {
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
    <div className='flex w-full h-screen justify-evenly items-center flex-col-reverse xl:flex-row overflow-hidden'>
        <Navbar />
        <div className='w-full flex justify-center items-center h-full xl:pb-[15rem]'>
          <LoginForm />
        </div>
      </div>
    )
}

export default Login