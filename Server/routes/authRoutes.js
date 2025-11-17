const express = require('express')
const router = express.Router()
const cors = require('cors')
const { registerUser, loginUser, getProfile, logoutUser } = require('../controllers/authControllers')

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

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)
router.post('/logout', logoutUser)

module.exports = router