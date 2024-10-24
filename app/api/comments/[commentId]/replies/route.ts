import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function POST(req: Request, { params }: { params: { commentId: string } }) {
  const { content, authorUsername } = await req.json();

  await dbConnect();
  const post = await Post.findOne({ 'comments._id': params.commentId });
  if (!post) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }
  const comment = post.comments.id(params.commentId);
  const newReply = { content, authorUsername };
  comment.replies.push(newReply);
  await post.save();
  return NextResponse.json(newReply);
}
