import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function PUT(req: Request, { params }: { params: { postId: string, commentId: string, replyId: string } }) {
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

  const reply = comment.replies.id(params.replyId);
  if (!reply) {
    return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
  }

  if (reply.authorUsername !== authorUsername) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  reply.content = content;
  await post.save();

  return NextResponse.json(reply);
}

export async function DELETE(req: Request, { params }: { params: { postId: string, commentId: string, replyId: string } }) {
  const { authorUsername } = await req.json();
  await dbConnect();
  
  try {
    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comment = post.comments.id(params.commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const reply = comment.replies.id(params.replyId);
    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    if (reply.authorUsername !== authorUsername) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    comment.replies.pull({ _id: params.replyId });
    await post.save();

    return NextResponse.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 });
  }
}
