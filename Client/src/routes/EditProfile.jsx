import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import Navbar from '../components/Navbar'

const EditProfile = () => {
  const { user, setUser, loading, refreshUser } = useContext(UserContext)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profilePic, setProfilePic] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      setUsername('');
      setEmail('');
      navigate('/login')
    } 
    else if (!loading && user) {
      setUsername(user.userName || '');
      setEmail(user.email || '');
    }
    else if (user) {
      setUsername(user.userName)
      setEmail(user.email)
    }
  }, [loading, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('userId', user.id)
    formData.append('username', username)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('type', 'profile')
    if (profilePic) {
      formData.append('filename', profilePic)
    }

    try {
      const { data } = await axios.post('/editProfile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('Profile updated!')
        await refreshUser()
        // setUser(data.updatedUser
        navigate(`/${username}`)
      }
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong')
    }
  }

  return (
    <div className='flex w-screen'>
      <Navbar />
      <div className='flex flex-col w-full items-center mt-10 px-4'>
        <form
          onSubmit={handleSubmit}
          className='w-full max-w-[500px] bg-white p-6 rounded shadow'
        >
          <h2 className='text-xl font-semibold mb-4'>Edit Profile</h2>

          <div className='mb-4'>
            <label className='block mb-1'>Profile Picture</label>
            <input
              type='file'
              accept='image/*'
              onChange={(e) => setProfilePic(e.target.files[0])}
            />
          </div>

          <div className='mb-4'>
            <label className='block mb-1'>Username</label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full border p-2 rounded'
            />
          </div>

          <div className='mb-4'>
            <label className='block mb-1'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full border p-2 rounded'
            />
          </div>

          <div className='mb-6'>
            <label className='block mb-1'>New Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full border p-2 rounded'
              placeholder='Leave blank to keep current'
            />
          </div>

          <button
            type='submit'
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditProfile
