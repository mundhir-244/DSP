import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SignupForm = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({
    userName: '',
    email: '',
    password: ''
  })

  const registerUser = async (e) => {
    e.preventDefault()
    const { userName, email, password } = data
    try {
      const { data } = await axios.post('/register', {
        userName, email, password
      })
      if (data.error) {
        toast.error(data.error)
      } else {
        setData({})
        toast.success('Sign Up Successful. Welcome!')
        navigate('/login')
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
        <form onSubmit={registerUser} id='form-container' className='flex flex-col max-w-[500px] w-[90%] p-5 bg-white rounded shadow-md hover:shadow-lg transition mt-10'>

            <h2 className='text-center font-medium text-3xl my-2'>Sign Up For Socialhub</h2>
            <h3 className='text-center pb-5'>Create a free account or <Link to='/login' className='text-primary font-medium underline'>Login</Link></h3>

            <label htmlFor="username" className='text-left mt-4 mb-1 font-medium'>Username</label>
            <input type="text" name='username' className='w-full border-black border-[1px] rounded-sm border-opacity-10 h-7 pl-2' value={data.userName} onChange={(e) => setData({...data, userName: e.target.value })} />

            <label htmlFor="email" className='text-left  mt-4 mb-1 font-medium'>Email</label>
            <input type="email" name='email' className='w-full border-black border-[1px] rounded-sm border-opacity-10 h-7 pl-2' value={data.email} onChange={(e) => setData({...data, email: e.target.value })} />

            <label htmlFor="password" className='text-left mt-4 mb-1 font-medium'>Password</label>
            <input type="password" name="password" className='w-full border-black border-[1px] rounded-sm border-opacity-10 h-7 pl-2' value={data.password} onChange={(e) => setData({...data, password: e.target.value })} />

            <button className='bg-primary my-4 text-white py-2 rounded hover:opacity-95 transition font-medium'>Sign Up</button>

        </form>
  )
}

export default SignupForm