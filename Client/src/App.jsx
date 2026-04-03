import axios from 'axios';
import { useContext } from 'react';
import { UserContext } from '../context/userContext';
import GetPosts from './components/GetPosts';
import Navbar from './components/Navbar';

axios.defaults.baseURL = 'http://192.168.0.135:3000';
axios.defaults.withCredentials = true;

function App() {
  const { user, loading } = useContext(UserContext);


  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex w-full h-full flex-col-reverse xl:flex-row">
      <Navbar />
      <GetPosts />
    </div>
  );
}

export default App;
