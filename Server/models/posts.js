const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String, required: false },
  url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },

  comments: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const PostModel = mongoose.model('Post', postSchema);
module.exports = PostModel;
