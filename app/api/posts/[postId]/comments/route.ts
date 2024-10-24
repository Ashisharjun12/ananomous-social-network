import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function POST(req: Request, { params }: { params: { postId: string } }) {
  const { content, authorUsername } = await req.json();

  await dbConnect();
  const post = await Post.findById(params.postId);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  const newComment = { content, authorUsername };
  post.comments.push(newComment);
  await post.save();
  return NextResponse.json(newComment);
}
