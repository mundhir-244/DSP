import axios from 'axios';
import { MessageCircle } from 'lucide-react';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const ShowPosts = ({ posts, selectedUser, refreshPosts }) => {
  const { user, setUser, loading, refreshUser } = useContext(UserContext)
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});

  if (loading) return <div>Loading...</div>;

  const getFileExtensionFromUrl = (url) => {
    if (!url) return null;
    const baseUrl = url.split('?')[0];
    const match = baseUrl.match(/\.(\w+)$/);
    return match ? match[1].toLowerCase() : null;
  };

  const renderMedia = (url) => {
    if (!url) return null;
    const ext = getFileExtensionFromUrl(url);

    if (ext === 'mp3') return <audio controls src={url} className="w-full" />;
    if (ext === 'mp4') return <video controls src={url} className="w-full max-h-[300px]" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <img src={url} alt="media" className="w-full h-auto rounded" />;

    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        Download File
      </a>
    );
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const navigate = useNavigate()
  const handleCommentSubmit = async (postId) => {
    if (!user) {
      toast.error('You must be logged in to comment');
      navigate('/login');
      return
    }

    const comment = commentInputs[postId];
    if (!comment?.trim()) return toast.error('Comment cannot be empty');
    try {
      await axios.post(`/posts/${postId}/comments`, { text: comment, userId: user.id });
      toast.success('Comment added!');
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      refreshPosts();
    } catch (error) {
      toast.error('Failed to add comment');
      console.error(error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleDeletePost = async (post) => {
    try {
      await axios.delete(`/deletePost`, { data: { post: post } });
      toast.success('Post deleted successfully');
      refreshPosts();
    } catch (error) {
      toast.error('Failed to delete post');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center w-[100%] p-5 transition mt-10">
      <h1 className="text-xl font-semibold mb-4">Latest Uploads</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500 text-sm">No posts found.</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="border rounded p-3 shadow mb-4 max-w-[500px]">
            <div className='flex items-center justify-between mb-2'>
              <a href={`/${post.userId.userName}`} className=" font-semibold text-sm text-gray-700">{post.userId?.userName || 'Error'}             </a>
              {selectedUser != undefined && (
                <button
                  className='flex items-center text-sm text-blue-600 hover:underline'
                  onClick={() => handleDeletePost(post)}>
                  Delete
                </button>
              )}
            </div>
            <p className="mb-3">{post.caption}</p>
            {renderMedia(post.url)}

            <button
              onClick={() => toggleComments(post._id)}
              className="flex items-center gap-2 mt-3 text-sm text-blue-600 hover:underline"
            >
              <MessageCircle size={16} />
              {showComments[post._id] ? 'Hide Comments' : 'Comment'}
            </button>

            {showComments[post._id] && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInputs[post._id] || ''}
                  onChange={(e) => handleCommentChange(post._id, e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <button
                  onClick={() => handleCommentSubmit(post._id)}
                  className="text-sm px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Post
                </button>

                {post.comments?.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {post.comments.map((comment, idx) => (
                      <li key={idx} className="border px-3 py-1 rounded text-sm">
                        <strong>{comment.userName || 'Anonymous'}:</strong> {comment.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ShowPosts;
