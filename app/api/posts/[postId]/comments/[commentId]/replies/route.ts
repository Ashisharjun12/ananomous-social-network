import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function POST(req: Request, { params }: { params: { postId: string, commentId: string } }) {
  const { content, authorUsername } = await req.json();

  await dbConnect();
  const post = await Post.findById(params.postId);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const comment = post.comments.id(params.commentId);
  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const newReply = { content, authorUsername };
  comment.replies.push(newReply);
  await post.save();

  return NextResponse.json(newReply);
}
