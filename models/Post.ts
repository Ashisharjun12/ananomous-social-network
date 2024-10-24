import mongoose, { Schema, Document } from 'mongoose';

interface ILike {
  userId: string;
  username: string;
}

// Create the Post schema
const PostSchema = new Schema({
  content: { type: String, required: true },
  authorUsername: { type: String, required: true },
  comments: [{ type: Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  imageUrl: { type: String },
  likes: { type: Number, default: 0 },
  likedByUsers: [{ type: String }]  // Store just userIds
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
