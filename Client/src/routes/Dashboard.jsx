import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import GetPosts from '../components/GetPosts';
import Navbar from '../components/Navbar';

const UserProfile = () => {
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();
  const { userName } = useParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userNotFound, setNotFound] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      if (!loading) {
        try {
          if (user != null) {
            if (userName == user.userName) {
              setSelectedUser(user)
            }
          } else {
            const res = await axios.get(`/getUser/${userName}`);
            const { _id, ...rest } = res.data.user;
            const user = { id: _id, ...rest };
            setSelectedUser(user);
          }
        } catch (error) {
          console.error("User Doesnt Exist", error);
          setNotFound(true);
        }
      }
    };

    getUser()
  }, [loading]);

  if (userNotFound) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <h1 className="text-3xl font-bold">404 - User Not Found</h1>
      </div>
    );
  }

  if (loading || !selectedUser) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex w-full h-full flex-col-reverse xl:flex-row">
      <Navbar />
      <div className="flex flex-col w-full items-center mt-10 px-4">

        {/* Profile Info */}
        <div className="w-full max-w-[600px] bg-white p-6 rounded shadow mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-300 border-white border-[1px] flex items-center justify-center mr-4">
              { !selectedUser.profilePicUrl &&
                <CircleUserRound className="w-10 h-10 text-white" />
              }
              <img src={selectedUser.profilePicUrl} alt="" className='rounded-full' />
            </div>
            <h2 className="text-xl font-semibold">{selectedUser.userName}</h2>
          </div>
          { selectedUser.id === user?.id &&
            <button
              onClick={() => navigate('/editprofile')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Edit Profile
            </button>
          }
        </div>

        <GetPosts user={selectedUser} />

      </div>
    </div>
  );
};

export default UserProfile;
