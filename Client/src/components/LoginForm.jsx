import axios from 'axios';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const LoginForm = () => {
  const navigate = useNavigate()
  const { setUser, setStreamToken } = useContext(UserContext)
  const [data, setData] = useState({
    email: '',
    password: '',
  })

  const loginUser = async (e) => {
    e.preventDefault()
    const { email, password } = data
    try {
      const response = await axios.post('/login', { email, password })
      if (response.error) {
        toast.error(response.error)
      } else {
        const [userData, streamToken] = response.data;
        // Set user state
        setUser(userData);
        setStreamToken(streamToken);
        setData({});
        toast.success('Login Successful. Welcome!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    }
  }

  return (
    <form
      onSubmit={loginUser}
      id="form-container"
      className="flex flex-col max-w-[500px] w-[90%] p-5 bg-white rounded shadow-md hover:shadow-lg transition mt-10"
    >
      <h2 className="text-center font-medium text-3xl my-2">Login</h2>
      <h3 className="text-center pb-5">
        Need a Socialhub account?{' '}
        <Link to="/signup" className="text-primary font-medium underline">
          Create an account
        </Link>
      </h3>

      <label htmlFor="email" className="text-left mt-4 mb-1 font-medium">
        Email
      </label>
      <input
        type="text"
        name="email"
        className="w-full border-black border-[1px] rounded-sm border-opacity-10 h-7 pl-2"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
      />

      <label htmlFor="password" className="text-left mt-4 mb-1 font-medium">
        Password
      </label>
      <input
        type="password"
        name="password"
        className="w-full border-black border-[1px] rounded-sm border-opacity-10 h-7 pl-2"
        value={data.password}
        onChange={(e) => setData({ ...data, password: e.target.value })}
      />

      <button className="bg-primary my-4 text-white py-2 rounded hover:opacity-95 transition font-medium">
        Login
      </button>
    </form>
  )
}

export default LoginForm
