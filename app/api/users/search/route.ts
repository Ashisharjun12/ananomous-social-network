import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  await dbConnect();

  try {
    // Find all unique users who have posted
    const users = await Post.aggregate([
      {
        $match: {
          authorUsername: { $regex: username, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$authorUsername',
          postCount: { $sum: 1 },
          latestPost: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          username: '$_id',
          postCount: 1,
          latestPost: 1,
          _id: 0
        }
      },
      { $sort: { latestPost: -1 } },
      { $limit: 10 }
    ]);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'An error occurred while searching' }, { status: 500 });
  }
}
