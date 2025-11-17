import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Channel, ChannelHeader, ChannelList, Chat, MessageInput, MessageList, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { UserContext } from '../../context/userContext';
import '../assets/css/messages.css';
import Navbar from '../components/Navbar';

const Messages = () => {
  const { user, loading, streamChat } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !streamChat)) {
      navigate('/login');
    }
  }, [user, loading, streamChat, navigate]);

  if (loading || !user || !streamChat?.userID) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col-reverse justify-between xl:justify-center xl:items-center xl:flex-row w-full h-screen">
      {/* Sidebar / Bottom Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col w-full h-full justify-center">
        <Chat client={streamChat}>
          <ChannelList />
          <Channel>
            <Window>
              <ChannelHeader />
              <div className='h-[calc(100vh-250px)] xl:h-[calc(100vh-200px)]'>
                <MessageList />
              </div>
              <div className='z-10 sticky bottom-[3rem] w-full'>
                <MessageInput />
              </div>
            </Window>
          </Channel>
        </Chat>
      </div>
    </div>
  );
//   <div className="flex flex-col-reverse xl:flex-row w-screen h-screen overflow-hidden">
//   <Navbar smallScreenOverlap={false} />

//   <div className="flex flex-1 flex-col h-full overflow-hidden">
//     <Chat client={streamChat}>
//       <ChannelList />
//       <Channel>
//         <Window>
//           <ChannelHeader />
//           <div className="flex flex-col flex-1 overflow-hidden">
//             {/* Only this scrolls */}
//             <div className="flex-1 overflow-y-auto">
//               <MessageList />
//             </div>
//             <MessageInput />
//           </div>
//         </Window>
//       </Channel>
//     </Chat>
//   </div>
// </div>
  // );
};

export default Messages;
