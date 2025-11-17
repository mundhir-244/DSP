const mongoose = require('mongoose');
const { Schema } = mongoose;

const FriendSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the UserModel
    required: true,
  },
  friends: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the user who sent the friend request
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const FriendModel = mongoose.model('Friend', FriendSchema);

module.exports = FriendModel;
