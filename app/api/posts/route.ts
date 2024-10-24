import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  await dbConnect();
  
  let query = {};
  if (username) {
    query = { authorUsername: username };
  }

  const posts = await Post.find(query).sort({ createdAt: -1 }).limit(20);
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  await dbConnect();

  const formData = await req.formData();
  const content = formData.get('content') as string;
  const authorUsername = formData.get('authorUsername') as string;
  const imageFile = formData.get('image') as File | null;

  let imageUrl;
  if (imageFile) {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    imageUrl = (result as any).secure_url;
  }

  const post = await Post.create({
    content,
    authorUsername,
    imageUrl,
  });

  return NextResponse.json(post);
}
