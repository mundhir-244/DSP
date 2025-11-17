import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  // Extracting user and loading state from the context
  const { user, loading } = useContext(UserContext)
  const navigate = useNavigate()

  // State to store the selected file
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')

  // Redirect to login if the user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]) // Store the selected file in state
  }

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error("Please select a file to upload.")
      return
    }
    
    try {
      const formData = new FormData()
      formData.append("filename", file)
      formData.append("email", user.email)
      formData.append("userId", user.id)
      formData.append("userName", user.userName)
      formData.append("caption", caption)

      const { data } = await axios.post('/handleUpload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
    })

      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('File uploaded successfully!')
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred during the upload.")
    }
  }

  return (
    <div className='flex w-full h-screen justify-between flex-col-reverse xl:flex-row overflow-hidden'>
      <Navbar />
      <div className="w-full h-[100%] flex justify-center items-center flex-col">
        <div className='bg-neutral-600 justify-between items-center flex flex-col max-w-[600px] w-[90%] h-[60vh] max-h-[800px] rounded-lg overflow-hidden'>
          <h1 className='bg-black text-white w-[100%] text-center font-medium py-2'>Create new post</h1>
          <form onSubmit={handleUpload} method="post" encType="multipart/form-data" className="h-full flex flex-col justify-center">
            <label htmlFor="file-upload" className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition duration-200">
              {file ? file.name : "Choose File"}
            </label>
            <input type="file" id="file-upload" name="video" onChange={handleFileChange} className='bg-white text-white hidden' />

            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-4 p-2 rounded-md w-full resize-none"
              rows={3}
            />

            <button type="submit" className="mt-4 p-2 bg-white rounded-lg">Upload</button>
        </form>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
