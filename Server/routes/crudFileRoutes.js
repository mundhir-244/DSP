const express = require('express')
const router = express.Router()
const cors = require('cors')
const { getUser, handleUpload, upload, getPosts, addComment, editProfile, getUsersPosts, deletePost } = require('../controllers/crudFileControllers')

//middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.0.167:5173'
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

router.get('/getPosts', getPosts);
router.post('/handleUpload', upload, handleUpload)
router.post('/posts/:postId/comments', addComment)
router.get('/posts/:userId', getUsersPosts)
router.get('/getUser/:userName', getUser)
router.post('/editProfile', upload, editProfile)
router.delete('/deletePost', deletePost)

module.exports = router