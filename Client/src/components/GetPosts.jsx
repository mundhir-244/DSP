import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ShowPosts from './ShowPosts';

const GetPosts = ({ user }) => {
  const [data, setData] = useState([]);
  const getPosts = async () => {
    try {
      let response;
      if (user === undefined) {
        response = await axios.get('/getPosts');
      } else {
        response = await axios.get(`/getUser/${user.userName}`);
        if (user?.id) {
          response = await axios.get(`/posts/${user.id}`);
        }
      }

      const result = response.data;

      if (result.error) {
        toast.error(result.error);
      } else {
        const posts = result.posts || result;
        setData(posts);
        toast.success('Fetched posts!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch posts.');
    }
  };

  useEffect(() => {
    getPosts();
  }, [user]);
  return <ShowPosts posts={data} selectedUser={user} refreshPosts={getPosts} />;
};

export default GetPosts;
