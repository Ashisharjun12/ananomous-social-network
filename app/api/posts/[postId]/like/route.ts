import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function POST(req: Request, { params }: { params: { postId: string } }) {
  await dbConnect();

  try {
    const { userId } = await req.json();
    const post = await Post.findById(params.postId);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Initialize likedByUsers if it doesn't exist
    if (!post.likedByUsers) {
      post.likedByUsers = [];
    }

    const userLikedIndex = post.likedByUsers.indexOf(userId);
    
    if (userLikedIndex > -1) {
      // User already liked, so unlike
      post.likedByUsers.splice(userLikedIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // User hasn't liked, so add like
      post.likedByUsers.push(userId);
      post.likes = (post.likes || 0) + 1;
    }

    await post.save();

    return NextResponse.json({
      likes: post.likes,
      hasLiked: userLikedIndex === -1
    });

  } catch (error) {
    console.error('Error handling like:', error);
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { postId: string } }) {
  const { userId } = await req.json();
  await dbConnect();

  try {
    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Remove user from likedBy array
    post.likedBy = post.likedBy?.filter(like => like.userId !== userId) || [];
    post.likes = post.likedBy.length;
    await post.save();

    return NextResponse.json({ 
      likes: post.likes,
      likedBy: post.likedBy 
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
  }
}
