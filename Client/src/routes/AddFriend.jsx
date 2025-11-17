import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import Navbar from '../components/Navbar'

const AddFriend = () => {
  const [friendRequests, setFriendRequests] = useState([])
  const [friendsUserName, setFriendsUserName] = useState('')

  const { user, loading } = useContext(UserContext)
  const navigate = useNavigate()

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  // Automatically fetch friend requests once user is available
  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const userId = user.id
        const { data } = await axios.post('/getFriendRequests', { userId })
        if (data.error) {
          toast.error(data.error)
        } else {
          setFriendRequests(data)
        }
      } catch (error) {
        console.log(error)
      }
    }

    if (user) {
      fetchFriendRequests()
    }
  }, [user])

  const addFriend = async (e) => {
    e.preventDefault()
    const userId = user.id
    try {
      const { data } = await axios.post('/addfriend', { friendsUserName, userId })

      if (data.error) {
        toast.error(data.error)
      } else {
        setFriendsUserName('')
        toast.success('Friend Request Sent!')
        navigate('/dashboard')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const acceptFriendRequest = async (requestUserId) => {
    try {
      const userId = user.id
      const { data } = await axios.post('/acceptFriendRequest', { requestUserId, userId })
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('Friend Accepted!')
        // Remove accepted request from the list
        setFriendRequests(friendRequests.filter(request => request.userId !== requestUserId))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='flex w-full h-screen justify-evenly flex-col-reverse xl:flex-row overflow-hidden'>
      <Navbar />
      <div className='flex flex-col w-full justify-center items-center h-full'>
        <form
          onSubmit={addFriend}
          className='flex flex-col max-w-[500px] w-[90%] px-5 py-20 bg-white rounded shadow-md hover:shadow-lg transition mt-10'
        >
          <input
            type='text'
            value={friendsUserName}
            onChange={(e) => setFriendsUserName(e.target.value)}
            className='w-full border-black border-[1px] rounded-sm border-opacity-10 h-7 pl-2 mb-4'
            placeholder='Enter friend username'
          />
          <button
            type='submit'
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'
          >
            Add Friend
          </button>
        </form>

        <div className='flex flex-col max-w-[500px] w-[90%] px-5 py-10 bg-white rounded shadow-md hover:shadow-lg transition mt-10'>
          <h2 className='text-lg font-semibold mb-4'>Friend Requests</h2>
          <ul>
            {friendRequests.length > 0 ? (
              friendRequests.map((request) => (
                <li
                  key={request.userId}
                  className='flex justify-between items-center mb-2'
                >
                  <span>{request.userName}</span>
                  <button
                    onClick={() => acceptFriendRequest(request.userId)}
                    className='ml-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition'
                  >
                    Accept
                  </button>
                </li>
              ))
            ) : (
              <li>No friend requests</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddFriend
