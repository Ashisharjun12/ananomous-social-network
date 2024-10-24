import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function PUT(req: Request, { params }: { params: { postId: string, commentId: string } }) {
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

  if (comment.authorUsername !== authorUsername) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  comment.content = content;
  await post.save();

  return NextResponse.json(comment);
}

export async function DELETE(req: Request, { params }: { params: { postId: string, commentId: string } }) {
  const { authorUsername } = await req.json();
  await dbConnect();
  const post = await Post.findById(params.postId);

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const comment = post.comments.id(params.commentId);
  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  if (comment.authorUsername !== authorUsername) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  post.comments.pull({ _id: params.commentId });
  await post.save();

  return NextResponse.json({ message: 'Comment deleted successfully' });
}
