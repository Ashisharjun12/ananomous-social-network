import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function PUT(req: Request, { params }: { params: { postId: string } }) {
  const { content, authorUsername } = await req.json();
  await dbConnect();
  const post = await Post.findById(params.postId);
  
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  if (post.authorUsername !== authorUsername) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  post.content = content;
  post.updatedAt = new Date();
  await post.save();

  return NextResponse.json(post);
}

export async function DELETE(req: Request, { params }: { params: { postId: string } }) {
  const { authorUsername } = await req.json();
  await dbConnect();
  const post = await Post.findById(params.postId);

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  if (post.authorUsername !== authorUsername) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await Post.findByIdAndDelete(params.postId);
  return NextResponse.json({ message: 'Post deleted successfully' });
}
