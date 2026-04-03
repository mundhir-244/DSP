const { initializeApp } = require("firebase/app")
const { firebaseConfig, admin } = require('../helpers/firebaseConfig')
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage")
const multer = require("multer")
const PostModel = require('../models/posts')
const User = require('../models/users')
const { hashPassword } = require('../helpers/auth')
const jwt = require('jsonwebtoken');
const { StreamChat } = require('stream-chat');

// Initialize StreamChat client
const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// Initialize Firebase
initializeApp(firebaseConfig)
const storage = getStorage()

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() })

const giveCurrentDateTime = () => {
  const today = new Date()
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
  return date + ' ' + time
}

// Shared upload logic
const uploadFile = async ({ file, type = 'files', userId }) => {
  const safeDateTime = giveCurrentDateTime().replace(/[: ]/g, '-')
  const filename = `${file.originalname.split('.')[0]}-${safeDateTime}.${file.originalname.split('.').pop()}`
  const folder = type === 'profile' ? 'profilepictures' : 'files'
  const storageRef = ref(storage, `${folder}/${filename}`)

  const metadata = {
    contentType: file.mimetype,
  }

  const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata)
  const downloadURL = await getDownloadURL(snapshot.ref)
  return downloadURL
}

// 📤 Handle uploads (posts or profile pics)
const handleUpload = async (req, res) => {
  try {
    const { email, userId, userName, caption, type } = req.body
    const file = req.file

    if (!file) return res.status(400).json({ error: 'No file provided' })

    const downloadURL = await uploadFile({ file, type, userId })

    if (type === 'profile') {
      const user = await User.findById(userId)
      if (!user) return res.status(404).json({ error: 'User not found' })

      user.profilePicUrl = downloadURL
      await user.save()

      return res.json({ message: 'Profile picture updated', downloadURL, updatedUser: user })
    }

    const newPost = new PostModel({
      userId,
      caption,
      url: downloadURL,
    })

    await newPost.save()

    return res.send({
      message: 'Post uploaded to Firebase',
      name: file.originalname,
      type: file.mimetype,
      downloadURL,
    })

  } catch (error) {
    console.error('Error in handleUpload:', error)
    return res.status(400).send(error.message)
  }
}

  const getUser = async (req, res) => {
    try {
      const { userName } = req.params

      const user = await User.findOne({ userName }).lean()
      if (!user) {
        return res.status(404).send({ error: 'User not found' })
      }
      return res.send({ user })
    } catch (error) {
      console.error('Error fetching user by username:', error)
      return res.status(500).send({ error: 'Internal Server Error' })
    }
  }

  // Fetch latest posts by a specific user
  const getUsersPosts = async (req, res) => {
    try {
      const { userId } = req.params

      const posts = await PostModel.find({ userId })
        .sort({ timestamp: -1 })
        .populate('userId', 'userName')
        .lean()

      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          const updatedComments = await Promise.all(
            post.comments.map(async (comment) => {
              const user = await User.findById(comment.userId).lean()
              return {
                ...comment,
                userName: user?.userName || "Error",
              }
            })
          )

          return {
            ...post,
            comments: updatedComments,
          }
        })
      )

      return res.send({
        message: `Fetched posts for user ${userId}`,
        posts: updatedPosts,
      })

    } catch (error) {
      console.error("Error getting user posts from MongoDB:", error)
      return res.status(500).send({ error: error.message })
    }
  }

// Fetch latest posts
const getPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'userName')
      .lean()

    const updatedPosts = await Promise.all(
      posts.map(async (post) => {
        const updatedComments = await Promise.all(
          post.comments.map(async (comment) => {
            const user = await User.findById(comment.userId).lean()
            return {
              ...comment,
              userName: user?.userName || "Error",
            }
          })
        )

        return {
          ...post,
          comments: updatedComments,
        }
      })
    )

    return res.send({
      message: 'Fetched latest posts successfully',
      posts: updatedPosts,
    })

  } catch (error) {
    console.error("Error getting posts from MongoDB:", error)
    return res.status(500).send({ error: error.message })
  }
}

