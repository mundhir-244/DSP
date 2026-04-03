const express = require('express')
const router = express.Router()
const cors = require('cors')
const { addFriend } = require('../controllers/friendControllers')
const { getFriendRequests } = require('../controllers/friendControllers')
const { acceptFriendRequest } = require('../controllers/friendControllers')

//middleware
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

router.post('/addFriend', addFriend)
router.post('/getFriendRequests', getFriendRequests)
router.post('/acceptFriendRequest', acceptFriendRequest)

module.exports = router