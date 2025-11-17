import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import AddFriend from "./routes/AddFriend";
import CreatePost from "./routes/CreatePost";
import Dashboard from "./routes/Dashboard";
import EditProfile from "./routes/EditProfile";
import Login from "./routes/Login";
import Messages from "./routes/Messages";
import Signup from "./routes/Signup";

export const router = createBrowserRouter([
    {path: '/', element: <App />},
    {path: '/login', element: <Login />},
    {path: '/signup', element: <Signup />},
    {path: '/editprofile', element: <EditProfile />},
    {path: '/addfriend', element: <AddFriend />},
    {path: '/messages', element: <Messages />},
    {path: '/createPost', element: <CreatePost />},
    { path: '/:userName', element: <Dashboard /> },
  ])