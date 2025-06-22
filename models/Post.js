import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: String,
  text: String,
  tags: Array,
  viewsCount: {
    type: Number,
    default: 0,
  },
  imageUrl: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Post', PostSchema);