// Add comment to a post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params
    const { text, userId } = req.body

    if (!text?.trim()) return res.status(400).json({ error: 'Comment text is required' })
    if (!userId) return res.status(400).json({ error: 'userId is required' })

    const post = await PostModel.findById(postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    post.comments.push({ text, userId })
    await post.save()

    return res.status(200).json({ message: 'Comment added', post })

  } catch (error) {
    console.error('Error adding comment:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const deletePost = async (req, res) => {
  try {
    const { post } = req.body

    // Delete from Firebase Storage
    const bucket = admin.storage().bucket();

    // Extract file path from public URL
    const decodeUrl = decodeURIComponent(post.url);
    const filePathMatch = decodeUrl.match(/\/o\/(.+)\?alt=media/);
    if (!filePathMatch) {
      return res.status(400).json({ error: 'Invalid Firebase URL' });
    }

    const filePath = filePathMatch[1];
    await bucket.file(filePath).delete();

    // Delete from MongoDB
    const deletedPost = await PostModel.findByIdAndDelete(post._id);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found in database' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

// Updates the users profile
const editProfile = async (req, res) => {
  try {
    const { userId, username, email, password } = req.body
    const profilePic = req.file

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    user.userName = username
    user.email = email
    if (password) user.password = await hashPassword(password)

    if (profilePic) {
      const downloadURL = await uploadFile({ file: profilePic, type: 'profile', userId })
      user.profilePicUrl = downloadURL
    }

  await user.save()

  await streamClient.upsertUser({
      id: user._id.toString(),
      name: user.userName,
      image: user.profilePicUrl,
      email: user.email
  });

  const newToken = jwt.sign({
    id: user._id.toString(),
    email: user.email,
    userName: user.userName,
    profilePicUrl: user.profilePicUrl
  }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: 'lax'
  });

    res.json({ updatedUser: user })

  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Profile update failed' })
  }
}

// Get all reported posts
const getReportedPosts = async (req, res) => {
  try {
    const posts = await PostModel.find({ reported: true })
      .sort({ 'reports.length': -1 })
      .populate('userId', 'userName profilePicUrl')
      .lean()

    return res.json(posts)
  } catch (error) {
    console.error('Error fetching reported posts:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

// Report a post
const reportPost = async (req, res) => {
  try {
    const { postId } = req.params
    const { userId, reason } = req.body

    const post = await PostModel.findById(postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const alreadyReported = post.reports?.some(r => r.userId?.toString() === userId)
    if (alreadyReported) return res.status(400).json({ error: 'You already reported this post' })

    post.reports.push({ userId, reason })
    post.reported = true
    post.reportReason = reason
    await post.save()

    return res.json({ message: 'Post reported' })
  } catch (error) {
    console.error('Error reporting post:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

// Approve post (dismiss reports)
const approvePost = async (req, res) => {
  try {
    const { postId } = req.params

    const post = await PostModel.findByIdAndUpdate(
      postId,
      { reported: false, reports: [], reportReason: '' },
      { new: true }
    )
    if (!post) return res.status(404).json({ error: 'Post not found' })

    return res.json({ message: 'Post approved' })
  } catch (error) {
    console.error('Error approving post:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

// Moderator delete post
const moderatorDeletePost = async (req, res) => {
  try {
    const { postId } = req.params

    // Fetch post first to get the URL for Firebase deletion
    const post = await PostModel.findById(postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    // Delete from Firebase Storage
    try {
      const bucket = admin.storage().bucket()
      const decodeUrl = decodeURIComponent(post.url)
      const filePathMatch = decodeUrl.match(/\/o\/(.+)\?alt=media/)
      if (filePathMatch) {
        const filePath = filePathMatch[1]
        await bucket.file(filePath).delete()
      }
    } catch (firebaseError) {
      console.error('Firebase deletion failed:', firebaseError.message)
      // Continue to delete from MongoDB even if Firebase fails
    }

    await PostModel.findByIdAndDelete(postId)
    return res.json({ message: 'Post deleted by moderator' })

  } catch (error) {
    console.error('Error in moderator delete:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = {
  upload: upload.single("filename"),
  handleUpload,
  getPosts,
  addComment,
  editProfile,
  uploadFile,
  getUsersPosts,
  getUser,
  deletePost,
  getReportedPosts,  
  reportPost,        
  approvePost,       
  moderatorDeletePost
}