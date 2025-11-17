import axios from 'axios'
import { useContext, useState } from 'react'

import {
  ChevronFirst,
  CirclePlus,
  CircleUserRound,
  House,
  LogOut,
  MessageCircleMore,
  UserRoundPlus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'

const Navbar = () => {
  const { user, setUser, loading } = useContext(UserContext)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true)
  const navigate = useNavigate()

  const toggleNavbar = () => {
    setIsNavbarCollapsed(prevState => !prevState)
  }

  const handleLogout = async () => {
    try {
      const res = await axios.post('/logout');
      console.log('Logging out...');

      // Clear local state
      setUser(null);
      setUsername('');
      setEmail('');

      toast.success(res.data.message);

      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  let navItems = []
  if (user && !loading) {
    navItems = [
      { icon: House, label: 'Home', link: '/' },
      { icon: MessageCircleMore, label: 'Messages', link: '/messages' },
      { icon: UserRoundPlus, label: 'Add Friend', link: '/addfriend' },
      { icon: CirclePlus, label: 'Create Post', link: '/createPost' },
      { icon: CircleUserRound, label: 'Account', link: `/${user.userName}` },
      {
        icon: LogOut, label: 'Logout', link: '/logout', onClick: () => handleLogout()
      }
    ]
  } else {
    navItems = [
      { icon: House, label: 'Home', link: '/' },
      { icon: MessageCircleMore, label: 'Messages', link: '/messages' },
      { icon: UserRoundPlus, label: 'Add Friend', link: '/addfriend' },
      { icon: CirclePlus, label: 'Create Post', link: '/createPost' },
      { icon: CircleUserRound, label: 'Account', link: `/login` },

    ]
  }


  return (
    <>
      {/* Small Screens */}
        <nav className="z-10 xl:hidden w-full flex flex-row bg-white border-r p-1 sticky bottom-0 h-fit">
          <ul className="flex justify-center items-center flex-row px-3 w-full">
            {navItems.map((item, index) => {
              const Icon = item.icon
              return (
                <a
                  href={item.link}
                  key={index}
                  onClick={e => {
                    if (item.onClick) {
                      e.preventDefault()
                      item.onClick()
                    }
                  }}
                  className="relative flex justify-center items-center cursor-pointer hover:bg-primary-100 rounded-lg w-full font-medium py-3"
                >
                  <Icon className="left-[.6rem] hover:bg-primary-100 rounded-full" />
                </a>
              )
            })}
          </ul>
        </nav>

      {/* Big Screens */}
        <nav
          className={`hidden min-h-screen xl:flex flex-col bg-white border-r px-1 ${
            !isNavbarCollapsed && 'w-[90vw]'
          } xl:max-w-xs`}
        >
          <div className='sticky top-0'>
            <div
              className={`p-4 pb-2 flex ${
                !isNavbarCollapsed ? 'justify-between' : 'justify-center'
              } items-center`}
            >
              {!isNavbarCollapsed && <div className="font-bold">Socialhub</div>}
              <button
                onClick={toggleNavbar}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <ChevronFirst
                  className={`${isNavbarCollapsed && 'rotate-180'} transition-all`}
                />
              </button>
            </div>

            <ul className="flex justify-center items-center flex-col px-3 pt-5 w-full h-fit">
              {navItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <a
                    href={item.link}
                    key={index}
                    onClick={e => {
                      if (item.onClick) {
                        e.preventDefault()
                        item.onClick()
                      }
                    }}
                    className={`relative flex cursor-pointer hover:bg-primary-100 rounded-lg w-full ${
                      isNavbarCollapsed && 'justify-evenly'
                    } font-medium py-3 my-1`}
                  >
                    <Icon
                      className={`${
                        !isNavbarCollapsed && 'absolute'
                      } left-[.6rem] hover:bg-primary-100 rounded-full`}
                    />
                    {!isNavbarCollapsed && (
                      <span className="ml-[3.2rem]">{item.label}</span>
                    )}
                  </a>
                )
              })}
            </ul>

          </div>
        </nav>
    </>
  )
}

export default Navbar
