const express = require('express')
const router = express.Router()
const cors = require('cors')
const {
  getUser, handleUpload, upload, getPosts, addComment,
  editProfile, getUsersPosts, deletePost,
  getReportedPosts, reportPost, approvePost, moderatorDeletePost
} = require('../controllers/crudFileControllers')

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.1.24:5173'
];

router.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Default Routes
router.get('/getPosts', getPosts)
router.post('/handleUpload', upload, handleUpload)
router.post('/posts/:postId/comments', addComment)
router.get('/posts/:userId', getUsersPosts)
router.get('/getUser/:userName', getUser)
router.post('/editProfile', upload, editProfile)
router.delete('/deletePost', deletePost)

// Moderator routes
router.get('/moderator/reportedPosts', getReportedPosts)
router.post('/moderator/approve/:postId', approvePost)
router.delete('/moderator/delete/:postId', moderatorDeletePost)
router.post('/posts/:postId/report', reportPost)

module.exports = router